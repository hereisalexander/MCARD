import {
  MarketListing,
  MarketListingSchema,
  CreateListingInput,
  CreateListingInputSchema,
  ListingStatus,
} from '@/contracts/marketplace.schema';
import { CardCategory } from '@/contracts/common.schema';
import { IMarketplaceRepository } from './repository.types';
import { INITIAL_MARKETPLACE_LISTINGS } from '@/types/marketplace';

const STORAGE_KEY = 'mcard_marketplace_listings';

export class LocalMarketplaceRepository implements IMarketplaceRepository {
  private getStorageData(): MarketListing[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // 初次訪問，載入預設初始掛單資料
        this.setStorageData(INITIAL_MARKETPLACE_LISTINGS as unknown as MarketListing[]);
        return INITIAL_MARKETPLACE_LISTINGS as unknown as MarketListing[];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      const validListings: MarketListing[] = [];
      for (const item of parsed) {
        const result = MarketListingSchema.safeParse(item);
        if (result.success) {
          validListings.push(result.data);
        } else {
          // 容錯讀取（若稍有微小不合規，仍嘗試保底顯示）
          validListings.push(item as MarketListing);
        }
      }

      return validListings;
    } catch (err) {
      console.error('[MarketplaceRepository] 讀取市集資料失敗:', err);
      return [];
    }
  }

  private setStorageData(data: MarketListing[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('[MarketplaceRepository] 寫入市集資料失敗:', err);
    }
  }

  async getAll(filter?: { category?: CardCategory; status?: ListingStatus }): Promise<MarketListing[]> {
    let list = this.getStorageData();

    if (filter?.category && filter.category !== 'all') {
      list = list.filter((item) => item.category === filter.category);
    }

    if (filter?.status) {
      list = list.filter((item) => item.status === filter.status);
    }

    return list;
  }

  async getById(id: string): Promise<MarketListing | null> {
    const list = this.getStorageData();
    const found = list.find((item) => item.id === id);
    return found || null;
  }

  async create(input: CreateListingInput, seller: { name: string; avatar: string }): Promise<MarketListing> {
    const validated = CreateListingInputSchema.parse(input);

    const newListing: MarketListing = {
      id: `listing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sellerName: seller.name,
      sellerAvatar: seller.avatar,
      sellerRating: 5.0,
      sellerSalesCount: 1,
      ...validated,
      createdAt: '剛剛',
      status: 'active',
      isOwner: true,
    };

    const currentList = this.getStorageData();
    const updated = [newListing, ...currentList];
    this.setStorageData(updated);

    return newListing;
  }

  async updateStatus(id: string, status: ListingStatus, soldPrice?: number): Promise<MarketListing> {
    const list = this.getStorageData();
    const index = list.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error(`找不到 ID 為 ${id} 之掛單`);
    }

    const target = list[index];
    const updated: MarketListing = {
      ...target,
      status,
      soldPrice: status === 'sold' ? (soldPrice ?? target.askingPrice) : target.soldPrice,
      soldAt: status === 'sold' ? new Date().toISOString() : target.soldAt,
    };

    list[index] = updated;
    this.setStorageData(list);

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const list = this.getStorageData();
    const filtered = list.filter((item) => item.id !== id);
    if (filtered.length === list.length) {
      return false;
    }
    this.setStorageData(filtered);
    return true;
  }
}

export const marketplaceRepository = new LocalMarketplaceRepository();
