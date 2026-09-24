import { fetchPokemonCardsFromApi, ApiPokemonCard } from './pokemonApi';

export type CardCategory = 'all' | 'pokemon' | 'yugioh' | 'onepiece' | 'dragonball' | 'nba' | 'fifa';

export interface UniversalCard {
  id: string;
  name: string;
  category: CardCategory;
  number: string;
  set: string;
  rarity: string;
  type: string;
  price: number;
  imageUrl: string;
  artistOrPlayer?: string;
  releaseYear?: number | string;
  tcgplayerUrl?: string;
  description?: string;
}

// 遊戲王精選標竿神卡資料庫 (Yu-Gi-Oh! Elite Cards)
const YUGIOH_CARDS: UniversalCard[] = [
  {
    id: 'ygo-blue-eyes',
    name: 'Blue-Eyes White Dragon (青眼白龍)',
    category: 'yugioh',
    number: 'LOB-001',
    set: 'Legend of Blue Eyes White Dragon',
    rarity: '1st Edition Ultra Rare',
    type: 'Dragon / Normal',
    price: 3450.0,
    imageUrl: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
    artistOrPlayer: 'Kazuki Takahashi',
    releaseYear: 2002,
    tcgplayerUrl: 'https://www.tcgplayer.com',
    description: 'This legendary dragon is a powerful engine of destruction. Virtually invincible, very few have faced this awesome beast and lived to tell the tale.',
  },
  {
    id: 'ygo-dark-magician',
    name: 'Dark Magician (黑魔導)',
    category: 'yugioh',
    number: 'LOB-005',
    set: 'Legend of Blue Eyes White Dragon',
    rarity: '1st Edition Ultra Rare',
    type: 'Spellcaster / Normal',
    price: 1850.0,
    imageUrl: 'https://images.ygoprodeck.com/images/cards/46986414.jpg',
    artistOrPlayer: 'Kazuki Takahashi',
    releaseYear: 2002,
    tcgplayerUrl: 'https://www.tcgplayer.com',
    description: 'The ultimate wizard in terms of attack and defense.',
  },
  {
    id: 'ygo-red-eyes',
    name: 'Red-Eyes Black Dragon (真紅眼黑龍)',
    category: 'yugioh',
    number: 'LOB-070',
    set: 'Legend of Blue Eyes White Dragon',
    rarity: '1st Edition Ultra Rare',
    type: 'Dragon / Normal',
    price: 1250.0,
    imageUrl: 'https://images.ygoprodeck.com/images/cards/74677422.jpg',
    artistOrPlayer: 'Kazuki Takahashi',
    releaseYear: 2002,
    tcgplayerUrl: 'https://www.tcgplayer.com',
    description: 'A ferocious dragon with a deadly attack.',
  },
  {
    id: 'ygo-slifer',
    name: 'Slifer the Sky Dragon (歐西里斯的天空龍)',
    category: 'yugioh',
    number: 'GB1-001',
    set: 'Game Boy Promo Secret Rare',
    rarity: 'Secret Rare',
    type: 'Divine-Beast / Effect',
    price: 890.0,
    imageUrl: 'https://images.ygoprodeck.com/images/cards/10000020.jpg',
    artistOrPlayer: 'Kazuki Takahashi',
    releaseYear: 2003,
    tcgplayerUrl: 'https://www.tcgplayer.com',
  },
  {
    id: 'ygo-exodia',
    name: 'Exodia the Forbidden One (被封印的艾克佐迪亞)',
    category: 'yugioh',
    number: 'LOB-124',
    set: 'Legend of Blue Eyes White Dragon',
    rarity: 'Ultra Rare',
    type: 'Spellcaster / Effect',
    price: 980.0,
    imageUrl: 'https://images.ygoprodeck.com/images/cards/33396948.jpg',
    artistOrPlayer: 'Kazuki Takahashi',
    releaseYear: 2002,
    tcgplayerUrl: 'https://www.tcgplayer.com',
  },
  {
    id: 'ygo-stardust',
    name: 'Stardust Dragon (星塵龍)',
    category: 'yugioh',
    number: 'TDGS-EN040',
    set: 'The Duelist Genesis',
    rarity: 'Ghost Rare',
    type: 'Dragon / Synchro',
    price: 720.0,
    imageUrl: 'https://images.ygoprodeck.com/images/cards/44508094.jpg',
    artistOrPlayer: 'Konami',
    releaseYear: 2008,
    tcgplayerUrl: 'https://www.tcgplayer.com',
  },
];

