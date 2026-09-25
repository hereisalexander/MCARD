import { CardCategory } from '@/services/multiCardService';

export interface WishlistItem {
  id: string;
  cardId: string;
  cardName: string;
  cardNumber?: string;
  setName: string;
  imageUrl: string;
  category: CardCategory;
  targetPrice?: number; // 買家設定之期望入手目標價
  baseMarketPrice: number; // 加入時的官方參考價
  addedAt: string;
  notes?: string;
}

export const INITIAL_WISHLIST_ITEMS: WishlistItem[] = [
  {
    id: 'wish-mewtwo-vstar',
    cardId: 'swsh12pt5-gg44',
    cardName: 'Mewtwo VSTAR (Galarian Gallery SAR)',
    cardNumber: 'GG44/GG70',
    setName: 'Crown Zenith',
    imageUrl: 'https://images.pokemontcg.io/swsh12pt5/GG44_hires.png',
    category: 'pokemon',
    targetPrice: 85,
    baseMarketPrice: 105,
    addedAt: '2026-09-24',
    notes: '經典超夢與噴火龍空中對決，等跌破 $90 入手 PSA 10。',
  },
  {
    id: 'wish-luffy-gear5',
    cardId: 'op05-119',
    cardName: 'Monkey D. Luffy (Gear 5 Manga Secret)',
    cardNumber: 'OP05-119',
    setName: 'One Piece Awakening of the New Era',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    category: 'onepiece',
    targetPrice: 1800,
    baseMarketPrice: 2200,
    addedAt: '2026-09-25',
    notes: '五檔魯夫親簽或漫畫底，目標 $1800 以內收未拆品。',
  },
];
