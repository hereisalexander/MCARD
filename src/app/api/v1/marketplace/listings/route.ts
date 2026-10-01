import { NextRequest } from 'next/server';
import { D1MarketplaceRepository } from '@/services/server/d1MarketplaceRepository';
import { apiSuccess, handleApiError } from '@/utils/apiResponse';
import { CardCategory } from '@/contracts/common.schema';
import { ListingStatus } from '@/contracts/marketplace.schema';

export const dynamic = 'force-dynamic';

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as CardCategory | undefined;
    const status = searchParams.get('status') as ListingStatus | undefined;

    const repo = new D1MarketplaceRepository();
    const listings = await repo.getAll({
      category: category || undefined,
      status: status || undefined,
    });

    return apiSuccess(listings, { totalCount: listings.length });
  } catch (error) {
    return handleApiError(error);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const seller = body.seller || {
      name: body.sellerName || '藏家賣家',
      avatar: body.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    };

    const repo = new D1MarketplaceRepository();
    const created = await repo.create(body, seller);

    return apiSuccess(created, undefined, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
};