// 海賊王卡牌精選標竿資料庫 (One Piece Card Game Elite)
const ONE_PIECE_CARDS: UniversalCard[] = [
  {
    id: 'op-luffy-manga',
    name: 'Monkey.D.Luffy (Gear 5 漫畫稀有魯夫)',
    category: 'onepiece',
    number: 'OP05-119',
    set: 'Awakening of the New Era (新時代的主角)',
    rarity: 'Manga Super Parallel SEC',
    type: 'Strike / Straw Hat Crew',
    price: 3800.0,
    imageUrl: 'https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP05/OP05-119_p1_EN.webp',
    artistOrPlayer: 'Eiichiro Oda',
    releaseYear: 2023,
    tcgplayerUrl: 'https://www.tcgplayer.com',
    description: 'Gear 5 Nika Form. One of the most sought-after Manga Rare cards in modern TCG history.',
  },
  {
    id: 'op-shanks-manga',
    name: 'Shanks (漫畫紅髮傑克)',
    category: 'onepiece',
    number: 'OP01-120',
    set: 'Romance Dawn (冒險的黎明)',
    rarity: 'Manga Super Parallel SEC',
    type: 'Slash / Red-Haired Pirates',
    price: 1950.0,
    imageUrl: 'https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-120_p1_EN.webp',
    artistOrPlayer: 'Eiichiro Oda',
    releaseYear: 2022,
    tcgplayerUrl: 'https://www.tcgplayer.com',
  },
  {
    id: 'op-zoro-manga',
    name: 'Roronoa Zoro (漫畫索隆)',
    category: 'onepiece',
    number: 'OP06-118',
    set: 'Wings of the Captain (雙璧的霸者)',
    rarity: 'Manga Super Parallel SEC',
    type: 'Slash / Straw Hat Crew',
    price: 1420.0,
    imageUrl: 'https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP06/OP06-118_p1_EN.webp',
    artistOrPlayer: 'Eiichiro Oda',
    releaseYear: 2024,
    tcgplayerUrl: 'https://www.tcgplayer.com',
  },
  {
    id: 'op-hancock-sp',
    name: 'Boa Hancock (女帝 波雅·漢考克 SP)',
    category: 'onepiece',
    number: 'OP07-051',
    set: '500 Years in the Future (500年後的未來)',
    rarity: 'Special Parallel SP',
    type: 'Special / Kuja Pirates',
    price: 680.0,
    imageUrl: 'https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP07/OP07-051_p1_EN.webp',
    artistOrPlayer: 'Eiichiro Oda',
    releaseYear: 2024,
    tcgplayerUrl: 'https://www.tcgplayer.com',
  },
  {
    id: 'op-ace-manga',
    name: 'Portgas.D.Ace (漫畫艾斯)',
    category: 'onepiece',
    number: 'OP02-013',
    set: 'Paramount War (頂點決戰)',
    rarity: 'Manga Super Parallel SR',
    type: 'Special / Whitebeard Pirates',
    price: 1150.0,
    imageUrl: 'https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP02/OP02-013_p1_EN.webp',
    artistOrPlayer: 'Eiichiro Oda',
    releaseYear: 2023,
    tcgplayerUrl: 'https://www.tcgplayer.com',
  },
];

