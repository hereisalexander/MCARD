'use client';

import React, { useState } from 'react';
import { CardListing, ListingStatus } from '@/types/marketplace';
import { CardCategory } from '@/services/multiCardService';
import { MarkSoldModal } from '@/components/MarkSoldModal';
import { UserPortfolioItem } from '@/components/PortfolioDashboard';
import { useLanguage } from '@/context/LanguageContext';
import {
  TagIcon,
  EditIcon,
  CheckCircleIcon,
  TrashIcon,
  TrendingDownIcon,
} from '@/components/icons/AppIcons';
import { getListingCardPhoto } from '@/utils/cardImages';

export interface MarketplaceViewProps {
  listings: CardListing[];
  onOpenCreateListing: () => void;
  onSelectListing: (listing: CardListing) => void;
  onUpdateListingStatus?: (
    listingId: string,
    status: ListingStatus,
    soldPrice?: number,
    syncToPortfolio?: boolean
  ) => void;
  onUpdateListingPrice?: (listingId: string, newPrice: number) => void;
  onDeleteListing?: (listingId: string) => void;
  portfolio?: UserPortfolioItem[];
  category?: CardCategory;
  onSelectCategory?: (cat: CardCategory) => void;
}

// 格式化自然語言相對時間，避免顯示原始 ISO 字串
const formatListingDate = (rawDate?: string): string => {
  if (!rawDate) return '';
  if (
    rawDate.includes('前') ||
    rawDate.includes('剛剛') ||
    rawDate.includes('昨天') ||
    rawDate.includes('小時') ||
    rawDate.includes('分鐘')
  ) {
    return rawDate;
  }
  const timestamp = Date.parse(rawDate);
  if (isNaN(timestamp)) return rawDate;
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return '剛剛';
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} 小時前`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} 天前`;
  const d = new Date(timestamp);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  listings,
  onOpenCreateListing,
  onSelectListing,
  onUpdateListingStatus,
  onUpdateListingPrice,
  onDeleteListing,
  portfolio = [],
  category: externalCategory,
  onSelectCategory,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [internalCategory, setInternalCategory] = useState<CardCategory>('all');
  const selectedCategory = externalCategory ?? internalCategory;
  const setSelectedCategory = (cat: CardCategory) => {
    setInternalCategory(cat);
    onSelectCategory?.(cat);
  };
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');
  const [filterDiscountOnly, setFilterDiscountOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my-listings' | 'sold-archive'>('all');

  // Modal & Edit Price states
  const [soldModalListing, setSoldModalListing] = useState<CardListing | null>(null);
  const [editingPriceListingId, setEditingPriceListingId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');

  // Seller Dashboard Metrics
  const myListings = listings.filter((l) => l.isOwner);
  const myActiveListings = myListings.filter((l) => l.status === 'active');
  const mySoldListings = myListings.filter((l) => l.status === 'sold');
  const myActiveTotalValue = myActiveListings.reduce((sum, item) => sum + item.askingPrice, 0);
  const mySoldTotalIncome = mySoldListings.reduce((sum, item) => sum + (item.soldPrice || item.askingPrice), 0);

  const filteredListings = listings.filter((item) => {
    // 1. Tab filter
    if (activeTab === 'all') {
      if (item.status === 'sold') return false; // In general market, only show active
    } else if (activeTab === 'my-listings') {
      if (!item.isOwner) return false;
    } else if (activeTab === 'sold-archive') {
      if (item.status !== 'sold') return false;
    }

    // 2. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.cardName.toLowerCase().includes(q);
      const matchSeller = item.sellerName.toLowerCase().includes(q);
      const matchSet = item.setName.toLowerCase().includes(q);
      if (!matchName && !matchSeller && !matchSet) return false;
    }

    // 3. Category filter
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    // 4. Condition filter
    if (conditionFilter !== 'ALL') {
      if (conditionFilter === 'PSA 10' && item.condition !== 'PSA 10') return false;
      if (conditionFilter === 'Ungraded' && item.condition === 'PSA 10') return false;
    }

    // 5. Discount filter
    if (filterDiscountOnly) {
      if (item.officialPrice <= 0 || item.askingPrice >= item.officialPrice) return false;
    }

    return true;
  });

  const handleStartEditPrice = (e: React.MouseEvent, item: CardListing) => {
    e.stopPropagation();
    setEditingPriceListingId(item.id);
    setEditingPriceValue(item.askingPrice.toString());
  };

  const handleSavePrice = (e: React.MouseEvent | React.FormEvent, listingId: string) => {
    e.stopPropagation();
    const newPrice = parseFloat(editingPriceValue);
    if (!isNaN(newPrice) && newPrice > 0 && onUpdateListingPrice) {
      onUpdateListingPrice(listingId, newPrice);
    }
    setEditingPriceListingId(null);
  };

  const handleCancelEditPrice = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPriceListingId(null);
  };

  const handleOpenSoldModal = (e: React.MouseEvent, item: CardListing) => {
    e.stopPropagation();
    setSoldModalListing(item);
  };

  const handleDeleteListingClick = (e: React.MouseEvent, item: CardListing) => {
    e.stopPropagation();
    const msg = t('marketplace_delist_confirm').replace('{name}', item.cardName);
    if (confirm(msg)) {
      if (onDeleteListing) onDeleteListing(item.id);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 py-2 sm:py-6 animate-fade-in">
      {/* Top Banner: Pure Minimalist */}
      <div className="w-full rounded-2xl p-5 sm:p-6 bg-surface border border-hairline/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-sans font-black text-xl sm:text-2xl text-foreground tracking-tight">
            {t('marketplace_title')}
          </h1>
          <p className="text-xs text-text-muted leading-relaxed max-w-xl">
            {t('marketplace_subtitle')}
          </p>
        </div>

        {/* Action Button: Refined Ferrari Red */}
        <button
          onClick={onOpenCreateListing}
          aria-label={t('marketplace_list_card_btn')}
          tabIndex={0}
          className="px-4.5 py-2.5 rounded-xl bg-ferrari-red hover:bg-ferrari-red-hover active:bg-ferrari-red-active active:scale-95 text-white font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 shrink-0 self-start sm:self-center"
        >
          <TagIcon className="w-4 h-4 text-white" />
          <span>{t('marketplace_list_card_btn')}</span>
        </button>
      </div>

      {/* Tabs & Search Controls */}
      <div className="w-full max-w-full overflow-hidden flex flex-col gap-3 bg-surface p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-hairline/70 shadow-2xs">
        {/* Row 1: All Listings vs My Listings vs Sold Archive & Search Box */}
        <div className="w-full max-w-full flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 min-w-0">
          {/* Main 3 Sub Tabs */}
          <div className="w-full sm:w-auto max-w-full overflow-x-auto no-scrollbar flex items-center gap-1 p-1 bg-surface-hover/70 rounded-xl border border-hairline/60 shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              aria-label={t('marketplace_tab_all')}
              tabIndex={0}
              className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                activeTab === 'all'
                  ? 'bg-surface text-foreground shadow-2xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              <span className="sm:hidden">全部</span>
              <span className="hidden sm:inline">{t('marketplace_tab_all')}</span>
              {' '}({listings.filter((l) => l.status !== 'sold').length})
            </button>
            <button
              onClick={() => setActiveTab('my-listings')}
              aria-label={t('marketplace_tab_my')}
              tabIndex={0}
              className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'my-listings'
                  ? 'bg-surface text-foreground shadow-2xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              <span className="sm:hidden">我的刊登</span>
              <span className="hidden sm:inline">{t('marketplace_tab_my')}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-ferrari-red/10 text-ferrari-red font-bold">
                {myListings.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sold-archive')}
              aria-label={t('marketplace_tab_sold')}
              tabIndex={0}
              className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                activeTab === 'sold-archive'
                  ? 'bg-surface text-foreground shadow-2xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              <span className="sm:hidden">成交紀錄</span>
              <span className="hidden sm:inline">{t('marketplace_tab_sold')}</span>
              {' '}({listings.filter((l) => l.status === 'sold').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:max-w-md min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('marketplace_search_placeholder')}
              aria-label={t('marketplace_search_placeholder')}
              className="w-full pl-9 pr-4 py-2 bg-surface-hover/80 text-foreground border border-hairline/80 rounded-xl font-mono text-xs focus:outline-none focus:border-ferrari-red"
            />
          </div>
        </div>

        {/* Row 2: Filter Pills (Category, Condition & Discount) */}
        <div className="w-full max-w-full flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 pb-0.5 flex-nowrap min-w-0">
          {/* Discount Only Pill */}
          <button
            onClick={() => setFilterDiscountOnly((prev) => !prev)}
            aria-label={t('marketplace_discount_only')}
            tabIndex={0}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-all border flex items-center gap-1.5 shrink-0 ${
              filterDiscountOnly
                ? 'bg-ferrari-red text-white border-ferrari-red shadow-2xs'
                : 'bg-surface-hover text-text-muted hover:text-foreground border-hairline/60'
            }`}
          >
            <TrendingDownIcon className="w-3.5 h-3.5" />
            <span>{t('marketplace_discount_only')}</span>
          </button>

          {/* Condition Pills */}
          {(['ALL', 'PSA 10', 'Ungraded'] as const).map((cond) => (
            <button
              key={cond}
              onClick={() => setConditionFilter(cond)}
              aria-label={cond === 'ALL' ? t('marketplace_all_conditions') : cond}
              tabIndex={0}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold whitespace-nowrap cursor-pointer transition-all border shrink-0 ${
                conditionFilter === cond
                  ? 'bg-foreground text-background border-foreground font-bold shadow-2xs'
                  : 'bg-surface-hover text-text-muted hover:text-foreground border-hairline/60'
              }`}
            >
              {cond === 'ALL' ? t('marketplace_all_conditions') : cond}
            </button>
          ))}

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as CardCategory)}
            aria-label={t('marketplace_all_categories')}
            className="h-7 px-2.5 bg-surface-hover text-text-muted border border-hairline/60 rounded-lg text-xs font-mono focus:outline-none cursor-pointer shrink-0"
          >
            <option value="all">{t('marketplace_all_categories')}</option>
            <option value="pokemon">{t('cat_pokemon')}</option>
            <option value="nba">{t('cat_nba')}</option>
            <option value="yugioh">{t('cat_yugioh')}</option>
            <option value="onepiece">{t('cat_onepiece')}</option>
          </select>
        </div>
      </div>

      {/* Seller Executive Dashboard (Visible when on 'my-listings' tab) */}
      {activeTab === 'my-listings' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface p-4 rounded-2xl border border-hairline/80 shadow-2xs animate-fade-in">
          <div className="flex flex-col p-3 rounded-xl bg-surface-hover/50 border border-hairline/60">
            <span className="text-[11px] font-mono text-text-muted">{t('marketplace_seller_active_title')}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-xl font-black text-foreground">{myActiveListings.length}</span>
              <span className="text-xs text-text-muted">items</span>
            </div>
            <span className="text-[10px] text-text-muted mt-0.5">{t('marketplace_seller_active_val')}: ${myActiveTotalValue.toLocaleString('en-US')}</span>
          </div>

          <div className="flex flex-col p-3 rounded-xl bg-surface-hover/50 border border-hairline/60">
            <span className="text-[11px] font-mono text-text-muted">{t('marketplace_seller_sold_title')}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-xl font-black text-emerald-500">{mySoldListings.length}</span>
              <span className="text-xs text-text-muted">items</span>
            </div>
            <span className="text-[10px] text-text-muted mt-0.5">{t('marketplace_seller_sold_val')}: ${mySoldTotalIncome.toLocaleString('en-US')}</span>
          </div>

          <div className="flex flex-col justify-center items-start sm:items-end p-3 rounded-xl bg-surface-hover/50 border border-hairline/60">
            <button
              onClick={onOpenCreateListing}
              className="px-4 py-2 bg-ferrari-red hover:bg-ferrari-red-hover active:bg-ferrari-red-active text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>{t('marketplace_list_card_btn')}</span>
            </button>
            <span className="text-[10px] text-text-muted mt-1.5">{t('marketplace_seller_add_hint')}</span>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-surface rounded-2xl border border-hairline border-dashed px-4 flex flex-col items-center justify-center">
          <p className="font-sans font-medium text-base sm:text-lg text-foreground mb-1">
            {activeTab === 'my-listings'
              ? t('marketplace_empty_my')
              : activeTab === 'sold-archive'
              ? t('marketplace_empty_sold')
              : t('marketplace_empty_all')}
          </p>
          <span className="font-mono text-xs text-text-muted max-w-sm mb-4">
            {activeTab === 'my-listings'
              ? t('marketplace_empty_my_desc')
              : t('marketplace_empty_all_desc')}
          </span>

          {/* Action button in empty state */}
          {activeTab === 'my-listings' ? (
            <button
              onClick={onOpenCreateListing}
              aria-label={t('marketplace_list_card_btn')}
              tabIndex={0}
              className="px-4 py-2 bg-ferrari-red hover:bg-ferrari-red-hover active:bg-ferrari-red-active text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <TagIcon className="w-3.5 h-3.5 text-white" />
              <span>{t('marketplace_list_card_btn')}</span>
            </button>
          ) : (searchQuery || conditionFilter !== 'ALL' || filterDiscountOnly || selectedCategory !== 'all') ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setConditionFilter('ALL');
                setFilterDiscountOnly(false);
                setSelectedCategory('all');
              }}
              aria-label="重設篩選條件"
              tabIndex={0}
              className="px-4 py-2 bg-surface-hover hover:bg-surface-hover/80 active:scale-95 text-foreground font-bold text-xs rounded-xl border border-hairline transition-all cursor-pointer"
            >
              重設所有篩選條件
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {filteredListings.map((item) => {
            const priceDiff =
              item.officialPrice > 0
                ? ((item.askingPrice - item.officialPrice) / item.officialPrice) * 100
                : 0;
            const savingsAmount = Math.max(0, item.officialPrice - item.askingPrice);
            const isDiscounted = priceDiff < 0;
            const isSold = item.status === 'sold';
            const isEditingThisPrice = editingPriceListingId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectListing(item)}
                className={`bg-surface rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between border transition-all duration-200 group cursor-pointer ${
                  isSold
                    ? 'border-hairline/50 opacity-90'
                    : 'border-hairline/70 hover:border-hairline hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                <div>
                  {/* Photo Display with Pro Terminal Overlays */}
                  <div className="relative aspect-[2.5/3.5] w-full rounded-xl overflow-hidden mb-2 bg-surface-hover border border-hairline/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getListingCardPhoto(item.cardName, item.photos)}
                      alt={item.cardName}
                      className="w-full h-full object-contain select-none group-hover:scale-102 transition-transform duration-200"
                      loading="lazy"
                    />

                    {/* Owner Micro Badge Top Right (Clean & non-intrusive) */}
                    {item.isOwner && (
                      <div className="absolute top-1.5 right-1.5 pointer-events-none">
                        <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-blue-600/90 backdrop-blur-md text-white border border-blue-400/30 shadow-xs">
                          {t('marketplace_my_listing_tag')}
                        </span>
                      </div>
                    )}

                    {/* Bottom Pro Market Bar: Semi-transparent official price ticker */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1.5 pt-4 flex items-center justify-between text-white font-mono text-[9.5px]">
                      <span className="text-white/80 font-medium truncate max-w-[55%]">
                        {item.officialPrice > 0 ? `市價 $${item.officialPrice.toLocaleString('en-US')}` : '無官方定價'}
                      </span>
                      {isDiscounted && !isSold ? (
                        <span className="text-emerald-400 font-extrabold flex items-center gap-0.5 shrink-0">
                          <TrendingDownIcon className="w-2.5 h-2.5" />
                          <span>省 ${savingsAmount.toLocaleString('en-US')}</span>
                        </span>
                      ) : (
                        <span className="text-white/60 text-[9px]">
                          {isSold ? '已成交' : '二級市價'}
                        </span>
                      )}
                    </div>

                    {/* Sold overlay */}
                    {isSold && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1 backdrop-blur-[1px]">
                        <span className="px-2.5 py-1 bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-md shadow-sm">
                          ✓ {t('marketplace_deal_sold_badge')}
                        </span>
                        {item.soldPrice && (
                          <span className="text-[10px] font-mono text-white/90">
                            {t('marketplace_realized_price')} ${item.soldPrice.toLocaleString('en-US')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Name & Set */}
                  <h4 className="font-sans font-bold text-xs sm:text-sm text-foreground tracking-tight leading-snug line-clamp-1 group-hover:text-ferrari-red transition-colors">
                    {item.cardName}
                  </h4>
                  <p className="text-[10px] text-text-muted font-mono truncate mt-0.5">
                    {item.setName || '未指定系列'}
                  </p>
                </div>

                {/* Bottom Section: Pro Data Matrix + Seller info + Actions */}
                <div className="flex flex-col mt-2">
                  {/* Inline Price Edit mode */}
                  {isEditingThisPrice ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 bg-surface-hover p-1.5 rounded-xl border border-ferrari-red mb-1.5"
                    >
                      <span className="font-mono text-xs text-text-muted">$</span>
                      <input
                        type="number"
                        step="any"
                        value={editingPriceValue}
                        onChange={(e) => setEditingPriceValue(e.target.value)}
                        className="w-full bg-transparent font-mono text-xs font-bold text-foreground focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={(e) => handleSavePrice(e, item.id)}
                        aria-label="儲存售價"
                        tabIndex={0}
                        className="w-5 h-5 flex items-center justify-center bg-ferrari-red hover:bg-ferrari-red-hover active:bg-ferrari-red-active text-white text-[10px] font-bold rounded-md transition-colors cursor-pointer shrink-0 shadow-2xs"
                        title="儲存售價"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelEditPrice}
                        aria-label="取消"
                        tabIndex={0}
                        className="w-5 h-5 flex items-center justify-center bg-surface hover:bg-surface-hover text-text-muted hover:text-foreground text-[10px] rounded-md border border-hairline/60 transition-colors cursor-pointer shrink-0"
                        title="取消"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    /* 2x2 Collector Pro Data Matrix */
                    <div className="bg-surface-hover/70 border border-hairline/70 rounded-xl p-2 mb-2 grid grid-cols-2 gap-1.5 items-center">
                      {/* Left: Asking Price */}
                      <div className="flex flex-col">
                        <span className="text-[8.5px] font-mono text-text-muted uppercase tracking-wider">
                          賣家開價
                        </span>
                        <span className="font-mono font-black text-sm sm:text-base text-ferrari-red leading-tight truncate">
                          ${(isSold && item.soldPrice ? item.soldPrice : item.askingPrice).toLocaleString('en-US')}
                        </span>
                      </div>

                      {/* Right: Official Ref Price */}
                      <div className="flex flex-col border-l border-hairline/60 pl-2">
                        <span className="text-[8.5px] font-mono text-text-muted uppercase tracking-wider">
                          行情參考
                        </span>
                        <span className="font-mono font-semibold text-xs sm:text-sm text-foreground/85 leading-tight truncate">
                          {item.officialPrice > 0 ? `$${item.officialPrice.toLocaleString('en-US')}` : '--'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Seller & Natural Time Row */}
                  <div className="flex items-center justify-between text-[10px] text-text-muted font-mono pt-0.5">
                    <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.sellerAvatar}
                        alt="Seller"
                        className="w-3.5 h-3.5 rounded-full object-cover shrink-0 border border-hairline/60"
                      />
                      <span className="truncate text-foreground/90 font-medium">{item.sellerName}</span>
                    </div>
                    <span className="shrink-0 text-text-muted">
                      {formatListingDate(isSold && item.soldAt ? item.soldAt : item.createdAt)}
                    </span>
                  </div>

                  {/* Seller Quick Action Toolbar (For user's owned listings) */}
                  {item.isOwner && !isSold && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 pt-2 border-t border-hairline/70 flex items-center gap-1.5"
                    >
                      <button
                        onClick={(e) => handleStartEditPrice(e, item)}
                        aria-label={t('marketplace_edit_price')}
                        tabIndex={0}
                        className="flex-1 h-7 px-2 rounded-lg text-[10.5px] font-mono font-bold bg-surface-hover hover:bg-surface-hover/80 active:scale-95 text-foreground border border-hairline/80 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap"
                        title={t('marketplace_edit_price')}
                      >
                        <EditIcon className="w-2.5 h-2.5 text-text-muted" />
                        <span>改價</span>
                      </button>

                      <button
                        onClick={(e) => handleOpenSoldModal(e, item)}
                        aria-label={t('marketplace_mark_sold')}
                        tabIndex={0}
                        className="flex-1 h-7 px-2 rounded-lg text-[10.5px] font-mono font-bold bg-foreground hover:bg-foreground/85 active:scale-95 text-background transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap"
                        title={t('marketplace_mark_sold')}
                      >
                        <CheckCircleIcon className="w-2.5 h-2.5" />
                        <span className="whitespace-nowrap">
                          <span className="hidden sm:inline">標記</span>售出
                        </span>
                      </button>

                      <button
                        onClick={(e) => handleDeleteListingClick(e, item)}
                        aria-label={t('marketplace_delist')}
                        tabIndex={0}
                        className="h-7 w-7 rounded-lg text-text-muted hover:text-ferrari-red hover:bg-ferrari-red/10 active:scale-95 border border-transparent hover:border-ferrari-red/20 transition-all cursor-pointer flex items-center justify-center shrink-0"
                        title={t('marketplace_delist')}
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mark Sold Modal */}
      {soldModalListing && (
        <MarkSoldModal
          key={soldModalListing.id}
          listing={soldModalListing}
          isOpen={soldModalListing !== null}
          onClose={() => setSoldModalListing(null)}
          portfolio={portfolio}
          onConfirmSold={(listingId, soldPrice, syncToPortfolio) => {
            if (onUpdateListingStatus) {
              onUpdateListingStatus(listingId, 'sold', soldPrice, syncToPortfolio);
            }
            setSoldModalListing(null);
          }}
        />
      )}
    </div>
  );
};
