'use client';

import React, { useState } from 'react';
import { WishlistItem } from '@/types/wishlist';
import { CardListing } from '@/types/marketplace';
import { CardCategory } from '@/services/multiCardService';
import {
  HeartIcon,
  TargetIcon,
  TagIcon,
  EditIcon,
  SearchIcon,
  ExternalLinkIcon,
} from '@/components/icons/AppIcons';
import { getEbayAffiliateUrl, trackAffiliateClick } from '@/utils/affiliate';

export interface WishlistViewProps {
  wishlist: WishlistItem[];
  listings: CardListing[];
  onRemoveFromWishlist: (id: string) => void;
  onUpdateWishlistItem: (updated: WishlistItem) => void;
  onNavigateToExplore: () => void;
  onSelectMarketplaceListing?: (listing: CardListing) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlist,
  listings,
  onRemoveFromWishlist,
  onUpdateWishlistItem,
  onNavigateToExplore,
  onSelectMarketplaceListing,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CardCategory>('all');
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<string>('');

  // Find marketplace matches for wishlist items
  const getMarketMatches = (item: WishlistItem) => {
    return listings.filter(
      (l) =>
        l.status === 'active' &&
        (l.cardName.toLowerCase().includes(item.cardName.toLowerCase()) ||
          item.cardName.toLowerCase().includes(l.cardName.toLowerCase()))
    );
  };

  const filteredItems = wishlist.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  // Calculate statistics
  const targetMetCount = wishlist.filter((item) => {
    if (!item.targetPrice) return false;
    const matches = getMarketMatches(item);
    const hasCheapListing = matches.some((m) => m.askingPrice <= (item.targetPrice || 0));
    return hasCheapListing || item.baseMarketPrice <= (item.targetPrice || 0);
  }).length;

  const totalTargetBudget = wishlist.reduce((sum, item) => sum + (item.targetPrice || item.baseMarketPrice), 0);

  const handleStartEditTarget = (item: WishlistItem) => {
    setEditingTargetId(item.id);
    setEditPriceInput(item.targetPrice ? item.targetPrice.toString() : item.baseMarketPrice.toString());
  };

  const handleSaveTarget = (item: WishlistItem) => {
    const val = parseFloat(editPriceInput);
    if (!isNaN(val) && val > 0) {
      onUpdateWishlistItem({ ...item, targetPrice: val });
    }
    setEditingTargetId(null);
  };

