'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchUniversalCards, UniversalCard, CardCategory } from '@/services/multiCardService';
import { HoloCard } from '@/components/HoloCard';
import { CardCondition } from '@/components/PortfolioDashboard';
import { useLanguage } from '@/context/LanguageContext';
import { CompareIcon, HeartIcon, ExternalLinkIcon } from '@/components/icons/AppIcons';
import { getEbayAffiliateUrl, trackAffiliateClick } from '@/utils/affiliate';

export type SortOption = 'DEFAULT' | 'PRICE_DESC' | 'PRICE_ASC' | 'NAME_ASC' | 'NUMBER_ASC';
export type PriceRangeFilter = 'ALL' | 'UNDER_25' | '25_100' | '100_300' | 'OVER_300';

interface CardGridProps {
  category?: CardCategory;
  onSelectCategory?: (category: CardCategory) => void;
  onAddCard: (cardName: string, price: number, imageUrl: string, condition?: CardCondition, category?: CardCategory) => void;
  onSelectCardDetail?: (card: UniversalCard) => void;
  initialSetFilter?: string;
  wishlistCardNames?: string[];
  onToggleWishlist?: (card: UniversalCard) => void;
  comparedCardIds?: string[];
  onToggleCompare?: (card: UniversalCard) => void;
}

