import { z } from 'zod';
import { CardCategorySchema } from './common.schema';

// 掛單狀態枚舉
export const ListingStatusSchema = z.enum(['active', 'reserved', 'sold']);
export type ListingStatus = z.infer<typeof ListingStatusSchema>;

// 通訊聯絡管道枚舉
export const ContactPlatformSchema = z.enum(['line', 'instagram', 'phone', 'email']);
export type ContactPlatform = z.infer<typeof ContactPlatformSchema>;

// 掛單品相條件
export const ListingConditionSchema = z.enum([
  'PSA 10',
  'PSA 9',
  'PSA 8.5',
  'PSA 8',
  'BGS 10',
  'BGS 9.5',
  'BGS 9',
  'CGC 10',
  'CGC 9.5',
  'Ungraded Near Mint',
  'Near Mint',
  'Ungraded',
  'Played',
]);
export type ListingCondition = z.infer<typeof ListingConditionSchema>;

// 二手市集商品掛單實體
export const MarketListingSchema = z.object({
  id: z.string().min(1, '掛單 ID 不得為空'),
  sellerName: z.string().min(1, '賣家暱稱不得為空'),
  sellerAvatar: z.string().min(1, '賣家頭像不得為空'),
  sellerRating: z.number().min(1).max(5).default(5.0),
  sellerSalesCount: z.number().int().nonnegative().default(0),
  contactPlatform: ContactPlatformSchema,
  contactValue: z.string().min(1, '請提供聯絡方式代號或號碼'),
  cardName: z.string().min(1, '卡牌品名不得為空'),
  category: CardCategorySchema.default('pokemon'),
  setName: z.string().min(1, '所屬系列名稱不得為空'),
  officialPrice: z.number().nonnegative().default(0),
  askingPrice: z.number().positive('開價金額必須大於 0'),
  soldPrice: z.number().nonnegative().optional(),
  soldAt: z.string().optional(),
  portfolioCardId: z.string().optional(),
  buyInCost: z.number().nonnegative().optional(),
  condition: ListingConditionSchema,
  photos: z.array(
    z.string().refine(
      (val) => val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/') || val.startsWith('data:'),
      { message: '圖片必須是有效的 URL、本機圖片路徑或 Data URL' }
    )
  ).min(1, '至少需上傳 1 張實體卡況照').max(5, '最多上傳 5 張照片'),
  notes: z.string().max(500, '卡況說明上限 500 字').default(''),
  location: z.string().min(1, '交收地點或寄送方式為必填'),
  createdAt: z.string().min(1),
  status: ListingStatusSchema.default('active'),
  isOwner: z.boolean().optional(),
});
export type MarketListing = z.infer<typeof MarketListingSchema>;

// 刊登二手商品之輸入校驗 (Create Listing Input)
export const CreateListingInputSchema = z.object({
  cardName: z.string().min(1, '卡牌品名為必填'),
  category: CardCategorySchema.default('pokemon'),
  setName: z.string().min(1, '系列名稱為必填'),
  officialPrice: z.number().nonnegative().default(0),
  askingPrice: z.number().positive('售價金額必須大於 0'),
  condition: ListingConditionSchema,
  photos: z.array(
    z.string().refine(
      (val) => val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/') || val.startsWith('data:'),
      { message: '請提供有效的圖片 URL、路徑或相片' }
    )
  ).min(1, '請至少提供 1 張實體卡片照片').max(5, '最多 5 張照片'),
  notes: z.string().max(500, '備註上限 500 字').default(''),
  location: z.string().min(1, '請填寫交易地點或寄送方式'),
  contactPlatform: ContactPlatformSchema,
  contactValue: z.string().min(1, '請輸入聯絡帳號或電話'),
  portfolioCardId: z.string().optional(),
  buyInCost: z.number().nonnegative().optional(),
});
export type CreateListingInput = z.infer<typeof CreateListingInputSchema>;

// 更新掛單狀態之輸入校驗 (Status Transition Input)
export const UpdateListingStatusInputSchema = z.object({
  status: ListingStatusSchema,
  soldPrice: z.number().nonnegative('實際成交價不可為負數').optional(),
});
export type UpdateListingStatusInput = z.infer<typeof UpdateListingStatusInputSchema>;
