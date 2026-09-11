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
      timestamp: '2 HOURS AGO',
      category: 'AUCTION RECORD',
      title: {
        en: 'PSA 10 1999 Base Set Holo Mewtwo Closes at $18,500',
        'zh-TW': '1999 年初代 Base Set 閃卡超夢 (PSA 10) 拍賣以 $18,500 成交',
        'zh-CN': '1999 年初代 Base Set 闪卡超梦 (PSA 10) 拍卖以 $18,500 成交',
      },
      description: {
        en: 'A pristine gem mint copy of the legendary 1999 Base Set Holo Mewtwo concluded after fierce competition in Sotheby-style private auction bidding.',
        'zh-TW': '品相極致完美的 1999 無印初代 Base Set 超夢閃卡在蘇富比等級的激烈角逐中以 $18,500 創下本季拍賣高價。',
        'zh-CN': '品相极致完美的 1999 无印初代 Base Set 超梦闪卡在苏富比等级的激烈角逐中以 $18,500 创下本季拍卖高价。',
      },
      cardName: 'Mewtwo Holo #10/102',
      price: 18500.0,
      changePercent: 8.2,
      imageUrl: 'https://images.pokemontcg.io/base1/10_hires.png',
      specDetails: {
        rarity: 'HOLO RARE',
        set: 'BASE SET (1999)',
        grade: 'PSA 10 GEM MT',
        vol24h: '$18,500',
      },
    },
    {
      id: '3',
      timestamp: '5 HOURS AGO',
      category: 'CIRCUIT RADAR',
      title: {
        en: 'Scarlet & Violet: Shrouded Fable Full Telemetry Released',
        'zh-TW': '朱紫新擴充包：Shrouded Fable 完整數據雷達發佈',
        'zh-CN': '朱紫新扩展包：Shrouded Fable 完整数据雷达发布',
      },
      description: {
        en: 'Official registry for the Shrouded Fable series is finalized. Pecharunt ex and the Loyal Three engine are expected to dominate international championship grids.',
        'zh-TW': '官方最新系列 Shrouded Fable 數據庫正式上線，桃歹郎 ex 與忠犬體系預計將重塑國際錦標賽事賽道格局。',
        'zh-CN': '官方最新系列 Shrouded Fable 数据库正式上线，桃歹郎 ex 与忠犬体系预计将重塑国际锦标赛事赛道格局。',
      },
      cardName: 'Pecharunt ex #039/064',
      price: 42.0,
      imageUrl: 'https://images.pokemontcg.io/sv6pt5/39_hires.png',
      specDetails: {
        rarity: 'DOUBLE RARE',
        set: 'SHROUDED FABLE',
        grade: 'UNGRADED',
        vol24h: '$12,400',
      },
    },
    {
      id: '4',
      timestamp: 'YESTERDAY',
      category: 'VAULT MILESTONE',
      title: {
        en: 'Shadowless 1st Edition Charizard Enters VIP Scuderia Showcase',
        'zh-TW': '初代無影一刷噴火龍載入 VIP Scuderia 典藏展示庫',
        'zh-CN': '初代无影一刷喷火龙载入 VIP Scuderia 典藏展示库',
      },
      description: {
        en: 'Celebrity high-net-worth portfolio added an iconic Base Set Shadowless Charizard Holo PSA 9, lifting overall vault valuation across the $800,000 threshold.',
        'zh-TW': '知名超跑俱樂部與頂級收藏家在展示庫更新 PSA 9 初代無影噴火龍，總資產庫估值正式衝破 80 萬美元大關。',
        'zh-CN': '知名超跑俱乐部与顶级收藏家在展示库更新 PSA 9 初代无影喷火龙，总资产库估值正式冲破 80 万美元大关。',
      },
      cardName: 'Charizard Shadowless Holo #4/102',
      price: 9800.0,
      changePercent: 5.4,
      imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
      specDetails: {
        rarity: 'HOLO RARE',
        set: 'BASE SET SHADOWLESS',
        grade: 'PSA 9 MINT',
        vol24h: '$29,600',
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
          Precision Asset Management for Pokémon Collectors
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