// 七龍珠卡牌精選標竿資料庫 (Dragon Ball Super / Fusion World)
const DRAGON_BALL_CARDS: UniversalCard[] = [
  {
    id: 'db-gogeta-scr',
    name: 'Son Goku & Vegeta (Gogeta 悟吉塔 神聖閃卡)',
    category: 'dragonball',
    number: 'BT6-107',
    set: 'Destroyer Kings',
    rarity: 'Secret Rare (SCR)',
    type: 'Saiyan / Fusion',
    price: 1280.0,
    imageUrl: '/images/cards/db-gogeta.jpg',
    artistOrPlayer: 'Akira Toriyama',
    releaseYear: 2019,
    tcgplayerUrl: 'https://www.tcgplayer.com',
    description: 'Ultimate fusion warrior possessing godly power beyond comprehension.',
  },
  {
    id: 'db-ultra-instinct',
    name: 'Son Goku, The Ultra Instinct (孫悟空 自在極意功)',
    category: 'dragonball',
    number: 'TB1-097',
    set: 'The Tournament of Power',
    rarity: 'Signature Secret Rare',
    type: 'God / Saiyan',
    price: 2450.0,
    imageUrl: '/images/cards/db-goku-ui.jpg',
    artistOrPlayer: 'Akira Toriyama',
    releaseYear: 2018,
    tcgplayerUrl: 'https://www.tcgplayer.com',
  },
  {
    id: 'db-broly-legendary',
    name: 'Broly, Ultimate Battle (傳說中的超級賽亞人 布羅利)',
    category: 'dragonball',
    number: 'FB01-139',
    set: 'Awakened Pulse Fusion World',
    rarity: 'Super Alt Art SCR',
    type: 'Saiyan / Berserk',
    price: 890.0,
    imageUrl: '/images/cards/db-broly.jpg',
    artistOrPlayer: 'Bandai / Toei',
    releaseYear: 2024,
    tcgplayerUrl: 'https://www.tcgplayer.com',
  },
  {
    id: 'db-vegeta-royal',
    name: 'Vegeta, Royal Pride (賽亞人王子的驕傲 貝吉塔)',
    category: 'dragonball',
    number: 'FB02-099',
    set: 'Blazing Aura',
    rarity: 'Alt-Art Secret Rare',
    type: 'Saiyan / Royal',
    price: 620.0,
    imageUrl: '/images/cards/db-vegeta.jpg',
    artistOrPlayer: 'Akira Toriyama',
    releaseYear: 2024,
    tcgplayerUrl: 'https://www.tcgplayer.com',
  },
];

// NBA 籃球球星卡精選標竿資料庫 (Panini Prizm, National Treasures, Topps Chrome)
const NBA_CARDS: UniversalCard[] = [
  {
    id: 'nba-jordan-fleer',
    name: 'Michael Jordan 1986 Fleer Rookie #57',
    category: 'nba',
    number: '#57 RC',
    set: '1986-87 Fleer Basketball',
    rarity: 'True Rookie Card',
    type: 'Shooting Guard / Bulls',
    price: 18500.0,
    imageUrl: '/images/cards/nba-jordan.jpg',
    artistOrPlayer: 'Michael Jordan (Chicago Bulls)',
    releaseYear: 1986,
    tcgplayerUrl: 'https://www.ebay.com',
    description: 'The Holy Grail of modern basketball cards. Air Jordan debut rookie card in legendary Chicago Bulls uniform.',
  },
  {
    id: 'nba-lebron-chrome',
    name: 'LeBron James 2003 Topps Chrome Rookie #111',
    category: 'nba',
    number: '#111 RC',
    set: '2003-04 Topps Chrome',
    rarity: 'Rookie Card Refractor',
    type: 'Small Forward / Cavaliers',
    price: 9200.0,
    imageUrl: '/images/cards/nba-lebron.jpg',
    artistOrPlayer: 'LeBron James (Cleveland Cavaliers)',
    releaseYear: 2003,
    tcgplayerUrl: 'https://www.ebay.com',
  },
  {
    id: 'nba-wemby-prizm',
    name: 'Victor Wembanyama 2023 Panini Prizm Silver #136',
    category: 'nba',
    number: '#136 RC',
    set: '2023-24 Panini Prizm Basketball',
    rarity: 'Silver Prizm Refractor',
    type: 'Center / Spurs',
    price: 2150.0,
    imageUrl: '/images/cards/nba-wemby.jpg',
    artistOrPlayer: 'Victor Wembanyama (San Antonio Spurs)',
    releaseYear: 2023,
    tcgplayerUrl: 'https://www.ebay.com',
    description: 'Generational phenom Victor Wembanyama flagship Silver Prizm Rookie card.',
  },
  {
    id: 'nba-curry-topps',
    name: 'Stephen Curry 2009 Topps Rookie #321',
    category: 'nba',
    number: '#321 RC',
    set: '2009-10 Topps Basketball',
    rarity: 'Rookie Card Gold /2009',
    type: 'Point Guard / Warriors',
    price: 4600.0,
    imageUrl: '/images/cards/nba-curry.jpg',
    artistOrPlayer: 'Stephen Curry (Golden State Warriors)',
    releaseYear: 2009,
    tcgplayerUrl: 'https://www.ebay.com',
  },
  {
    id: 'nba-kobe-chrome',
    name: 'Kobe Bryant 1996 Topps Chrome Rookie #138',
    category: 'nba',
    number: '#138 RC',
    set: '1996-97 Topps Chrome',
    rarity: 'Rookie Card Refractor',
    type: 'Shooting Guard / Lakers',
    price: 14500.0,
    imageUrl: '/images/cards/nba-kobe.jpg',
    artistOrPlayer: 'Kobe Bryant (LA Lakers)',
    releaseYear: 1996,
    tcgplayerUrl: 'https://www.ebay.com',
  },
  {
    id: 'nba-luka-prizm',
    name: 'Luka Doncic 2018 Panini Prizm Silver #280',
    category: 'nba',
    number: '#280 RC',
    set: '2018-19 Panini Prizm Basketball',
    rarity: 'Silver Prizm Refractor',
    type: 'Point Forward / Mavericks',
    price: 3200.0,
    imageUrl: '/images/cards/nba-luka.jpg',
    artistOrPlayer: 'Luka Doncic (Dallas Mavericks)',
    releaseYear: 2018,
    tcgplayerUrl: 'https://www.ebay.com',
  },
];

