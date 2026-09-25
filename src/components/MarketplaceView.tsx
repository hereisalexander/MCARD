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
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  listings,
  onOpenCreateListing,
  onSelectListing,
  onUpdateListingStatus,
  onUpdateListingPrice,
  onDeleteListing,
  portfolio = [],
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CardCategory>('all');
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
      {/* Top Banner: Marketplace Introduction */}
      <div className="relative w-full rounded-2xl p-5 sm:p-7 bg-gradient-to-r from-ferrari-red/10 via-surface to-surface border border-hairline/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ferrari-red animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-ferrari-red">
              {t('marketplace_p2p_badge')}
            </span>
          </div>
          <h1 className="font-sans font-black text-xl sm:text-2xl text-foreground tracking-tight">
            {t('marketplace_title')}
          </h1>
          <p className="text-xs text-text-muted max-w-xl leading-relaxed">
            {t('marketplace_subtitle')}
          </p>
        </div>

        {/* Action Button: List Card */}
        <button
          onClick={onOpenCreateListing}
          className="px-5 py-2.5 rounded-xl bg-ferrari-red hover:bg-ferrari-red-hover active:bg-ferrari-red-active text-white font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer shadow-sm flex items-center gap-2 shrink-0 active:scale-95"
        >
          <TagIcon className="w-4 h-4 text-white" />
          <span>{t('marketplace_list_card_btn')}</span>
        </button>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col gap-3 bg-surface p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-hairline/70 shadow-2xs">
        {/* Row 1: All Listings vs My Listings vs Sold Archive & Search Box */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Main 3 Sub Tabs */}
          <div className="flex items-center gap-1 p-1 bg-surface-hover/70 rounded-xl border border-hairline/60 self-start overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-surface text-foreground shadow-2xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              {t('marketplace_tab_all')} ({listings.filter((l) => l.status !== 'sold').length})
            </button>
            <button
              onClick={() => setActiveTab('my-listings')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'my-listings'
                  ? 'bg-surface text-foreground shadow-2xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              <span>{t('marketplace_tab_my')}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-ferrari-red/10 text-ferrari-red font-bold">
                {myListings.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sold-archive')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'sold-archive'
                  ? 'bg-surface text-foreground shadow-2xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              {t('marketplace_tab_sold')} ({listings.filter((l) => l.status === 'sold').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
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
              className="w-full pl-9 pr-4 py-2 bg-surface-hover/80 text-foreground border border-hairline/80 rounded-xl font-mono text-xs focus:outline-none focus:border-ferrari-red"
            />
          </div>
        </div>

        {/* Row 2: Filter Pills (Category, Condition & Discount) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {/* Discount Only Pill */}
          <button
            onClick={() => setFilterDiscountOnly((prev) => !prev)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-all border flex items-center gap-1.5 ${
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
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold whitespace-nowrap cursor-pointer transition-all border ${
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
            className="h-7 px-2.5 bg-surface-hover text-text-muted border border-hairline/60 rounded-lg text-xs font-mono focus:outline-none cursor-pointer"
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
              className="px-4 py-2 bg-foreground text-background hover:opacity-90 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>{t('marketplace_list_card_btn')}</span>
            </button>
            <span className="text-[10px] text-text-muted mt-1.5">{t('marketplace_seller_add_hint')}</span>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-hairline border-dashed">
          <p className="font-sans font-medium text-lg text-foreground mb-1">
            {activeTab === 'my-listings'
              ? t('marketplace_empty_my')
              : activeTab === 'sold-archive'
              ? t('marketplace_empty_sold')
              : t('marketplace_empty_all')}
          </p>
          <span className="font-mono text-xs text-text-muted">
            {activeTab === 'my-listings'
              ? t('marketplace_empty_my_desc')
              : t('marketplace_empty_all_desc')}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {filteredListings.map((item) => {
            const priceDiff =
              item.officialPrice > 0
                ? ((item.askingPrice - item.officialPrice) / item.officialPrice) * 100
                : 0;
            const isDiscounted = priceDiff < 0;
            const isSold = item.status === 'sold';
            const isEditingThisPrice = editingPriceListingId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectListing(item)}
                className={`bg-surface rounded-2xl p-3 sm:p-4 flex flex-col justify-between border transition-all duration-200 group cursor-pointer ${
                  isSold
                    ? 'border-hairline/50 opacity-90'
                    : 'border-hairline/70 hover:border-hairline hover:shadow-md hover:-translate-y-1'
                }`}
              >
                <div>
                  {/* Photo Display */}
                  <div className="relative aspect-[2.5/3.5] w-full rounded-xl overflow-hidden mb-2.5 bg-surface-hover border border-hairline/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.photos[0] || 'https://images.pokemontcg.io/sv3pt5/199_hires.png'}
                      alt={item.cardName}
                      className="w-full h-full object-contain select-none group-hover:scale-102 transition-transform duration-200"
                      loading="lazy"
                    />

                    {/* Condition Pill Top Left */}
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold shadow-xs border ${
                        item.condition === 'PSA 10'
                          ? 'bg-accent-yellow text-black border-amber-400'
                          : 'bg-black/75 text-white border-white/20'
                      }`}
                    >
                      {item.condition}
                    </span>

                    {/* Owner Badge Top Right */}
                    {item.isOwner && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-blue-500 text-white shadow-xs">
                        {t('marketplace_my_listing_tag')}
                      </span>
                    )}

                    {/* Sold overlay */}
                    {isSold && (
                      <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center gap-1 backdrop-blur-[1px]">
                        <span className="px-3 py-1 bg-emerald-500/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-md shadow-sm">
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

                  {/* Card Name */}
                  <h4 className="font-sans font-bold text-xs sm:text-sm text-foreground tracking-tight mb-1 line-clamp-1 group-hover:text-ferrari-red transition-colors">
                    {item.cardName}
                  </h4>

                  {/* Location & Time */}
                  <div className="flex items-center justify-between text-[10px] text-text-muted mb-2 font-mono">
                    <span className="truncate max-w-[90px]">{item.location}</span>
                    <span>{isSold && item.soldAt ? item.soldAt : item.createdAt}</span>
                  </div>
                </div>

                {/* Price & Seller Row */}
                <div className="pt-2 border-t border-hairline/60 flex flex-col gap-1.5 mt-auto">
                  {/* Inline Price Edit mode */}
                  {isEditingThisPrice ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 bg-surface-hover p-1 rounded-lg border border-ferrari-red"
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
                        className="p-1 bg-emerald-600 text-white text-[10px] rounded hover:bg-emerald-500 cursor-pointer"
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelEditPrice}
                        className="p-1 bg-surface text-text-muted text-[10px] rounded hover:text-foreground cursor-pointer"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono font-black text-sm sm:text-base text-ferrari-red">
                          ${(isSold && item.soldPrice ? item.soldPrice : item.askingPrice).toLocaleString('en-US')}
                        </span>
                        {isSold && (
                          <span className="text-[9px] font-mono text-emerald-500 font-bold">
                            ({t('marketplace_deal_sold_badge')})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] line-through text-text-muted font-mono">
                        ${item.officialPrice.toLocaleString('en-US')}
                      </span>
                    </div>
                  )}

                  {/* Discount or Deal tag */}
                  {isDiscounted && !isSold ? (
                    <span className="text-[9px] font-mono font-bold text-semantic-success truncate flex items-center gap-1">
                      <TrendingDownIcon className="w-3 h-3 text-semantic-success" />
                      <span>{t('marketplace_below_pct').replace('{pct}', Math.abs(priceDiff).toFixed(0))}</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-text-muted truncate">
                      {isSold ? t('marketplace_deal_completed') : t('marketplace_official_ref')}
                    </span>
                  )}

                  {/* Seller info footer */}
                  <div className="flex items-center gap-1.5 pt-1 text-[10px] text-text-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.sellerAvatar}
                      alt="Seller"
                      className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                    />
                    <span className="truncate">{item.sellerName}</span>
                  </div>

                  {/* Seller Quick Action Controls (When user owns this listing) */}
                  {item.isOwner && !isSold && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 pt-2 border-t border-hairline/60 flex items-center justify-between gap-1"
                    >
                      <button
                        onClick={(e) => handleStartEditPrice(e, item)}
                        className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-surface-hover hover:bg-surface-hover/80 text-foreground border border-hairline transition-colors cursor-pointer flex items-center gap-1"
                        title={t('marketplace_edit_price')}
                      >
                        <EditIcon className="w-2.5 h-2.5" />
                        <span>{t('marketplace_edit_price')}</span>
                      </button>

                      <button
                        onClick={(e) => handleOpenSoldModal(e, item)}
                        className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1"
                        title={t('marketplace_mark_sold')}
                      >
                        <CheckCircleIcon className="w-2.5 h-2.5" />
                        <span>{t('marketplace_mark_sold')}</span>
                      </button>

                      <button
                        onClick={(e) => handleDeleteListingClick(e, item)}
                        className="p-1 rounded-md text-[10px] text-text-muted hover:text-ferrari-red transition-colors cursor-pointer"
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
