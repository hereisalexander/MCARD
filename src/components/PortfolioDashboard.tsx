'use client';

import React from 'react';

export interface UserPortfolioItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  addedAt: string;
}

interface PortfolioDashboardProps {
  portfolio: UserPortfolioItem[];
  onRemoveCard: (id: string) => void;
  portfolioValue: number;
  mode: 'portfolio' | 'showcase';
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  portfolio,
  onRemoveCard,
  portfolioValue,
  mode,
}) => {
  // Mock Steve Aoki's showcase cards
  const aokiCards = [
    {
      id: 'a1',
      name: 'Charizard Base Set Shadowless Holo',
      rarity: 'PSA 10 GEM MINT',
      value: 420000,
      imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    },
    {
      id: 'a2',
      name: 'Illustrator Pikachu Promo',
      rarity: 'PSA 9 MINT',
      value: 350000,
      imageUrl: 'https://images.pokemontcg.io/promo/pika_hires.png',
    },
    {
      id: 'a3',
      name: 'Lugia First Edition Neo Genesis Holo',
      rarity: 'PSA 10 GEM MINT',
      value: 72500,
      imageUrl: 'https://images.pokemontcg.io/neo1/9_hires.png',
    },
  ];

  const handleRemoveClick = (id: string) => {
    onRemoveCard(id);
  };

  const handleRemoveKeyDown = (event: React.KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRemoveCard(id);
    }
  };

  // Sparkline SVG values based on mock price trend
  const sparklineData = [10, 25, 18, 42, 35, 60, 52, 75, 68, 90, 85, 100];
  const chartWidth = 500;
  const chartHeight = 80;
  const padding = 5;

  const points = sparklineData
    .map((val, index) => {
      const x = (index / (sparklineData.length - 1)) * (chartWidth - padding * 2) + padding;
      const y = chartHeight - (val / 100) * (chartHeight - padding * 2) - padding;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-full py-6 max-w-7xl mx-auto px-4 md:px-0 flex flex-col gap-10">
      
      {/* SECTION 1: USER'S LIVE PORTFOLIO */}
      {mode === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Portfolio Items List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-primary pb-3">
              <h2 className="font-display font-bold text-2xl uppercase tracking-wider text-foreground">
                MY LIVE TRACKER
              </h2>
              <span className="font-mono text-[11px] text-text-muted">
                {portfolio.length} ITEMS IN COLLECTION
              </span>
            </div>

            {portfolio.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-surface rounded-[20px] border-hairline border-dashed text-center min-h-[300px]">
                <span className="font-mono text-[11px] font-bold tracking-[2px] text-verge-ultraviolet dark:text-jelly-mint mb-3">
                  COLLECTION VACANT
                </span>
                <h3 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground mb-2">
                  YOUR PORTFOLIO IS EMPTY
                </h3>
                <p className="font-body text-sm text-text-muted max-w-sm mb-6">
                  Go to the Explore tab or the StoryStream to add some cards to your tracker and view price trends.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-surface border-hairline border-primary rounded-[20px] p-4 gap-4 hover:border-verge-ultraviolet dark:hover:border-jelly-mint transition-all duration-150"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-background rounded-[4px] border border-primary overflow-hidden flex items-center justify-center p-1 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl} alt={item.name} className="object-contain max-h-full max-w-full" />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-display font-bold text-base md:text-lg uppercase text-foreground leading-tight">
                          {item.name}
                        </h4>
                        <span className="font-mono text-[9px] text-text-muted">ADDED ON {item.addedAt.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="font-mono font-bold text-base text-foreground">
                        ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => handleRemoveClick(item.id)}
                        onKeyDown={(e) => handleRemoveKeyDown(e, item.id)}
                        tabIndex={0}
                        className="px-3 py-1.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500/20 font-mono text-[10px] font-bold tracking-[1px] transition-colors duration-150 cursor-pointer"
                        aria-label={`Remove ${item.name} from collection`}
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right 1 Col: Portfolio Stats & Charts */}
          <div className="flex flex-col gap-6">
            <div className="border-b border-primary pb-3">
              <h2 className="font-display font-bold text-2xl uppercase tracking-wider text-foreground">
                PORTFOLIO STATS
              </h2>
            </div>

            {/* Stats Box */}
            <div className="bg-verge-ultraviolet text-white dark:bg-jelly-mint dark:text-absolute-black rounded-[20px] p-6 flex flex-col gap-6">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] tracking-[1.5px] opacity-75 uppercase">
                  TOTAL VALUATION (USD)
                </span>
                <span className="font-display font-bold text-4xl md:text-5xl tracking-tighter leading-none mt-1">
                  ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-current/15 pt-4">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] opacity-75 uppercase">OWNED ITEMS</span>
                  <span className="font-display font-bold text-2xl">{portfolio.length} Cards</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] opacity-75 uppercase">SLABS (EST.)</span>
                  <span className="font-display font-bold text-2xl">
                    {portfolio.filter(p => p.price > 100).length} Items
                  </span>
                </div>
              </div>

              {/* Sparkline Chart inside Stats Box */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="font-mono text-[9px] opacity-75 uppercase">7-DAY VALUE TREND</span>
                <div className="w-full bg-black/20 dark:bg-white/10 rounded-lg p-2 flex items-center justify-center">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-12 overflow-visible"
                  >
                    <polyline
                      fill="none"
                      stroke={portfolioValue > 0 ? (portfolio.length % 2 === 0 ? '#3cffd0' : '#5200ff') : '#949494'}
                      strokeWidth="3"
                      points={points}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: STEVE AOKI CELEBRITY SHOWCASE */}
      {mode === 'showcase' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-primary pb-3">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-verge-ultraviolet dark:bg-jelly-mint" />
              <h2 className="font-display font-bold text-2xl uppercase tracking-wider text-foreground">
                CELEBRITY SHOWCASE
              </h2>
            </div>
            <span className="font-mono text-[11px] text-text-muted">
              FEATURED PROFILE
            </span>
          </div>

          {/* Aoki Showcase Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Block: Profile Info */}
            <div className="bg-surface border-hairline border-primary rounded-[20px] p-6 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-primary bg-slate-900/10 overflow-hidden flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://www.steveaoki.com/hubfs/SteveAoki_2022_PressPhoto_CreditKevinKranz.jpg"
                      alt="Steve Aoki Avatar"
                      className="object-cover h-full w-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="font-display font-bold text-lg text-foreground">SA</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-display font-bold text-xl uppercase leading-none">STEVE AOKI</h3>
                    <span className="font-mono text-[10px] text-text-muted">@aokiscardhouse</span>
                  </div>
                </div>

                <p className="font-body text-xs text-text-muted leading-relaxed">
                  World-renowned DJ, producer, and avid TCG collector. Aoki has built one of the most legendary collections of vintage Pokémon cards in existence.
                </p>
              </div>

              <div className="flex flex-col border-t border-primary pt-4 gap-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-muted">SHOWCASE VALUATION</span>
                  <span className="font-bold text-foreground">$842,500.00</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-muted">TOTAL ITEMS</span>
                  <span className="font-bold text-foreground">142 Items</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-muted">PSA SLABS</span>
                  <span className="font-bold text-foreground">86 Graded</span>
                </div>
              </div>
            </div>

            {/* Right Blocks: Steve Aoki's Showcase Cards */}
            {aokiCards.map((card) => (
              <div
                key={card.id}
                className="bg-surface border-hairline border-primary rounded-[20px] p-5 flex flex-col justify-between hover:border-verge-ultraviolet dark:hover:border-jelly-mint transition-all duration-150"
              >
                <div>
                  <div className="aspect-[4/3] w-full rounded-xl border border-primary overflow-hidden bg-black/5 dark:bg-black/35 flex items-center justify-center p-3 mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={card.imageUrl} alt={card.name} className="object-contain max-h-full max-w-full rounded-[4px]" />
                  </div>
                  
                  <span className="px-2 py-0.5 rounded-[4px] bg-verge-ultraviolet text-white dark:bg-jelly-mint dark:text-absolute-black font-mono text-[9px] font-bold tracking-[1px] uppercase">
                    {card.rarity}
                  </span>

                  <h4 className="font-display text-lg font-bold uppercase text-foreground leading-tight mt-2">
                    {card.name}
                  </h4>
                </div>

                <div className="flex items-center justify-between border-t border-primary pt-3 mt-4">
                  <span className="font-mono text-[9px] text-text-muted">ESTIMATED VALUE</span>
                  <span className="font-mono font-bold text-base text-foreground">
                    ${card.value.toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            ))}

          </div>
        </div>
      )}
      
    </div>
  );
};
