import { z } from 'zod';

// 卡牌領域分類枚舉
export const CardCategorySchema = z.enum([
  'all',
  'pokemon',
  'yugioh',
  'onepiece',
  'dragonball',
  'nba',
  'fifa',
]);
export type CardCategory = z.infer<typeof CardCategorySchema>;

// 評級鑑定等級枚舉
export const CardGradeSchema = z.enum([
  'Ungraded',
  'PSA 10',
  'PSA 9',
  'PSA 8',
  'BGS 10',
  'BGS 9.5',
  'BGS Black Label',
  'CGC 10',
  'Other',
]);
export type CardGrade = z.infer<typeof CardGradeSchema>;

// 卡況品相標準枚舉
export const CardConditionSchema = z.enum([
  'Mint',
  'Near Mint',
  'Lightly Played',
  'Moderately Played',
  'Heavily Played',
  'Damaged',
]);
export type CardCondition = z.infer<typeof CardConditionSchema>;

// 貨幣種類枚舉
export const CurrencySchema = z.enum(['USD', 'TWD', 'JPY']);
export type Currency = z.infer<typeof CurrencySchema>;

// 標準 API 錯誤響應格式 (Error Envelope)
export const ApiErrorEnvelopeSchema = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});
export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;

// 標準分頁中繼資料
export const PaginationMetaSchema = z.object({
  currentPage: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
