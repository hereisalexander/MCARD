export type CommunityPostType = 'showcase' | 'marketplace' | 'grading' | 'discussion';

export interface CommunityComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes?: number;
}

export interface CardTagInfo {
  cardName: string;
  price?: number;
  isForSale?: boolean;
  condition?: string; // 'PSA 10' | 'PSA 9' | 'BGS 10' | 'Ungraded' | 'CGC 10'
  originalPrice?: number;
  discountPercent?: number;
  category?: 'pokemon' | 'onepiece' | 'sports' | 'yugioh';
  imageUrl?: string;
}

export interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    handle: string;
    badge?: string;
    isVerified?: boolean;
  };
  type: CommunityPostType;
  title: string;
  content: string;
  imageUrl: string;
  additionalImages?: string[];
  tags: string[];
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  comments?: CommunityComment[];
  createdAt: string;
  date?: string; // e.g. '09-18' for Xiaohongshu style
  aspectRatio?: 'tall' | 'portrait' | 'square' | 'wide';
  isVideo?: boolean;
  videoDuration?: string; // e.g. '0:47'
  location?: string;
  cardInfo?: CardTagInfo;
}

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [];

export const isDemoPost = (post?: unknown): boolean => {
  if (!post || typeof post !== 'object') return false;
  const id = (post as { id?: string }).id || '';
  const demoIds = [
    'post-xhs-1',
    'post-xhs-2',
    'post-xhs-3',
    'post-xhs-4',
    'post-xhs-5',
    'post-1',
    'post-2',
    'post-3',
    'post-6',
  ];
  return demoIds.includes(id) || id.startsWith('post-xhs-') || id.startsWith('demo-') || id.startsWith('mock-');
};