const CATEGORY_TAG_INFO: Record<CardCategory, { label: string; style: string }> = {
  all: { label: 'ALL', style: 'bg-primary/15 text-foreground border-primary/30' },
  pokemon: { label: 'POKÉMON', style: 'bg-amber-400/15 text-amber-500 border-amber-500/30' },
  yugioh: { label: 'YU-GI-OH!', style: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  onepiece: { label: 'ONE PIECE', style: 'bg-red-500/15 text-red-400 border-red-500/30' },
  dragonball: { label: 'DRAGON BALL', style: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  nba: { label: 'NBA BASKETBALL', style: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  fifa: { label: 'FIFA FOOTBALL', style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};

export const CardGrid: React.FC<CardGridProps> = ({
  category = 'all',
  onSelectCategory,
  onAddCard,
  onSelectCardDetail,
  initialSetFilter = 'ALL',
  wishlistCardNames = [],
  onToggleWishlist,
  comparedCardIds = [],
  onToggleCompare,
}) => {
  const { t } = useLanguage();
  const [cards, setCards] = useState<UniversalCard[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedSet, setSelectedSet] = useState<string>('ALL');
  
  // Sorting & Price Range Filter States
  const [sortBy, setSortBy] = useState<SortOption>('DEFAULT');
  const [priceRange, setPriceRange] = useState<PriceRangeFilter>('ALL');

  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial set filter from props
  useEffect(() => {
    if (initialSetFilter) {
      const timer = setTimeout(() => {
        setSelectedSet(initialSetFilter);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialSetFilter]);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Main Card Fetch Function
  const loadCards = useCallback(
    async (isNewSearch: boolean, targetPage: number) => {
      if (isNewSearch) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await fetchUniversalCards({
          category,
          page: targetPage,
          pageSize: 24,
          searchQuery: debouncedSearch,
          sortBy: sortBy === 'PRICE_DESC' ? 'price-desc' : sortBy === 'PRICE_ASC' ? 'price-asc' : sortBy === 'NAME_ASC' ? 'name-asc' : 'price-desc',
        });

        if (isNewSearch) {
          setCards(result.cards);
        } else {
          setCards((prev) => [...prev, ...result.cards]);
        }

        setTotalCount(result.totalCount);
        setHasMore(result.hasMore);
        setPage(targetPage);
      } catch (err) {
        console.error('Failed to load cards:', err);
        setError('UNABLE TO FETCH CARDS FROM API. PLEASE TRY AGAIN.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [category, debouncedSearch, sortBy]
  );

  // Trigger search on category, search or initial filter change
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        loadCards(true, 1);
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [loadCards]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as SortOption);
  };

  const handlePriceRangeSelect = (range: PriceRangeFilter) => {
    setPriceRange(range);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    loadCards(false, page + 1);
  };

  const handleCardClick = (card: UniversalCard) => {
    if (onSelectCardDetail) {
      onSelectCardDetail(card);
    }
  };

  // Filter by Price Range & In-Memory Sorting if needed
  const processedCards = useMemo(() => {
    let result = [...cards];

    if (selectedSet !== 'ALL') {
      const lowerSet = selectedSet.toLowerCase();
      result = result.filter((c) => {
        const cardSet = (c.set || '').toLowerCase();
        const cardName = (c.name || '').toLowerCase();
        return (
          cardSet === lowerSet ||
          cardSet.includes(lowerSet) ||
          lowerSet.includes(cardSet) ||
          (lowerSet.includes('ninja') && cardName.includes('greninja')) ||
          (lowerSet.includes('nihil') && cardName.includes('zygarde')) ||
          (lowerSet.includes('storm') && cardName.includes('rayquaza'))
        );
      });
    }

    if (priceRange !== 'ALL') {
      result = result.filter((card) => {
        if (priceRange === 'UNDER_25') return card.price < 25;
        if (priceRange === '25_100') return card.price >= 25 && card.price <= 100;
        if (priceRange === '100_300') return card.price > 100 && card.price <= 300;
        if (priceRange === 'OVER_300') return card.price > 300;
        return true;
      });
    }

    return result;
  }, [cards, priceRange, selectedSet]);

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-6 py-2 sm:py-6 animate-fade-in">
      {/* Control Header & Filters Bar (Compact on mobile) */}
      <div className="flex flex-col gap-2.5 sm:gap-4 bg-surface p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-hairline/70 shadow-2xs">
        {/* Top row: Search input & Sorting */}
        <div className="flex flex-col md:flex-row gap-2.5 sm:gap-4 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={
                category === 'nba'
                  ? 'Search NBA stars (e.g. Jordan, Curry)...'
                  : category === 'fifa'
                  ? 'Search football stars (e.g. Messi, Ronaldo)...'
                  : category === 'yugioh'
                  ? 'Search Yu-Gi-Oh! (e.g. Blue-Eyes)...'
                  : category === 'onepiece'
                  ? 'Search One Piece (e.g. Luffy, Shanks)...'
                  : t('search_placeholder')
              }
              aria-label={t('search_label')}
              className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-surface-hover/80 text-foreground border border-hairline/80 rounded-xl font-mono text-xs focus:outline-none focus:border-ferrari-red transition-colors"
            />
          </div>

          {/* Category & Sort Controls (2-columns on mobile, inline on desktop) */}
          <div className="grid grid-cols-2 md:flex items-center gap-2 sm:gap-3">
            {onSelectCategory && (
              <div className="flex items-center gap-1.5 w-full md:w-auto">
                <span className="hidden md:inline text-[11px] font-semibold text-text-muted shrink-0 font-sans tracking-wide">
                  Category:
                </span>
                <select
                  value={category}
                  onChange={(e) => onSelectCategory(e.target.value as CardCategory)}
                  aria-label="Filter category"
                  className="w-full md:w-auto h-8.5 sm:h-9 px-2 sm:px-3 bg-surface-hover/80 text-foreground border border-hairline/80 rounded-xl font-mono text-[11px] sm:text-xs focus:outline-none focus:border-ferrari-red transition-colors cursor-pointer"
                >
                  <option value="all">{t('cat_all')}</option>
                  <option value="pokemon">{t('cat_pokemon')}</option>
                  <option value="yugioh">{t('cat_yugioh')}</option>
                  <option value="onepiece">{t('cat_onepiece')}</option>
                  <option value="dragonball">{t('cat_dragonball')}</option>
                  <option value="nba">{t('cat_nba')}</option>
                  <option value="fifa">{t('cat_fifa')}</option>
                </select>
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 w-full md:w-auto">
              <span className="hidden md:inline text-[11px] font-semibold text-text-muted shrink-0 font-sans tracking-wide">
                {t('sort_by_label')}:
              </span>
              <select
                value={sortBy}
                onChange={handleSortChange}
                aria-label={t('sort_by_label')}
                className="w-full md:w-auto h-8.5 sm:h-9 px-2 sm:px-3 bg-surface-hover/80 text-foreground border border-hairline/80 rounded-xl font-mono text-[11px] sm:text-xs focus:outline-none focus:border-ferrari-red transition-colors cursor-pointer"
              >
                <option value="DEFAULT">{t('sort_default')}</option>
                <option value="PRICE_DESC">{t('sort_price_desc')}</option>
                <option value="PRICE_ASC">{t('sort_price_asc')}</option>
                <option value="NAME_ASC">{t('sort_name_asc')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Price Range Badges Filter Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pt-0.5 pb-0.5">
          <span className="hidden sm:inline text-[11px] font-semibold text-text-muted shrink-0 mr-1">
            {t('filter_price_range')}:
          </span>

          {(
            [
              { id: 'ALL', label: t('filter_all_prices') },
              { id: 'UNDER_25', label: t('filter_under_25') },
              { id: '25_100', label: t('filter_25_100') },
              { id: '100_300', label: t('filter_100_300') },
              { id: 'OVER_300', label: t('filter_300_plus') },
            ] as const
          ).map((filter) => {
            const isSelected = priceRange === filter.id;
            return (
              <button
                key={filter.id}
                tabIndex={0}
                onClick={() => handlePriceRangeSelect(filter.id)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg font-mono text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-ferrari-red text-white border-ferrari-red shadow-2xs'
                    : 'bg-surface-hover/60 hover:bg-surface-hover text-text-muted border-hairline/60'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Showing count indicator */}
      <div className="flex justify-between items-center px-1">
        <span className="font-mono text-xs text-text-muted">
          {isLoading
            ? t('fetching_live_data')
            : t('showing_cards')
                .replace('{count}', processedCards.length.toString())
                .replace('{total}', totalCount.toString())}
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-ferrari-red/10 border border-ferrari-red/30 text-ferrari-red font-mono text-xs">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="bg-surface border border-hairline/70 rounded-2xl p-3 sm:p-5 flex flex-col justify-between animate-pulse"
            >
              <div>
                <div className="aspect-[2.5/3.5] w-full bg-surface-hover rounded-xl mb-4" />
                <div className="h-4 bg-surface-hover rounded-lg w-1/3 mb-2" />
                <div className="h-5 bg-surface-hover rounded-lg w-3/4 mb-3" />
                <div className="h-4 bg-surface-hover rounded-lg w-1/2 mb-4" />
              </div>
              <div className="border-t border-hairline/60 pt-3 flex justify-between items-center">
                <div className="h-5 bg-surface-hover rounded-lg w-1/3" />
                <div className="h-8 bg-surface-hover rounded-lg w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : processedCards.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-hairline border-dashed">
          <p className="font-sans font-medium text-2xl uppercase text-foreground mb-2">{t('no_cards_found')}</p>
          <span className="font-mono text-xs text-text-muted">{t('try_resetting_filters')}</span>
        </div>
      ) : (
        /* Real Cards Grid */
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {processedCards.map((card) => {
              const catTag = CATEGORY_TAG_INFO[card.category] || CATEGORY_TAG_INFO.all;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className="bg-surface rounded-2xl p-3 sm:p-5 flex flex-col justify-between border border-hairline/70 hover:border-hairline hover:shadow-md hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
                >
                  <div>
                    {/* Floating Wishlist & Compare Buttons */}
                    <div className="flex items-center justify-between mb-1.5">
                      {/* Compare Checkbox Pill */}
                      {onToggleCompare ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare(card);
                          }}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-tight transition-all cursor-pointer flex items-center gap-1 border ${
                            comparedCardIds.includes(card.id)
                              ? 'bg-blue-600 text-white border-blue-500 shadow-2xs'
                              : 'bg-surface-hover/80 text-text-muted hover:text-foreground border-hairline/60'
                          }`}
                          title="加入對比走勢"
                        >
                          <CompareIcon className="w-3 h-3" />
                          <span className="hidden sm:inline">
                            {comparedCardIds.includes(card.id) ? '對比中' : '對比'}
                          </span>
                        </button>
                      ) : <div />}

                      {/* Wishlist Heart Button */}
                      {onToggleWishlist && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(card);
                          }}
                          className={`ml-auto p-1 rounded-full text-xs transition-transform active:scale-125 cursor-pointer ${
                            wishlistCardNames.some(
                              (name) => name.toLowerCase() === card.name.toLowerCase()
                            )
                              ? 'text-rose-500 filter drop-shadow-[0_0_4px_rgba(244,63,94,0.4)]'
                              : 'text-text-muted/60 hover:text-rose-400'
                          }`}
                          title="加入/移出願望清單"
                        >
                          <HeartIcon
                            filled={wishlistCardNames.some(
                              (name) => name.toLowerCase() === card.name.toLowerCase()
                            )}
                            className="w-3.5 h-3.5"
                          />
                        </button>
                      )}
                    </div>

                    {/* 3D Interactive Holo Frame */}
                    <div className="w-full mb-2 sm:mb-4">
                      <HoloCard
                        src={card.imageUrl}
                        alt={card.name}
                        rarity={card.rarity}
                      />
                    </div>

                    {/* Category & Set Tags */}
                    <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2 flex-wrap">
                      <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[8px] font-mono font-bold tracking-wider border ${catTag.style}`}>
                        {catTag.label}
                      </span>
                      <span className="rounded-full px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-semibold tracking-wide bg-surface-hover text-text-muted border border-hairline/60 max-w-[80px] sm:max-w-[120px] truncate">
                        {card.set}
                      </span>
                    </div>

                    {/* Card Name */}
                    <h4 className="font-sans font-medium text-xs sm:text-base tracking-tight text-foreground mb-1 line-clamp-1 group-hover:text-ferrari-red transition-colors">
                      {card.name}
                    </h4>

                    {/* Rarity & Type / Player */}
                    <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-text-muted mb-2 sm:mb-4 font-mono">
                      <span className="truncate max-w-[65px] sm:max-w-[110px]">{card.rarity}</span>
                      <span className="font-semibold text-foreground/80 truncate max-w-[65px] sm:max-w-[100px]">
                        {card.artistOrPlayer || card.type}
                      </span>
                    </div>
                  </div>

                  {/* Price & Action row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-hairline/60 pt-2 sm:pt-3 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[8px] sm:text-[9px] tracking-wide text-text-muted font-semibold">{t('est_market_price')}</span>
                      <span className="font-mono font-bold text-xs sm:text-base text-foreground">
                        ${card.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <a
                        href={getEbayAffiliateUrl(card)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          trackAffiliateClick('ebay', card.name, getEbayAffiliateUrl(card));
                        }}
                        className="px-2 py-1 sm:py-1.5 rounded-lg bg-surface-hover hover:border-amber-500/50 hover:bg-amber-500/10 border border-hairline/70 text-text-muted hover:text-amber-500 font-mono text-[10px] sm:text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-2xs flex items-center gap-1 shrink-0"
                        title="在 eBay 查看全球現貨"
                      >
                        <span className="font-bold text-amber-500">eBay</span>
                        <ExternalLinkIcon className="w-2.5 h-2.5" />
                      </a>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddCard(card.name, card.price, card.imageUrl, 'Ungraded', card.category);
                        }}
                        className="flex-1 sm:flex-none px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-surface-hover hover:bg-ferrari-red hover:text-white border border-hairline/70 text-text-muted font-mono text-[10px] sm:text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-xs active:scale-95 text-center"
                      >
                        {t('add_to_portfolio')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-hairline text-foreground font-mono text-xs font-semibold tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isLoadingMore
                  ? t('fetching_live_data')
                  : t('load_more_cards')
                      .replace('{count}', processedCards.length.toString())
                      .replace('{total}', totalCount.toString())}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
