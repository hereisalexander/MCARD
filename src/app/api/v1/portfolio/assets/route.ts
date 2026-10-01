import { NextRequest } from 'next/server';
import { D1PortfolioRepository } from '@/services/server/d1PortfolioRepository';
import { apiSuccess, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const GET = async () => {
  try {
    const repo = new D1PortfolioRepository();
    const assets = await repo.getAll();
    const summary = await repo.getSummary();
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
    const body = await req.json();
    const repo = new D1PortfolioRepository();
    const created = await repo.add(body);
    return apiSuccess(created, undefined, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
};
