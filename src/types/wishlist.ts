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

export const INITIAL_WISHLIST_ITEMS: WishlistItem[] = [];

