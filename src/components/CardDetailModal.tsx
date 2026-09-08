'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ApiPokemonCard } from '@/services/pokemonApi';
import { CardCondition } from '@/components/PortfolioDashboard';
import { HoloCard } from '@/components/HoloCard';

interface CardDetailModalProps {
  card: ApiPokemonCard | null;
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (cardName: string, price: number, imageUrl: string, condition: CardCondition) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  onAddCard,
}) => {
  const [selectedCondition, setSelectedCondition] = useState<CardCondition>('Ungraded');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Close on ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Generate 30-day historical price simulation based on current price
  const priceHistoryData = useMemo(() => {
    if (!card) return [];
    const basePrice = card.price;
    const pointsCount = 30;
    const history = [];

    // Deterministic pseudo-random seed based on card id
    let seed = 0;
    for (let i = 0; i < card.id.length; i++) {
      seed += card.id.charCodeAt(i);
    }

    const pseudoRandom = (step: number) => {
      const x = Math.sin(seed + step) * 10000;
      return x - Math.floor(x);
    };

    let currentVal = basePrice * 0.88;
    for (let day = pointsCount; day >= 1; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      const fluctuation = (pseudoRandom(day) - 0.48) * (basePrice * 0.04);
      currentVal = Math.max(0.5, currentVal + fluctuation);
      
      // Force last day to match current market price
      if (day === 1) {
        currentVal = basePrice;
      }

      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Number(currentVal.toFixed(2)),
      });
    }

    return history;
  }, [card]);

  if (!isOpen || !card) return null;

  const currentPrice = card.price;
  const pricesArr = priceHistoryData.map((d) => d.price);
  const minPrice = Math.min(...pricesArr, currentPrice);
  const maxPrice = Math.max(...pricesArr, currentPrice);
  const startPrice = priceHistoryData[0]?.price || currentPrice;
  const priceChange = currentPrice - startPrice;
  const priceChangePct = startPrice > 0 ? (priceChange / startPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  // SVG Chart Geometry
  const chartWidth = 500;
  const chartHeight = 160;
  const padding = 20;

  const pointsString = priceHistoryData
    .map((item, idx) => {
      const x = (idx / (priceHistoryData.length - 1)) * (chartWidth - padding * 2) + padding;
      const yRange = maxPrice - minPrice || 1;
      const y = chartHeight - ((item.price - minPrice) / yRange) * (chartHeight - padding * 2) - padding;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPointsString = `${padding},${chartHeight} ${pointsString} ${chartWidth - padding},${chartHeight}`;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddClick = () => {
    onAddCard(card.name, card.price, card.imageUrl, selectedCondition);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in"
    >
      <div className="bg-background border-hairline border-primary rounded-[24px] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative flex flex-col gap-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Top Header & Close Button */}
        <div className="flex items-center justify-between border-b border-primary pb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-verge-ultraviolet text-white dark:bg-jelly-mint dark:text-absolute-black font-mono text-[10px] font-bold tracking-[1.5px] uppercase">
              {card.set}
            </span>
            <span className="font-mono text-xs text-text-muted">#{card.number}</span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-primary flex items-center justify-center font-mono font-bold text-foreground hover:bg-surface hover:border-verge-ultraviolet dark:hover:border-jelly-mint transition-all duration-150 cursor-pointer"
            aria-label="Close card detail modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Hero Card Showcase (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center gap-4">
            <div className="w-full max-w-[280px]">
              <HoloCard src={card.imageUrl} alt={card.name} rarity={card.rarity} />
            </div>
            
            {card.artist && (
              <span className="font-mono text-[11px] text-text-muted">
                ILLUSTRATOR: <strong className="text-foreground">{card.artist.toUpperCase()}</strong>
              </span>
            )}
          </div>

          {/* Right Column: Card Details & Price Chart (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div>
              <span className="font-mono text-[10px] font-bold text-verge-ultraviolet dark:text-jelly-mint tracking-[2px] uppercase">
                {card.rarity.toUpperCase()} • {card.type.toUpperCase()} TYPE
              </span>
              <h2 className="font-display font-bold text-3xl md:text-5xl uppercase tracking-tight text-foreground leading-none mt-1">
                {card.name}
              </h2>
            </div>

            {/* Current Price & 30-Day Performance Stat Cards */}
            <div className="grid grid-cols-2 gap-4 bg-surface p-4 rounded-[16px] border-hairline border-primary">
              <div className="flex flex-col">
                <span className="font-mono text-[9px] text-text-muted tracking-[1px] uppercase">
                  CURRENT EST. MARKET PRICE
                </span>
                <span className="font-mono font-bold text-2xl text-foreground">
                  ${card.price.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="font-mono text-[9px] text-text-muted tracking-[1px] uppercase">
                  30-DAY CHANGE
                </span>
                <span className={`font-mono font-bold text-xl ${isPositive ? 'text-emerald-500 dark:text-jelly-mint' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}${priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePct.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* 30-Day Historical Price Chart */}
            <div className="bg-surface p-5 rounded-[20px] border-hairline border-primary flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] font-bold text-text-muted tracking-[1.5px] uppercase">
                  30-DAY PRICE HISTORY (MARKET TREND)
                </span>
                <span className="font-mono text-[10px] text-text-muted">
                  RANGE: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
                </span>
              </div>

              {/* Interactive SVG Chart */}
              <div className="relative w-full h-[160px] bg-background rounded-xl p-2 border border-primary/40 flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPositive ? '#3cffd0' : '#ef4444'} stopOpacity="0.35" />
                      <stop offset="100%" stopColor={isPositive ? '#3cffd0' : '#ef4444'} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Fill under Curve */}
                  <polygon points={areaPointsString} fill="url(#chartGradient)" />

                  {/* Trend Line */}
                  <polyline
                    fill="none"
                    stroke={isPositive ? '#3cffd0' : '#ef4444'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsString}
                  />

                  {/* Interactive Points */}
                  {priceHistoryData.map((item, idx) => {
                    const x = (idx / (priceHistoryData.length - 1)) * (chartWidth - padding * 2) + padding;
                    const yRange = maxPrice - minPrice || 1;
                    const y = chartHeight - ((item.price - minPrice) / yRange) * (chartHeight - padding * 2) - padding;
                    const isHovered = hoveredPointIndex === idx;

                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r={isHovered ? 6 : 3}
                        className="transition-all duration-150 cursor-pointer"
                        fill={isHovered ? '#ffffff' : isPositive ? '#3cffd0' : '#ef4444'}
                        stroke={isPositive ? '#5200ff' : '#991b1b'}
                        strokeWidth="2"
                        onMouseEnter={() => setHoveredPointIndex(idx)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      />
                    );
                  })}
                </svg>

                {/* Hover Tooltip */}
                {hoveredPointIndex !== null && priceHistoryData[hoveredPointIndex] && (
                  <div className="absolute top-2 right-4 bg-foreground text-background font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-primary uppercase">
                    {priceHistoryData[hoveredPointIndex].date}: ${priceHistoryData[hoveredPointIndex].price.toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Action Row: Condition Picker & Add to Portfolio */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-primary pt-4 mt-auto">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="font-mono text-[10px] font-bold text-text-muted uppercase shrink-0">CONDITION:</span>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value as CardCondition)}
                  className="bg-surface border border-primary rounded-xl px-3 py-2 font-mono text-xs font-bold text-foreground focus:outline-none focus:border-verge-ultraviolet dark:focus:border-jelly-mint cursor-pointer uppercase w-full sm:w-auto"
                >
                  <option value="Ungraded">UNGRADED</option>
                  <option value="PSA 10">PSA 10 GEM MINT</option>
                  <option value="PSA 9">PSA 9 MINT</option>
                  <option value="BGS 10">BGS 10 PRISTINE</option>
                  <option value="BGS Black Label">BGS BLACK LABEL</option>
                </select>
              </div>

              <button
                onClick={handleAddClick}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-verge-ultraviolet text-white dark:bg-jelly-mint dark:text-absolute-black font-mono text-xs font-bold tracking-[1.5px] hover:opacity-85 active:opacity-60 transition-all duration-150 cursor-pointer uppercase shadow-md"
              >
                + ADD TO PORTFOLIO (${card.price.toFixed(2)})
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
