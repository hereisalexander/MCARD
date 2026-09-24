'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export interface TelemetrySignal {
  id: string;
  timestamp: string;
  category: 'TELEMETRY' | 'PRICE SURGE' | 'AUCTION RECORD' | 'CIRCUIT RADAR' | 'VAULT MILESTONE';
  title: Record<'en' | 'zh-TW' | 'zh-CN', string>;
  description: Record<'en' | 'zh-TW' | 'zh-CN', string>;
  cardName?: string;
  price?: number;
  changePercent?: number;
  imageUrl?: string;
  specDetails?: {
    rarity: string;
    set: string;
    grade: string;
    vol24h: string;
  };
}

interface PaddockTelemetryProps {
  onAddCard: (cardName: string, price: number, imageUrl: string) => void;
  onExploreClick: () => void;
  onPortfolioClick: () => void;
}

export const PaddockTelemetry: React.FC<PaddockTelemetryProps> = ({
  onAddCard,
  onExploreClick,
  onPortfolioClick,
}) => {
  const { language, t } = useLanguage();

  const signals: TelemetrySignal[] = [
    {
      id: '1',
      timestamp: '10 MINS AGO',
      category: 'PRICE SURGE',
      title: {
        en: 'Charizard ex 151 SIR Surges to New All-Time High',
        'zh-TW': '噴火龍 ex 151 SAR 價格飆升創歷史新高',
        'zh-CN': '喷火龙 ex 151 SAR 价格飙升创历史新高',
      },
      description: {
        en: 'The Scarlet & Violet 151 Special Illustration Rare Charizard ex has seen a massive institutional buying wave today, accelerating price by +14.8% across global telemetry exchanges.',
        'zh-TW': '朱紫 151 特殊插畫罕見卡 (SAR) 噴火龍 ex 今日迎來機構級買盤介入，全球即時交易成交價大漲 +14.8%。',
        'zh-CN': '朱紫 151 特殊插画罕见卡 (SAR) 喷火龙 ex 今日迎来机构级买盘介入，全球实时交易成交价大涨 +14.8%。',
      },
      cardName: 'Charizard ex #199/165',
      price: 134.5,
      changePercent: 14.8,
      imageUrl: 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
      specDetails: {
        rarity: 'SPECIAL ILLUST. RARE',
        set: '151 (SV03.5)',
        grade: 'RAW / GEM MINT',
        vol24h: '$48,200',
      },
    },
    {
      id: '2',
      timestamp: '25 MINS AGO',
      category: 'AUCTION RECORD',
      title: {
        en: 'Michael Jordan 1986 Fleer RC #57 PSA 10 Hits $18,500',
        'zh-TW': '麥可·喬丹 1986 Fleer 新秀卡 #57 (PSA 10) 拍賣以 $18,500 成交',
        'zh-CN': '迈克尔·乔丹 1986 Fleer 新秀卡 #57 (PSA 10) 拍卖以 $18,500 成交',
      },
      description: {
        en: 'The definitive Holy Grail of basketball cards was closed after furious bidding at Goldin Auctions, setting a new benchmark for vintage sports assets.',
        'zh-TW': '籃球球星卡永恆神作——公牛傳奇喬丹 1986 Fleer 頂級 PSA 10 評級新秀卡在 Goldin 拍賣行以 $18,500 美元落槌成交。',
        'zh-CN': '篮球球星卡永恒神作——公牛传奇乔丹 1986 Fleer 顶级 PSA 10 评级新秀卡在 Goldin 拍卖行以 $18,500 美元落槌成交。',
      },
      cardName: 'Michael Jordan 1986 Fleer #57 RC',
      price: 18500.0,
      changePercent: 12.4,
      imageUrl: '/images/cards/nba-jordan.jpg',
      specDetails: {
        rarity: 'TRUE ROOKIE CARD',
        set: '1986-87 FLEER NBA',
        grade: 'PSA 10 GEM MT',
        vol24h: '$65,000',
      },
    },
    {
      id: '3',
      timestamp: '1 HOUR AGO',
      category: 'PRICE SURGE',
      title: {
        en: 'One Piece OP-05 Manga Luffy (Gear 5) Accelerates +24%',
        'zh-TW': '海賊王 OP-05 漫畫稀有五檔魯夫爆衝大漲 +24%',
        'zh-CN': '航海王 OP-05 漫画稀有五档路飞爆冲大涨 +24%',
      },
      description: {
        en: 'Awakening of the New Era Manga Super Parallel Gear 5 Luffy is dominating international TCG trade volume, reaching $3,800 amid unprecedented collector demand.',
        'zh-TW': '《新時代的主角》漫畫背景太陽神尼卡型態五檔魯夫全球行情瘋搶，即時市場均價飆漲至 $3,800 美元。',
        'zh-CN': '《新时代的主角》漫画背景太阳神尼卡形态五档路飞全球行情疯抢，实时市场均价飙涨至 $3,800 美元。',
      },
      cardName: 'Monkey.D.Luffy Manga SEC (OP05-119)',
      price: 3800.0,
      changePercent: 24.0,
      imageUrl: 'https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP05/OP05-119_p1_EN.webp',
      specDetails: {
        rarity: 'MANGA SUPER PARALLEL',
        set: 'AWAKENING OF THE NEW ERA',
        grade: 'RAW / GEM MINT',
        vol24h: '$94,000',
      },
    },
    {
      id: '4',
      timestamp: '3 HOURS AGO',
      category: 'CIRCUIT RADAR',
      title: {
        en: 'Lionel Messi 2014 Prizm World Cup Silver Surges Before Finals',
        'zh-TW': '梅西 2014 Panini Prizm 世界盃銀折球星卡強勢攀升',
        'zh-CN': '梅西 2014 Panini Prizm 世界杯银折球星卡强势攀升',
      },
      description: {
        en: 'Lionel Messi 2014 Panini World Cup flagship Silver Prizm liquidity surges as international soccer memorabilia investors consolidate generational GOAT grails.',
        'zh-TW': '球王梅西 2014 巴西世界盃經典銀折 (Silver Prizm) 流動性大幅提振，全球足球收藏資產機構集中建倉。',
        'zh-CN': '球王梅西 2014 巴西世界杯经典银折 (Silver Prizm) 流动性大幅提振，全球足球收藏资产机构集中建仓。',
      },
      cardName: 'Lionel Messi 2014 Prizm #12',
      price: 6800.0,
      changePercent: 9.5,
      imageUrl: '/images/cards/fifa-messi.jpg',
      specDetails: {
        rarity: 'SILVER PRIZM REFRACTOR',
        set: '2014 WORLD CUP BRAZIL',
        grade: 'PSA 10 GEM MT',
        vol24h: '$32,500',
      },
    },
    {
      id: '5',
      timestamp: '5 HOURS AGO',
      category: 'VAULT MILESTONE',
      title: {
        en: '1st Edition Blue-Eyes White Dragon LOB-001 Enters Master Vault',
        'zh-TW': '遊戲王 2002 初代一刷青眼白龍 (LOB-001) 載入大師收藏庫',
        'zh-CN': '游戏王 2002 初代一刷青眼白龙 (LOB-001) 载入大师收藏库',
      },
      description: {
        en: 'Legend of Blue Eyes 1st Edition Ultra Rare Blue-Eyes White Dragon PSA 10 verified, marking historic synergy across anime and vintage card investment portfolios.',
        'zh-TW': '2002 年北美初代一刷極品 PSA 10 青眼白龍正式登錄，與動漫及體育神卡共同組建頂級多元跨界投資組合。',
        'zh-CN': '2002 年北美初代一刷极品 PSA 10 青眼白龙正式登录，与动漫及体育神卡共同组建顶级多元跨界投资组合。',
      },
      cardName: 'Blue-Eyes White Dragon LOB-001',
      price: 3450.0,
      changePercent: 6.8,
      imageUrl: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
      specDetails: {
        rarity: '1ST EDITION ULTRA RARE',
        set: 'LEGEND OF BLUE EYES',
        grade: 'PSA 10 GEM MT',
        vol24h: '$28,000',
      },
    },
  ];

  const handleAddClick = (signal: TelemetrySignal) => {
    if (signal.cardName && signal.price && signal.imageUrl) {
      onAddCard(signal.cardName, signal.price, signal.imageUrl);
    }
  };

  return (
    <div className="w-full flex flex-col gap-10 sm:gap-14 pb-12 animate-fade-in">
      
      {/* 1. HERO SECTION (無框無遮罩，現代大器留白排版) */}
      <section className="relative w-full py-10 sm:py-16 flex flex-col items-start justify-start">

        {/* Display Mega Headline */}
        <h1 className="font-sans font-medium text-4xl sm:text-6xl md:text-7xl text-foreground tracking-[-1.5px] leading-[1.05] mb-6 max-w-4xl">
          Precision Asset Management for MCARD Collectors
        </h1>

        <p className="font-sans text-base sm:text-lg text-text-muted max-w-2xl leading-relaxed mb-8">
          Real-time market telemetry, portfolio ROI tracking, and high-fidelity 3D archival valuation inspired by racing engineering precision.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onExploreClick}
            className="h-12 px-8 rounded-lg font-sans text-sm font-semibold tracking-[0.5px] bg-ferrari-red text-white hover:bg-ferrari-red-hover active:bg-ferrari-red-active transition-all duration-150 cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <span>Explore Archive</span>
            <span>→</span>
          </button>
          <button
            onClick={onPortfolioClick}
            className="h-12 px-8 rounded-lg font-sans text-sm font-semibold tracking-[0.5px] bg-surface-hover hover:bg-surface-hover/80 text-foreground transition-all duration-150 cursor-pointer"
          >
            View Vault Portfolio
          </button>
        </div>
      </section>

      {/* 2. TELEMETRY SPEC-BAND (無方框分割，自然浮雕卡片) */}
      <section className="w-full bg-surface-hover/60 rounded-2xl p-6 sm:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Cell 1 */}
          <div className="flex flex-col">
            <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              $1,428,950
            </span>
            <span className="font-sans text-xs font-semibold text-text-muted mt-1.5">
              Tracked Market Volume (24h)
            </span>
          </div>

          {/* Cell 2 */}
          <div className="flex flex-col">
            <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-ferrari-red tracking-tight">
              +14.8%
            </span>
            <span className="font-sans text-xs font-semibold text-text-muted mt-1.5">
              Peak SIR 24h Velocity
            </span>
          </div>

          {/* Cell 3 */}
          <div className="flex flex-col">
            <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              18,400+
            </span>
            <span className="font-sans text-xs font-semibold text-text-muted mt-1.5">
              Indexed Cards in Vault
            </span>
          </div>

          {/* Cell 4 */}
          <div className="flex flex-col">
            <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              99.98%
            </span>
            <span className="font-sans text-xs font-semibold text-text-muted mt-1.5">
              API Telemetry Uptime
            </span>
          </div>
        </div>
      </section>

      {/* 3. FEATURE CARDS GRID (自然柔和卡片，微圓角，無死板邊框) */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-5 bg-ferrari-red rounded-full" />
            <h2 className="font-sans font-medium text-xl sm:text-2xl tracking-tight text-foreground">
              Featured Circuit Valuations
            </h2>
          </div>
          <span className="font-mono text-xs text-text-muted tracking-wider">
            Live Auction Radar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {signals.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-150 border border-hairline/60"
            >
              <div>
                {/* Top Badge & Category */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.5px] uppercase bg-surface-hover text-foreground">
                    {item.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-ferrari-red">
                    {item.changePercent ? `+${item.changePercent}%` : ''}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-sans font-medium text-lg sm:text-xl tracking-tight text-foreground mb-2 leading-snug">
                  {item.title[language]}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-text-muted leading-relaxed mb-6">
                  {item.description[language]}
                </p>

                {/* Spec details row */}
                {item.specDetails && (
                  <div className="grid grid-cols-2 gap-2 py-3 px-4 bg-surface-hover/70 rounded-lg mb-6 font-mono text-xs">
                    <div>
                      <span className="text-text-muted block text-[10px] uppercase tracking-wider">GRADE</span>
                      <span className="text-foreground font-bold">{item.specDetails.grade}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px] uppercase tracking-wider">SERIES</span>
                      <span className="text-foreground font-bold">{item.specDetails.set}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Bar */}
              {item.cardName && item.price && item.imageUrl && (
                <div className="pt-4 border-t border-hairline/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.cardName}
                      className="w-11 h-15 object-contain rounded-md bg-surface-hover shadow-xs"
                    />
                    <div className="flex flex-col">
                      <span className="font-sans font-medium text-sm text-foreground tracking-tight">
                        {item.cardName}
                      </span>
                      <span className="font-mono text-base font-bold text-foreground">
                        ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddClick(item)}
                    className="h-9 px-4 rounded-lg font-sans text-xs font-semibold bg-ferrari-red text-white hover:bg-ferrari-red-hover active:bg-ferrari-red-active transition-colors duration-150 cursor-pointer shrink-0 shadow-xs"
                  >
                    {t('add_to_portfolio')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. RACE CALENDAR ROWS (現代平滑清單，告別生硬表格橫線) */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-5 bg-ferrari-red rounded-full" />
            <h2 className="font-sans font-medium text-xl sm:text-2xl tracking-tight text-foreground">
              Paddock Market Telemetry Logs
            </h2>
          </div>
          <span className="font-mono text-xs text-text-muted tracking-wider">
            Chronological Timeline
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {signals.map((item) => (
            <div
              key={item.id}
              className="py-4 px-5 rounded-xl bg-surface hover:bg-surface-hover transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-hairline/40"
            >
              {/* Left Column: Timestamp & Badge */}
              <div className="flex items-center gap-3 w-full md:w-56 shrink-0">
                <span className="font-mono text-xs text-text-muted tracking-wider">
                  {item.timestamp}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-surface-hover text-foreground">
                  {item.category}
                </span>
              </div>

              {/* Middle Column: Headline & Description */}
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="font-sans font-medium text-sm sm:text-base text-foreground tracking-tight truncate group-hover:text-ferrari-red transition-colors duration-150">
                  {item.title[language]}
                </h4>
                <p className="font-sans text-xs text-text-muted line-clamp-1 mt-0.5">
                  {item.description[language]}
                </p>
              </div>

              {/* Right Column: Price & Instant Vault Button */}
              {item.cardName && item.price && item.imageUrl && (
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0">
                  <div className="text-right">
                    <span className="block font-mono text-sm font-bold text-foreground">
                      ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    {item.changePercent && (
                      <span className="block font-mono text-[10px] font-semibold text-ferrari-red">
                        +{item.changePercent}%
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddClick(item)}
                    className="h-8 px-3.5 rounded-md font-sans text-xs font-semibold bg-surface-hover hover:bg-ferrari-red hover:text-white transition-colors duration-150 cursor-pointer"
                  >
                    + Vault
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA BAND (現代輕奢橫幅) */}
      <section className="w-full bg-surface-hover/70 rounded-2xl p-8 sm:p-14 text-center flex flex-col items-center">
        <span className="font-sans text-xs font-bold tracking-[1px] text-ferrari-red uppercase mb-3">
          Institutional Grade Collection Vault
        </span>
        <h2 className="font-sans font-medium text-2xl sm:text-4xl text-foreground tracking-tight max-w-2xl mb-4">
          Start Tracking Your Pokémon TCG Assets with Racing Precision
        </h2>
        <p className="font-sans text-sm sm:text-base text-text-muted max-w-xl mb-8">
          Seamlessly monitor PSA grades, calculate real-time portfolio ROI, and inspect holographic cards in our interactive 3D physics showroom.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onExploreClick}
            className="h-12 px-8 rounded-lg font-sans text-sm font-semibold bg-ferrari-red text-white hover:bg-ferrari-red-hover active:bg-ferrari-red-active transition-colors duration-150 cursor-pointer shadow-xs"
          >
            Search All Cards
          </button>
          <button
            onClick={onPortfolioClick}
            className="h-12 px-8 rounded-lg font-sans text-sm font-semibold bg-surface hover:bg-surface-hover text-foreground border border-hairline transition-colors duration-150 cursor-pointer"
          >
            Open Portfolio
          </button>
        </div>
      </section>
    </div>
  );
};
