import { NextRequest } from 'next/server';
import { D1CommunityRepository } from '@/services/server/d1CommunityRepository';
import { apiSuccess, apiError, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const GET = async (
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;
    const repo = new D1CommunityRepository();
    const post = await repo.getById(id);

    if (!post) {
      return apiError('RESOURCE_NOT_FOUND', `找不到 ID 為 ${id} 之社群貼文`, undefined, 404);
    }

    return apiSuccess(post);
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
    const repo = new D1CommunityRepository();
    const success = await repo.deletePost(id);

    if (!success) {
      return apiError('RESOURCE_NOT_FOUND', `找不到 ID 為 ${id} 之社群貼文`, undefined, 404);
    }

    return apiSuccess({ message: 'Post successfully deleted.' });
  } catch (error) {
    return handleApiError(error);
  }
};
