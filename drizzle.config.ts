import { defineConfig } from 'drizzle-kit';
import fs from 'fs';
import path from 'path';

// 自動定位 Wrangler 本地 D1 生成的 SQLite 檔案
const findLocalD1Sqlite = (): string | undefined => {
  const d1Dir = path.resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
  if (!fs.existsSync(d1Dir)) return undefined;

  const files = fs.readdirSync(d1Dir);
  const sqliteFile = files.find((file) => file.endsWith('.sqlite') && file !== 'metadata.sqlite');
  return sqliteFile ? path.join(d1Dir, sqliteFile) : undefined;
};

const localDbPath = findLocalD1Sqlite();
// LibSQL 在 Windows 需使用 file: 或 file:/// 前綴格式
const dbUrl = localDbPath ? `file:${localDbPath.replace(/\\/g, '/')}` : undefined;

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  ...(dbUrl ? { dbCredentials: { url: dbUrl } } : {}),
});
