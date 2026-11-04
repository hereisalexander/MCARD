import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { verifyPassword } from '@/utils/crypto';
import { createSession, getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/services/server/authHelper';
import { apiSuccess, apiError, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

const LoginSchema = z.object({
  email: z.string().email('請輸入有效的 Email 地址'),
  password: z.string().min(1, '請輸入密碼'),
});

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validated = LoginSchema.parse(body);

    const db = getDb();
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, validated.email.toLowerCase()))
      .get();

    if (!user || !user.passwordHash) {
      return apiError('UNAUTHORIZED', '帳號或密碼不正確', undefined, 401);
    }

    const isMatch = await verifyPassword(validated.password, user.passwordHash);
    if (!isMatch) {
      return apiError('UNAUTHORIZED', '帳號或密碼不正確', undefined, 401);
    }

    // 建立新 Session
    const { rawToken } = await createSession(user.id);

    // 寫入 Session Cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, rawToken, getSessionCookieOptions());

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      provider: 'email',
      createdAt: user.createdAt,
      joinedAt: user.createdAt,
    };

    return apiSuccess(safeUser);
  } catch (error) {
    return handleApiError(error);
  }
};