  return (
    <div className="w-full flex flex-col gap-6 py-2 sm:py-6 animate-fade-in">
      {/* Top Banner */}
      <div className="relative w-full rounded-2xl p-5 sm:p-7 bg-gradient-to-r from-rose-500/10 via-surface to-surface border border-hairline/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-500">
              Collector Wishlist & Price Drops
            </span>
          </div>
          <h1 className="font-sans font-black text-xl sm:text-2xl text-foreground tracking-tight">
            願望清單與降價預警中心
          </h1>
          <p className="text-xs text-text-muted max-w-xl leading-relaxed">
            追蹤心儀神卡、設定心理目標買入價。當市場或市集有賣家以符合條件刊登時，系統即時自動通知！
          </p>
        </div>

        <button
          onClick={onNavigateToExplore}
          className="px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-hairline text-foreground font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer shadow-2xs flex items-center gap-2 shrink-0 active:scale-95"
        >
          <SearchIcon className="w-4 h-4 text-text-muted" />
          <span>探索圖鑑挑選卡牌</span>
        </button>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface p-4 rounded-2xl border border-hairline/80 shadow-2xs">
        <div className="flex flex-col p-3 rounded-xl bg-surface-hover/50 border border-hairline/60">
          <span className="text-[11px] font-mono text-text-muted">追蹤中心願卡牌</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-xl font-black text-foreground">{wishlist.length}</span>
            <span className="text-xs text-text-muted">張</span>
          </div>
          <span className="text-[10px] text-text-muted mt-0.5">跨全品類收藏心願</span>
        </div>

        <div className="flex flex-col p-3 rounded-xl bg-surface-hover/50 border border-hairline/60">
          <span className="text-[11px] font-mono text-text-muted">已達目標價 / 降價中</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-xl font-black text-rose-500">{targetMetCount}</span>
            <span className="text-xs text-rose-500 font-bold">張可入手！</span>
          </div>
          <span className="text-[10px] text-text-muted mt-0.5">市集存在符合期望之刊登</span>
        </div>

        <div className="flex flex-col p-3 rounded-xl bg-surface-hover/50 border border-hairline/60">
          <span className="text-[11px] font-mono text-text-muted">預計入手總預算</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-xl font-black text-foreground">
              ${totalTargetBudget.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-text-muted">USD</span>
          </div>
          <span className="text-[10px] text-text-muted mt-0.5">以目標期望價累計</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {(['all', 'pokemon', 'yugioh', 'onepiece', 'dragonball', 'nba', 'fifa'] as CardCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-surface hover:bg-surface-hover text-text-muted border-hairline/70'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Wishlist Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-hairline border-dashed flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-1">
            <HeartIcon filled={false} className="w-6 h-6" />
          </div>
          <p className="font-sans font-medium text-lg text-foreground">
            {selectedCategory === 'all' ? '您的願望清單目前是空的' : '該分類下尚無心願卡牌'}
          </p>
          <span className="font-mono text-xs text-text-muted max-w-sm">
            在「探索」或卡牌詳情中點擊心形圖標，將想收的卡牌加入願望清單並設定目標價！
          </span>
          <button
            onClick={onNavigateToExplore}
            className="mt-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-sm transition-all"
          >
            前往探索瀏覽卡牌
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredItems.map((item) => {
            const matches = getMarketMatches(item);
            const lowestMarketPrice = matches.length > 0
              ? Math.min(...matches.map((m) => m.askingPrice))
              : null;
            const target = item.targetPrice || item.baseMarketPrice;
            const isMet = (lowestMarketPrice !== null && lowestMarketPrice <= target) || item.baseMarketPrice <= target;
            const isEditing = editingTargetId === item.id;

            return (
              <div
                key={item.id}
                className="bg-surface rounded-2xl border border-hairline/80 hover:border-hairline hover:shadow-md p-4 flex flex-col justify-between transition-all duration-200 group relative"
              >
                <div>
                  {/* Top Row: Category & Remove */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-surface-hover border border-hairline text-text-muted">
                      {item.category}
                    </span>
                    <button
                      onClick={() => onRemoveFromWishlist(item.id)}
                      className="text-text-muted hover:text-ferrari-red text-xs p-1 rounded-md transition-colors cursor-pointer"
                      title="移出願望清單"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Card Visual & Metadata */}
                  <div className="flex gap-3 items-center">
                    <div className="w-16 h-22 bg-surface-hover rounded-xl border border-hairline/60 overflow-hidden flex items-center justify-center p-1 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.cardName}
                        className="object-contain max-h-full max-w-full select-none group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-sans font-bold text-sm text-foreground leading-snug truncate">
                        {item.cardName}
                      </h4>
                      <span className="text-[11px] text-text-muted font-mono truncate">
                        {item.setName}
                      </span>
                      {item.cardNumber && (
                        <span className="text-[10px] text-text-muted font-mono">
                          {item.cardNumber}
                        </span>
                      )}
                      <span className="text-[10px] text-text-muted font-mono mt-1">
                        加入時市價: ${item.baseMarketPrice.toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>

                  {/* Price Target Comparison */}
                  <div className="mt-3 p-3 rounded-xl bg-surface-hover/60 border border-hairline/60 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted font-mono flex items-center gap-1.5">
                        <TargetIcon className="w-3.5 h-3.5 text-rose-500" />
                        <span>我的期望目標價:</span>
                      </span>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono">$</span>
                          <input
                            type="number"
                            step="any"
                            value={editPriceInput}
                            onChange={(e) => setEditPriceInput(e.target.value)}
                            className="w-16 px-1 py-0.5 bg-surface text-foreground font-mono text-xs font-bold border border-rose-500 rounded focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveTarget(item)}
                            className="text-emerald-500 text-xs font-bold px-1"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEditTarget(item)}
                          className="font-mono font-bold text-rose-500 hover:underline flex items-center gap-1.5 cursor-pointer"
                          title="點擊修改期望價"
                        >
                          <span>${target.toLocaleString('en-US')}</span>
                          <EditIcon className="w-2.5 h-2.5 text-text-muted" />
                        </button>
                      )}
                    </div>

                    {/* Progress / Status */}
                    <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-hairline/40">
                      <span className="text-text-muted">當前市場狀態:</span>
                      {isMet ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          已達到心理買入價！
                        </span>
                      ) : (
                        <span className="text-amber-500 font-semibold">
                          高於目標 ${(item.baseMarketPrice - target).toFixed(0)} USD
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notes if available */}
                  {item.notes && (
                    <p className="mt-2 text-[10px] text-text-muted font-sans bg-surface-hover/30 p-2 rounded-lg border border-hairline/30 italic">
                      &quot;{item.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Marketplace Match Callout */}
                <div className="mt-3 pt-2.5 border-t border-hairline/60">
                  {matches.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                          <TagIcon className="w-3 h-3 text-emerald-500" />
                          <span>市集有 {matches.length} 筆在售刊登</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-foreground">
                          最低 ${lowestMarketPrice?.toLocaleString('en-US')}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (onSelectMarketplaceListing && matches[0]) {
                            onSelectMarketplaceListing(matches[0]);
                          }
                        }}
                        className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-[11px] font-mono tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>查看在售商品 (最低 ${lowestMarketPrice})</span>
                        <span>→</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                        <span>市集目前尚無卡友上架</span>
                        <span className="text-[9px]">持續自動監控中</span>
                      </div>
                      <a
                        href={getEbayAffiliateUrl({ name: item.cardName, category: item.category })}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackAffiliateClick(
                            'ebay',
                            `Wishlist: ${item.cardName}`,
                            getEbayAffiliateUrl({ name: item.cardName, category: item.category })
                          )
                        }
                        className="w-full py-1.5 rounded-lg bg-surface-hover hover:border-amber-500/50 hover:bg-amber-500/10 border border-hairline/80 text-foreground hover:text-amber-500 font-mono text-[11px] font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <span className="font-bold text-amber-500">eBay</span>
                        <span>在 eBay 尋找現貨</span>
                        <ExternalLinkIcon className="w-3 h-3 text-text-muted" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
