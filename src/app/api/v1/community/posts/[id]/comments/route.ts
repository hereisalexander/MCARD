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
    const user = await requireAuth(req);
    const { id } = await context.params;
    const body = await req.json();

    const author = {
      name: user.name,
      avatar: user.avatarUrl,
    };

    const repo = new D1CommunityRepository();
    const comment = await repo.addComment(id, body.content, author);

    return apiSuccess(comment, undefined, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
};
