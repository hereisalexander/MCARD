import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { eq, gt } from 'drizzle-orm';
import { getDb } from '@/db';
import { users, sessions, UserRow, SessionRow } from '@/db/schema';
import { generateSessionToken, hashSessionToken } from '@/utils/crypto';

export const SESSION_COOKIE_NAME = 'mcard_session';
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 天

export class AuthRequiredError extends Error {
  constructor(message: string = '請先登入後再進行此操作') {
    super(message);
    this.name = 'AuthRequiredError';
  }
}

/**
 * 取得 Session Cookie 寫入規格
 */
export const getSessionCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
};

/**
 * 為指定使用者建立新 Session 並寫入 D1
 */
export const createSession = async (
  userId: string
): Promise<{ session: SessionRow; rawToken: string }> => {
  const db = getDb();
  const rawToken = generateSessionToken();
  const tokenHash = await hashSessionToken(rawToken);
  const now = Date.now();
  const expiresAt = now + SESSION_MAX_AGE_SECONDS * 1000;

  const sessionId = `sess_${now}_${Math.random().toString(36).substring(2, 8)}`;

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    tokenHash,
    expiresAt,
    createdAt: new Date().toISOString(),
  });

  const sessionRow: SessionRow = {
    id: sessionId,
    userId,
    tokenHash,
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  return { session: sessionRow, rawToken };
};

/**
 * 從請求中解析 Session Token
 */
export const extractSessionToken = async (req?: NextRequest): Promise<string | null> => {
  if (req) {
    const cookieHeader = req.cookies.get(SESSION_COOKIE_NAME);
    if (cookieHeader?.value) {
      return cookieHeader.value;
    }
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME);
    return token?.value || null;
  } catch {
    return null;
  }
};

/**
 * 獲取當前登入者資訊（若未登入或過期則回傳 null）
 */
export const getCurrentUser = async (req?: NextRequest): Promise<UserRow | null> => {
  const rawToken = await extractSessionToken(req);
  if (!rawToken) {
    return null;
  }

  const tokenHash = await hashSessionToken(rawToken);
  const db = getDb();
  const now = Date.now();

  const sessionRecord = await db
    .select()
    .from(sessions)
    .where(eq(sessions.tokenHash, tokenHash))
    .get();

  if (!sessionRecord) {
    return null;
  }

  // 檢查是否已過期
  if (sessionRecord.expiresAt < now) {
    // 異步清理過期 Session
    db.delete(sessions).where(eq(sessions.id, sessionRecord.id)).catch(() => {});
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionRecord.userId))
    .get();

  return user || null;
};

/**
 * 要求登入（若未登入拋出 AuthRequiredError，由 API Handler 統一轉換為 401）
 */
export const requireAuth = async (req?: NextRequest): Promise<UserRow> => {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new AuthRequiredError();
  }
  return user;
};

/**
 * 銷毀目前 Session（登出）
 */
export const destroySession = async (req?: NextRequest): Promise<void> => {
  const rawToken = await extractSessionToken(req);
  if (!rawToken) {
    return;
  }

  const tokenHash = await hashSessionToken(rawToken);
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
};

