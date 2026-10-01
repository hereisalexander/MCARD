import {
  CardAsset,
  CardAssetSchema,
  CreateCardAssetInput,
  CreateCardAssetInputSchema,
  UpdateCardAssetInput,
  UpdateCardAssetInputSchema,
  PortfolioSummary,
  PortfolioSummarySchema,
} from '@/contracts/portfolio.schema';
import { IPortfolioRepository } from '../repository.types';
import { LocalPortfolioRepository } from '../portfolioRepository';

const STORAGE_KEY = 'mcard_portfolio_assets';
const LEGACY_STORAGE_KEY = 'pokemon_portfolio';

export class ApiPortfolioRepository implements IPortfolioRepository {
  private fallbackRepo = new LocalPortfolioRepository();
  private hasSyncedLocalToD1 = false;

  private getCachedData(): CardAsset[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  }

  private setCachedData(data: CardAsset[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[ApiPortfolioRepository] 快取寫入失敗:', e);
    }
  }

  // 自動將舊有 LocalStorage 內的資產同步至 Cloudflare D1
  private async autoSyncLocalData(cloudAssets: CardAsset[]): Promise<CardAsset[]> {
    if (this.hasSyncedLocalToD1 || typeof window === 'undefined') {
      return cloudAssets;
    }
    this.hasSyncedLocalToD1 = true;

    // 若 D1 尚無資料，但本機有歷史持倉，則自動一次性上傳至 D1
    const localData = this.getCachedData();
    if (cloudAssets.length === 0 && localData.length > 0) {
      console.log(`[Cloudflare D1] 偵測到本機有 ${localData.length} 筆舊持倉，正在自動遷移至 D1...`);
      const migrated: CardAsset[] = [];
      for (const item of localData) {
        try {
          const res = await fetch('/api/v1/portfolio/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cardId: item.cardId || item.id,
              name: item.name,
              category: item.category,
              price: item.price,
              buyPrice: item.buyPrice,
              quantity: item.quantity,
              condition: item.condition,
              imageUrl: item.imageUrl,
              notes: item.notes,
            }),
          });
          const json = await res.json();
          if (json.success && json.data) {
            migrated.push(json.data);
          }
        } catch (migErr) {
          console.warn('[D1 Migration] 單筆遷移失敗:', item.name, migErr);
        }
      }

      if (migrated.length > 0) {
        console.log(`[Cloudflare D1] 成功遷移 ${migrated.length} 筆資產至雲端 D1！`);
        this.setCachedData(migrated);
        return migrated;
      }
    }

    return cloudAssets;
  }

  getAll = async (): Promise<CardAsset[]> => {
    try {
      const res = await fetch('/api/v1/portfolio/assets', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const validAssets: CardAsset[] = [];
          for (const item of json.data) {
            const parsed = CardAssetSchema.safeParse(item);
            if (parsed.success) {
              validAssets.push(parsed.data);
            }
          }
          const finalAssets = await this.autoSyncLocalData(validAssets);
          this.setCachedData(finalAssets);
          return finalAssets;
        }
      }
    } catch (err) {
      console.warn('[ApiPortfolioRepository] 無法連線至 D1 API，退回本機 LocalStorage:', err);
    }

    return this.fallbackRepo.getAll();
  };

  getById = async (id: string): Promise<CardAsset | null> => {
    try {
      const all = await this.getAll();
      return all.find((item) => item.id === id) || null;
    } catch {
      return this.fallbackRepo.getById(id);
    }
  };

  add = async (input: CreateCardAssetInput): Promise<CardAsset> => {
    const validated = CreateCardAssetInputSchema.parse(input);

    try {
      const res = await fetch('/api/v1/portfolio/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const created = CardAssetSchema.parse(json.data);
          const current = this.getCachedData();
          this.setCachedData([created, ...current]);
          return created;
        }
      }
    } catch (err) {
      console.warn('[ApiPortfolioRepository] 遠端新增失敗，寫入本地備用:', err);
    }

    return this.fallbackRepo.add(validated);
  };

  update = async (id: string, updates: UpdateCardAssetInput): Promise<CardAsset> => {
    const validated = UpdateCardAssetInputSchema.parse(updates);

    try {
      const res = await fetch(`/api/v1/portfolio/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updated = CardAssetSchema.parse(json.data);
          const current = this.getCachedData();
          const next = current.map((item) => (item.id === id ? updated : item));
          this.setCachedData(next);
          return updated;
        }
      }
    } catch (err) {
      console.warn('[ApiPortfolioRepository] 遠端更新失敗，更新本地備用:', err);
    }

    return this.fallbackRepo.update(id, validated);
  };

  remove = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/portfolio/assets/${id}`, {
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
      console.warn('[ApiPortfolioRepository] 遠端刪除失敗，刪除本地備用:', err);
    }

    return this.fallbackRepo.remove(id);
  };

  getSummary = async (): Promise<PortfolioSummary> => {
    try {
      const res = await fetch('/api/v1/portfolio/summary', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return PortfolioSummarySchema.parse(json.data);
        }
      }
    } catch {
      // 容錯退回本地計算
    }

    return this.fallbackRepo.getSummary();
  };

  exportBackup = async (): Promise<string> => {
    const assets = await this.getAll();
    const payload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      appName: 'MCARD',
      storage: 'Cloudflare D1 (Edge Synced)',
      items: assets,
    };
    return JSON.stringify(payload, null, 2);
  };

  importBackup = async (
    jsonString: string
  ): Promise<{ success: boolean; importedCount: number; errors?: string[] }> => {
    try {
      const parsed = JSON.parse(jsonString);
      const items = Array.isArray(parsed) ? parsed : parsed.items;

      if (!Array.isArray(items)) {
        return { success: false, importedCount: 0, errors: ['備份資料格式不正確，找不到卡牌清單'] };
      }

      let importedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          await this.add({
            cardId: item.cardId || item.id || `card-${i}`,
            name: item.name || '未命名卡牌',
            category: item.category || 'pokemon',
            price: typeof item.price === 'number' ? item.price : 0,
            buyPrice: typeof item.buyPrice === 'number' ? item.buyPrice : 0,
            quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
            condition: item.condition || 'Ungraded',
            imageUrl: item.imageUrl || '',
            notes: item.notes,
          });
          importedCount++;
        } catch (itemErr) {
          errors.push(`第 ${i + 1} 筆匯入失敗: ${(itemErr as Error).message}`);
        }
      }

      return {
        success: importedCount > 0,
        importedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (e) {
      return { success: false, importedCount: 0, errors: [`JSON 解析失敗: ${(e as Error).message}`] };
    }
  };
}
