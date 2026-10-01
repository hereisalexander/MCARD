import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types';

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    KV_CACHE?: KVNamespace;
    BUCKET?: R2Bucket;
  }
}

export {};
