import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const GET = async (req: NextRequest) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return apiError(
      'INTERNAL_SERVER_ERROR',
      'Google OAuth 尚未配置 GOOGLE_CLIENT_ID，請於環境變數中設定後再試。',
      undefined,
      500
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin || 'http://localhost:3000';
  const redirectUri = `${origin}/api/v1/auth/google/callback`;

  // 生成防 CSRF 的隨機 State
  const state = crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set('mcard_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 分鐘有效
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state: state,
    prompt: 'select_account',
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.redirect(googleAuthUrl);
};

