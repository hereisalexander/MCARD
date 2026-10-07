import { D1PortfolioRepository } from '@/services/server/d1PortfolioRepository';
import { apiSuccess, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const GET = async () => {
  try {
    const repo = new D1PortfolioRepository();
    const summary = await repo.getSummary();
    return apiSuccess(summary);
  } catch (error) {
    return handleApiError(error);
  }
};
