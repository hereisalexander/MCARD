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

export const INITIAL_MARKETPLACE_LISTINGS: CardListing[] = [];

export const isDemoListing = (item?: unknown): boolean => {
  if (!item || typeof item !== 'object') return false;
  const id = (item as { id?: string }).id || '';
  const demoIds = [
    'listing-charizard-151',
    'listing-pikachu-sparks',
    'listing-luffy-gear5',
    'listing-jordan-fleer',
    'listing-blue-eyes',
    'listing-gengar-vmax-alt',
  ];
  return demoIds.includes(id) || id.startsWith('demo-') || id.startsWith('mock-');
};

