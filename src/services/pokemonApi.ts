export interface ApiPokemonCard {
  id: string;
  name: string;
  number: string;
  set: string;
  type: string;
  rarity: string;
  price: number | null;
  imageUrl: string;
  artist?: string;
  tcgplayerUrl?: string;
}

interface RawTcgPlayerPrices {
  holofoil?: { market?: number; mid?: number; low?: number };
  normal?: { market?: number; mid?: number; low?: number };
  reverseHolofoil?: { market?: number; mid?: number; low?: number };
  '1stEditionHolofoil'?: { market?: number };
  unlimitedHolofoil?: { market?: number };
}

export interface RawTcgCard {
  id: string;
  name: string;
  number: string;
  artist?: string;
  rarity?: string;
  types?: string[];
  set?: {
    id: string;
    name: string;
    series?: string;
  };
  images?: {
    small?: string;
    large?: string;
  };
  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: RawTcgPlayerPrices;
  };
  cardmarket?: {
    url?: string;
    prices?: {
      averageSellPrice?: number;
      trendPrice?: number;
      reverseHoloSell?: number;
    };
  };
}

export interface FetchCardsParams {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  setName?: string;
  cardType?: string;
}

export interface FetchCardsResult {
  cards: ApiPokemonCard[];
  totalCount: number;
  hasMore: boolean;
}

// Extract real dynamic price from card raw response without fake 4.99 fallback
export const extractCardPrice = (card: RawTcgCard): number | null => {
  const tcgPrices = card.tcgplayer?.prices;
  if (tcgPrices) {
    const market =
      tcgPrices.holofoil?.market ??
      tcgPrices.normal?.market ??
      tcgPrices.reverseHolofoil?.market ??
      tcgPrices['1stEditionHolofoil']?.market ??
      tcgPrices.unlimitedHolofoil?.market ??
      tcgPrices.holofoil?.mid ??
      tcgPrices.normal?.mid ??
      tcgPrices.holofoil?.low ??
      tcgPrices.normal?.low;
      
    if (typeof market === 'number' && market > 0) return Number(market.toFixed(2));
  }

  const cmPrices = card.cardmarket?.prices;
  if (cmPrices) {
    const cmPrice = cmPrices.averageSellPrice ?? cmPrices.trendPrice ?? cmPrices.reverseHoloSell;
    if (typeof cmPrice === 'number' && cmPrice > 0) return Number(cmPrice.toFixed(2));
  }

  // 徹底移除 4.99 假數值，若無公開市場成交報價即標記為 null
  return null;
};

// Map raw card response to internal card format
export const mapRawCardToApiPokemonCard = (card: RawTcgCard): ApiPokemonCard => {
  return {
    id: card.id,
    name: card.name,
    number: card.number,
    set: card.set?.name || 'Pokémon TCG',
    type: card.types && card.types.length > 0 ? card.types[0] : 'Normal',
    rarity: card.rarity || 'Common',
    price: extractCardPrice(card),
    imageUrl: card.images?.large || card.images?.small || '',
    artist: card.artist || 'Unknown',
    tcgplayerUrl: card.tcgplayer?.url,
  };
};

// 移除 pokemontcg.io 外部請求，作為解耦的統一介面入口
export const fetchPokemonCardsFromApi = async (
  _params: FetchCardsParams = {}
): Promise<FetchCardsResult> => {
  // 徹底移除 api.pokemontcg.io 請求，預留給即將接入的新價格 API
  return {
    cards: [],
    totalCount: 0,
    hasMore: false,
  };
};

export interface ApiPokemonSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}

export const FALLBACK_POKEMON_SETS: ApiPokemonSet[] = [
  {
    id: 'sv3pt5',
    name: '151',
    series: 'Scarlet & Violet',
    printedTotal: 165,
    total: 207,
    releaseDate: '2023/09/22',
    updatedAt: '2023/09/22',
    images: {
      symbol: 'https://images.pokemontcg.io/sv3pt5/symbol.png',
      logo: 'https://images.pokemontcg.io/sv3pt5/logo.png',
    },
  },
  {
    id: 'base1',
    name: 'Base Set',
    series: 'Base',
    printedTotal: 102,
    total: 102,
    releaseDate: '1999/01/09',
    updatedAt: '1999/01/09',
    images: {
      symbol: 'https://images.pokemontcg.io/base1/symbol.png',
      logo: 'https://images.pokemontcg.io/base1/logo.png',
    },
  },
  {
    id: 'swsh7',
    name: 'Evolving Skies',
    series: 'Sword & Shield',
    printedTotal: 203,
    total: 237,
    releaseDate: '2021/08/27',
    updatedAt: '2021/08/27',
    images: {
      symbol: 'https://images.pokemontcg.io/swsh7/symbol.png',
      logo: 'https://images.pokemontcg.io/swsh7/logo.png',
    },
  },
  {
    id: 'swsh12pt5',
    name: 'Crown Zenith',
    series: 'Sword & Shield',
    printedTotal: 159,
    total: 230,
    releaseDate: '2023/01/20',
    updatedAt: '2023/01/20',
    images: {
      symbol: 'https://images.pokemontcg.io/swsh12pt5/symbol.png',
      logo: 'https://images.pokemontcg.io/swsh12pt5/logo.png',
    },
  },
  {
    id: 'sv06',
    name: 'Twilight Masquerade',
    series: 'Scarlet & Violet',
    printedTotal: 167,
    total: 226,
    releaseDate: '2024/05/24',
    updatedAt: '2024/05/24',
    images: {
      symbol: 'https://images.pokemontcg.io/sv06/symbol.png',
      logo: 'https://images.pokemontcg.io/sv06/logo.png',
    },
  },
  {
    id: 'sv02',
    name: 'Paldea Evolved',
    series: 'Scarlet & Violet',
    printedTotal: 193,
    total: 279,
    releaseDate: '2023/06/09',
    updatedAt: '2023/06/09',
    images: {
      symbol: 'https://images.pokemontcg.io/sv02/symbol.png',
      logo: 'https://images.pokemontcg.io/sv02/logo.png',
    },
  },
  {
    id: 'swsh10',
    name: 'Astral Radiance',
    series: 'Sword & Shield',
    printedTotal: 189,
    total: 246,
    releaseDate: '2022/05/27',
    updatedAt: '2022/05/27',
    images: {
      symbol: 'https://images.pokemontcg.io/swsh10/symbol.png',
      logo: 'https://images.pokemontcg.io/swsh10/logo.png',
    },
  },
  {
    id: 'swsh11',
    name: 'Lost Origin',
    series: 'Sword & Shield',
    printedTotal: 196,
    total: 247,
    releaseDate: '2022/09/09',
    updatedAt: '2022/09/09',
    images: {
      symbol: 'https://images.pokemontcg.io/swsh11/symbol.png',
      logo: 'https://images.pokemontcg.io/swsh11/logo.png',
    },
  },
  {
    id: 'sv01',
    name: 'Scarlet & Violet Base Set',
    series: 'Scarlet & Violet',
    printedTotal: 198,
    total: 258,
    releaseDate: '2023/03/31',
    updatedAt: '2023/03/31',
    images: {
      symbol: 'https://images.pokemontcg.io/sv01/symbol.png',
      logo: 'https://images.pokemontcg.io/sv01/logo.png',
    },
  },
];

// 移除 pokemontcg.io 外部請求，直接返回精選擴充包系列歸檔
export const fetchPokemonSets = async (): Promise<ApiPokemonSet[]> => {
  return FALLBACK_POKEMON_SETS;
};
