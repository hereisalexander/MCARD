'use client';

import React, { useState, useEffect } from 'react';
import { UserPortfolioItem } from './PortfolioDashboard';
import { fetchPokemonSets, ApiPokemonSet, FALLBACK_POKEMON_SETS } from '@/services/pokemonApi';
import { useLanguage } from '@/context/LanguageContext';

interface SetsViewProps {
  portfolio: UserPortfolioItem[];
  onSelectSet: (setName: string) => void;
}

export const SetsView: React.FC<SetsViewProps> = ({ portfolio, onSelectSet }) => {
  const { t } = useLanguage();
  const [sets, setSets] = useState<ApiPokemonSet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadLiveSets = async () => {
      setLoading(true);
      const data = await fetchPokemonSets();
      if (isMounted) {
        if (data && data.length > 0) {
          setSets(data);
        } else {
          setSets(FALLBACK_POKEMON_SETS);
        }
        setLoading(false);
      }
    };
    loadLiveSets();
    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate unique cards collected by user for a given set name
  const getCollectedCount = (setName: string) => {
    const matched = portfolio.filter((item) => {
      const lowerName = item.name.toLowerCase();
      const lowerSet = setName.toLowerCase();
      return lowerName.includes(lowerSet) || lowerSet.includes(lowerName.replace(/[^a-z0-9]/gi, ''));
    });
    return matched.length;
  };

  const handleSetClick = (setName: string) => {
    onSelectSet(setName);
  };

  return (
    <div className="w-full py-6 max-w-7xl mx-auto px-4 md:px-0 animate-fade-in">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-primary pb-4 mb-8 gap-2">
        <div>
          <span className="font-mono text-[10px] font-bold text-verge-ultraviolet dark:text-jelly-mint tracking-[2px] uppercase">
            LIVE POKÉMON TCG EXPANSIONS
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl uppercase tracking-tight text-foreground leading-none mt-1">
            {t('sets_page_title')}
          </h2>
        </div>
        <span className="font-mono text-[11px] text-text-muted">
          {t('sets_active_count').replace('{count}', (sets.length || 36).toString())}
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border-hairline border-primary rounded-[20px] p-6 flex flex-col justify-between h-56 animate-pulse"
            >
              <div className="h-16 w-3/4 bg-background border border-primary/20 rounded-xl" />
              <div className="h-4 w-1/2 bg-background border border-primary/20 rounded mt-4" />
              <div className="h-3 w-full bg-background border border-primary/20 rounded-full mt-6" />
            </div>
          ))}
        </div>
      ) : (
        /* Expansion Sets Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => {
            const ownedCount = getCollectedCount(set.name);
            const totalCards = set.printedTotal || set.total || 100;
            const percent = Math.min(Math.round((ownedCount / totalCards) * 100), 100);

            return (
              <div
                key={set.id}
                onClick={() => handleSetClick(set.name)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSetClick(set.name)}
                tabIndex={0}
                className="bg-surface border-hairline border-primary rounded-[22px] p-6 flex flex-col justify-between gap-6 hover:border-verge-ultraviolet dark:hover:border-jelly-mint transition-all duration-150 cursor-pointer group shadow-sm hover:shadow-md"
                aria-label={`View cards in set ${set.name}`}
              >
                <div className="flex flex-col gap-4">
                  {/* Top Set Card Header (Symbol + Series) */}
                  <div className="flex items-center justify-between border-b border-primary/30 pb-3">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={set.images.symbol}
                        alt={`${set.name} symbol`}
                        className="w-5 h-5 object-contain"
                      />
                      <span className="font-mono text-[10px] font-bold text-verge-ultraviolet dark:text-jelly-mint tracking-[1px] uppercase">
                        {set.series.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-text-muted">
                      {set.releaseDate ? set.releaseDate.slice(0, 4) : '2024'}
                    </span>
                  </div>

                  {/* Set Logo Image */}
                  <div className="h-20 w-full rounded-xl flex items-center justify-center p-3 border border-primary/20 bg-background relative overflow-hidden group-hover:border-verge-ultraviolet dark:group-hover:border-jelly-mint transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={set.images.logo}
                      alt={set.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Set Details */}
                  <div className="flex justify-between items-center font-mono text-[11px]">
                    <h3 className="font-display font-bold text-lg uppercase text-foreground truncate max-w-[180px]">
                      {set.name}
                    </h3>
                    <span className="text-text-muted">
                      {set.printedTotal} CARDS
                    </span>
                  </div>
                </div>

                {/* Collection Progress bar */}
                <div className="flex flex-col gap-2 border-t border-primary/40 pt-4">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-text-muted">{t('sets_collected_progress')}</span>
                    <span className="font-bold text-foreground">
                      {ownedCount} / {totalCards} ({percent}%)
                    </span>
                  </div>
                  
                  {/* Progress Track */}
                  <div className="w-full h-2 bg-background border border-primary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-verge-ultraviolet dark:bg-jelly-mint transition-all duration-300"
                      style={{ width: `${percent > 0 ? Math.max(percent, 5) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
