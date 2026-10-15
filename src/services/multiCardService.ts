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
  price: number | null;
  imageUrl: string;
  artistOrPlayer?: string;
  releaseYear?: number | string;
  tcgplayerUrl?: string;
  description?: string;
}

// Helper: 將 ApiPokemonCard 轉換為通用 UniversalCard 格式
export const adaptPokemonCardToUniversal = (card: ApiPokemonCard): UniversalCard => ({
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
});

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

// 主查詢入口：直接對接真實官方 API，徹底移除所有虛擬模擬數據卡片
export const fetchUniversalCards = async ({
  category = 'all',
  page = 1,
  pageSize = 24,
  searchQuery = '',
  sortBy = 'price-desc',
}: FetchUniversalCardsParams = {}): Promise<FetchUniversalCardsResult> => {
  // 目前僅 Pokémon 官方提供完整即時 API，'all' 與 'pokemon' 皆直接請求 Pokémon TCG 真實 API
  if (category === 'pokemon' || category === 'all') {
    const rawResult = await fetchPokemonCardsFromApi({
      page,
      pageSize,
      searchQuery,
    });

    const adaptedCards = rawResult.cards.map(adaptPokemonCardToUniversal);

    if (sortBy === 'price-desc') {
      adaptedCards.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    } else if (sortBy === 'price-asc') {
      adaptedCards.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (sortBy === 'name-asc') {
      adaptedCards.sort((a, b) => a.name.localeCompare(b.name));
    }

    return {
      cards: adaptedCards,
      totalCount: rawResult.totalCount,
      hasMore: rawResult.hasMore,
    };
  }

  // 其他分類 (yugioh, onepiece, dragonball, nba, fifa) 尚未接入真實官方 API
  // 直接回傳空結果，徹底杜絕展示假卡或模擬虛擬數據
  return {
    cards: [],
    totalCount: 0,
    hasMore: false,
  };
};
