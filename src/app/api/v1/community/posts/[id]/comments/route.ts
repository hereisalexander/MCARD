import { NextRequest } from 'next/server';
import { D1CommunityRepository } from '@/services/server/d1CommunityRepository';
import { apiSuccess, handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export const POST = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const author = body.author || {
      name: '藏家玩家',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    };

    const repo = new D1CommunityRepository();
    const comment = await repo.addComment(id, body.content, author);

    return apiSuccess(comment, undefined, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
};
