import { NextRequest } from 'next/server';
import { D1CommunityRepository } from '@/services/server/d1CommunityRepository';
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
    const body = await req.json();
    const author = body.author || {
      id: 'local-user',
      name: 'TCG 藏家',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
      handle: '@mcard_collector',
      badge: '認證藏家',
    };

    const repo = new D1CommunityRepository();
    const created = await repo.createPost(body, author);

    return apiSuccess(created, undefined, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
};
