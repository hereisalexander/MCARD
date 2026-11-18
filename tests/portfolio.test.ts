import { describe, it, expect } from 'vitest';
import {
  GRADE_MULTIPLIERS,
  getConditionMultiplier,
  calculateItemTotalCost,
  calculateItemMarketValue,
  calculateUnrealizedPnL,
  calculateRoiPercent,
  calculatePortfolioMetrics,
  PortfolioCalculableItem,
} from '@/utils/portfolioCalculation';

describe('核心資產計算 (Portfolio Calculation)', () => {
  describe('1. 買入成本計算 (calculateItemTotalCost)', () => {
    it('正常計算單張卡牌之買入成本', () => {
      const cost = calculateItemTotalCost(150.5, 1);
      expect(cost).toBe(150.5);
    });

    it('正常計算複數持倉之總成本並四捨五入至兩位小數', () => {
      const cost = calculateItemTotalCost(33.333, 3);
      expect(cost).toBe(100.0);
    });

    it('零成本 (0 元抽中或贈送) 時應回傳 0', () => {
      const cost = calculateItemTotalCost(0, 5);
      expect(cost).toBe(0);
    });

    it('持有數量為 0 或負數防呆應回傳 0', () => {
      expect(calculateItemTotalCost(100, 0)).toBe(0);
      expect(calculateItemTotalCost(100, -2)).toBe(0);
      expect(calculateItemTotalCost(-50, 2)).toBe(0);
    });
  });

  describe('2. 品相評級加權係數 (getConditionMultiplier & calculateItemMarketValue)', () => {
    it('應正確映射各主流評級單位的加權倍數', () => {
      expect(getConditionMultiplier('Ungraded')).toBe(1.0);
      expect(getConditionMultiplier('PSA 10')).toBe(2.8);
      expect(getConditionMultiplier('PSA 9')).toBe(1.4);
      expect(getConditionMultiplier('PSA 8')).toBe(1.15);
      expect(getConditionMultiplier('BGS 10')).toBe(3.5);
      expect(getConditionMultiplier('BGS 9.5')).toBe(2.0);
      expect(getConditionMultiplier('BGS Black Label')).toBe(6.0);
      expect(getConditionMultiplier('CGC 10')).toBe(2.5);
      expect(getConditionMultiplier('Other')).toBe(1.0);
    });

    it('未指定或未知評級品相時，應安全 fallback 為 1.0', () => {
      expect(getConditionMultiplier(undefined)).toBe(1.0);
      expect(getConditionMultiplier(null)).toBe(1.0);
      expect(getConditionMultiplier('UNKNOWN_GRADE')).toBe(1.0);
      expect(getConditionMultiplier('')).toBe(1.0);
    });

    it('計算單卡加權市場價值 (basePrice * multiplier * qty)', () => {
      // 裸卡價格 $100，PSA 10 (2.8倍)，持有 2 張 => $560
      const valuePsa10 = calculateItemMarketValue(100, 2, 'PSA 10');
      expect(valuePsa10).toBe(560.0);

      // BGS Black Label (6.0倍)，1 張 $250 => $1500
      const valueBgsBlack = calculateItemMarketValue(250, 1, 'BGS Black Label');
      expect(valueBgsBlack).toBe(1500.0);

      // 裸卡 Ungraded (1.0倍)，3 張 $45.5 => $136.5
      const valueUngraded = calculateItemMarketValue(45.5, 3, 'Ungraded');
      expect(valueUngraded).toBe(136.5);
    });

    it('單價或數量小於等於 0 時市場價值應為 0', () => {
      expect(calculateItemMarketValue(0, 10, 'PSA 10')).toBe(0);
      expect(calculateItemMarketValue(100, 0, 'PSA 10')).toBe(0);
      expect(calculateItemMarketValue(-50, 1, 'PSA 10')).toBe(0);
    });
  });

  describe('3. 未實現損益計算 (calculateUnrealizedPnL)', () => {
    it('獲利情境：市值高於成本時損益為正', () => {
      const pnl = calculateUnrealizedPnL(1500, 1000);
      expect(pnl).toBe(500);
    });

    it('虧損情境：市值低於成本時損益為負', () => {
      const pnl = calculateUnrealizedPnL(800, 1200);
      expect(pnl).toBe(-400);
    });

    it('持平情境：市值等於成本時損益為 0', () => {
      const pnl = calculateUnrealizedPnL(750.25, 750.25);
      expect(pnl).toBe(0);
    });

    it('小數點精度處理：應四捨五入至兩位小數', () => {
      const pnl = calculateUnrealizedPnL(100.555, 50.222);
      expect(pnl).toBe(50.33);
    });
  });

  describe('4. 投資回報率 (ROI %) 計算 (calculateRoiPercent)', () => {
    it('正常獲利 ROI 計算', () => {
      // 市值 150，成本 100 => 獲利 50 => ROI 50%
      const roi = calculateRoiPercent(150, 100);
      expect(roi).toBe(50.0);
    });

    it('虧損 ROI 計算', () => {
      // 市值 50，成本 100 => 虧損 50 => ROI -50%
      const roi = calculateRoiPercent(50, 100);
      expect(roi).toBe(-50.0);
    });

    it('防呆機制：成本為 0 或負數時應回傳 null (避免 Divide-by-Zero)', () => {
      expect(calculateRoiPercent(500, 0)).toBeNull();
      expect(calculateRoiPercent(500, -100)).toBeNull();
    });

    it('精準百分比小數點位數四捨五入', () => {
      // 市值 133.33，成本 100 => 33.33%
      const roi = calculateRoiPercent(133.333, 100);
      expect(roi).toBe(33.33);
    });
  });

  describe('5. 投資組合匯總指標 (calculatePortfolioMetrics)', () => {
    it('空投資組合應回傳預設 0 值與 null ROI', () => {
      const summary = calculatePortfolioMetrics([]);
      expect(summary).toEqual({
        totalAssetsCount: 0,
        totalPortfolioValueUSD: 0,
        totalCostUSD: 0,
        unrealizedPnLUSD: 0,
        overallRoiPercent: null,
      });
    });

    it('綜合多筆卡牌持倉計算 (基準模式)', () => {
      const items: PortfolioCalculableItem[] = [
        { price: 100, buyPrice: 80, quantity: 2, condition: 'Ungraded' }, // 市值 200, 成本 160
        { price: 50, buyPrice: 60, quantity: 1, condition: 'Ungraded' },  // 市值 50, 成本 60
        { price: 200, buyPrice: 150, quantity: 1, condition: 'PSA 10' }, // 市值 200, 成本 150
      ];

      // 總數量: 4
      // 總市值: 200 + 50 + 200 = 450
      // 總成本: 160 + 60 + 150 = 370
      // 未實現損益: 450 - 370 = 80
      // ROI: (80 / 370) * 100 = 21.62%
      const summary = calculatePortfolioMetrics(items, false);
      expect(summary.totalAssetsCount).toBe(4);
      expect(summary.totalPortfolioValueUSD).toBe(450.0);
      expect(summary.totalCostUSD).toBe(370.0);
      expect(summary.unrealizedPnLUSD).toBe(80.0);
      expect(summary.overallRoiPercent).toBe(21.62);
    });

    it('支援品相加權模式 (applyGradeMultiplier = true)', () => {
      const items: PortfolioCalculableItem[] = [
        { price: 100, buyPrice: 100, quantity: 1, condition: 'PSA 10' }, // PSA 10 加權 2.8x => 市值 280, 成本 100
        { price: 100, buyPrice: 100, quantity: 1, condition: 'BGS 10' }, // BGS 10 加權 3.5x => 市值 350, 成本 100
      ];

      // 總市值: 280 + 350 = 630
      // 總成本: 200
      // PnL: 430
      // ROI: (430 / 200) * 100 = 215.0%
      const summary = calculatePortfolioMetrics(items, true);
      expect(summary.totalPortfolioValueUSD).toBe(630.0);
      expect(summary.totalCostUSD).toBe(200.0);
      expect(summary.unrealizedPnLUSD).toBe(430.0);
      expect(summary.overallRoiPercent).toBe(215.0);
    });
  });
});
