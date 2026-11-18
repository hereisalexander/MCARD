/**
 * MCARD Edge Cache Utility
 * 提供基於 Cloudflare KV_CACHE 與記憶體 Fallback 的 Stale-While-Revalidate (SWR) 高性能快取機制。
 * 包含 Single-Flight (並發請求去重)、平滑降級 Fallback 與快取指標監控，防止外部 API 觸發 429 速率限制。
 */

import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { KVNamespace } from '@cloudflare/workers-types';

export interface CacheEntry<T> {
  value: T;
  cachedAt: number; // 寫入毫秒時間戳
  ttl: number; // 毫秒為單位的新鮮期
  swrTtl: number; // 毫秒為單位的 Stale 寬限期
  source: 'kv' | 'memory';
}

export interface CacheOptions<T> {
  ttlSeconds?: number; // 新鮮時間（秒），預設 7200 秒 (2 小時)
  swrSeconds?: number; // SWR 寬限時間（秒），預設 86400 秒 (24 小時)
  fallback?: T | (() => Promise<T> | T); // 當外部 API 與快取皆無時的安全兜底值
  forceFresh?: boolean; // 是否強制重新發起請求
  prefix?: string; // Key 前綴命名空間
}

export interface CacheMetrics {
  hits: number;
  staleHits: number;
  misses: number;
  fallbackHits: number;
  errorsHandled: number;
}

// 記憶體快取全域單例，避免 Fast Refresh 或模組熱重載遺失快取
type MemoryStore = Map<string, CacheEntry<unknown>>;

const globalCacheKey = Symbol.for('__MCARD_MEMORY_CACHE__');
const globalMetricsKey = Symbol.for('__MCARD_CACHE_METRICS__');
const globalInFlightKey = Symbol.for('__MCARD_IN_FLIGHT_REQUESTS__');

interface ExtendedGlobal {
  [globalCacheKey]?: MemoryStore;
  [globalMetricsKey]?: CacheMetrics;
  [globalInFlightKey]?: Map<string, Promise<unknown>>;
}

const customGlobal = globalThis as unknown as ExtendedGlobal;

if (!customGlobal[globalCacheKey]) {
  customGlobal[globalCacheKey] = new Map<string, CacheEntry<unknown>>();
}

if (!customGlobal[globalMetricsKey]) {
  customGlobal[globalMetricsKey] = {
    hits: 0,
    staleHits: 0,
    misses: 0,
    fallbackHits: 0,
    errorsHandled: 0,
  };
}

if (!customGlobal[globalInFlightKey]) {
  customGlobal[globalInFlightKey] = new Map<string, Promise<unknown>>();
}

const memoryStore = customGlobal[globalCacheKey] as MemoryStore;
const cacheMetrics = customGlobal[globalMetricsKey] as CacheMetrics;
const inFlightRequests = customGlobal[globalInFlightKey] as Map<string, Promise<unknown>>;

// 記憶體最大保留容量，超量時實施簡易 LRU 淘汰
const MAX_MEMORY_CACHE_ITEMS = 1000;

