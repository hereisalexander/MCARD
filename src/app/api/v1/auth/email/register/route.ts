import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/utils/crypto';
import { createSession, getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/services/server/authHelper';
import { apiSuccess, apiError, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

const RegisterSchema = z.object({
  email: z.string().email('請輸入有效的 Email 地址'),
  password: z.string().min(6, '密碼長度至少需 6 個字元'),
  name: z.string().min(1, '請輸入暱稱或姓名').max(50, '暱稱最多 50 個字元'),
});

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validated = RegisterSchema.parse(body);

    const db = getDb();
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validated.email.toLowerCase()))
      .get();

    if (existingUser) {
      return apiError('RESOURCE_CONFLICT', '此 Email 已經註冊，請直接登入', undefined, 409);
    }

    const passwordHash = await hashPassword(validated.password);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      validated.name || validated.email
    )}`;
    const now = new Date().toISOString();

    await db.insert(users).values({
      id: userId,
      email: validated.email.toLowerCase(),
      name: validated.name,
      avatarUrl,
      passwordHash,
      role: 'user',
      createdAt: now,
      updatedAt: now,
    });

    // 建立新 Session
    const { rawToken } = await createSession(userId);

    // 寫入 Session Cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, rawToken, getSessionCookieOptions());

    const safeUser = {
      id: userId,
      email: validated.email.toLowerCase(),
      name: validated.name,
      avatarUrl,
      role: 'user',
      provider: 'email',
      createdAt: now,
      joinedAt: now,
    };

    return apiSuccess(safeUser, undefined, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
};

