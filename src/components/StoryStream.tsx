'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export interface StreamItem {
  id: string;
  timestamp: string;
  category: 'PRICE ALERT' | 'NEW SET' | 'AUCTION' | 'MARKET' | 'MILESTONE';
  title: Record<'en' | 'zh-TW' | 'zh-CN', string>;
  description: Record<'en' | 'zh-TW' | 'zh-CN', string>;
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
  const { language, t } = useLanguage();

  const streamData: StreamItem[] = [
    {
      id: '1',
      timestamp: '10 Mins Ago',
      category: 'PRICE ALERT',
      title: {
        en: 'Charizard ex (151 SIR) Surges to New Highs',
        'zh-TW': '噴火龍 ex (151 SAR) 價格飆升創近期新高',
        'zh-CN': '喷火龙 ex (151 SAR) 价格飙升创近期新高',
      },
      description: {
        en: 'The Scarlet & Violet 151 Special Illustration Rare Charizard ex has seen a massive buying wave today, driving prices up by 14.8% on major marketplaces.',
        'zh-TW': '朱紫 151 特殊插畫罕見卡 (SAR) 噴火龍 ex 今日迎來強勁買盤，卡牌交易市場市價大漲 14.8%。',
        'zh-CN': '朱紫 151 特殊插画罕见卡 (SAR) 喷火龙 ex 今日迎来强劲买盘，卡牌交易市场市价大涨 14.8%。',
      },
      cardName: 'Charizard ex #199/165',
      price: 134.50,
      changePercent: 14.8,
      imageUrl: 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
      accentType: 'mint',
    },
    {
      id: '2',
      timestamp: '2 Hours Ago',
      category: 'NEW SET',
      title: {
        en: 'Scarlet & Violet: Shrouded Fable Set List Revealed',
        'zh-TW': '朱紫新擴充包：Shrouded Fable 完整卡表曝光',
        'zh-CN': '朱紫新扩展包：Shrouded Fable 完整卡表曝光',
      },
      description: {
        en: 'The official card list for the upcoming mini-set Shrouded Fable is out. Pecharunt ex and the Loyal Three are set to redefine the competitive metagame.',
        'zh-TW': '即將發售的迷你擴充包正式卡表公佈，桃歹郎 ex 與三讚犬將重新塑造賽事競技環境。',
        'zh-CN': '即将发售的迷你扩展包正式卡表公布，桃歹郎 ex 与三赞犬将重新塑造赛事竞技环境。',
      },
      accentType: 'none',
    },
    {
      id: '3',
      timestamp: '5 Hours Ago',
      category: 'AUCTION',
      title: {
        en: 'PSA 10 Base Set Holo Mewtwo Closes at $18,500',
        'zh-TW': '1999 年初代 Base Set 閃卡超夢 (PSA 10) 拍賣以 $18,500 成交',
        'zh-CN': '1999 年初代 Base Set 闪卡超梦 (PSA 10) 拍卖以 $18,500 成交',
      },
      description: {
        en: 'A pristine gem mint copy of the legendary 1999 Base Set Holo Mewtwo found a new owner in a fierce bidding war closing on eBay today.',
        'zh-TW': '品相極致完美的 1999 無印初代 Base Set 超夢閃卡在今日 eBay 激烈拍賣中成交。',
        'zh-CN': '品相极致完美的 1999 无印初代 Base Set 超梦闪卡在今日 eBay 激烈拍卖中成交。',
      },
      cardName: 'Mewtwo Holo #10/102',
      price: 18500.00,
      imageUrl: 'https://images.pokemontcg.io/base1/10_hires.png',
      accentType: 'purple',
    },
    {
      id: '4',
      timestamp: 'Yesterday',
      category: 'MARKET',
      title: {
        en: 'Hype Settles on Japanese 151 Booster Boxes',
        'zh-TW': '日版 151 寶可夢卡包盒裝行情逐步回穩',
        'zh-CN': '日版 151 宝可梦卡包盒装行情逐步回稳',
      },
      description: {
        en: 'Following a substantial wave of reprints from The Pokemon Company in Japan, booster boxes have dropped back to a steady $115 per box.',
        'zh-TW': '隨著日本官方大批量再版補充包出貨，日版 151 盒裝價格回落至 $115 附近，吸引大量投資收藏家入場。',
        'zh-CN': '随着日本官方大批量再版补充包出货，日版 151 盒装价格回落至 $115 附近，吸引大量投资收藏家入学。',
      },
      accentType: 'none',
    },
    {
      id: '5',
      timestamp: '2 Days Ago',
      category: 'MILESTONE',
      title: {
        en: 'Steve Aoki Adds Shadowless Charizard to Public Showcase',
        'zh-TW': 'Steve Aoki 於 3D 展覽館更新無影初代噴火龍閃卡',
        'zh-CN': 'Steve Aoki 于 3D 展览馆更新无影初代喷火龙闪卡',
      },
      description: {
        en: 'Celebrity collector Steve Aoki updated his showcase with a legendary Base Set Shadowless Charizard Holo PSA 9, raising his total portfolio valuation past the $800k mark.',
        'zh-TW': '知名音樂巨星與卡牌收藏家 Steve Aoki 在其個人 Showcase 新增 PSA 9 初代無影噴火龍，總收藏市值突破 80 萬美元大關。',
        'zh-CN': '知名音乐巨星与卡牌收藏家 Steve Aoki 在其个人 Showcase 新增 PSA 9 初代无影喷火龙，总收藏市值突破 80 万美元大关。',
      },
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
    <div className="w-full py-8 max-w-4xl mx-auto animate-fade-in">
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
      <div className="relative pl-6 sm:pl-32">
        {/* Vertical Rule Line */}
        <div className="absolute left-6 sm:left-[105px] top-0 bottom-0 w-[2px] border-l-2 border-dashed border-verge-ultraviolet dark:border-jelly-mint opacity-40" />

        <div className="flex flex-col gap-8">
          {streamData.map((item) => {
            const isMint = item.accentType === 'mint';
            const isPurple = item.accentType === 'purple';

            return (
              <div key={item.id} className="relative group">
                {/* Left side timestamp on desktop with clean right spacing */}
                <div className="absolute left-[-125px] top-4 w-28 text-right hidden sm:block pr-4">
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

                  {/* Title & Description */}
                  <h3 className="font-display font-bold text-xl md:text-2xl uppercase mb-2 leading-tight">
                    {item.title[language]}
                  </h3>
                  <p className={`font-body text-xs md:text-sm leading-relaxed mb-4 ${isMint ? 'text-absolute-black/80' : isPurple ? 'text-white/80' : 'text-text-muted'}`}>
                    {item.description[language]}
                  </p>

                  {/* Optional Card Embed */}
                  {item.cardName && item.price && item.imageUrl && (
                    <div className="mt-4 pt-4 border-t border-primary/20 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl} alt={item.cardName} className="w-10 h-14 object-contain rounded border border-primary/30" />
                        <div className="flex flex-col">
                          <span className="font-display font-bold text-sm uppercase">{item.cardName}</span>
                          <span className="font-mono text-xs font-bold">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddClick(item)}
                        className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold uppercase transition-all duration-150 ${
                          isMint
                            ? 'bg-absolute-black text-jelly-mint hover:opacity-85'
                            : isPurple
                            ? 'bg-jelly-mint text-absolute-black hover:opacity-85'
                            : 'bg-verge-ultraviolet text-white dark:bg-jelly-mint dark:text-absolute-black hover:opacity-85'
                        }`}
                      >
                        {t('add_to_portfolio')}
                      </button>
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
