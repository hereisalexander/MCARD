import { z } from 'zod';
import { CardCategorySchema } from './common.schema';

// 貼文類型分類
export const CommunityPostTypeSchema = z.enum([
  'showcase',
  'marketplace',
  'grading',
  'discussion',
]);
export type CommunityPostType = z.infer<typeof CommunityPostTypeSchema>;

// 留言實體
export const CommunityCommentSchema = z.object({
  id: z.string().min(1),
  authorName: z.string().min(1),
  authorAvatar: z.string().url(),
  content: z.string().min(1, '留言內容不得為空').max(300, '留言上限 300 字'),
  createdAt: z.string().min(1),
  likes: z.number().int().nonnegative().default(0),
});
export type CommunityComment = z.infer<typeof CommunityCommentSchema>;

// 新增留言之輸入校驗 (Create Comment Input)
export const CreateCommentInputSchema = z.object({
  content: z.string().trim().min(1, '請輸入留言內容').max(300, '留言內容不可超過 300 字'),
});
export type CreateCommentInput = z.infer<typeof CreateCommentInputSchema>;

// 引用之卡牌資訊標籤
export const CardTagInfoSchema = z.object({
  cardName: z.string().min(1),
  price: z.number().nonnegative().optional(),
  isForSale: z.boolean().optional(),
  condition: z.string().optional(),
  originalPrice: z.number().nonnegative().optional(),
  discountPercent: z.number().optional(),
  category: CardCategorySchema.optional(),
  imageUrl: z.string().url().optional(),
});
export type CardTagInfo = z.infer<typeof CardTagInfoSchema>;

// 社群作者資料
export const PostAuthorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  avatar: z.string().url(),
  handle: z.string().min(1),
  badge: z.string().optional(),
  isVerified: z.boolean().optional(),
});
export type PostAuthor = z.infer<typeof PostAuthorSchema>;

// 社群貼文實體
export const CommunityPostSchema = z.object({
  id: z.string().min(1),
  author: PostAuthorSchema,
  type: CommunityPostTypeSchema.default('showcase'),
  title: z.string().min(1, '貼文標題為必填').max(80, '標題上限 80 字'),
  content: z.string().min(1, '貼文內容為必填').max(2000, '貼文上限 2000 字'),
  imageUrl: z.string().url('首圖必須為有效 URL'),
  additionalImages: z.array(z.string().url()).max(4, '最多上傳 4 張附圖').default([]),
  tags: z.array(z.string()).default([]),
  likes: z.number().int().nonnegative().default(0),
  isLiked: z.boolean().default(false),
  commentsCount: z.number().int().nonnegative().default(0),
  comments: z.array(CommunityCommentSchema).default([]),
  createdAt: z.string().min(1),
  date: z.string().optional(),
  location: z.string().max(50).optional(),
  cardInfo: CardTagInfoSchema.optional(),
});
export type CommunityPost = z.infer<typeof CommunityPostSchema>;

// 發布貼文之輸入校驗 (Create Post Input)
export const CreatePostInputSchema = z.object({
  title: z.string().trim().min(2, '標題至少需 2 個字元').max(80, '標題不可超過 80 字'),
  content: z.string().trim().min(5, '內容至少需 5 個字元').max(2000, '內容不可超過 2000 字'),
  type: CommunityPostTypeSchema.default('showcase'),
  imageUrl: z.string().trim().url('請輸入正確的圖片 URL 連結'),
  tags: z.array(z.string()).default([]),
  cardInfo: CardTagInfoSchema.optional(),
});
export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;
