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
    <div className="w-full py-6 flex flex-col gap-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-hairline/60 pb-4">
        <div>
          <span className="text-[11px] font-semibold text-ferrari-red tracking-wider uppercase">
            Expansion Archives
          </span>
          <h2 className="font-sans font-medium text-2xl sm:text-4xl text-foreground tracking-tight mt-1">
            {t('sets_page_title')}
          </h2>
        </div>
        <span className="font-mono text-xs text-text-muted hidden sm:inline tracking-wider">
          {t('sets_active_count', { count: sets.length })}
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-hairline/70 rounded-2xl p-6 flex flex-col justify-between h-56 animate-pulse"
            >
              <div className="h-16 w-3/4 bg-surface-hover rounded-xl" />
              <div className="h-4 w-1/2 bg-surface-hover rounded-lg mt-4" />
              <div className="h-2 w-full bg-surface-hover rounded-full mt-6" />
            </div>
          ))}
        </div>
      ) : (
        /* Expansion Sets Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
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
                className="bg-surface border border-hairline/70 rounded-2xl p-6 flex flex-col justify-between gap-6 hover:border-hairline hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                aria-label={`View cards in set ${set.name}`}
              >
                <div className="flex flex-col gap-4">
                  {/* Top Set Card Header (Symbol + Series) */}
                  <div className="flex items-center justify-between border-b border-hairline/60 pb-3">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={set.images.symbol}
                        alt={`${set.name} symbol`}
                        className="w-5 h-5 object-contain"
                      />
                      <span className="rounded-full px-2.5 py-0.5 bg-surface-hover border border-hairline/60 text-foreground font-mono text-[9px] font-semibold tracking-wide">
                        {set.series}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-text-muted">
                      {set.releaseDate ? set.releaseDate.slice(0, 4) : '2024'}
                    </span>
                  </div>

                  {/* Set Logo Image */}
                  <div className="h-20 w-full rounded-xl flex items-center justify-center p-3 bg-surface-hover/60 relative overflow-hidden group-hover:bg-surface-hover transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={set.images.logo}
                      alt={set.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Set Details */}
                  <div className="flex justify-between items-center font-mono text-[11px]">
                    <h3 className="font-sans font-medium text-lg text-foreground truncate max-w-[180px] group-hover:text-ferrari-red transition-colors">
                      {set.name}
                    </h3>
                    <span className="text-text-muted">
                      {set.printedTotal} Cards
                    </span>
                  </div>
                </div>

                {/* Collection Progress bar */}
                <div className="flex flex-col gap-2 border-t border-hairline/60 pt-4">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-text-muted">{t('sets_collected_progress')}</span>
                    <span className="font-bold text-foreground">
                      {ownedCount} / {totalCards} ({percent}%)
                    </span>
                  </div>
                  
                  {/* Progress Track */}
                  <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ferrari-red rounded-full transition-all duration-300"
                      style={{ width: `${percent > 0 ? Math.max(percent, 4) : 0}%` }}
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
