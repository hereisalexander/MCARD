'use client';

import React from 'react';
import { UniversalCard } from '@/services/multiCardService';
import { CompareIcon } from '@/components/icons/AppIcons';

export interface VersusFloatBarProps {
  selectedCards: UniversalCard[];
  onRemoveCard: (cardId: string) => void;
  onClearAll: () => void;
  onLaunchCompare: () => void;
}

export const VersusFloatBar: React.FC<VersusFloatBarProps> = ({
  selectedCards,
  onRemoveCard,
  onClearAll,
  onLaunchCompare,
}) => {
  if (selectedCards.length === 0) return null;

  return (
    <aside
      aria-label="卡牌對比抽屜"
      className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-45 w-[94%] max-w-2xl bg-surface/95 backdrop-blur-xl border border-hairline/90 rounded-2xl shadow-2xl p-3 sm:p-4 flex items-center justify-between gap-3 animate-slide-in"
    >
      {/* Left: Card Avatars */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-hairline/60">
          <div className="flex items-center gap-1 text-blue-500 font-bold text-xs">
            <CompareIcon className="w-3.5 h-3.5" />
            <span>對比中</span>
          </div>
          <span className="font-mono text-xs font-black text-foreground">
            {selectedCards.length}/4
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedCards.map((card) => (
            <div
              key={card.id}
              className="relative flex items-center gap-2 bg-surface-hover/80 pl-1.5 pr-2 py-1 rounded-xl border border-hairline/60 shrink-0 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-6 h-8 object-contain rounded bg-background shrink-0"
              />
              <div className="flex flex-col min-w-0 max-w-[80px] sm:max-w-[110px]">
                <span className="text-[10px] font-sans font-bold text-foreground truncate">
                  {card.name}
                </span>
                <span className="text-[9px] font-mono font-semibold text-text-muted">
                  ${card.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveCard(card.id)}
                className="w-4 h-4 rounded-full bg-surface hover:bg-ferrari-red hover:text-white text-text-muted text-[10px] flex items-center justify-center transition-colors cursor-pointer"
                title="移除對比"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onClearAll}
          className="text-text-muted hover:text-foreground text-xs font-semibold px-2 py-1.5 transition-colors cursor-pointer"
        >
          清空
        </button>

        <button
          type="button"
          onClick={onLaunchCompare}
          disabled={selectedCards.length < 2}
          className={`px-4 sm:px-5 py-2 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center gap-1.5 shadow-sm select-none ${
            selectedCards.length >= 2
              ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95'
              : 'bg-surface-hover text-text-muted cursor-not-allowed opacity-60'
          }`}
        >
          <span>開始對比分析</span>
          <span className="text-[10px] font-mono opacity-80">({selectedCards.length})</span>
        </button>
      </div>
    </aside>
  );
};
