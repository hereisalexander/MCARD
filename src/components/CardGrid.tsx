'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchPokemonCardsFromApi, ApiPokemonCard } from '@/services/pokemonApi';
import { HoloCard } from '@/components/HoloCard';
import { CardCondition } from '@/components/PortfolioDashboard';
import { useLanguage } from '@/context/LanguageContext';

export type SortOption = 'DEFAULT' | 'PRICE_DESC' | 'PRICE_ASC' | 'NAME_ASC' | 'NUMBER_ASC';
export type PriceRangeFilter = 'ALL' | 'UNDER_25' | '25_100' | '100_300' | 'OVER_300';

interface CardGridProps {
  onAddCard: (cardName: string, price: number, imageUrl: string, condition?: CardCondition) => void;
  onSelectCardDetail?: (card: ApiPokemonCard) => void;
  initialSetFilter?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  onAddCard,
  onSelectCardDetail,
  initialSetFilter = 'ALL',
}) => {
  const { t } = useLanguage();
  const [cards, setCards] = useState<ApiPokemonCard[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedSet, setSelectedSet] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  
  // Task 5: Sorting & Price Range Filter States
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
        const result = await fetchPokemonCardsFromApi({
          page: targetPage,
          pageSize: 30,
          searchQuery: debouncedSearch,
          setName: selectedSet,
          cardType: selectedType,
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
    [debouncedSearch, selectedSet, selectedType]
  );

  // Trigger search on filter/search change
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

  const handleSetSelect = (setName: string) => {
    setSelectedSet(setName);
  };

  const handleTypeSelect = (typeName: string) => {
    setSelectedType(typeName);
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

  const handleCardClick = (card: ApiPokemonCard) => {
    if (onSelectCardDetail) {
      onSelectCardDetail(card);
    }
  };

  // Task 5 Data Pipeline: Filter by Price Range & Sort Cards
  const processedCards = useMemo(() => {
    let result = [...cards];

    // 1. Price Range Filter
    if (priceRange !== 'ALL') {
      result = result.filter((card) => {
        if (priceRange === 'UNDER_25') return card.price < 25;
        if (priceRange === '25_100') return card.price >= 25 && card.price <= 100;
        if (priceRange === '100_300') return card.price > 100 && card.price <= 300;
        if (priceRange === 'OVER_300') return card.price > 300;
        return true;
      });
    }

    // 2. Sorting
    if (sortBy === 'PRICE_DESC') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'PRICE_ASC') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'NAME_ASC') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'NUMBER_ASC') {
      result.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
    }

    return result;
  }, [cards, priceRange, sortBy]);

  const setsList = [
    'ALL',
    '151',
    'Evolving Skies',
    'Crown Zenith',
    'Base Set',
    'Twilight Masquerade',
    'Paldean Fates',
    'Obsidian Flames',
    'Silver Tempest',
  ];

  const typesList = [
    'ALL',
    'Colorless',
    'Darkness',
    'Dragon',
    'Fairy',
    'Fighting',
    'Fire',
    'Grass',
    'Lightning',
    'Metal',
    'Psychic',
    'Water',
  ];

  const priceRangeOptions: { id: PriceRangeFilter; label: string }[] = [
    { id: 'ALL', label: t('filter_all_prices') },
    { id: 'UNDER_25', label: t('filter_under_25') },
    { id: '25_100', label: t('filter_25_100') },
    { id: '100_300', label: t('filter_100_300') },
    { id: 'OVER_300', label: t('filter_300_plus') },
  ];

  return (
    <div className="w-full py-6 animate-fade-in">
      {/* Search & Multi-Dimensional Filter Bar (Modern soft elevated panel) */}
      <div className="flex flex-col gap-6 mb-8 bg-surface-hover/50 p-6 sm:p-8 rounded-2xl border border-hairline/60 shadow-sm">
        
        {/* Top Row: Search Input + Sort Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-8 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label htmlFor="card-search" className="text-[11px] font-semibold tracking-wider text-text-muted">
                {t('search_label')}
              </label>
              {debouncedSearch && (
                <span className="text-[10px] font-semibold text-white bg-ferrari-red px-2.5 py-0.5 rounded-full tracking-wider">
                  FILTERED BY &quot;{debouncedSearch}&quot;
                </span>
              )}
            </div>
            <input
              id="card-search"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('search_placeholder')}
              className="w-full h-11 bg-surface border border-hairline rounded-xl px-4 text-sm text-foreground placeholder-text-muted/60 focus:outline-none focus:border-ferrari-red focus:ring-2 focus:ring-ferrari-red/10 transition-all duration-150"
            />
          </div>

          {/* Sort By Selector */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <label htmlFor="sort-select" className="text-[11px] font-semibold tracking-wider text-text-muted">
              {t('sort_by_label')}
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={handleSortChange}
              className="w-full h-11 bg-surface border border-hairline rounded-xl px-4 font-sans text-xs font-semibold text-foreground focus:outline-none focus:border-ferrari-red focus:ring-2 focus:ring-ferrari-red/10 cursor-pointer"
            >
              <option value="DEFAULT">{t('sort_default')}</option>
              <option value="PRICE_DESC">{t('sort_price_desc')}</option>
              <option value="PRICE_ASC">{t('sort_price_asc')}</option>
              <option value="NAME_ASC">{t('sort_name_asc')}</option>
              <option value="NUMBER_ASC">{t('sort_number_asc')}</option>
            </select>
          </div>
        </div>

        {/* Middle Row: Price Range Filters */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-text-muted">
            {t('filter_price_range')}
          </span>
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar md:flex-wrap gap-2 py-1 scroll-smooth">
            {priceRangeOptions.map((opt) => {
              const isActive = priceRange === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handlePriceRangeSelect(opt.id)}
                  className={`h-8 px-3.5 rounded-lg font-sans text-xs font-semibold tracking-wide cursor-pointer transition-all duration-150 shrink-0 whitespace-nowrap border ${
                    isActive
                      ? 'bg-ferrari-red text-white border-ferrari-red shadow-sm'
                      : 'bg-surface text-text-muted border-hairline/80 hover:text-foreground hover:bg-surface-hover hover:border-hairline'
                  }`}
                  aria-label={`Filter cards by price range ${opt.label}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Expansion Set Filters */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-text-muted">
            {t('filter_expansion_set')}
          </span>
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar md:flex-wrap gap-2 py-1 scroll-smooth">
            {setsList.map((setName) => {
              const isActive = selectedSet === setName;
              return (
                <button
                  key={setName}
                  onClick={() => handleSetSelect(setName)}
                  className={`h-8 px-3.5 rounded-lg font-sans text-xs font-semibold tracking-wide cursor-pointer transition-all duration-150 shrink-0 whitespace-nowrap border ${
                    isActive
                      ? 'bg-ferrari-red text-white border-ferrari-red shadow-sm'
                      : 'bg-surface text-text-muted border-hairline/80 hover:text-foreground hover:bg-surface-hover hover:border-hairline'
                  }`}
                  aria-label={`Filter cards by set ${setName}`}
                >
                  {setName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-text-muted">
            {t('filter_elemental_type')}
          </span>
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar md:flex-wrap gap-2 py-1 scroll-smooth">
            {typesList.map((typeName) => {
              const isActive = selectedType === typeName;
              return (
                <button
                  key={typeName}
                  onClick={() => handleTypeSelect(typeName)}
                  className={`h-8 px-3.5 rounded-lg font-sans text-xs font-semibold tracking-wide cursor-pointer transition-all duration-150 shrink-0 whitespace-nowrap border ${
                    isActive
                      ? 'bg-ferrari-red text-white border-ferrari-red shadow-sm'
                      : 'bg-surface text-text-muted border-hairline/80 hover:text-foreground hover:bg-surface-hover hover:border-hairline'
                  }`}
                  aria-label={`Filter cards by type ${typeName}`}
                >
                  {typeName}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result Count Status Bar */}
      <div className="flex justify-between items-center mb-6 pb-2 border-b border-hairline/60">
        <span className="text-xs font-semibold tracking-wide text-text-muted">
          {t('showing_cards', { count: processedCards.length, total: totalCount })}
        </span>
        {isLoadingMore && (
          <span className="font-mono text-xs text-ferrari-red animate-pulse tracking-wider">
            UPDATING TELEMETRY...
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[#181818] border border-ferrari-red text-white p-4 rounded-none mb-8 text-center text-sm">
          {error}
        </div>
      )}

      {/* Loading Skeleton View */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
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
        /* Empty State */
        <div className="text-center py-20 bg-canvas-elevated rounded-none border border-hairline border-dashed">
          <p className="font-sans font-medium text-2xl uppercase text-white mb-2">{t('no_cards_found')}</p>
          <span className="font-mono text-xs text-text-muted">{t('try_resetting_filters')}</span>
        </div>
      ) : (
        /* Real Cards Grid (Modern rounded cards, subtle border, smooth hover elevation) */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
            {processedCards.map((card) => (
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

                  {/* Card Telemetry Tags */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="rounded-full px-2.5 py-0.5 text-[9px] font-semibold tracking-wide bg-surface-hover text-text-muted border border-hairline/60 max-w-[140px] truncate">
                      {card.set}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      #{card.number}
                    </span>
                  </div>

                  {/* Card Name */}
                  <h4 className="font-sans font-medium text-base sm:text-lg tracking-tight text-foreground mb-1 line-clamp-1 group-hover:text-ferrari-red transition-colors">
                    {card.name}
                  </h4>

                  {/* Rarity & Type */}
                  <div className="flex justify-between items-center text-[11px] text-text-muted mb-4 font-mono">
                    <span className="truncate max-w-[120px]">{card.rarity}</span>
                    <span className="font-semibold text-foreground/80">{card.type}</span>
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
                      onAddCard(card.name, card.price, card.imageUrl);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-ferrari-red text-white hover:bg-ferrari-red-hover active:bg-ferrari-red-active font-sans text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer shadow-sm"
                    aria-label={`Add ${card.name} to portfolio`}
                  >
                    {t('add_to_portfolio')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-12 mb-6">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="h-11 px-8 rounded-full bg-surface border border-hairline font-sans text-xs font-semibold tracking-wide text-foreground hover:bg-surface-hover hover:border-foreground/20 transition-all duration-150 cursor-pointer disabled:opacity-50 flex items-center gap-3 shadow-sm"
              >
                {isLoadingMore ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-ferrari-red animate-ping" />
                    {t('fetching_live_data')}
                  </>
                ) : (
                  <>{t('load_more_cards', { count: cards.length, total: totalCount })}</>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
