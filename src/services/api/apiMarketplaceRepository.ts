import {
  MarketListing,
  MarketListingSchema,
  CreateListingInput,
  CreateListingInputSchema,
  ListingStatus,
} from '@/contracts/marketplace.schema';
import { CardCategory } from '@/contracts/common.schema';
import { IMarketplaceRepository } from '../repository.types';
import { LocalMarketplaceRepository } from '../marketplaceRepository';
import { isDemoListing } from '@/types/marketplace';

const STORAGE_KEY = 'mcard_marketplace_listings';

export class ApiMarketplaceRepository implements IMarketplaceRepository {
  private fallbackRepo = new LocalMarketplaceRepository();
  private hasSyncedLocalToD1 = false;

  private getCachedData(): MarketListing[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      let hasCorrections = false;
      const filtered = parsed.filter((item: MarketListing) => {
        if (isDemoListing(item)) {
          hasCorrections = true;
          return false;
        }
        return true;
      });
      if (hasCorrections) {
        this.setCachedData(filtered);
      }
      return filtered;
    } catch {
      return [];
    }
  }


  private setCachedData(data: MarketListing[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[ApiMarketplaceRepository] 快取寫入失敗:', e);
    }
  }

  private async autoSyncLocalListings(cloudListings: MarketListing[]): Promise<MarketListing[]> {
    if (typeof window === 'undefined') {
      return cloudListings;
    }

    const localData = this.getCachedData();
    const cloudIds = new Set(cloudListings.map((c) => c.id));
    const pendingSync = localData.filter((item) => !cloudIds.has(item.id) && !isDemoListing(item));

    if (pendingSync.length === 0) {
      return cloudListings.length > 0 ? cloudListings : localData;
    }

    if (!this.hasSyncedLocalToD1) {
      this.hasSyncedLocalToD1 = true;
      for (const item of pendingSync) {
        try {
          const res = await fetch('/api/v1/marketplace/listings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cardName: item.cardName,
              category: item.category,
              setName: item.setName,
              officialPrice: item.officialPrice,
              askingPrice: item.askingPrice,
              condition: item.condition,
              photos: item.photos,
              notes: item.notes,
              location: item.location,
              contactPlatform: item.contactPlatform,
              contactValue: item.contactValue,
              seller: {
                name: item.sellerName,
                avatar: item.sellerAvatar,
              },
            }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              const parsed = MarketListingSchema.safeParse(json.data);
              if (parsed.success) {
                cloudListings.push(parsed.data);
              }
            }
          }
        } catch (migErr) {
          console.warn('[D1 Migration] 市集遷移失敗:', item.cardName, migErr);
        }
      }
    }

    // 合併雲端與本地尚未被雲端收錄的自建掛單，確保離線或未同步時本機卡牌永不消失
    const mergedListings: MarketListing[] = [...cloudListings];
    const existingIds = new Set(mergedListings.map((m) => m.id));
    for (const item of pendingSync) {
      if (!existingIds.has(item.id)) {
        mergedListings.push(item);
        existingIds.add(item.id);
      }
    }

    return mergedListings;
  }

  getAll = async (filter?: { category?: CardCategory; status?: ListingStatus }): Promise<MarketListing[]> => {
    try {
      const params = new URLSearchParams();
      if (filter?.category && filter.category !== 'all') params.set('category', filter.category);
      if (filter?.status) params.set('status', filter.status);

      const url = `/api/v1/marketplace/listings${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { cache: 'no-store' });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const validListings: MarketListing[] = [];
          for (const item of json.data) {
            if (isDemoListing(item)) continue;
            const parsed = MarketListingSchema.safeParse(item);
            if (parsed.success) {
              validListings.push(parsed.data);
            }
          }
          const finalData = await this.autoSyncLocalListings(validListings);
          this.setCachedData(finalData);

          let filtered = finalData;
          if (filter?.category && filter.category !== 'all') {
            filtered = filtered.filter((item) => item.category === filter.category);
          }
          if (filter?.status) {
            filtered = filtered.filter((item) => item.status === filter.status);
          }
          return filtered;
        }
      }
    } catch (err) {
      console.warn('[ApiMarketplaceRepository] 無法連線至 D1 API，退回本機:', err);
    }

    return this.fallbackRepo.getAll(filter);
  };

  getById = async (id: string): Promise<MarketListing | null> => {
    try {
      const res = await fetch(`/api/v1/marketplace/listings/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return MarketListingSchema.parse(json.data);
        }
      }
    } catch {
      // 容錯退回本地
    }

    return this.fallbackRepo.getById(id);
  };

  create = async (
    input: CreateListingInput,
    seller: { name: string; avatar: string }
  ): Promise<MarketListing> => {
    const validated = CreateListingInputSchema.parse(input);

    try {
      const res = await fetch('/api/v1/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validated, seller }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const created = MarketListingSchema.parse(json.data);
          const current = this.getCachedData();
          this.setCachedData([created, ...current]);
          return created;
        }
      }
    } catch (err) {
      console.warn('[ApiMarketplaceRepository] 遠端刊登失敗，儲存至本地備用:', err);
    }

    return this.fallbackRepo.create(validated, seller);
  };

  updateStatus = async (
    id: string,
    status: ListingStatus,
    soldPrice?: number
  ): Promise<MarketListing> => {
    try {
      const res = await fetch(`/api/v1/marketplace/listings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, soldPrice }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updated = MarketListingSchema.parse(json.data);
          const current = this.getCachedData();
          this.setCachedData(current.map((item) => (item.id === id ? updated : item)));
          return updated;
        }
      }
    } catch (err) {
      console.warn('[ApiMarketplaceRepository] 遠端狀態更新失敗，更新本地備用:', err);
    }

    return this.fallbackRepo.updateStatus(id, status, soldPrice);
  };

  delete = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/marketplace/listings/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const current = this.getCachedData();
          this.setCachedData(current.filter((item) => item.id !== id));
          return true;
        }
      }
    } catch (err) {
      console.warn('[ApiMarketplaceRepository] 遠端刪除失敗，刪除本地備用:', err);
    }

    return this.fallbackRepo.delete(id);
  };
}
