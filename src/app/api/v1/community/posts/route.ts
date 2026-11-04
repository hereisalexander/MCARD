import { NextRequest } from 'next/server';
import { D1CommunityRepository } from '@/services/server/d1CommunityRepository';
import { requireAuth } from '@/services/server/authHelper';
import { apiSuccess, handleApiError } from '@/utils/apiResponse';
import { CommunityPostType } from '@/contracts/community.schema';

export const dynamic = 'force-dynamic';

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as CommunityPostType | undefined;

    const repo = new D1CommunityRepository();
    const feed = await repo.getFeed(type || undefined);

    return apiSuccess(feed, { totalCount: feed.length });
  } catch (error) {
    return handleApiError(error);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const author = {
      id: user.id,
      name: user.name,
      avatar: user.avatarUrl,
      handle: `@${user.email.split('@')[0]}`,
      badge: '認證藏家',
    };

    const repo = new D1CommunityRepository();
    const created = await repo.createPost(body, author);

    return apiSuccess(created, undefined, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
};
