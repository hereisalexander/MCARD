import { NextRequest } from 'next/server';
import { D1PortfolioRepository } from '@/services/server/d1PortfolioRepository';
import { getCurrentUser, requireAuth } from '@/services/server/authHelper';
import { apiSuccess, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const GET = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return apiSuccess([], {
        totalCount: 0,
        totalAssetsCount: 0,
        totalPortfolioValueUSD: 0,
        totalCostUSD: 0,
        unrealizedPnLUSD: 0,
        overallRoiPercent: null,
      });
    }

    const repo = new D1PortfolioRepository();
    const assets = await repo.getAll(user.id);
    const summary = await repo.getSummary(user.id);
    return apiSuccess(assets, {
      totalCount: assets.length,
      ...summary,
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const repo = new D1PortfolioRepository();
    const created = await repo.add(body, user.id);
    return apiSuccess(created, undefined, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
};
