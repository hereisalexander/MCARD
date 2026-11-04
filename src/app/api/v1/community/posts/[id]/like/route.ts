import { NextRequest } from 'next/server';
import { D1CommunityRepository } from '@/services/server/d1CommunityRepository';
import { requireAuth } from '@/services/server/authHelper';
import { apiSuccess, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const POST = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await requireAuth(req);
    const { id } = await context.params;
    const repo = new D1CommunityRepository();
    const result = await repo.toggleLike(id);

    return apiSuccess({
      postId: id,
      isLiked: result.isLiked,
      newLikesCount: result.newLikes,
    });
  } catch (error) {
    return handleApiError(error);
  }
};
