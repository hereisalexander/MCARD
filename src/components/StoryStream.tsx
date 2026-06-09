'use client';

import React from 'react';

export interface StreamItem {
  id: string;
  timestamp: string;
  category: 'PRICE ALERT' | 'NEW SET' | 'AUCTION' | 'MARKET' | 'MILESTONE';
  title: string;
  description: string;
  cardName?: string;
  price?: number;
  changePercent?: number;
  imageUrl?: string;
  accentType: 'mint' | 'purple' | 'none';
}

interface StoryStreamProps {
  onAddCard: (cardName: string, price: number, imageUrl: string) => void;
}

export const StoryStream: React.FC<StoryStreamProps> = ({ onAddCard }) => {
  const streamData: StreamItem[] = [
    {
      id: '1',
      timestamp: '10 Mins Ago',
      category: 'PRICE ALERT',
      title: 'Charizard ex (151 SIR) Surges to New Highs',
      description: 'The Scarlet & Violet 151 Special Illustration Rare Charizard ex has seen a massive buying wave today, driving prices up by 14.8% on major marketplaces.',
      cardName: 'Charizard ex #199/165',
      price: 134.50,
      changePercent: 14.8,
      imageUrl: 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
      accentType: 'mint', // Mint block tile
    },
    {
      id: '2',
      timestamp: '2 Hours Ago',
      category: 'NEW SET',
      title: 'Scarlet & Violet: Shrouded Fable Set List Revealed',
      description: 'The official card list for the upcoming mini-set Shrouded Fable is out. Pecharunt ex and the Loyal Three are set to redefine the competitive metagame.',
      accentType: 'none', // Standard black/white tile
    },
    {
      id: '3',
      timestamp: '5 Hours Ago',
      category: 'AUCTION',
      title: 'PSA 10 Base Set Holo Mewtwo Closes at $18,500',
      description: 'A pristine gem mint copy of the legendary 1999 Base Set Holo Mewtwo found a new owner in a fierce bidding war closing on eBay today.',
      cardName: 'Mewtwo Holo #10/102',
      price: 18500.00,
      imageUrl: 'https://images.pokemontcg.io/base1/10_hires.png',
      accentType: 'purple', // Purple block tile
    },
    {
      id: '4',
      timestamp: 'Yesterday',
      category: 'MARKET',
      title: 'Hype Settles on Japanese 151 Booster Boxes',
      description: 'Following a substantial wave of reprints from The Pokemon Company in Japan, booster boxes have dropped back to a steady $115 per box, making it a hot target for entry-level collectors.',
      accentType: 'none',
    },
    {
      id: '5',
      timestamp: '2 Days Ago',
      category: 'MILESTONE',
      title: 'Steve Aoki Adds Shadowless Charizard to Public Showcase',
      description: 'Celebrity collector Steve Aoki updated his showcase with a legendary Base Set Shadowless Charizard Holo PSA 9, raising his total portfolio valuation past the $800k mark.',
      cardName: 'Charizard Shadowless Holo #4/102',
      price: 9800.00,
      imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
      accentType: 'none',
    },
  ];

  const handleAddClick = (item: StreamItem) => {
    if (item.cardName && item.price && item.imageUrl) {
      onAddCard(item.cardName, item.price, item.imageUrl);
    }
  };

  return (
    <div className="w-full py-8 max-w-4xl mx-auto">
      {/* Stream Header */}
      <div className="flex items-center gap-4 mb-10 border-b border-primary pb-3">
        <span className="font-mono text-[14px] font-bold tracking-[2px] bg-verge-ultraviolet text-white dark:bg-jelly-mint dark:text-absolute-black px-2 py-0.5 rounded-[2px]">
          LIVE
        </span>
        <h2 className="font-display font-bold text-2xl uppercase tracking-wider text-foreground">
          THE STORYSTREAM
        </h2>
        <div className="flex-1 border-t border-dashed border-border-primary opacity-25" />
        <span className="font-mono text-[11px] text-text-muted hidden sm:inline">
          REAL-TIME POKÉMON MARKET INSIGHTS
        </span>
      </div>

      {/* Timeline Container */}
      <div className="relative pl-6 sm:pl-28">
        {/* Vertical Rule Line */}
        <div className="absolute left-6 sm:left-[87px] top-0 bottom-0 w-[2px] bg-dashed border-l-2 border-dashed border-verge-ultraviolet dark:border-jelly-mint opacity-40" />

        <div className="flex flex-col gap-8">
          {streamData.map((item) => {
            const isMint = item.accentType === 'mint';
            const isPurple = item.accentType === 'purple';
            const hasAccent = isMint || isPurple;

            return (
              <div key={item.id} className="relative group">
                {/* Left side timestamp on desktop */}
                <div className="absolute left-[-115px] top-4 w-24 text-right hidden sm:block">
                  <span className="font-mono text-[11px] font-bold tracking-[1px] text-text-muted">
                    {item.timestamp.toUpperCase()}
                  </span>
                </div>

                {/* Card Tile */}
                <div
                  className={`rounded-[20px] p-6 transition-all duration-200 ${
                    isMint
                      ? 'bg-jelly-mint text-absolute-black border-none'
                      : isPurple
                      ? 'bg-verge-ultraviolet text-white border-none'
                      : 'bg-surface border-hairline border-primary hover:border-verge-ultraviolet dark:hover:border-jelly-mint'
                  }`}
                >
                  {/* Timestamp for mobile */}
                  <div className="sm:hidden font-mono text-[10px] tracking-[1px] mb-2 text-text-muted">
                    {item.timestamp.toUpperCase()}
                  </div>

                  {/* Tag/Kicker */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`font-mono text-[11px] font-bold tracking-[1.5px] px-2 py-0.5 rounded-[4px] ${
                        isMint
                          ? 'bg-absolute-black text-jelly-mint'
                          : isPurple
                          ? 'bg-jelly-mint text-absolute-black'
                          : 'bg-foreground text-background'
                      }`}
                    >
                      {item.category}
                    </span>
                    {item.changePercent && (
                      <span className={`font-mono text-[11px] font-bold ${isMint ? 'text-absolute-black underline' : 'text-jelly-mint'}`}>
                        +{item.changePercent}%
                      </span>
                    )}
                  </div>

                  {/* Headline */}
                  <h3
                    className={`font-display text-xl md:text-3xl font-bold uppercase tracking-tight leading-none mb-3 cursor-pointer group-hover:text-deep-link-blue transition-colors duration-150 ${
                      isMint ? 'text-absolute-black' : isPurple ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {item.title}
                  </h3>

                  {/* Excerpt */}
                  <p
                    className={`font-body text-sm leading-relaxed mb-4 ${
                      isMint ? 'text-absolute-black/80' : isPurple ? 'text-white/80' : 'text-text-muted'
                    }`}
                  >
                    {item.description}
                  </p>

                  {/* Embedded card detail block */}
                  {item.cardName && item.price && (
                    <div
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border-hairline gap-4 ${
                        isMint
                          ? 'bg-absolute-black/5 border-absolute-black/20 text-absolute-black'
                          : isPurple
                          ? 'bg-absolute-black/30 border-white/20 text-white'
                          : 'bg-background border-primary text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <div className="w-12 h-16 relative overflow-hidden rounded-[4px] border border-black/10 dark:border-white/10 bg-slate-900/10 flex items-center justify-center shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.imageUrl}
                              alt={item.cardName}
                              className="object-contain max-h-full max-w-full"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-mono text-[10px] tracking-[0.5px] opacity-75">FEATURED CARD</span>
                          <span className="font-body font-bold text-sm">{item.cardName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-current/10">
                        <div className="flex flex-col text-right">
                          <span className="font-mono text-[10px] tracking-[0.5px] opacity-75">MARKET PRICE</span>
                          <span className="font-mono font-bold text-sm">
                            ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleAddClick(item)}
                          className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold tracking-[1px] transition-colors duration-150 cursor-pointer ${
                            isMint
                              ? 'bg-absolute-black text-white hover:bg-absolute-black/80'
                              : isPurple
                              ? 'bg-jelly-mint text-absolute-black hover:bg-white'
                              : 'bg-verge-ultraviolet text-white dark:bg-jelly-mint dark:text-absolute-black hover:opacity-85'
                          }`}
                          aria-label={`Simulate adding ${item.cardName} to portfolio`}
                        >
                          + PORTFOLIO
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