// FIFA 足球球星卡精選標竿資料庫 (Panini Prizm World Cup, Topps Chrome UCL)
const FIFA_CARDS: UniversalCard[] = [
  {
    id: 'fifa-messi-prizm',
    name: 'Lionel Messi 2014 Panini Prizm World Cup #12',
    category: 'fifa',
    number: '#12 Prizm',
    set: '2014 Panini World Cup Brazil',
    rarity: 'Silver Prizm Refractor',
    type: 'Forward / Argentina',
    price: 6800.0,
    imageUrl: '/images/cards/fifa-messi.jpg',
    artistOrPlayer: 'Lionel Messi (Argentina)',
    releaseYear: 2014,
    tcgplayerUrl: 'https://www.ebay.com',
    description: 'Iconic World Cup card of the greatest footballer in history reaching the 2014 World Cup Final.',
  },
  {
    id: 'fifa-cr7-mega-craques',
    name: 'Cristiano Ronaldo 2003 Panini Mega Craques #137',
    category: 'fifa',
    number: '#137 RC',
    set: '2003-04 Panini Mega Craques',
    rarity: 'True Rookie Card',
    type: 'Winger / Sporting CP',
    price: 11200.0,
    imageUrl: '/images/cards/fifa-cr7.jpg',
    artistOrPlayer: 'Cristiano Ronaldo (Sporting CP / Portugal)',
    releaseYear: 2003,
    tcgplayerUrl: 'https://www.ebay.com',
  },
  {
    id: 'fifa-mbappe-prizm',
    name: 'Kylian Mbappé 2018 Panini Prizm World Cup #80',
    category: 'fifa',
    number: '#80 RC',
    set: '2018 Panini World Cup Russia',
    rarity: 'Silver Prizm Refractor',
    type: 'Forward / France',
    price: 2400.0,
    imageUrl: '/images/cards/fifa-mbappe.jpg',
    artistOrPlayer: 'Kylian Mbappé (France)',
    releaseYear: 2018,
    tcgplayerUrl: 'https://www.ebay.com',
  },
  {
    id: 'fifa-haaland-chrome',
    name: 'Erling Haaland 2019 Topps Chrome Bundesliga #72',
    category: 'fifa',
    number: '#72 RC',
    set: '2019-20 Topps Chrome Bundesliga',
    rarity: 'Refractor /250',
    type: 'Striker / Dortmund',
    price: 1850.0,
    imageUrl: '/images/cards/fifa-haaland.jpg',
    artistOrPlayer: 'Erling Haaland (Borussia Dortmund / Norway)',
    releaseYear: 2019,
    tcgplayerUrl: 'https://www.ebay.com',
  },
  {
    id: 'fifa-yamal-topps',
    name: 'Lamine Yamal 2024 Topps Chrome UEFA Euro #19',
    category: 'fifa',
    number: '#19 RC',
    set: '2024 Topps UEFA Euro Championship',
    rarity: 'Gold Refractor /50',
    type: 'Winger / Spain',
    price: 2850.0,
    imageUrl: '/images/cards/fifa-yamal.jpg',
    artistOrPlayer: 'Lamine Yamal (Barcelona / Spain)',
    releaseYear: 2024,
    tcgplayerUrl: 'https://www.ebay.com',
  },
];

