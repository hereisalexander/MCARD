/**
 * Web Crypto API 安全加解密工具庫
 * 針對 Cloudflare Workers 邊緣環境最佳化，不依賴任何 Node.js 原生 C++ 模組
 */

const HASH_ITERATIONS = 100000;
const KEY_LENGTH_BITS = 256;

// 輔助函式：將 Uint8Array 轉為 Hex 字串
const toHex = (buffer: Uint8Array): string => {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// 輔助函式：將 Hex 字串轉為 Uint8Array
const fromHex = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

// 輔助函式：防止時序攻擊的恆定時間比對 (Constant-time comparison)
const timingSafeEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
};

/**
 * 使用 PBKDF2-SHA256 對明文密碼進行加鹽雜湊
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: HASH_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    KEY_LENGTH_BITS
  );

  const derivedBytes = new Uint8Array(derivedBits);
  return `${toHex(salt)}:${toHex(derivedBytes)}`;
};

/**
 * 驗證輸入密碼與存儲的加鹽雜湊是否相符
 */
export const verifyPassword = async (
  password: string,
  storedHash: string
): Promise<boolean> => {
  const parts = storedHash.split(':');
  if (parts.length !== 2) {
    return false;
  }

  const [saltHex, originalHashHex] = parts;
  const salt = fromHex(saltHex);
  const originalBytes = fromHex(originalHashHex);

  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: HASH_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    KEY_LENGTH_BITS
  );

  const derivedBytes = new Uint8Array(derivedBits);
  return timingSafeEqual(originalBytes, derivedBytes);
};

/**
 * 生成高強度隨機 Session Token
 */
export const generateSessionToken = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return toHex(bytes);
};

/**
 * 對 Session Token 進行 SHA-256 雜湊
 * 資料庫僅儲存雜湊值，防止資料庫洩漏導致會話被劫持
 */
export const hashSessionToken = async (token: string): Promise<string> => {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(token));
  return toHex(new Uint8Array(digest));
};
