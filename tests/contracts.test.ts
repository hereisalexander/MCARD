import { describe, it, expect } from 'vitest';
import {
  ScanRequestSchema,
  PriceHistoryPointSchema,
  CardScanResultSchema,
} from '@/contracts/scan.schema';
import {
  CreateCardAssetInputSchema,
  PortfolioSummarySchema,
} from '@/contracts/portfolio.schema';
import {
  MarketListingSchema,
  CreateListingInputSchema,
  UpdateListingStatusInputSchema,
} from '@/contracts/marketplace.schema';

describe('Zod 契約邊界值測試 (Contracts Boundary Testing)', () => {
  describe('1. 掃描與行情契約 (Scan & Pricing Schemas)', () => {
    describe('ScanRequestSchema', () => {
      it('有效 base64 字串驗證通過', () => {
        const result = ScanRequestSchema.safeParse({ imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' });
        expect(result.success).toBe(true);
      });

      it('空字串應拒絕', () => {
        const result = ScanRequestSchema.safeParse({ imageBase64: '' });
        expect(result.success).toBe(false);
      });
    });

    describe('PriceHistoryPointSchema', () => {
      it('合法週期枚舉驗證通過', () => {
        const validPeriods = ['1M', '3M', '6M', '1Y', 'NOW'] as const;
        for (const period of validPeriods) {
          const res = PriceHistoryPointSchema.safeParse({
            period,
            date: '2026-10',
            price: 120.5,
          });
          expect(res.success).toBe(true);
        }
      });

      it('非法週期枚舉應拋出驗證錯誤', () => {
        const res = PriceHistoryPointSchema.safeParse({
          period: '2M',
          date: '2026-10',
          price: 120.5,
        });
        expect(res.success).toBe(false);
      });
    });

    describe('CardScanResultSchema 邊界值', () => {
      const validBaseResult = {
        category: 'pokemon',
        cardName: 'Charizard ex SAR',
        cardNumber: '199/165',
        setName: 'Pokemon 151',
        rarity: 'SAR',
        isGraded: false,
        confidence: 0.95,
        pricing: {
          currency: 'USD',
          currentPrice: 135.0,
          rawPrice: 135.0,
          lastUpdated: '2026-11-18',
          source: 'PriceCharting',
          history: [],
        },
      };

      it('合法掃描結果資料通過驗證', () => {
        const result = CardScanResultSchema.safeParse(validBaseResult);
        expect(result.success).toBe(true);
      });

      it('信心度邊界測試：0.0 與 1.0 合法，超過邊界應拒絕', () => {
        expect(CardScanResultSchema.safeParse({ ...validBaseResult, confidence: 0.0 }).success).toBe(true);
        expect(CardScanResultSchema.safeParse({ ...validBaseResult, confidence: 1.0 }).success).toBe(true);
        expect(CardScanResultSchema.safeParse({ ...validBaseResult, confidence: -0.01 }).success).toBe(false);
        expect(CardScanResultSchema.safeParse({ ...validBaseResult, confidence: 1.01 }).success).toBe(false);
      });

      it('評級卡封裝屬性：isGraded 為 true 且包含 gradingCompany 與 gradeScore', () => {
        const gradedData = {
          ...validBaseResult,
          isGraded: true,
          gradingCompany: 'PSA',
          gradeScore: '10',
          certNumber: '12345678',
        };
        const result = CardScanResultSchema.safeParse(gradedData);
        expect(result.success).toBe(true);
      });

      it('category 必須屬於指定領域枚舉', () => {
        const invalidCategory = { ...validBaseResult, category: 'magic_the_gathering' };
        expect(CardScanResultSchema.safeParse(invalidCategory).success).toBe(false);
      });
    });
  });

  describe('2. 投資組合持倉契約 (Portfolio Schemas)', () => {
    describe('CardAssetSchema & CreateCardAssetInputSchema', () => {
      const validAssetInput = {
        cardId: 'sv3pt5-199',
        name: '噴火龍 ex (Charizard ex SAR)',
        category: 'pokemon' as const,
        price: 135.5,
        buyPrice: 90.0,
        quantity: 2,
        condition: 'PSA 10' as const,
        imageUrl: 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
        notes: '2026 年初日本秋葉原購入',
      };

      it('合規持倉資料驗證通過', () => {
        const result = CreateCardAssetInputSchema.safeParse(validAssetInput);
        expect(result.success).toBe(true);
      });

      it('數量 quantity 邊界值：必須為正整數 (大於 0 且不可為浮點數)', () => {
        expect(CreateCardAssetInputSchema.safeParse({ ...validAssetInput, quantity: 1 }).success).toBe(true);
        expect(CreateCardAssetInputSchema.safeParse({ ...validAssetInput, quantity: 0 }).success).toBe(false);
        expect(CreateCardAssetInputSchema.safeParse({ ...validAssetInput, quantity: -1 }).success).toBe(false);
        expect(CreateCardAssetInputSchema.safeParse({ ...validAssetInput, quantity: 1.5 }).success).toBe(false);
      });

      it('價格 price 與 buyPrice 邊界值：可為 0 (非負數)，負數應拒絕', () => {
        expect(CreateCardAssetInputSchema.safeParse({ ...validAssetInput, price: 0, buyPrice: 0 }).success).toBe(true);
        expect(CreateCardAssetInputSchema.safeParse({ ...validAssetInput, price: -1 }).success).toBe(false);
        expect(CreateCardAssetInputSchema.safeParse({ ...validAssetInput, buyPrice: -0.01 }).success).toBe(false);
      });

      it('圖片 URL 邊界校驗：非 URL 格式應拒絕', () => {
        expect(CreateCardAssetInputSchema.safeParse({ ...validAssetInput, imageUrl: 'invalid-url' }).success).toBe(false);
        expect(CreateCardAssetInputSchema.safeParse({ ...validAssetInput, imageUrl: '' }).success).toBe(false);
      });

      it('備註 notes 字數上限邊界：300 字合規，301 字應拒絕', () => {
        const note300 = 'A'.repeat(300);
        const note301 = 'A'.repeat(301);
        expect(CreateCardAssetInputSchema.safeParse({ ...validAssetInput, notes: note300 }).success).toBe(true);
        expect(CreateCardAssetInputSchema.safeParse({ ...validAssetInput, notes: note301 }).success).toBe(false);
      });

      it('品相 condition 預設值為 Ungraded', () => {
        const withoutCondition = { ...validAssetInput };
        delete (withoutCondition as { condition?: string }).condition;
        const parsed = CreateCardAssetInputSchema.parse(withoutCondition);
        expect(parsed.condition).toBe('Ungraded');
      });
    });

    describe('PortfolioSummarySchema', () => {
      it('支援 null 之 overallRoiPercent (成本為 0 情境)', () => {
        const summary = {
          totalAssetsCount: 5,
          totalPortfolioValueUSD: 500,
          totalCostUSD: 0,
          unrealizedPnLUSD: 500,
          overallRoiPercent: null,
        };
        const result = PortfolioSummarySchema.safeParse(summary);
        expect(result.success).toBe(true);
      });

      it('支援負數之 unrealizedPnLUSD (虧損情境)', () => {
        const summary = {
          totalAssetsCount: 1,
          totalPortfolioValueUSD: 50,
          totalCostUSD: 100,
          unrealizedPnLUSD: -50,
          overallRoiPercent: -50.0,
        };
        const result = PortfolioSummarySchema.safeParse(summary);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('3. 二手市集刊登契約 (Marketplace Schemas)', () => {
    const validListingInput = {
      cardName: '皮卡丘 25週年紀念',
      category: 'pokemon' as const,
      setName: 'Celebrations',
      officialPrice: 50,
      askingPrice: 45.0,
      condition: 'PSA 10' as const,
      photos: ['https://example.com/cards/front.jpg'],
      notes: '品相如新，附卡磚',
      location: '台北車站面交 / 7-11 賣貨便',
      contactPlatform: 'line' as const,
      contactValue: 'pika_collector_2026',
    };

    describe('CreateListingInputSchema', () => {
      it('合規掛單輸入通過驗證', () => {
        const res = CreateListingInputSchema.safeParse(validListingInput);
        expect(res.success).toBe(true);
      });

      it('開價 askingPrice 必須大於 0 (不可為 0 或負數)', () => {
        expect(CreateListingInputSchema.safeParse({ ...validListingInput, askingPrice: 0.01 }).success).toBe(true);
        expect(CreateListingInputSchema.safeParse({ ...validListingInput, askingPrice: 0 }).success).toBe(false);
        expect(CreateListingInputSchema.safeParse({ ...validListingInput, askingPrice: -10 }).success).toBe(false);
      });

      it('照片數量邊界：1~5 張合法，0 張或超過 5 張應拒絕', () => {
        // 0 張
        expect(CreateListingInputSchema.safeParse({ ...validListingInput, photos: [] }).success).toBe(false);
        // 1 張
        expect(CreateListingInputSchema.safeParse({ ...validListingInput, photos: ['https://example.com/1.jpg'] }).success).toBe(true);
        // 5 張
        const photos5 = [
          'https://example.com/1.jpg',
          'https://example.com/2.jpg',
          'https://example.com/3.jpg',
          'https://example.com/4.jpg',
          'https://example.com/5.jpg',
        ];
        expect(CreateListingInputSchema.safeParse({ ...validListingInput, photos: photos5 }).success).toBe(true);
        // 6 張
        const photos6 = [...photos5, 'https://example.com/6.jpg'];
        expect(CreateListingInputSchema.safeParse({ ...validListingInput, photos: photos6 }).success).toBe(false);
      });

      it('照片格式多型相容：支援 http, https, 本機路徑 (/), data URL', () => {
        const diversePhotos = [
          'https://images.pokemontcg.io/card.png',
          'http://example.com/pic.jpg',
          '/uploads/custom-card.png',
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
        ];
        const res = CreateListingInputSchema.safeParse({ ...validListingInput, photos: diversePhotos });
        expect(res.success).toBe(true);
      });

      it('聯絡管道枚舉校驗：支援 line, instagram, phone, email', () => {
        const validPlatforms = ['line', 'instagram', 'phone', 'email'] as const;
        for (const platform of validPlatforms) {
          expect(CreateListingInputSchema.safeParse({ ...validListingInput, contactPlatform: platform }).success).toBe(true);
        }
        expect(CreateListingInputSchema.safeParse({ ...validListingInput, contactPlatform: 'wechat' }).success).toBe(false);
      });
    });

    describe('MarketListingSchema 實體約束', () => {
      const fullListing = {
        id: 'list-001',
        sellerName: '小智',
        sellerAvatar: 'https://example.com/avatar.jpg',
        sellerRating: 4.8,
        sellerSalesCount: 12,
        contactPlatform: 'line' as const,
        contactValue: 'ash123',
        cardName: '超夢 GX',
        category: 'pokemon' as const,
        setName: 'SM3+',
        officialPrice: 80,
        askingPrice: 75,
        condition: 'PSA 9' as const,
        photos: ['https://example.com/mewtwo.jpg'],
        notes: '',
        location: '台中面交',
        createdAt: '2026-11-18T10:00:00Z',
        status: 'active' as const,
      };

      it('完整掛單實體校驗通過', () => {
        expect(MarketListingSchema.safeParse(fullListing).success).toBe(true);
      });

      it('賣家評分範圍邊界：1.0 ~ 5.0 合法，超出應拒絕', () => {
        expect(MarketListingSchema.safeParse({ ...fullListing, sellerRating: 1.0 }).success).toBe(true);
        expect(MarketListingSchema.safeParse({ ...fullListing, sellerRating: 5.0 }).success).toBe(true);
        expect(MarketListingSchema.safeParse({ ...fullListing, sellerRating: 0.9 }).success).toBe(false);
        expect(MarketListingSchema.safeParse({ ...fullListing, sellerRating: 5.1 }).success).toBe(false);
      });

      it('更新刊登狀態：active -> reserved -> sold 及其 soldPrice 校驗', () => {
        expect(UpdateListingStatusInputSchema.safeParse({ status: 'reserved' }).success).toBe(true);
        expect(UpdateListingStatusInputSchema.safeParse({ status: 'sold', soldPrice: 70.0 }).success).toBe(true);
        expect(UpdateListingStatusInputSchema.safeParse({ status: 'sold', soldPrice: -5 }).success).toBe(false);
      });
    });
  });
});
