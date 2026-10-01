import { NextRequest } from 'next/server';
import { D1MarketplaceRepository } from '@/services/server/d1MarketplaceRepository';
import { apiSuccess, handleApiError } from '@/utils/apiResponse';
import { UpdateListingStatusInputSchema } from '@/contracts/marketplace.schema';

export const dynamic = 'force-dynamic';

export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const validated = UpdateListingStatusInputSchema.parse(body);

    const repo = new D1MarketplaceRepository();
    const updated = await repo.updateStatus(id, validated.status, validated.soldPrice);

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
};
