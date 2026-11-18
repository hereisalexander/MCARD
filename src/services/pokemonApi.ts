/**
 * Pokémon TCG API 整合服務
 * 具備邊緣快取保護 (Cloudflare KV + SWR)、單飛去重 (Single-Flight) 與 API 故障平滑降級機制。
 */

import { withStaleWhileRevalidate } from '../utils/cache';

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

interface TcgCardsApiResponse {
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

interface TcgSetsApiResponse {
  data: ApiPokemonSet[];
}

interface SingleCardApiResponse {
  data: RawTcgCard;
}

// 快取生命週期設定（秒）
export const SETS_CACHE_TTL_SECONDS = 24 * 60 * 60; // Sets 快取 24 小時
export const SETS_CACHE_SWR_SECONDS = 48 * 60 * 60; // Sets SWR 寬限期 48 小時
export const CARDS_CACHE_TTL_SECONDS = 2 * 60 * 60; // 卡牌資訊快取 2 小時
export const CARDS_CACHE_SWR_SECONDS = 12 * 60 * 60; // 卡牌 SWR 寬限期 12 小時

const POKEMON_TCG_API_BASE = 'https://api.pokemontcg.io/v2';
const API_TIMEOUT_MS = 8000;

/**
 * 建立標準 Pokémon TCG API 請求 Headers
 */
const buildApiHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const apiKey = process.env.POKEMON_TCG_API_KEY;
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  return headers;
};

/**
 * 具有超時控制的 Fetch 包裝器
 */
const fetchWithTimeout = async (url: string): Promise<Response> => {
  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: buildApiHeaders(),
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutTimer);
  }
};

/**
 * 自卡牌原始 API 響應解析市場即時公允價格
 */
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

    if (typeof market === 'number' && market > 0) {
      return Number(market.toFixed(2));
    }
  }

  const cmPrices = card.cardmarket?.prices;
  if (cmPrices) {
    const cmPrice = cmPrices.averageSellPrice ?? cmPrices.trendPrice ?? cmPrices.reverseHoloSell;
    if (typeof cmPrice === 'number' && cmPrice > 0) {
      return Number(cmPrice.toFixed(2));
    }
  }

  return null;
};

/**
 * 將原始卡牌對象對齊為系統標準 ApiPokemonCard
 */
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

/**
 * 獲取 Pokémon 系列擴充包列表
 * 快取策略：Sets 快取 24hr，API 故障時平滑降級至 FALLBACK_POKEMON_SETS
 */
export const fetchPokemonSets = async (forceFresh = false): Promise<ApiPokemonSet[]> => {
  const cacheKey = 'tcg:pokemon:sets:all';

  return withStaleWhileRevalidate(
    cacheKey,
    async () => {
      const url = `${POKEMON_TCG_API_BASE}/sets?orderBy=-releaseDate&pageSize=50`;
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`[Pokemon TCG API] Sets 請求失敗，狀態碼: ${response.status}`);
      }

      const json: TcgSetsApiResponse = await response.json();
      if (!json || !Array.isArray(json.data) || json.data.length === 0) {
        throw new Error('[Pokemon TCG API] Sets 響應格式無效或為空');
      }

      return json.data;
    },
    {
      ttlSeconds: SETS_CACHE_TTL_SECONDS, // 24 小時
      swrSeconds: SETS_CACHE_SWR_SECONDS, // 48 小時
      fallback: FALLBACK_POKEMON_SETS, // 平滑降級至精選系列
      forceFresh,
    }
  );
};

/**
 * 建構卡牌查詢字串
 */
