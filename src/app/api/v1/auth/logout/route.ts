import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { destroySession, SESSION_COOKIE_NAME } from '@/services/server/authHelper';
import { apiSuccess, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const POST = async (req: NextRequest) => {
  try {
    await destroySession(req);

    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return apiSuccess({ success: true, message: '已成功登出' });
  } catch (error) {
    return handleApiError(error);
  }
};

