import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { eq, and } from 'drizzle-orm';
import { getDb } from '@/db';
import { users, accounts } from '@/db/schema';
import { createSession, getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/services/server/authHelper';

export const dynamic = 'force-dynamic';

interface GoogleUserInfo {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  email_verified?: boolean;
}

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  const origin =
    process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin || 'http://localhost:3000';

  if (errorParam) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(errorParam)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/?auth_error=missing_code_or_state`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get('mcard_oauth_state')?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${origin}/?auth_error=csrf_state_mismatch`);
  }

  // 清除 state cookie
  cookieStore.delete('mcard_oauth_state');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/?auth_error=missing_google_credentials`);
  }

  const redirectUri = `${origin}/api/v1/auth/google/callback`;

  try {
    // 1. 交換 Google Token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('[Google OAuth Token Error]:', errText);
      return NextResponse.redirect(`${origin}/?auth_error=token_exchange_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. 取得 Google 個人檔案資訊
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoRes.ok) {
      return NextResponse.redirect(`${origin}/?auth_error=userinfo_fetch_failed`);
    }

    const googleUser = (await userinfoRes.json()) as GoogleUserInfo;
    const db = getDb();
    const now = new Date().toISOString();

    // 3. 檢查第三方帳號關聯表
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, 'google'),
          eq(accounts.providerAccountId, googleUser.sub)
        )
      )
      .get();

    let targetUserId: string;

    if (existingAccount) {
      targetUserId = existingAccount.userId;
      // 可選：更新姓名與頭像
      await db
        .update(users)
        .set({
          name: googleUser.name || 'Google 使用者',
          avatarUrl: googleUser.picture || '',
          updatedAt: now,
        })
        .where(eq(users.id, targetUserId));
    } else {
      // 檢查是否已有相同 Email 的使用者
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, googleUser.email.toLowerCase()))
        .get();

      if (existingUser) {
        targetUserId = existingUser.id;
      } else {
        targetUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        await db.insert(users).values({
          id: targetUserId,
          email: googleUser.email.toLowerCase(),
          name: googleUser.name || 'Google 使用者',
          avatarUrl:
            googleUser.picture ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googleUser.email)}`,
          role: 'user',
          createdAt: now,
          updatedAt: now,
        });
      }

      // 建立帳號綁定關聯
      await db.insert(accounts).values({
        id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        userId: targetUserId,
        provider: 'google',
        providerAccountId: googleUser.sub,
        createdAt: now,
      });
    }

    // 4. 建立 Session
    const { rawToken } = await createSession(targetUserId);

    // 5. 寫入 Session Cookie
    cookieStore.set(SESSION_COOKIE_NAME, rawToken, getSessionCookieOptions());

    return NextResponse.redirect(`${origin}/?auth=success`);
  } catch (err) {
    console.error('[Google OAuth Callback Error]:', err);
    return NextResponse.redirect(`${origin}/?auth_error=internal_callback_error`);
  }
};

