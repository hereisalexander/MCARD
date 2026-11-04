import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/services/server/authHelper';
import { apiSuccess, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const GET = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return apiSuccess({ user: null });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      provider: user.passwordHash ? 'email' : 'google',
      createdAt: user.createdAt,
      joinedAt: user.createdAt,
    };

    return apiSuccess({ user: safeUser });
  } catch (error) {
    return handleApiError(error);
  }
};

