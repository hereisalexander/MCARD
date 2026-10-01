import { NextRequest } from 'next/server';
import { D1MarketplaceRepository } from '@/services/server/d1MarketplaceRepository';
import { apiSuccess, apiError, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const GET = async (
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;
    const repo = new D1MarketplaceRepository();
    const listing = await repo.getById(id);

    if (!listing) {
      return apiError('RESOURCE_NOT_FOUND', `找不到 ID 為 ${id} 之掛單記錄`, undefined, 404);
    }

    return apiSuccess(listing);
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
    const repo = new D1MarketplaceRepository();
    const success = await repo.delete(id);

    if (!success) {
      return apiError('RESOURCE_NOT_FOUND', `找不到 ID 為 ${id} 之掛單記錄`, undefined, 404);
    }

    return apiSuccess({ message: 'Listing successfully deleted.' });
  } catch (error) {
    return handleApiError(error);
  }
};
