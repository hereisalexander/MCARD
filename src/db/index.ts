import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import * as schema from './schema';

export type AppDatabase = DrizzleD1Database<typeof schema>;

export const getDb = (): AppDatabase => {
  try {
    const { env } = getCloudflareContext();
    if (env && env.DB) {
      return drizzle(env.DB, { schema });
    }
  } catch (error) {
    console.warn('[D1 Database] 無法取得 Cloudflare Context，可能處於靜態建置或本機獨立模式:', error);
  }

  throw new Error('Cloudflare D1 實例尚未綁定，請確認已配置 wrangler.jsonc 並正確注入 DB 資源');
};

export { schema };
