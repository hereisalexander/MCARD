'use client';

import React, { useState } from 'react';
import { CardListing } from '@/types/marketplace';
import { UserPortfolioItem } from '@/components/PortfolioDashboard';

export interface MarkSoldModalProps {
  listing: CardListing | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSold: (listingId: string, soldPrice: number, syncToPortfolio: boolean) => void;
  portfolio: UserPortfolioItem[];
}

export const MarkSoldModal: React.FC<MarkSoldModalProps> = ({
  listing,
  isOpen,
  onClose,
  onConfirmSold,
  portfolio,
}) => {
  const [actualSoldPrice, setActualSoldPrice] = useState<string>(
    listing ? listing.askingPrice.toString() : ''
  );
  const [syncToPortfolio, setSyncToPortfolio] = useState<boolean>(true);

  if (!isOpen || !listing) return null;

  const numericSoldPrice = parseFloat(actualSoldPrice) || 0;
  
  // Find matching portfolio card if any
  const matchedPortfolioCard = portfolio.find(
    (item) => item.id === listing.portfolioCardId || item.name.toLowerCase() === listing.cardName.toLowerCase()
  );

  const buyCost = matchedPortfolioCard ? matchedPortfolioCard.buyPrice : (listing.buyInCost || 0);
  const calculatedProfit = numericSoldPrice - buyCost;
  const roiPercentage = buyCost > 0 ? (calculatedProfit / buyCost) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericSoldPrice <= 0) return;
    onConfirmSold(listing.id, numericSoldPrice, syncToPortfolio);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mark-sold-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-surface border border-hairline rounded-2xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 id="mark-sold-title" className="font-sans font-bold text-base text-foreground">
              標記卡牌已售出 (Mark as Sold)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-foreground p-1 text-sm font-bold transition-colors cursor-pointer"
            aria-label="關閉視窗"
          >
            ✕
          </button>
        </div>

        {/* Card Snapshot Preview */}
        <div className="flex items-center gap-3 py-3 mt-1 bg-surface-hover/50 rounded-xl px-3 border border-hairline/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.photos[0] || 'https://images.pokemontcg.io/sv3pt5/199_hires.png'}
            alt={listing.cardName}
            className="w-12 h-16 object-contain rounded-md bg-background shrink-0 border border-hairline"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-sans font-bold text-xs text-foreground truncate">
              {listing.cardName}
            </span>
            <span className="text-[10px] text-text-muted font-mono">
              原掛牌價: ${listing.askingPrice.toLocaleString('en-US')} · {listing.condition}
            </span>
            <span className="text-[10px] text-text-muted font-mono">
              官方行情: ${listing.officialPrice.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono font-bold text-foreground mb-1">
              實際最終成交金額 (USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">
                $
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={actualSoldPrice}
                onChange={(e) => setActualSoldPrice(e.target.value)}
                placeholder="例如: 280"
                className="w-full pl-8 pr-3 py-2 bg-surface-hover/80 text-foreground border border-hairline/80 rounded-xl font-mono text-sm focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>
          </div>

          {/* Profit & ROI Real-time calculation */}
          {buyCost > 0 && (
            <div className="p-3 rounded-xl bg-surface-hover/70 border border-hairline/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-text-muted block font-mono">買入成本 / 獲利試算</span>
                <span className="font-mono text-xs font-semibold text-foreground">
                  成本 ${buyCost} ➔ 實收 ${numericSoldPrice}
                </span>
              </div>
              <div className="text-right">
                <span className={`font-mono text-xs font-bold block ${calculatedProfit >= 0 ? 'text-emerald-500' : 'text-ferrari-red'}`}>
                  {calculatedProfit >= 0 ? `+${calculatedProfit.toFixed(1)} USD` : `${calculatedProfit.toFixed(1)} USD`}
                </span>
                <span className={`text-[10px] font-mono font-semibold ${roiPercentage >= 0 ? 'text-emerald-500' : 'text-ferrari-red'}`}>
                  ROI: {roiPercentage >= 0 ? `+${roiPercentage.toFixed(1)}%` : `${roiPercentage.toFixed(1)}%`}
                </span>
              </div>
            </div>
          )}

          {/* Sync checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={syncToPortfolio}
              onChange={(e) => setSyncToPortfolio(e.target.checked)}
              className="mt-0.5 rounded border-hairline text-emerald-500 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs text-text-muted leading-relaxed">
              同時從個人資產庫（Portfolio）扣減該持倉，並在紀錄中記錄此筆真實賣出獲利。
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-foreground bg-surface-hover transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-all cursor-pointer shadow-sm"
            >
              確認結案 · 標記已售出
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
