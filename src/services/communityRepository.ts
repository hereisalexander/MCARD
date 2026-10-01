import {
  CommunityPost,
  CommunityComment,
  CreatePostInput,
  CreatePostInputSchema,
  CreateCommentInputSchema,
  CommunityPostType,
} from '@/contracts/community.schema';
import { ICommunityRepository } from './repository.types';
import { INITIAL_COMMUNITY_POSTS } from '@/types/community';

const STORAGE_KEY = 'mcard_community_posts_v1';

export class LocalCommunityRepository implements ICommunityRepository {
  private getStorageData(): CommunityPost[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.setStorageData(INITIAL_COMMUNITY_POSTS as unknown as CommunityPost[]);
        return INITIAL_COMMUNITY_POSTS as unknown as CommunityPost[];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed as CommunityPost[];
    } catch (err) {
      console.error('[CommunityRepository] 讀取社群資料失敗:', err);
      return [];
    }
  }

  private setStorageData(data: CommunityPost[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('[CommunityRepository] 寫入社群資料失敗:', err);
    }
  }

  async getFeed(filterType?: CommunityPostType): Promise<CommunityPost[]> {
    const list = this.getStorageData();
    if (!filterType) return list;
    return list.filter((p) => p.type === filterType);
  }

  async getById(id: string): Promise<CommunityPost | null> {
    const list = this.getStorageData();
    const found = list.find((p) => p.id === id);
    return found || null;
  }

  async createPost(
    input: CreatePostInput,
    author: { id: string; name: string; avatar: string; handle: string; badge?: string }
  ): Promise<CommunityPost> {
    const validated = CreatePostInputSchema.parse(input);

    const now = new Date();
    const dateFormatted = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    const newPost: CommunityPost = {
      id: `post-local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: {
        id: author.id,
        name: author.name,
        avatar: author.avatar,
        handle: author.handle,
        badge: author.badge,
        isVerified: true,
      },
      ...validated,
      additionalImages: [],
      likes: 0,
      isLiked: false,
      commentsCount: 0,
      comments: [],
      createdAt: '剛剛',
      date: dateFormatted,
    };

    const currentList = this.getStorageData();
    const updated = [newPost, ...currentList];
    this.setStorageData(updated);

    return newPost;
  }

  async toggleLike(postId: string): Promise<{ isLiked: boolean; newLikes: number }> {
    const list = this.getStorageData();
    const index = list.findIndex((p) => p.id === postId);

    if (index === -1) {
      throw new Error(`找不到 ID 為 ${postId} 之貼文`);
    }

    const post = list[index];
    const currentlyLiked = Boolean(post.isLiked);
    const newIsLiked = !currentlyLiked;
    const newLikes = newIsLiked ? post.likes + 1 : Math.max(0, post.likes - 1);

    list[index] = {
      ...post,
      isLiked: newIsLiked,
      likes: newLikes,
    };

    this.setStorageData(list);
    return { isLiked: newIsLiked, newLikes };
  }

  async addComment(
    postId: string,
    content: string,
    author: { name: string; avatar: string }
  ): Promise<CommunityComment> {
    const validated = CreateCommentInputSchema.parse({ content });

    const list = this.getStorageData();
    const index = list.findIndex((p) => p.id === postId);

    if (index === -1) {
      throw new Error(`找不到 ID 為 ${postId} 之貼文`);
    }

    const post = list[index];
    const newComment: CommunityComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      authorName: author.name,
      authorAvatar: author.avatar,
      content: validated.content,
      createdAt: '剛剛',
      likes: 0,
    };

    const updatedComments = [...(post.comments || []), newComment];
    list[index] = {
      ...post,
      comments: updatedComments,
      commentsCount: updatedComments.length,
    };

    this.setStorageData(list);
    return newComment;
  }

  async deletePost(postId: string): Promise<boolean> {
    const list = this.getStorageData();
    const filtered = list.filter((p) => p.id !== postId);
    if (filtered.length === list.length) {
      return false;
    }
    this.setStorageData(filtered);
    return true;
  }
}

import { ApiCommunityRepository } from './api/apiCommunityRepository';

export const communityRepository = new ApiCommunityRepository();
