import {
  CommunityPost,
  CommunityPostSchema,
  CommunityComment,
  CommunityCommentSchema,
  CreatePostInput,
  CreatePostInputSchema,
  CreateCommentInputSchema,
  CommunityPostType,
} from '@/contracts/community.schema';
import { ICommunityRepository } from '../repository.types';
import { LocalCommunityRepository } from '../communityRepository';

const STORAGE_KEY = 'mcard_community_posts_v1';

export class ApiCommunityRepository implements ICommunityRepository {
  private fallbackRepo = new LocalCommunityRepository();
  private hasSyncedLocalToD1 = false;

  private getCachedData(): CommunityPost[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as CommunityPost[];
    } catch {
      return [];
    }
  }

  private setCachedData(data: CommunityPost[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[ApiCommunityRepository] 快取寫入失敗:', e);
    }
  }

  private async autoSyncLocalPosts(cloudPosts: CommunityPost[]): Promise<CommunityPost[]> {
    if (this.hasSyncedLocalToD1 || typeof window === 'undefined') {
      return cloudPosts;
    }
    this.hasSyncedLocalToD1 = true;

    const localData = this.getCachedData();
    if (cloudPosts.length === 0 && localData.length > 0) {
      console.log(`[Cloudflare D1] 正在將 ${localData.length} 筆社群貼文同步至 D1...`);
      const migrated: CommunityPost[] = [];
      for (const item of localData) {
        try {
          const res = await fetch('/api/v1/community/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: item.title,
              content: item.content,
              type: item.type,
              imageUrl: item.imageUrl,
              tags: item.tags,
              cardInfo: item.cardInfo,
              author: item.author,
            }),
          });
          const json = await res.json();
          if (json.success && json.data) {
            migrated.push(json.data);
          }
        } catch (migErr) {
          console.warn('[D1 Migration] 社群貼文遷移失敗:', item.title, migErr);
        }
      }

      if (migrated.length > 0) {
        this.setCachedData(migrated);
        return migrated;
      }
    }

    return cloudPosts;
  }

  getFeed = async (filterType?: CommunityPostType): Promise<CommunityPost[]> => {
    try {
      const url = filterType ? `/api/v1/community/posts?type=${filterType}` : '/api/v1/community/posts';
      const res = await fetch(url, { cache: 'no-store' });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const validPosts: CommunityPost[] = [];
          for (const item of json.data) {
            const parsed = CommunityPostSchema.safeParse(item);
            if (parsed.success) {
              validPosts.push(parsed.data);
            }
          }
          const finalPosts = await this.autoSyncLocalPosts(validPosts);
          this.setCachedData(finalPosts);
          return finalPosts;
        }
      }
    } catch (err) {
      console.warn('[ApiCommunityRepository] 無法連線至 D1 API，退回本機:', err);
    }

    return this.fallbackRepo.getFeed(filterType);
  };

  getById = async (id: string): Promise<CommunityPost | null> => {
    try {
      const res = await fetch(`/api/v1/community/posts/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return CommunityPostSchema.parse(json.data);
        }
      }
    } catch {
      // 容錯退回本地
    }

    return this.fallbackRepo.getById(id);
  };

  createPost = async (
    input: CreatePostInput,
    author: { id: string; name: string; avatar: string; handle: string; badge?: string }
  ): Promise<CommunityPost> => {
    const validated = CreatePostInputSchema.parse(input);

    try {
      const res = await fetch('/api/v1/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validated, author }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const created = CommunityPostSchema.parse(json.data);
          const current = this.getCachedData();
          this.setCachedData([created, ...current]);
          return created;
        }
      }
    } catch (err) {
      console.warn('[ApiCommunityRepository] 遠端發文失敗，儲存至本地備用:', err);
    }

    return this.fallbackRepo.createPost(validated, author);
  };

  toggleLike = async (postId: string): Promise<{ isLiked: boolean; newLikes: number }> => {
    try {
      const res = await fetch(`/api/v1/community/posts/${postId}/like`, {
        method: 'POST',
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return {
            isLiked: Boolean(json.data.isLiked),
            newLikes: Number(json.data.newLikesCount || json.data.newLikes || 0),
          };
        }
      }
    } catch (err) {
      console.warn('[ApiCommunityRepository] 遠端按讚失敗，使用本地按讚:', err);
    }

    return this.fallbackRepo.toggleLike(postId);
  };

  addComment = async (
    postId: string,
    content: string,
    author: { name: string; avatar: string }
  ): Promise<CommunityComment> => {
    const validated = CreateCommentInputSchema.parse({ content });

    try {
      const res = await fetch(`/api/v1/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: validated.content, author }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return CommunityCommentSchema.parse(json.data);
        }
      }
    } catch (err) {
      console.warn('[ApiCommunityRepository] 遠端留言失敗，使用本地留言:', err);
    }

    return this.fallbackRepo.addComment(postId, validated.content, author);
  };

  deletePost = async (postId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/community/posts/${postId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const current = this.getCachedData();
          this.setCachedData(current.filter((p) => p.id !== postId));
          return true;
        }
      }
    } catch (err) {
      console.warn('[ApiCommunityRepository] 遠端刪除貼文失敗，刪除本地備用:', err);
    }

    return this.fallbackRepo.deletePost(postId);
  };
}
