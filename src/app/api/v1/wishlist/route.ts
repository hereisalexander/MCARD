import { NextRequest } from 'next/server';
import { D1WishlistRepository } from '@/services/server/d1WishlistRepository';
import { getCurrentUser, requireAuth } from '@/services/server/authHelper';
import { apiSuccess, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const GET = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return apiSuccess([], { totalCount: 0 });
    }

    const repo = new D1WishlistRepository();
    const items = await repo.getAll(user.id);
    return apiSuccess(items, { totalCount: items.length });
  } catch (error) {
    return handleApiError(error);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const repo = new D1WishlistRepository();
    const created = await repo.add(body, user.id);
    return apiSuccess(created, undefined, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
};
