import { z } from 'zod';
import { CardCategorySchema, CardGradeSchema } from './common.schema';

// 卡牌快照（避免外部 API 異動導致持倉失真）
export const CardSnapshotSchema = z.object({
  id: z.string().min(1, '卡牌 ID 不得為空'),
  name: z.string().min(1, '卡牌名稱不得為空'),
  setName: z.string().min(1, '系列名稱不得為空'),
  number: z.string().default(''),
  rarity: z.string().default(''),
  imageUrl: z.string().url('卡牌圖片必須是合法 URL'),
  currentMarketPrice: z.number().nonnegative('市場參考價不得為負數').default(0),
});
export type CardSnapshot = z.infer<typeof CardSnapshotSchema>;

// 個人持倉資產實體
export const CardAssetSchema = z.object({
  id: z.string().min(1, '資產 ID 不得為空'),
  userId: z.string().default('anonymous_user'),
  cardId: z.string().min(1, '關聯卡牌 ID 不得為空'),
  name: z.string().min(1, '卡牌名稱不得為空'),
  category: CardCategorySchema.default('pokemon'),
  price: z.number().nonnegative('當前市場單價不得為負數').default(0),
  buyPrice: z.number().nonnegative('購入單價不得為負數').default(0),
  quantity: z.number().int('持倉數量必須為整數').positive('持倉數量必須大於 0').default(1),
  condition: CardGradeSchema.default('Ungraded'),
  imageUrl: z.string().url('圖片連結不合法'),
  addedAt: z.string().min(1, '入庫時間不得為空'),
  notes: z.string().max(300, '備忘筆記上限 300 字').optional(),
});
export type CardAsset = z.infer<typeof CardAssetSchema>;

// 新增持倉之輸入校驗 (Input Schema)
export const CreateCardAssetInputSchema = z.object({
  cardId: z.string().min(1, '請選擇欲入庫之卡牌'),
  name: z.string().min(1, '卡牌名稱為必填'),
  category: CardCategorySchema.default('pokemon'),
  price: z.number().nonnegative('市場單價不可為負數').default(0),
  buyPrice: z.number().nonnegative('購入單價不可為負數').default(0),
  quantity: z.number().int('數量須為整數').positive('數量至少為 1 張').default(1),
  condition: CardGradeSchema.default('Ungraded'),
  imageUrl: z.string().url('圖片連結格式不正確'),
  notes: z.string().max(300, '備忘上限 300 字').optional(),
});
export type CreateCardAssetInput = z.infer<typeof CreateCardAssetInputSchema>;

// 更新持倉之輸入校驗 (Update Schema)
export const UpdateCardAssetInputSchema = z.object({
  buyPrice: z.number().nonnegative('購入單價不可為負數').optional(),
  quantity: z.number().int().positive('數量至少為 1 張').optional(),
  condition: CardGradeSchema.optional(),
  notes: z.string().max(300).optional(),
});
export type UpdateCardAssetInput = z.infer<typeof UpdateCardAssetInputSchema>;

// 投資組合統計匯總
export const PortfolioSummarySchema = z.object({
  totalAssetsCount: z.number().int().nonnegative(),
  totalPortfolioValueUSD: z.number().nonnegative(),
  totalCostUSD: z.number().nonnegative(),
  unrealizedPnLUSD: z.number(),
  overallRoiPercent: z.number().nullable(), // 若總成本為 0 則為 null
});
export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
