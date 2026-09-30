import {
  CardAsset,
  CardAssetSchema,
  CreateCardAssetInput,
  CreateCardAssetInputSchema,
  UpdateCardAssetInput,
  UpdateCardAssetInputSchema,
  PortfolioSummary,
} from '@/contracts/portfolio.schema';
import { IPortfolioRepository } from './repository.types';

const STORAGE_KEY = 'mcard_portfolio_assets';
const LEGACY_STORAGE_KEY = 'pokemon_portfolio';

export class LocalPortfolioRepository implements IPortfolioRepository {
  private getStorageData(): CardAsset[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return [];
      
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // 透過 Zod 進行逐筆 Runtime 驗證與容錯轉換
      const validAssets: CardAsset[] = [];
      for (const item of parsed) {
        const result = CardAssetSchema.safeParse({
          ...item,
          // 向後相容舊資料欄位
          buyPrice: typeof item.buyPrice === 'number' ? item.buyPrice : 0,
          quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
          condition: item.condition || 'Ungraded',
          addedAt: item.addedAt || new Date().toISOString(),
        });

        if (result.success) {
          validAssets.push(result.data);
        } else {
          console.warn('[PortfolioRepository] 略過損壞資產資料:', item, result.error.format());
        }
      }

      return validAssets;
    } catch (err) {
      console.error('[PortfolioRepository] 讀取資產庫失敗:', err);
      return [];
    }
  }

  private setStorageData(data: CardAsset[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // 同步舊 key 確保相容
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('[PortfolioRepository] 寫入資產庫失敗:', err);
    }
  }

  async getAll(): Promise<CardAsset[]> {
    return this.getStorageData();
  }

  async getById(id: string): Promise<CardAsset | null> {
    const list = this.getStorageData();
    const found = list.find((item) => item.id === id);
    return found || null;
  }

  async add(input: CreateCardAssetInput): Promise<CardAsset> {
    // 1. Zod 嚴格檢驗輸入格式
    const validated = CreateCardAssetInputSchema.parse(input);

    const newItem: CardAsset = {
      id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: 'local-user',
      ...validated,
      addedAt: new Date().toISOString(),
    };

    const currentList = this.getStorageData();
    const updated = [newItem, ...currentList];
    this.setStorageData(updated);

    return newItem;
  }

  async update(id: string, updates: UpdateCardAssetInput): Promise<CardAsset> {
    const validated = UpdateCardAssetInputSchema.parse(updates);
    const list = this.getStorageData();
    const index = list.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error(`找不到 ID 為 ${id} 之資產記錄`);
    }

    const updatedItem: CardAsset = {
      ...list[index],
      ...validated,
    };

    list[index] = updatedItem;
    this.setStorageData(list);

    return updatedItem;
  }

  async remove(id: string): Promise<boolean> {
    const list = this.getStorageData();
    const filtered = list.filter((item) => item.id !== id);
    if (filtered.length === list.length) {
      return false;
    }
    this.setStorageData(filtered);
    return true;
  }

  async getSummary(): Promise<PortfolioSummary> {
    const list = this.getStorageData();
    const totalAssetsCount = list.reduce((acc, curr) => acc + curr.quantity, 0);
    const totalPortfolioValueUSD = list.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    const totalCostUSD = list.reduce((acc, curr) => acc + (curr.buyPrice || 0) * curr.quantity, 0);
    const unrealizedPnLUSD = totalPortfolioValueUSD - totalCostUSD;

    // ROI 計算防呆：若成本為 0 則回傳 null
    const overallRoiPercent = totalCostUSD > 0 
      ? Number(((unrealizedPnLUSD / totalCostUSD) * 100).toFixed(2))
      : null;

    return {
      totalAssetsCount,
      totalPortfolioValueUSD: Number(totalPortfolioValueUSD.toFixed(2)),
      totalCostUSD: Number(totalCostUSD.toFixed(2)),
      unrealizedPnLUSD: Number(unrealizedPnLUSD.toFixed(2)),
      overallRoiPercent,
    };
  }

  async exportBackup(): Promise<string> {
    const list = this.getStorageData();
    const payload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      appName: 'MCARD',
      items: list,
    };
    return JSON.stringify(payload, null, 2);
  }

  async importBackup(jsonString: string): Promise<{ success: boolean; importedCount: number; errors?: string[] }> {
    try {
      const parsed = JSON.parse(jsonString);
      const items = Array.isArray(parsed) ? parsed : parsed.items;

      if (!Array.isArray(items)) {
        return { success: false, importedCount: 0, errors: ['備份資料格式不正確，找不到卡牌清單'] };
      }

      const validList: CardAsset[] = [];
      const errors: string[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const res = CardAssetSchema.safeParse({
          id: item.id || `imported-${Date.now()}-${i}`,
          userId: item.userId || 'local-user',
          cardId: item.cardId || item.id || `card-${i}`,
          name: item.name || '未命名卡牌',
          category: item.category || 'pokemon',
          price: typeof item.price === 'number' ? item.price : 0,
          buyPrice: typeof item.buyPrice === 'number' ? item.buyPrice : 0,
          quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
          condition: item.condition || 'Ungraded',
          imageUrl: item.imageUrl || '',
          addedAt: item.addedAt || new Date().toISOString(),
          notes: item.notes,
        });

        if (res.success) {
          validList.push(res.data);
        } else {
          errors.push(`第 ${i + 1} 筆「${item.name || '未知'}」驗證失敗: ${res.error.issues[0]?.message}`);
        }
      }

      if (validList.length > 0) {
        this.setStorageData(validList);
        return { success: true, importedCount: validList.length, errors: errors.length > 0 ? errors : undefined };
      }

      return { success: false, importedCount: 0, errors };
    } catch (e) {
      return { success: false, importedCount: 0, errors: [`JSON 解析失敗: ${(e as Error).message}`] };
    }
  }
}

export const portfolioRepository = new LocalPortfolioRepository();
