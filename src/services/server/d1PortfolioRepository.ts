import { eq, desc } from 'drizzle-orm';
import { AppDatabase, getDb } from '@/db';
import { cardAssets, InsertCardAssetRow } from '@/db/schema';
import {
  CardAsset,
  CardAssetSchema,
  CreateCardAssetInput,
  CreateCardAssetInputSchema,
  UpdateCardAssetInput,
  UpdateCardAssetInputSchema,
  PortfolioSummary,
} from '@/contracts/portfolio.schema';
import { IPortfolioRepository } from '../repository.types';

export class D1PortfolioRepository implements IPortfolioRepository {
  private customDb?: AppDatabase;
  private defaultUserId = 'local-user';

  constructor(db?: AppDatabase) {
    this.customDb = db;
  }

  private getDatabase(): AppDatabase {
    if (this.customDb) {
      return this.customDb;
    }
    return getDb();
  }

  constMapRowToAsset = (row: typeof cardAssets.$inferSelect): CardAsset => {
    return CardAssetSchema.parse({
      id: row.id,
      userId: row.userId,
      cardId: row.cardId,
      name: row.name,
      category: row.category,
      price: row.price,
      buyPrice: row.buyPrice,
      quantity: row.quantity,
      condition: row.condition,
      imageUrl: row.imageUrl,
      notes: row.notes ?? undefined,
      addedAt: row.addedAt,
    });
  };

  getAll = async (userId: string = this.defaultUserId): Promise<CardAsset[]> => {
    const db = this.getDatabase();
    const rows = await db
      .select()
      .from(cardAssets)
      .where(eq(cardAssets.userId, userId))
      .orderBy(desc(cardAssets.addedAt));

    return rows.map((row) => this.constMapRowToAsset(row));
  };

  getById = async (id: string): Promise<CardAsset | null> => {
    const db = this.getDatabase();
    const rows = await db.select().from(cardAssets).where(eq(cardAssets.id, id)).limit(1);

    if (rows.length === 0) {
      return null;
    }

    return this.constMapRowToAsset(rows[0]);
  };

  add = async (input: CreateCardAssetInput, userId: string = this.defaultUserId): Promise<CardAsset> => {
    const validated = CreateCardAssetInputSchema.parse(input);
    const db = this.getDatabase();

    const newId = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newRecord: InsertCardAssetRow = {
      id: newId,
      userId,
      cardId: validated.cardId,
      name: validated.name,
      category: validated.category,
      price: validated.price,
      buyPrice: validated.buyPrice,
      quantity: validated.quantity,
      condition: validated.condition,
      imageUrl: validated.imageUrl,
      notes: validated.notes ?? null,
      addedAt: new Date().toISOString(),
    };

    await db.insert(cardAssets).values(newRecord);
    const created = await this.getById(newId);

    if (!created) {
      throw new Error('新增資產失敗，無法查得新建之記錄');
    }

    return created;
  };

  update = async (id: string, updates: UpdateCardAssetInput): Promise<CardAsset> => {
    const validated = UpdateCardAssetInputSchema.parse(updates);
    const db = this.getDatabase();

    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`找不到 ID 為 ${id} 之資產記錄`);
    }

    const updatePayload: Partial<InsertCardAssetRow> = {};
    if (validated.buyPrice !== undefined) updatePayload.buyPrice = validated.buyPrice;
    if (validated.quantity !== undefined) updatePayload.quantity = validated.quantity;
    if (validated.condition !== undefined) updatePayload.condition = validated.condition;
    if (validated.notes !== undefined) updatePayload.notes = validated.notes;

    if (Object.keys(updatePayload).length > 0) {
      await db.update(cardAssets).set(updatePayload).where(eq(cardAssets.id, id));
    }

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`更新後無法查得資產 ${id}`);
    }

    return updated;
  };

  remove = async (id: string): Promise<boolean> => {
    const db = this.getDatabase();
    const existing = await this.getById(id);
    if (!existing) {
      return false;
    }

    await db.delete(cardAssets).where(eq(cardAssets.id, id));
    return true;
  };

  getSummary = async (userId: string = this.defaultUserId): Promise<PortfolioSummary> => {
    const assets = await this.getAll(userId);

    const totalAssetsCount = assets.reduce((sum, item) => sum + item.quantity, 0);
    const totalPortfolioValueUSD = assets.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalCostUSD = assets.reduce((sum, item) => sum + item.buyPrice * item.quantity, 0);
    const unrealizedPnLUSD = totalPortfolioValueUSD - totalCostUSD;

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
  };

  exportBackup = async (userId: string = this.defaultUserId): Promise<string> => {
    const assets = await this.getAll(userId);
    const payload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      appName: 'MCARD',
      storage: 'Cloudflare D1',
      items: assets,
    };
    return JSON.stringify(payload, null, 2);
  };

  importBackup = async (
    jsonString: string,
    userId: string = this.defaultUserId
  ): Promise<{ success: boolean; importedCount: number; errors?: string[] }> => {
    try {
      const parsed = JSON.parse(jsonString);
      const items = Array.isArray(parsed) ? parsed : parsed.items;

      if (!Array.isArray(items)) {
        return { success: false, importedCount: 0, errors: ['備份資料格式不正確，找不到卡牌清單'] };
      }

      const errors: string[] = [];
      let importedCount = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const res = CreateCardAssetInputSchema.safeParse({
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

        if (res.success) {
          await this.add(res.data, userId);
          importedCount++;
        } else {
          errors.push(`第 ${i + 1} 筆「${item.name || '未知'}」驗證失敗: ${res.error.issues[0]?.message}`);
        }
      }

      if (importedCount > 0) {
        return { success: true, importedCount, errors: errors.length > 0 ? errors : undefined };
      }

      return { success: false, importedCount: 0, errors };
    } catch (e) {
      return { success: false, importedCount: 0, errors: [`JSON 解析失敗: ${(e as Error).message}`] };
    }
  };
}
