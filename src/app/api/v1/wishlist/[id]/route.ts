import { NextRequest } from 'next/server';
import { D1WishlistRepository } from '@/services/server/d1WishlistRepository';
import { apiSuccess, apiError, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const repo = new D1WishlistRepository();
    const updated = await repo.update(id, body);
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
};

export const DELETE = async (
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;
    const repo = new D1WishlistRepository();
    const success = await repo.remove(id);

    if (!success) {
      return apiError('RESOURCE_NOT_FOUND', `找不到 ID 為 ${id} 之願望清單項目`, undefined, 404);
    }

    return apiSuccess({ message: 'Wishlist item successfully removed.' });
  } catch (error) {
    return handleApiError(error);
  }
};
