import { CardCategory } from '@/services/multiCardService';

export type ListingCondition =
  | 'PSA 10'
  | 'PSA 9'
  | 'BGS 9.5'
  | 'CGC 10'
  | 'Ungraded Near Mint'
  | 'Played';

export type ListingStatus = 'active' | 'reserved' | 'sold';
export type ContactPlatform = 'line' | 'instagram' | 'phone' | 'email';

export interface CardListing {
  id: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRating?: number; // e.g. 5.0
  sellerSalesCount?: number; // e.g. 14
  contactPlatform: ContactPlatform;
  contactValue: string;
  cardName: string;
  category: CardCategory;
  setName: string;
  officialPrice: number;
  askingPrice: number;
  soldPrice?: number;
  soldAt?: string;
  portfolioCardId?: string;
  buyInCost?: number;
  condition: ListingCondition;
  photos: string[];
  notes: string;
  location: string;
  createdAt: string;
  status: ListingStatus;
  isOwner?: boolean;
}

export const DEMO_LISTING_IDS: readonly string[] = [
  'listing-charizard-151',
  'listing-pikachu-sparks',
  'listing-jordan-fleer',
  'listing-blue-eyes',
  'listing-gengar-vmax-alt',
];

export const DEMO_SELLER_NAMES: readonly string[] = [
  'RedTrainer_99',
  'PikaCollector_HK',
  'VintageHoops_Pro',
  'KaibaCorp_TW',
  'PokemonMaster_99',
];

export const isDemoListing = (item?: { id?: string; sellerName?: string } | null): boolean => {
  if (!item) return false;
  if (item.id && DEMO_LISTING_IDS.includes(item.id)) return true;
  if (item.sellerName && DEMO_SELLER_NAMES.includes(item.sellerName)) return true;
  return false;
};

export const INITIAL_MARKETPLACE_LISTINGS: CardListing[] = [];