// Helper: 將 ApiPokemonCard 轉換為通用 UniversalCard 格式
export const adaptPokemonCardToUniversal = (card: ApiPokemonCard): UniversalCard => {
  return {
    id: card.id,
    name: card.name,
    category: 'pokemon',
    number: card.number,
    set: card.set,
    rarity: card.rarity,
    type: card.type,
    price: card.price,
    imageUrl: card.imageUrl,
    artistOrPlayer: card.artist,
    tcgplayerUrl: card.tcgplayerUrl,
  };
};

export interface FetchUniversalCardsParams {
  category?: CardCategory;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sortBy?: 'price-desc' | 'price-asc' | 'name-asc' | 'newest';
}

export interface FetchUniversalCardsResult {
  cards: UniversalCard[];
  totalCount: number;
  hasMore: boolean;
}

// 主查詢入口：支援跨品類查詢與過濾
export const fetchUniversalCards = async ({
  category = 'all',
  page = 1,
  pageSize = 24,
  searchQuery = '',
  sortBy = 'price-desc',
}: FetchUniversalCardsParams = {}): Promise<FetchUniversalCardsResult> => {
  // 1. 如果單獨請求 Pokémon，直接呼叫真 API
  if (category === 'pokemon') {
    const rawResult = await fetchPokemonCardsFromApi({
      page,
      pageSize,
      searchQuery,
    });
    const adapted = rawResult.cards.map(adaptPokemonCardToUniversal);
    if (sortBy === 'price-desc') adapted.sort((a, b) => b.price - a.price);
    if (sortBy === 'price-asc') adapted.sort((a, b) => a.price - b.price);
    if (sortBy === 'name-asc') adapted.sort((a, b) => a.name.localeCompare(b.name));

    return {
      cards: adapted,
      totalCount: rawResult.totalCount,
      hasMore: rawResult.hasMore,
    };
  }

  // 2. 獲取所選品類的卡牌庫
  let sourceCards: UniversalCard[] = [];

  if (category === 'yugioh') {
    sourceCards = [...YUGIOH_CARDS];
  } else if (category === 'onepiece') {
    sourceCards = [...ONE_PIECE_CARDS];
  } else if (category === 'dragonball') {
    sourceCards = [...DRAGON_BALL_CARDS];
  } else if (category === 'nba') {
    sourceCards = [...NBA_CARDS];
  } else if (category === 'fifa') {
    sourceCards = [...FIFA_CARDS];
  } else {
    // category === 'all': 聚合各大品類旗艦神卡 + 前景寶可夢神卡
    try {
      const pokeResult = await fetchPokemonCardsFromApi({ page: 1, pageSize: 12 });
      const topPokemon = pokeResult.cards.map(adaptPokemonCardToUniversal);
      sourceCards = [
        ...topPokemon,
        ...NBA_CARDS,
        ...ONE_PIECE_CARDS,
        ...YUGIOH_CARDS,
        ...FIFA_CARDS,
        ...DRAGON_BALL_CARDS,
      ];
    } catch {
      sourceCards = [
        ...NBA_CARDS,
        ...ONE_PIECE_CARDS,
        ...YUGIOH_CARDS,
        ...FIFA_CARDS,
        ...DRAGON_BALL_CARDS,
      ];
    }
  }

  // 3. 搜尋過濾
  let filtered = sourceCards;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q) ||
        c.number.toLowerCase().includes(q) ||
        (c.artistOrPlayer && c.artistOrPlayer.toLowerCase().includes(q))
    );
  }

  // 4. 排序
  if (sortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  // 5. 分頁裁切
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);
  const hasMore = startIndex + pageSize < filtered.length;

  return {
    cards: paginated,
    totalCount: filtered.length,
    hasMore,
  };
};