const buildCardQueryString = (params: FetchCardsParams): string => {
  const { searchQuery = '', setName = '', cardType = '' } = params;
  const queryParts: string[] = [];

  if (searchQuery.trim()) {
    const sanitized = searchQuery.trim().replace(/["']/g, '');
    queryParts.push(`name:"*${sanitized}*"`);
  }

  if (setName && setName !== 'ALL') {
    const sanitizedSet = setName.trim().replace(/["']/g, '');
    queryParts.push(`set.name:"${sanitizedSet}"`);
  }

  if (cardType && cardType !== 'ALL') {
    const sanitizedType = cardType.trim().replace(/["']/g, '');
    queryParts.push(`types:"${sanitizedType}"`);
  }

  return queryParts.join(' ');
};

/**
 * 獲取 Pokémon 卡牌搜尋結果（支援搜尋、分頁、屬性與系列過濾）
 * 快取策略：卡牌搜尋結果快取 2hr，若遭遇 429 或網路故障平滑降級至歷史快取或安全空狀態
 */
export const fetchPokemonCardsFromApi = async (
  params: FetchCardsParams = {},
  forceFresh = false
): Promise<FetchCardsResult> => {
  const { page = 1, pageSize = 24 } = params;

  const queryString = buildCardQueryString(params);
  const cacheKey = `tcg:pokemon:cards:p${page}:ps${pageSize}:q[${queryString || 'empty'}]`;

  const safeEmptyResult: FetchCardsResult = {
    cards: [],
    totalCount: 0,
    hasMore: false,
  };

  return withStaleWhileRevalidate(
    cacheKey,
    async () => {
      const qParam = queryString ? `&q=${encodeURIComponent(queryString)}` : '';
      const url = `${POKEMON_TCG_API_BASE}/cards?page=${page}&pageSize=${pageSize}${qParam}&orderBy=-set.releaseDate`;

      const response = await fetchWithTimeout(url);

      if (response.status === 429) {
        throw new Error('[Pokemon TCG API] 遭遇 429 速率限制 (Rate Limited)');
      }

      if (!response.ok) {
        throw new Error(`[Pokemon TCG API] Cards 請求失敗，狀態碼: ${response.status}`);
      }

      const json: TcgCardsApiResponse = await response.json();
      if (!json || !Array.isArray(json.data)) {
        throw new Error('[Pokemon TCG API] Cards 響應數據格式無效');
      }

      const cards = json.data.map(mapRawCardToApiPokemonCard);
      const totalCount = json.totalCount ?? cards.length;
      const hasMore = page * pageSize < totalCount;

      return {
        cards,
        totalCount,
        hasMore,
      };
    },
    {
      ttlSeconds: CARDS_CACHE_TTL_SECONDS, // 2 小時
      swrSeconds: CARDS_CACHE_SWR_SECONDS, // 12 小時
      fallback: safeEmptyResult, // 平滑降級兜底
      forceFresh,
    }
  );
};

/**
 * 依據卡牌 ID 獲取單張卡牌資訊
 * 快取策略：單卡資訊快取 2hr，API 故障時平滑降級為快取舊資料或 null
 */
export const fetchPokemonCardById = async (
  cardId: string,
  forceFresh = false
): Promise<ApiPokemonCard | null> => {
  if (!cardId || !cardId.trim()) {
    return null;
  }

  const cleanId = cardId.trim();
  const cacheKey = `tcg:pokemon:card:${cleanId}`;

  return withStaleWhileRevalidate(
    cacheKey,
    async () => {
      const url = `${POKEMON_TCG_API_BASE}/cards/${encodeURIComponent(cleanId)}`;
      const response = await fetchWithTimeout(url);

      if (response.status === 404) {
        return null;
      }

      if (response.status === 429) {
        throw new Error(`[Pokemon TCG API] 單卡查詢遭遇 429 速率限制: ${cleanId}`);
      }

      if (!response.ok) {
        throw new Error(`[Pokemon TCG API] 單卡查詢失敗，狀態碼: ${response.status}`);
      }

      const json: SingleCardApiResponse = await response.json();
      if (!json || !json.data) {
        return null;
      }

      return mapRawCardToApiPokemonCard(json.data);
    },
    {
      ttlSeconds: CARDS_CACHE_TTL_SECONDS, // 2 小時
      swrSeconds: CARDS_CACHE_SWR_SECONDS, // 12 小時
      fallback: null,
      forceFresh,
    }
  );
};

/**
 * 獲取首頁/探索頁熱門卡牌 (Featured Cards)
 * 預設快取熱門指標卡（例如 151 系列熱門卡牌）2 小時
 */
export const fetchFeaturedPokemonCards = async (
  forceFresh = false
): Promise<ApiPokemonCard[]> => {
  const result = await fetchPokemonCardsFromApi(
    {
      page: 1,
      pageSize: 12,
      searchQuery: 'Charizard',
    },
    forceFresh
  );

  return result.cards;
};
