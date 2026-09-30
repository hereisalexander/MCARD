export type CommunityPostType = 'showcase' | 'marketplace' | 'grading' | 'discussion';

export interface CommunityComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes?: number;
}

export interface CardTagInfo {
  cardName: string;
  price?: number;
  isForSale?: boolean;
  condition?: string; // 'PSA 10' | 'PSA 9' | 'BGS 10' | 'Ungraded' | 'CGC 10'
  originalPrice?: number;
  discountPercent?: number;
  category?: 'pokemon' | 'onepiece' | 'sports' | 'yugioh';
  imageUrl?: string;
}

export interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    handle: string;
    badge?: string;
    isVerified?: boolean;
  };
  type: CommunityPostType;
  title: string;
  content: string;
  imageUrl: string;
  additionalImages?: string[];
  tags: string[];
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  comments?: CommunityComment[];
  createdAt: string;
  date?: string; // e.g. '09-18' for Xiaohongshu style
  aspectRatio?: 'tall' | 'portrait' | 'square' | 'wide';
  isVideo?: boolean;
  videoDuration?: string; // e.g. '0:47'
  location?: string;
  cardInfo?: CardTagInfo;
}

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-xhs-1',
    author: {
      id: 'user-la',
      name: '北美LA潮探索',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      handle: '@la_tcg_finder',
      badge: '潮流博主',
      isVerified: true,
    },
    type: 'discussion',
    title: '寶可夢30th大家開的怎麼樣…#Pokemon #寶可夢 #卡牌排行',
    content: '盤點當前海外市場成交均價 TOP 30 最昂貴神卡！從 $3800 的限量特典到破千美元的稀有復刻版，這波 30 周年熱潮直接引爆全球藏家熱情。大家目前開出最滿意的是哪一張？',
    imageUrl: 'https://images.pokemontcg.io/cel25/15_hires.png',
    tags: ['Pokemon', '寶可夢30周年', '卡牌行情', 'TOP30'],
    likes: 254,
    isLiked: false,
    commentsCount: 38,
    createdAt: '3 小時前',
    date: '09-18',
    aspectRatio: 'square',
    location: 'Los Angeles, CA',
    cardInfo: {
      cardName: 'Venusaur & Blastoise 30th Anniversary Top Tier',
      price: 3700,
      isForSale: false,
      condition: 'PSA 10',
      category: 'pokemon',
      imageUrl: 'https://images.pokemontcg.io/cel25/15_hires.png',
    },
  },
  {
    id: 'post-xhs-2',
    author: {
      id: 'user-cherry',
      name: '櫻梅桃李',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      handle: '@sakura_cards',
      badge: '資深牌友',
      isVerified: true,
    },
    type: 'discussion',
    title: '寶可夢卡牌｜稀有度分不清楚？看這篇就夠！各位牌友收藏向',
    content: '很多剛入坑的小夥伴常被 MUR, FUR, MA, SAR, AR, SR 搞得眼花繚亂！這篇手把手為大家拆解各版本罕度等級、邊框工藝、箔面壓紋以及保值潛力，收藏前先看清楚不踩坑！',
    imageUrl: 'https://images.pokemontcg.io/sv4pt5/234_hires.png',
    tags: ['寶可夢卡牌', '稀有度科普', 'SAR', '新手入坑'],
    likes: 514,
    isLiked: true,
    commentsCount: 62,
    createdAt: '5 小時前',
    date: '09-22',
    aspectRatio: 'tall',
    location: '台北市',
    cardInfo: {
      cardName: 'Charizard ex #234/091 (Paldean Fates)',
      price: 165,
      isForSale: false,
      condition: 'Gem Mint',
      category: 'pokemon',
      imageUrl: 'https://images.pokemontcg.io/sv4pt5/234_hires.png',
    },
  },
  {
    id: 'post-xhs-3',
    author: {
      id: 'user-lucky',
      name: '幸運鵝拆卡',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      handle: '@lucky_breaker',
      badge: '實況拆包',
      isVerified: false,
    },
    type: 'showcase',
    title: '寶可夢30周年今天發售，看我一發入魂！不是說量很大嗎…',
    content: '今天排隊兩小時終於搶到金色特典包！當場撕開手都在抖，居然直接開出黃金皮卡丘！錄下了完整開箱反應視頻，彈幕吸歐氣的朋友通通有福了～',
    imageUrl: 'https://images.pokemontcg.io/sv3pt5/25_hires.png',
    tags: ['拆包視頻', '30周年', '一發入魂', '皮卡丘'],
    likes: 297,
    isLiked: false,
    commentsCount: 45,
    createdAt: '8 小時前',
    date: '09-16',
    aspectRatio: 'tall',
    isVideo: true,
    videoDuration: '0:47',
    location: '新北市・新莊',
    cardInfo: {
      cardName: 'Pikachu 30th Anniversary Gold Special',
      price: 240,
      isForSale: false,
      condition: 'Raw Pack Fresh',
      category: 'pokemon',
      imageUrl: 'https://images.pokemontcg.io/sv3pt5/25_hires.png',
    },
  },
  {
    id: 'post-xhs-4',
    author: {
      id: 'user-art',
      name: '卡牌繪畫社',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      handle: '@ptcg_artisan',
      badge: '藝術插畫',
      isVerified: true,
    },
    type: 'showcase',
    title: '寶可夢ptcg的手繪卡拼圖 1、《亙古開來》2、《林間密境》',
    content: '把兩張 AR 特畫卡片拼在一起，微距鏡頭下的星幻彩虹反光簡直美翻了！插畫師在綠葉與陽光照射角度的細膩筆觸，完全值得放進木質壓克力相框珍藏。',
    imageUrl: 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
    tags: ['手繪卡', '拼圖美學', '卡牌攝影', '光影細節'],
    likes: 388,
    isLiked: false,
    commentsCount: 29,
    createdAt: '1 天前',
    date: '09-15',
    aspectRatio: 'wide',
    location: '台中市',
    cardInfo: {
      cardName: 'Charizard ex SAR Illustration Art',
      price: 135,
      isForSale: false,
      condition: 'Near Mint',
      category: 'pokemon',
      imageUrl: 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
    },
  },
  {
    id: 'post-1',
    author: {
      id: 'user-ash',
      name: 'Ash Ketchum',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      handle: '@pallet_champ',
      badge: '認證藏家',
      isVerified: true,
    },
    type: 'showcase',
    title: '剛開了一盒 151 特典包，竟然單抽出這張神卡！手都在抖...',
    content: '今天下班路過卡店順手抓了一盒 151，撕到最後三包居然閃出彩虹光芒！這張噴火龍 SAR (Special Illustration Rare) 卡面細節真的太頂了，邊角無白邊、居中度完美，準備送去 PSA 搏 10 分！大家覺得有機會嗎？',
    imageUrl: 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
    tags: ['寶可夢151', '噴火龍SAR', '歐皇附體', '開箱大捷'],
    likes: 342,
    isLiked: false,
    commentsCount: 28,
    createdAt: '10 分鐘前',
    date: '09-18',
    aspectRatio: 'portrait',
    location: '台北市・秋葉原卡牌旗艦店',
    cardInfo: {
      cardName: 'Charizard ex #199/165 (151 SAR)',
      price: 135,
      isForSale: false,
      condition: 'Ungraded (Gem Mint)',
      category: 'pokemon',
      imageUrl: 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
    },
  },
  {
    id: 'post-2',
    author: {
      id: 'user-red',
      name: 'Red Trader',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
      handle: '@red_vault',
      badge: '誠信商家',
      isVerified: true,
    },
    type: 'marketplace',
    title: '【撿漏退坑急出】PSA 10 夢幻 ex 閃色寶藏，低於市場均價 15%！',
    content: '因為個人資金周轉，低於近期 eBay 成交均價出清！黑標質感極佳，附帶防偽條碼與官方密封保護殼。支援大台北地區面交驗卡或順豐保價快遞，有意者歡迎私訊小窗，先到先得！',
    imageUrl: 'https://images.pokemontcg.io/sv4pt5/232_hires.png',
    tags: ['撿漏出清', '夢幻ex', 'PSA10', '急出秒發'],
    likes: 189,
    isLiked: false,
    commentsCount: 15,
    createdAt: '25 分鐘前',
    date: '09-17',
    aspectRatio: 'square',
    location: '新北市・板橋捷運站',
    cardInfo: {
      cardName: 'Mew ex Shiny #232/091 (Paldean Fates)',
      price: 180,
      originalPrice: 215,
      discountPercent: 16,
      isForSale: true,
      condition: 'PSA 10',
      category: 'pokemon',
      imageUrl: 'https://images.pokemontcg.io/sv4pt5/232_hires.png',
    },
  },
  {
    id: 'post-3',
    author: {
      id: 'user-cynthia',
      name: 'Cynthia Collector',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      handle: '@garchomp_queen',
      badge: '頂級評級師',
      isVerified: true,
    },
    type: 'grading',
    title: '送檢 PSA 兩個月終於開箱！10 張送評拿下 9 個 Gem Mint 10！🎉',
    content: '本次開箱最重磅的是這張超夢 Mewtwo VSTAR 皇冠藝圖！正面置中 50/50，背面四角極其鋒利。送檢心得分享：送評前一定要用微纖維布輕拭卡面指紋，套入 Card Saver 1 時避免夾角！',
    imageUrl: 'https://images.pokemontcg.io/swsh12pt5/GG44_hires.png',
    tags: ['PSA開箱', '送檢心得', '超夢VSTAR', '滿分喜報'],
    likes: 512,
    isLiked: true,
    commentsCount: 42,
    createdAt: '1 小時前',
    date: '09-15',
    aspectRatio: 'tall',
    location: 'PSA 美國加州認證中心回函',
    cardInfo: {
      cardName: 'Mewtwo VSTAR #GG44/GG70 (Crown Zenith)',
      price: 98,
      isForSale: false,
      condition: 'PSA 10',
      category: 'pokemon',
      imageUrl: 'https://images.pokemontcg.io/swsh12pt5/GG44_hires.png',
    },
  },
  {
    id: 'post-6',
    author: {
      id: 'user-eevee',
      name: 'Eevee Master',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      handle: '@eevee_heroes',
      badge: '伊布狂熱者',
      isVerified: false,
    },
    type: 'marketplace',
    title: '【同好換卡/出清】月亮伊布 VMAX 異圖 (Moonbreon) PSA 9 好價尋買家',
    content: '自己送檢的自拔卡，可惜只有 9 分（背面稍微偏右了一點點）。正面毫無瑕疵，適合自收藏不想多花翻倍溢價買 10 分的實惠派玩家！支援換卡（優先看耿鬼 VMAX SA 或噴火龍 VMAX 閃卡），可補差價。',
    imageUrl: 'https://images.pokemontcg.io/swsh7/215_hires.png',
    tags: ['月亮伊布', '伊布英雄', '出清換卡', '高CP值'],
    likes: 310,
    isLiked: false,
    commentsCount: 22,
    createdAt: '5 小時前',
    date: '09-12',
    aspectRatio: 'wide',
    location: '高雄市・三多商圈',
    cardInfo: {
      cardName: 'Umbreon VMAX #215/203 (Evolving Skies)',
      price: 680,
      originalPrice: 780,
      discountPercent: 13,
      isForSale: true,
      condition: 'PSA 9',
      category: 'pokemon',
      imageUrl: 'https://images.pokemontcg.io/swsh7/215_hires.png',
    },
  },
];
