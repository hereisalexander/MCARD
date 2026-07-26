export interface ApiPokemonCard {
  id: string;
  name: string;
  number: string;
  set: string;
  type: string;
  rarity: string;
  price: number;
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

interface RawTcgCard {
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

interface TcgApiResponse {
  data: RawTcgCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
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

// Extract real dynamic price from API raw response
const extractCardPrice = (card: RawTcgCard): number => {
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
      
    if (market && market > 0) return Number(market.toFixed(2));
  }

  const cmPrices = card.cardmarket?.prices;
  if (cmPrices) {
    const cmPrice = cmPrices.averageSellPrice ?? cmPrices.trendPrice ?? cmPrices.reverseHoloSell;
    if (cmPrice && cmPrice > 0) return Number(cmPrice.toFixed(2));
  }

  // Fallback nominal value if card has no public market listings
  return 4.99;
};

// Map raw card response to internal card format
const mapRawCardToApiPokemonCard = (card: RawTcgCard): ApiPokemonCard => {
  return {
    id: card.id,
    name: card.name,
    number: card.number,
    set: card.set?.name || 'Pokémon TCG',
    type: card.types && card.types.length > 0 ? card.types[0] : 'Normal',
    rarity: card.rarity || 'Common',
    price: extractCardPrice(card),
    imageUrl: card.images?.large || card.images?.small || 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
    artist: card.artist || 'Unknown',
    tcgplayerUrl: card.tcgplayer?.url,
  };
};

export const fetchPokemonCardsFromApi = async ({
  page = 1,
  pageSize = 20,
  searchQuery = '',
  setName = 'ALL',
  cardType = 'ALL',
}: FetchCardsParams): Promise<FetchCardsResult> => {
  try {
    const queryParts: string[] = [];

    if (searchQuery.trim()) {
      const sanitized = searchQuery.trim().replace(/["']/g, '');
      queryParts.push(`name:"*${sanitized}*"`);
    }

    if (setName && setName !== 'ALL') {
      queryParts.push(`set.name:"${setName}"`);
    }

    if (cardType && cardType !== 'ALL') {
      queryParts.push(`types:"${cardType}"`);
    }

    const qParam = queryParts.length > 0 ? queryParts.join(' ') : '';
    
    // Try internal proxy route first for max reliability, fallback to direct API
    const proxyUrl = `/api/pokemon/cards?page=${page}&pageSize=${pageSize}${qParam ? `&q=${encodeURIComponent(qParam)}` : ''}`;
    const directUrl = `https://api.pokemontcg.io/v2/cards?page=${page}&pageSize=${pageSize}${qParam ? `&q=${encodeURIComponent(qParam)}` : ''}`;

    let response: Response;
    try {
      response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Proxy status: ${response.status}`);
      }
    } catch {
      // Fallback to direct API with headers if proxy fails
      response = await fetch(directUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });
    }

    if (!response.ok) {
      console.warn(`[Pokemon TCG API] Both proxy & direct requests failed with status ${response.status}.`);
      return { cards: [], totalCount: 0, hasMore: false };
    }

    const json: TcgApiResponse = await response.json();

    if (!json || !Array.isArray(json.data)) {
      return { cards: [], totalCount: 0, hasMore: false };
    }

    const cards = json.data.map(mapRawCardToApiPokemonCard);
    const totalCount = json.totalCount || cards.length;
    const hasMore = page * pageSize < totalCount;

    return {
      cards,
      totalCount,
      hasMore,
    };
  } catch (error) {
    console.error('[Pokemon TCG API] Error fetching cards:', error);
    return { cards: [], totalCount: 0, hasMore: false };
  }
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

interface TcgSetApiResponse {
  data: ApiPokemonSet[];
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

export const fetchPokemonSets = async (): Promise<ApiPokemonSet[]> => {
  try {
    const internalUrl = '/api/pokemon/sets';
    const response = await fetch(internalUrl);

    if (!response.ok) {
      console.warn('[Pokemon TCG API] Internal Sets API returned non-OK status, using fallback sets.');
      return FALLBACK_POKEMON_SETS;
    }

    const json: TcgSetApiResponse = await response.json();
    if (json && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return FALLBACK_POKEMON_SETS;
  } catch (error) {
    console.warn('[Pokemon TCG API] Internal Sets API failed, using fallback sets:', error);
    return FALLBACK_POKEMON_SETS;
  }
};
