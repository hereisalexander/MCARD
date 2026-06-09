'use client';

import React from 'react';
import { UserPortfolioItem } from './PortfolioDashboard';

interface SetItem {
  id: string;
  name: string;
  code: string;
  releaseYear: string;
  totalCards: number;
  bannerColor: string; // Tailwind bg color class
}

interface SetsViewProps {
  portfolio: UserPortfolioItem[];
  onSelectSet: (setName: string) => void;
}

export const SetsView: React.FC<SetsViewProps> = ({ portfolio, onSelectSet }) => {
  const setsData: SetItem[] = [
    {
      id: 's1',
      name: 'Base Set',
      code: 'BS',
      releaseYear: '1999',
      totalCards: 102,
      bannerColor: 'bg-yellow-500',
    },
    {
      id: 's2',
      name: 'Scarlet & Violet: 151',
      code: '151',
      releaseYear: '2023',
      totalCards: 165,
      bannerColor: 'bg-verge-ultraviolet',
    },
    {
      id: 's3',
      name: 'Evolving Skies',
      code: 'ES',
      releaseYear: '2021',
      totalCards: 203,
      bannerColor: 'bg-blue-600',
    },
    {
      id: 's4',
      name: 'Crown Zenith',
      code: 'CZ',
      releaseYear: '2023',
      totalCards: 159,
      bannerColor: 'bg-purple-600',
    },
    {
      id: 's5',
      name: 'Twilight Masquerade',
      code: 'TM',
      releaseYear: '2024',
      totalCards: 167,
      bannerColor: 'bg-emerald-600',
    },
  ];

  // Helper to count how many cards the user owns in this set
  const getCollectedCount = (setName: string) => {
    // Note: card database has Evolving Skies, Crown Zenith, 151, Base Set, Twilight Masquerade
    return portfolio.filter((item) => {
      if (setName === 'Base Set') return item.name.includes('Base Set') || item.name.includes('Shadowless') || item.name.includes('102');
      if (setName === 'Scarlet & Violet: 151') return item.name.includes('151') || item.name.includes('165');
      if (setName === 'Evolving Skies') return item.name.includes('Evolving Skies') || item.name.includes('203');
      if (setName === 'Crown Zenith') return item.name.includes('Crown Zenith') || item.name.includes('159');
      if (setName === 'Twilight Masquerade') return item.name.includes('Twilight Masquerade') || item.name.includes('167');
      return false;
    }).length;
  };

  const handleSetClick = (setName: string) => {
    onSelectSet(setName);
  };

  const handleSetKeyDown = (event: React.KeyboardEvent, setName: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectSet(setName);
    }
  };

  return (
    <div className="w-full py-6 max-w-7xl mx-auto px-4 md:px-0">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-primary pb-3 mb-8">
        <h2 className="font-display font-bold text-2xl uppercase tracking-wider text-foreground">
          POKÉMON EXPANSION SETS
        </h2>
        <span className="font-mono text-[11px] text-text-muted">
          5 ACTIVE SETS IN DATABASE
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {setsData.map((set) => {
          const ownedCount = getCollectedCount(set.name);
          const percent = Math.min(Math.round((ownedCount / set.totalCards) * 100), 100);

          return (
            <div
              key={set.id}
              onClick={() => handleSetClick(set.name === 'Scarlet & Violet: 151' ? '151' : set.name)}
              onKeyDown={(e) => handleSetKeyDown(e, set.name === 'Scarlet & Violet: 151' ? '151' : set.name)}
              tabIndex={0}
              className="bg-surface border-hairline border-primary rounded-[20px] p-6 flex flex-col justify-between gap-6 hover:border-verge-ultraviolet dark:hover:border-jelly-mint transition-all duration-150 cursor-pointer group"
              aria-label={`View cards in set ${set.name}`}
            >
              <div className="flex flex-col gap-4">
                {/* Visual Banner Block */}
                <div className="h-20 w-full rounded-xl flex items-center justify-center p-4 border border-primary bg-black/5 dark:bg-black/35 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-grid-pattern" />
                  <span className="font-display font-bold text-2xl uppercase text-foreground z-10 text-center tracking-wide group-hover:text-deep-link-blue transition-colors duration-150">
                    {set.name}
                  </span>
                </div>

                <div className="flex justify-between text-xs font-mono text-text-muted">
                  <span>RELEASE YEAR: {set.releaseYear}</span>
                  <span>CODE: {set.code}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-2 border-t border-primary pt-4">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span>COLLECTED PROGRESS</span>
                  <span className="font-bold text-foreground">
                    {ownedCount} / {set.totalCards} ({percent}%)
                  </span>
                </div>
                
                {/* Horizontal Progress Track */}
                <div className="w-full h-2 bg-background border border-primary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-verge-ultraviolet dark:bg-jelly-mint transition-all duration-300"
                    style={{ width: `${percent > 0 ? Math.max(percent, 4) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
