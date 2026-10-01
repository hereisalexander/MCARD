import { NextRequest } from 'next/server';
import { D1WishlistRepository } from '@/services/server/d1WishlistRepository';
import { apiSuccess, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const GET = async () => {
  try {
    const repo = new D1WishlistRepository();
    const items = await repo.getAll();
    return apiSuccess(items, { totalCount: items.length });
  } catch (error) {
    return handleApiError(error);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const repo = new D1WishlistRepository();
    const created = await repo.add(body);
    return apiSuccess(created, undefined, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
};