const pruneMemoryCacheIfFull = (): void => {
  if (memoryStore.size <= MAX_MEMORY_CACHE_ITEMS) {
    return;
  }

  // 尋找最早被快取的項目刪除
  let oldestKey: string | null = null;
  let oldestTime = Infinity;

  for (const [key, item] of memoryStore.entries()) {
    if (item.cachedAt < oldestTime) {
      oldestTime = item.cachedAt;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    memoryStore.delete(oldestKey);
  }
};

/**
 * 安全取得 Cloudflare KV_CACHE 命名空間實例
 * 支援於非 Cloudflare 環境（如本機開發、測試或靜態渲染）平滑降級為 null
 */
const getCloudflareKv = (): KVNamespace | null => {
  try {
    const { env } = getCloudflareContext();
    if (env && env.KV_CACHE) {
      return env.KV_CACHE;
    }
  } catch {
    // 非 Cloudflare Worker 請求上下文或環境尚未綁定，安全返回 null
  }
  return null;
};

/**
 * 讀取快取條目（先查記憶體，若無則查 Cloudflare KV）
 */
export const readCacheEntry = async <T>(key: string): Promise<CacheEntry<T> | null> => {
  // 1. 優先從記憶體讀取（0ms 延遲）
  const inMemory = memoryStore.get(key) as CacheEntry<T> | undefined;
  if (inMemory) {
    return inMemory;
  }

  // 2. 記憶體未命中，嘗試自 Cloudflare KV 讀取
  const kv = getCloudflareKv();
  if (!kv) {
    return null;
  }

  try {
    const kvRaw = await kv.get(key, 'text');
    if (!kvRaw) {
      return null;
    }

    const parsed = JSON.parse(kvRaw) as CacheEntry<T>;
    if (!parsed || typeof parsed.cachedAt !== 'number') {
      return null;
    }

    // 將 KV 資料回填至本機記憶體，加速後續讀取
    parsed.source = 'kv';
    pruneMemoryCacheIfFull();
    memoryStore.set(key, parsed as CacheEntry<unknown>);

    return parsed;
  } catch (error) {
    console.warn(`[EdgeCache] 從 Cloudflare KV 讀取金鑰 "${key}" 失敗:`, error);
    return null;
  }
};

/**
 * 寫入快取條目至記憶體與 Cloudflare KV
 */
export const writeCacheEntry = async <T>(
  key: string,
  value: T,
  ttlSeconds: number,
  swrSeconds: number
): Promise<void> => {
  const ttlMs = ttlSeconds * 1000;
  const swrMs = swrSeconds * 1000;

  const entry: CacheEntry<T> = {
    value,
    cachedAt: Date.now(),
    ttl: ttlMs,
    swrTtl: swrMs,
    source: 'memory',
  };

  // 1. 寫入記憶體
  pruneMemoryCacheIfFull();
  memoryStore.set(key, entry as CacheEntry<unknown>);

  // 2. 異步寫入 Cloudflare KV（若可用）
  const kv = getCloudflareKv();
  if (!kv) {
    return;
  }

  try {
    // 總生命週期設為 ttl + swr 緩衝時間，至少 60 秒
    const totalLifetimeSeconds = Math.max(60, Math.ceil(ttlSeconds + swrSeconds));
    await kv.put(key, JSON.stringify(entry), {
      expirationTtl: totalLifetimeSeconds,
    });
  } catch (error) {
    console.warn(`[EdgeCache] 寫入 Cloudflare KV 金鑰 "${key}" 失敗:`, error);
  }
};

/**
 * 核心 SWR 背景重新驗證 (Revalidation) 執行器
 */
const executeBackgroundRevalidation = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number,
  swrSeconds: number
): Promise<void> => {
  // 如果該金鑰當前已有正在執行的請求，則略過背景驗證以防重複刷 API
  if (inFlightRequests.has(key)) {
    return;
  }

  const revalidationPromise = (async () => {
    try {
      const freshData = await fetcher();
      if (freshData !== undefined && freshData !== null) {
        await writeCacheEntry(key, freshData, ttlSeconds, swrSeconds);
      }
    } catch (error) {
      cacheMetrics.errorsHandled++;
      console.warn(`[EdgeCache] 金鑰 "${key}" 背景重新驗證失敗（已保持原有 Stale 資料）:`, error);
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, revalidationPromise);
};

/**
 * 輔助解析兜底 Fallback 值
 */
const resolveFallbackValue = async <T>(
  fallback?: T | (() => Promise<T> | T)
): Promise<T> => {
  if (typeof fallback === 'function') {
    return (fallback as () => Promise<T> | T)();
  }
  return fallback as T;
};

/**
 * Stale-While-Revalidate (SWR) 包裝器
 *
 * 1. 命中且 Fresh：立即返回，不請求外部 API
 * 2. 命中但 Stale：立即返回過期資料，並在背景觸發異步 Revalidate 更新
 * 3. 完全未命中或超過 SWR 期限：透過 Single-Flight 去重執行 fetcher
 * 4. 外部 API 故障（如 429 或 500）：平滑降級至最後存留的快取，若無快取則降級至 fallback
 */
export const withStaleWhileRevalidate = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions<T> = {}
): Promise<T> => {
  const {
    ttlSeconds = 7200, // 預設 2 小時
    swrSeconds = 86400, // 預設 24 小時寬限期
    fallback,
    forceFresh = false,
  } = options;

  const now = Date.now();
  let cachedEntry: CacheEntry<T> | null = null;

  // 1. 若非強制重抓，嘗試獲取既有快取
  if (!forceFresh) {
    cachedEntry = await readCacheEntry<T>(key);
  }

  if (cachedEntry) {
    const age = now - cachedEntry.cachedAt;
    const isFresh = age <= cachedEntry.ttl;
    const isStale = age > cachedEntry.ttl && age <= cachedEntry.ttl + cachedEntry.swrTtl;

    // 情況 A: 資料完全新鮮，立即命中返回
    if (isFresh) {
      cacheMetrics.hits++;
      return cachedEntry.value;
    }

    // 情況 B: 資料處於 Stale 寬限期，立即返回舊資料並在背景觸發更新
    if (isStale) {
      cacheMetrics.staleHits++;
      // 觸發背景非阻塞更新
      executeBackgroundRevalidation(key, fetcher, ttlSeconds, swrSeconds).catch(() => {});
      return cachedEntry.value;
    }
  }

  // 情況 C: 未命中快取或快取已過寬限期，需同步請求外部 API
  // 透過 Single-Flight 機制去重，防止併發請求穿透引發 429
  let flightPromise = inFlightRequests.get(key) as Promise<T> | undefined;

  if (!flightPromise) {
    cacheMetrics.misses++;
    flightPromise = (async () => {
      try {
        const freshData = await fetcher();
        if (freshData !== undefined && freshData !== null) {
          await writeCacheEntry(key, freshData, ttlSeconds, swrSeconds);
        }
        return freshData;
      } catch (error) {
        cacheMetrics.errorsHandled++;
        console.warn(`[EdgeCache] 請求外部資源失敗 [${key}]:`, error);

        // 平滑降級策略 1: 若有任何歷史過期快取，即便已逾期仍立即兜底回傳
        if (cachedEntry && cachedEntry.value !== undefined && cachedEntry.value !== null) {
          cacheMetrics.fallbackHits++;
          console.warn(`[EdgeCache] 外部 API 故障，平滑降級使用歷史快取 [${key}]`);
          return cachedEntry.value;
        }

        // 平滑降級策略 2: 若提供了預設 fallback，則回傳安全兜底值
        if (fallback !== undefined) {
          cacheMetrics.fallbackHits++;
          console.warn(`[EdgeCache] 外部 API 故障且無歷史快取，採用預設 Fallback [${key}]`);
          return await resolveFallbackValue(fallback);
        }

        // 若無任何降級方案，拋出異常
        throw error;
      } finally {
        inFlightRequests.delete(key);
      }
    })();

    inFlightRequests.set(key, flightPromise as Promise<unknown>);
  }

  return flightPromise;
};

/**
 * 取得快取運行效能與監控統計指標
 */
export const getCacheMetrics = (): CacheMetrics => {
  return { ...cacheMetrics };
};

/**
 * 重設快取監控統計指標（供測試或效能重置使用）
 */
export const resetCacheMetrics = (): void => {
  cacheMetrics.hits = 0;
  cacheMetrics.staleHits = 0;
  cacheMetrics.misses = 0;
  cacheMetrics.fallbackHits = 0;
  cacheMetrics.errorsHandled = 0;
};

/**
 * 清除單一金鑰或全域快取（供測試與除錯使用）
 */
export const clearCache = async (key?: string): Promise<void> => {
  if (key) {
    memoryStore.delete(key);
    inFlightRequests.delete(key);
    const kv = getCloudflareKv();
    if (kv) {
      try {
        await kv.delete(key);
      } catch {
        // ignore delete failure
      }
    }
    return;
  }

  memoryStore.clear();
  inFlightRequests.clear();
  resetCacheMetrics();
};
