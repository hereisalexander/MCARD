import { eq, desc } from 'drizzle-orm';
import { AppDatabase, getDb } from '@/db';
import { communityPosts, communityComments, InsertCommunityPostRow, InsertCommunityCommentRow } from '@/db/schema';
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

export class D1CommunityRepository implements ICommunityRepository {
  private customDb?: AppDatabase;

  constructor(db?: AppDatabase) {
    this.customDb = db;
  }

  private getDatabase(): AppDatabase {
    if (this.customDb) {
      return this.customDb;
    }
    return getDb();
  }

  private mapRowToPost = (
    row: typeof communityPosts.$inferSelect,
    commentsList: (typeof communityComments.$inferSelect)[] = []
  ): CommunityPost => {
    const parsedComments: CommunityComment[] = commentsList.map((c) =>
      CommunityCommentSchema.parse({
        id: c.id,
        authorName: c.authorName,
        authorAvatar: c.authorAvatar,
        content: c.content,
        createdAt: c.createdAt,
        likes: c.likes,
      })
    );

    return CommunityPostSchema.parse({
      id: row.id,
      author: {
        id: row.authorId,
        name: row.authorName,
        avatar: row.authorAvatar,
        handle: row.authorHandle,
        badge: row.authorBadge ?? undefined,
        isVerified: Boolean(row.isVerified),
      },
      type: row.type,
      title: row.title,
      content: row.content,
      imageUrl: row.imageUrl,
      additionalImages: row.additionalImages ?? [],
      tags: row.tags ?? [],
      likes: row.likes,
      isLiked: false,
      commentsCount: row.commentsCount,
      comments: parsedComments,
      location: row.location ?? undefined,
      cardInfo: row.cardInfo ? (typeof row.cardInfo === 'string' ? JSON.parse(row.cardInfo) : row.cardInfo) : undefined,
      createdAt: row.createdAt,
    });
  };

  getFeed = async (filterType?: CommunityPostType): Promise<CommunityPost[]> => {
    const db = this.getDatabase();
    const query = db.select().from(communityPosts);

    const postRows = filterType
      ? await query.where(eq(communityPosts.type, filterType)).orderBy(desc(communityPosts.createdAt))
      : await query.orderBy(desc(communityPosts.createdAt));

    const postsWithComments: CommunityPost[] = [];
    for (const postRow of postRows) {
      const commentRows = await db
        .select()
        .from(communityComments)
        .where(eq(communityComments.postId, postRow.id))
        .orderBy(desc(communityComments.createdAt));

      postsWithComments.push(this.mapRowToPost(postRow, commentRows));
    }

    return postsWithComments;
  };

  getById = async (id: string): Promise<CommunityPost | null> => {
    const db = this.getDatabase();
    const postRows = await db.select().from(communityPosts).where(eq(communityPosts.id, id)).limit(1);

    if (postRows.length === 0) {
      return null;
    }

    const commentRows = await db
      .select()
      .from(communityComments)
      .where(eq(communityComments.postId, id))
      .orderBy(desc(communityComments.createdAt));

    return this.mapRowToPost(postRows[0], commentRows);
  };

  createPost = async (
    input: CreatePostInput,
    author: { id: string; name: string; avatar: string; handle: string; badge?: string }
  ): Promise<CommunityPost> => {
    const validated = CreatePostInputSchema.parse(input);
    const db = this.getDatabase();

    const newId = `post-d1-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: InsertCommunityPostRow = {
      id: newId,
      authorId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      authorHandle: author.handle,
      authorBadge: author.badge ?? null,
      isVerified: true,
      type: validated.type,
      title: validated.title,
      content: validated.content,
      imageUrl: validated.imageUrl,
      additionalImages: [],
      tags: validated.tags ?? [],
      likes: 0,
      commentsCount: 0,
      cardInfo: validated.cardInfo ? JSON.stringify(validated.cardInfo) : null,
      createdAt: new Date().toISOString(),
    };

    await db.insert(communityPosts).values(newRecord);
    const created = await this.getById(newId);

    if (!created) {
      throw new Error('發布社群貼文失敗');
    }

    return created;
  };

  toggleLike = async (postId: string): Promise<{ isLiked: boolean; newLikes: number }> => {
    const db = this.getDatabase();
    const existing = await this.getById(postId);

    if (!existing) {
      throw new Error(`找不到 ID 為 ${postId} 之貼文`);
    }

    // 簡易 toggle：每次點選增加 1 個讚
    const newLikes = existing.likes + 1;
    await db
      .update(communityPosts)
      .set({ likes: newLikes })
      .where(eq(communityPosts.id, postId));

    return { isLiked: true, newLikes };
  };

  addComment = async (
    postId: string,
    content: string,
    author: { name: string; avatar: string; id?: string }
  ): Promise<CommunityComment> => {
    const validated = CreateCommentInputSchema.parse({ content });
    const db = this.getDatabase();

    const existing = await this.getById(postId);
    if (!existing) {
      throw new Error(`找不到 ID 為 ${postId} 之貼文`);
    }

    const commentId = `comment-d1-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const commentRecord: InsertCommunityCommentRow = {
      id: commentId,
      postId,
      authorId: author.id || 'anonymous-user',
      authorName: author.name,
      authorAvatar: author.avatar,
      content: validated.content,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    await db.insert(communityComments).values(commentRecord);
    await db
      .update(communityPosts)
      .set({ commentsCount: existing.commentsCount + 1 })
      .where(eq(communityPosts.id, postId));

    return CommunityCommentSchema.parse({
      id: commentId,
      authorName: author.name,
      authorAvatar: author.avatar,
      content: validated.content,
      createdAt: commentRecord.createdAt,
      likes: 0,
    });
  };

  deletePost = async (postId: string): Promise<boolean> => {
    const db = this.getDatabase();
    const existing = await this.getById(postId);
    if (!existing) {
      return false;
    }

    await db.delete(communityPosts).where(eq(communityPosts.id, postId));
    return true;
  };
}
