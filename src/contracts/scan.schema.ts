import { z } from 'zod';

// 掃描辨識請求 Schema
export const ScanRequestSchema = z.object({
  imageBase64: z.string().min(1, '圖片數據不可為空'),
});
export type ScanRequest = z.infer<typeof ScanRequestSchema>;

// 歷史價格節點：支援 1M, 3M, 6M, 1Y, NOW
export const PriceHistoryPointSchema = z.object({
  period: z.enum(['1M', '3M', '6M', '1Y', 'NOW']),
  date: z.string().describe('例如 2026-09 或 2026-10'),
  price: z.number().describe('預估二級市場行情美元價格'),
});
export type PriceHistoryPoint = z.infer<typeof PriceHistoryPointSchema>;

// 即時市場行情與歷史節點契約
export const CardPricingSchema = z.object({
  currency: z.literal('USD').default('USD'),
  currentPrice: z.number().nullable().describe('當前預估二級市場參考價 (USD)'),
  rawPrice: z.number().nullable().optional().describe('流通品相 / 裸卡 (Raw / Ungraded) 參考價 (USD)'),
  psa10Price: z.number().nullable().optional().describe('PSA 10 滿分評級二級市場參考價 (USD)'),
  priceRange: z
    .object({
      low: z.number().optional(),
      high: z.number().optional(),
    })
    .optional(),
  lastUpdated: z.string().describe('行情抓取時間 ISO 戳記或日期'),
  source: z.string().describe('價格來源依據，例如 PriceCharting / eBay Recent Solds / TCGplayer'),
  history: z.array(PriceHistoryPointSchema).default([]),
});
export type CardPricing = z.infer<typeof CardPricingSchema>;

// 完整掃描結果契約
export const CardScanResultSchema = z.object({
  category: z.enum(['pokemon', 'yugioh', 'onepiece', 'dragonball', 'nba', 'fifa', 'unknown']),
  cardName: z.string().describe('卡牌官方正式名稱 (英文、日文或中文)'),
  cardNumber: z.string().optional().describe('卡牌官方編號，例如 199/165, OP05-119, LOB-001'),
  setName: z.string().optional().describe('擴充包或所屬系列名稱'),
  rarity: z.string().optional().describe('稀有度標籤，例如 SAR, UR, Secret Rare, Base'),
  isGraded: z.boolean().describe('是否為評級封裝卡盒'),
  gradingCompany: z.enum(['PSA', 'BGS', 'CGC', 'RAW']).optional(),
  gradeScore: z.string().optional().describe('評級分數，例如 10, 9.5, 9'),
  certNumber: z.string().optional().describe('評級標籤上的唯一官方認證編號'),
  confidence: z.number().min(0).max(1).describe('模型綜合辨識信心度 (0.0 - 1.0)'),
  summary: z.string().optional().describe('卡牌視覺特徵簡述'),
  pricing: CardPricingSchema,
});
export type CardScanResult = z.infer<typeof CardScanResultSchema>;
