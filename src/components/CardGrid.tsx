'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchUniversalCards, UniversalCard, CardCategory } from '@/services/multiCardService';
import { HoloCard } from '@/components/HoloCard';
import { CardCondition } from '@/components/PortfolioDashboard';
import { useLanguage } from '@/context/LanguageContext';

export type SortOption = 'DEFAULT' | 'PRICE_DESC' | 'PRICE_ASC' | 'NAME_ASC' | 'NUMBER_ASC';
export type PriceRangeFilter = 'ALL' | 'UNDER_25' | '25_100' | '100_300' | 'OVER_300';

interface CardGridProps {
  category?: CardCategory;
  onSelectCategory?: (category: CardCategory) => void;
  onAddCard: (cardName: string, price: number, imageUrl: string, condition?: CardCondition, category?: CardCategory) => void;
  onSelectCardDetail?: (card: UniversalCard) => void;
  initialSetFilter?: string;
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
    <div className="w-full flex flex-col gap-6 py-6 animate-fade-in">
      {/* Control Header & Filters Bar */}
      <div className="flex flex-col gap-4 bg-surface p-5 rounded-2xl border border-hairline/70 shadow-sm">
        {/* Top row: Search input & Sorting */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={
                category === 'nba'
                  ? 'Search NBA stars (e.g. Jordan, LeBron, Wemby, Curry)...'
                  : category === 'fifa'
                  ? 'Search football stars (e.g. Messi, Ronaldo, Mbappé)...'
                  : category === 'yugioh'
                  ? 'Search Yu-Gi-Oh! (e.g. Blue-Eyes, Dark Magician)...'
                  : category === 'onepiece'
                  ? 'Search One Piece (e.g. Luffy, Shanks, Zoro)...'
                  : t('search_placeholder')
              }
              aria-label={t('search_label')}
              className="w-full px-4 py-2.5 bg-surface-hover/80 text-foreground border border-hairline/80 rounded-xl font-mono text-xs focus:outline-none focus:border-ferrari-red transition-colors"
            />
          </div>

          {/* Category & Sort Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {onSelectCategory && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-text-muted shrink-0 font-sans tracking-wide">
                  Category:
                </span>
                <select
                  value={category}
                  onChange={(e) => onSelectCategory(e.target.value as CardCategory)}
                  aria-label="Filter category"
                  className="h-9 px-3 bg-surface-hover/80 text-foreground border border-hairline/80 rounded-xl font-mono text-xs focus:outline-none focus:border-ferrari-red transition-colors cursor-pointer"
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
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-text-muted shrink-0 font-sans tracking-wide">
                {t('sort_by_label')}:
              </span>
              <select
                value={sortBy}
                onChange={handleSortChange}
                aria-label={t('sort_by_label')}
                className="h-9 px-3 bg-surface-hover/80 text-foreground border border-hairline/80 rounded-xl font-mono text-xs focus:outline-none focus:border-ferrari-red transition-colors cursor-pointer"
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
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-semibold text-text-muted shrink-0 mr-1">
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
                className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-ferrari-red text-white border-ferrari-red shadow-sm'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="bg-surface border border-hairline/70 rounded-2xl p-5 flex flex-col justify-between animate-pulse"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6">
            {processedCards.map((card) => {
              const catTag = CATEGORY_TAG_INFO[card.category] || CATEGORY_TAG_INFO.all;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className="bg-surface rounded-2xl p-5 flex flex-col justify-between border border-hairline/70 hover:border-hairline hover:shadow-md hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
                >
                  <div>
                    {/* 3D Interactive Holo Frame */}
                    <div className="w-full mb-4">
                      <HoloCard
                        src={card.imageUrl}
                        alt={card.name}
                        rarity={card.rarity}
                      />
                    </div>

                    {/* Category & Set Tags */}
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-mono font-bold tracking-wider border ${catTag.style}`}>
                        {catTag.label}
                      </span>
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide bg-surface-hover text-text-muted border border-hairline/60 max-w-[120px] truncate">
                        {card.set}
                      </span>
                    </div>

                    {/* Card Name */}
                    <h4 className="font-sans font-medium text-base tracking-tight text-foreground mb-1 line-clamp-1 group-hover:text-ferrari-red transition-colors">
                      {card.name}
                    </h4>

                    {/* Rarity & Type / Player */}
                    <div className="flex justify-between items-center text-[11px] text-text-muted mb-4 font-mono">
                      <span className="truncate max-w-[110px]">{card.rarity}</span>
                      <span className="font-semibold text-foreground/80 truncate max-w-[100px]">
                        {card.artistOrPlayer || card.type}
                      </span>
                    </div>
                  </div>

                  {/* Price & Action row */}
                  <div className="flex items-center justify-between border-t border-hairline/60 pt-3 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[9px] tracking-wide text-text-muted font-semibold">{t('est_market_price')}</span>
                      <span className="font-mono font-bold text-base text-foreground">
                        ${card.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddCard(card.name, card.price, card.imageUrl, 'Ungraded', card.category);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-surface-hover hover:bg-ferrari-red hover:text-white border border-hairline/70 text-text-muted font-mono text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      {t('add_to_portfolio')}
                    </button>
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
