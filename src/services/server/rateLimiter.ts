import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface RateLimitOptions {
  limit?: number; // 限制視窗內允許的最大請求次數
  windowSeconds?: number; // 時間視窗（秒）
  prefix?: string; // 命名空間前綴
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // 預計重設的 Unix 時間戳記 (秒)
  retryAfterSeconds: number;
}

interface MemoryBucket {
  count: number;
  resetAt: number;
}

// 記憶體降級儲存庫 (當 KV 不可用時啟用)
const inMemoryStore = new Map<string, MemoryBucket>();

// 清理過期的記憶體桶，防範記憶體洩漏
const cleanExpiredMemoryBuckets = (): void => {
  const currentTimestamp = Date.now();
  for (const [key, bucket] of inMemoryStore.entries()) {
    if (bucket.resetAt <= currentTimestamp) {
      inMemoryStore.delete(key);
    }
  }
};

// 提取客戶端真實 IP 位址
export const getClientIpAddress = (req: NextRequest): string => {
  const cloudflareConnectingIp = req.headers.get('cf-connecting-ip');
  if (cloudflareConnectingIp) {
    return cloudflareConnectingIp.trim();
  }

  const forwardedForHeader = req.headers.get('x-forwarded-for');
  if (forwardedForHeader) {
    const firstForwardedIp = forwardedForHeader.split(',')[0].trim();
    if (firstForwardedIp) {
      return firstForwardedIp;
    }
  }

  const realIpHeader = req.headers.get('x-real-ip');
  if (realIpHeader) {
    return realIpHeader.trim();
  }

  return '127.0.0.1';
};

export const checkRateLimit = async (
  req: NextRequest,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> => {
  const limit = options.limit ?? 10;
  const windowSeconds = options.windowSeconds ?? 60;
  const prefix = options.prefix ?? 'global';

  const clientIp = getClientIpAddress(req);
  const currentTimeMs = Date.now();
  const currentWindowIndex = Math.floor(currentTimeMs / (windowSeconds * 1000));
  const windowResetTimestampSec = (currentWindowIndex + 1) * windowSeconds;
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil(windowResetTimestampSec - currentTimeMs / 1000)
  );

  const storageKey = `rate:${prefix}:${clientIp}:${currentWindowIndex}`;

  // 嘗試使用 Cloudflare KV 進行分散式頻率限制
  try {
    const { env } = getCloudflareContext();
    if (env?.KV_CACHE) {
      const existingCountStr = await env.KV_CACHE.get(storageKey);
      const currentCount = existingCountStr ? parseInt(existingCountStr, 10) : 0;

      if (currentCount >= limit) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset: windowResetTimestampSec,
          retryAfterSeconds,
        };
      }

      const nextCount = currentCount + 1;
      // 設置 KV 鍵過期時間（稍長於視窗秒數以保證容錯）
      await env.KV_CACHE.put(storageKey, nextCount.toString(), {
        expirationTtl: windowSeconds + 10,
      });

      return {
        success: true,
        limit,
        remaining: Math.max(0, limit - nextCount),
        reset: windowResetTimestampSec,
        retryAfterSeconds: 0,
      };
    }
  } catch (error) {
    console.warn('[RateLimiter] KV 操作失敗，降級使用記憶體限流:', error);
  }

  // 降級使用記憶體快取
  cleanExpiredMemoryBuckets();

  const existingMemoryBucket = inMemoryStore.get(storageKey);
  const currentCount = existingMemoryBucket ? existingMemoryBucket.count : 0;

  if (currentCount >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: windowResetTimestampSec,
      retryAfterSeconds,
    };
  }

  const nextCount = currentCount + 1;
  inMemoryStore.set(storageKey, {
    count: nextCount,
    resetAt: (currentWindowIndex + 1) * windowSeconds * 1000,
  });

  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - nextCount),
    reset: windowResetTimestampSec,
    retryAfterSeconds: 0,
  };
};
