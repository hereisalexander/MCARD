import { NextRequest } from 'next/server';
import { D1PortfolioRepository } from '@/services/server/d1PortfolioRepository';
import { apiSuccess, apiError, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const repo = new D1PortfolioRepository();
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
    const repo = new D1PortfolioRepository();
    const success = await repo.remove(id);
    if (!success) {
      return apiError('RESOURCE_NOT_FOUND', `找不到 ID 為 ${id} 之資產記錄`, undefined, 404);
    }
    return apiSuccess({ message: 'Asset successfully removed.' });
  } catch (error) {
    return handleApiError(error);
  }
};
