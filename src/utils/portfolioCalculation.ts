import { CardGrade } from '@/contracts/common.schema';
import { PortfolioSummary } from '@/contracts/portfolio.schema';

/**
 * 品相評級價值乘數對照表
 */
export const GRADE_MULTIPLIERS: Record<string, number> = {
  'Ungraded': 1.0,
  'PSA 10': 2.8,
  'PSA 9': 1.4,
  'PSA 8': 1.15,
  'BGS 10': 3.5,
  'BGS 9.5': 2.0,
  'BGS Black Label': 6.0,
  'CGC 10': 2.5,
  'Other': 1.0,
};

/**
 * 取得品相評級對應之價值加權係數
 * 若未匹配則安全退避回傳 1.0
 */
export const getConditionMultiplier = (condition?: CardGrade | string | null): number => {
  if (!condition) {
    return 1.0;
  }
  return GRADE_MULTIPLIERS[condition] ?? 1.0;
};

/**
 * 計算單項卡牌資產之總買入成本
 */
export const calculateItemTotalCost = (buyPrice: number = 0, quantity: number = 1): number => {
  if (buyPrice <= 0 || quantity <= 0) {
    return 0;
  }
  return Number((buyPrice * quantity).toFixed(2));
};

/**
 * 計算單項卡牌資產之加權市場總價值
 * @param basePrice 裸卡/基準市場價
 * @param quantity 持有數量
 * @param condition 卡況評級
 */
export const calculateItemMarketValue = (
  basePrice: number = 0,
  quantity: number = 1,
  condition?: CardGrade | string | null
): number => {
  if (basePrice <= 0 || quantity <= 0) {
    return 0;
  }
  const multiplier = getConditionMultiplier(condition);
  return Number((basePrice * multiplier * quantity).toFixed(2));
};

/**
 * 計算未實現損益 (Unrealized P&L in USD)
 * 未實現損益 = 總持倉市值 - 總買入成本
 */
export const calculateUnrealizedPnL = (totalMarketValue: number, totalCost: number): number => {
  return Number((totalMarketValue - totalCost).toFixed(2));
};

/**
 * 計算投資回報率 (ROI 百分比)
 * 若總成本不大於 0，回傳 null 以免除以零錯誤
 */
export const calculateRoiPercent = (totalMarketValue: number, totalCost: number): number | null => {
  if (totalCost <= 0) {
    return null;
  }
  const pnl = totalMarketValue - totalCost;
  return Number(((pnl / totalCost) * 100).toFixed(2));
};

export interface PortfolioCalculableItem {
  price: number;
  buyPrice?: number;
  quantity: number;
  condition?: CardGrade | string | null;
}

/**
 * 匯總投資組合指標計算
 */
export const calculatePortfolioMetrics = (
  items: PortfolioCalculableItem[],
  applyGradeMultiplier: boolean = false
): PortfolioSummary => {
  if (!items || items.length === 0) {
    return {
      totalAssetsCount: 0,
      totalPortfolioValueUSD: 0,
      totalCostUSD: 0,
      unrealizedPnLUSD: 0,
      overallRoiPercent: null,
    };
  }

  let totalAssetsCount = 0;
  let totalPortfolioValueUSD = 0;
  let totalCostUSD = 0;

  for (const item of items) {
    const qty = item.quantity > 0 ? item.quantity : 1;
    totalAssetsCount += qty;

    const unitPrice = item.price >= 0 ? item.price : 0;
    const unitBuyPrice = (item.buyPrice && item.buyPrice >= 0) ? item.buyPrice : 0;

    const itemValue = applyGradeMultiplier
      ? calculateItemMarketValue(unitPrice, qty, item.condition)
      : unitPrice * qty;

    totalPortfolioValueUSD += itemValue;
    totalCostUSD += unitBuyPrice * qty;
  }

  const roundedValue = Number(totalPortfolioValueUSD.toFixed(2));
  const roundedCost = Number(totalCostUSD.toFixed(2));
  const unrealizedPnL = calculateUnrealizedPnL(roundedValue, roundedCost);
  const overallRoiPercent = calculateRoiPercent(roundedValue, roundedCost);

  return {
    totalAssetsCount,
    totalPortfolioValueUSD: roundedValue,
    totalCostUSD: roundedCost,
    unrealizedPnLUSD: unrealizedPnL,
    overallRoiPercent,
  };
};
