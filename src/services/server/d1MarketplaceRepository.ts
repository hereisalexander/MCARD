import { eq, and, desc } from 'drizzle-orm';
import { AppDatabase, getDb } from '@/db';
import { marketListings, InsertMarketListingRow, cardAssets } from '@/db/schema';
import {
  MarketListing,
  MarketListingSchema,
  CreateListingInput,
  CreateListingInputSchema,
  ListingStatus,
} from '@/contracts/marketplace.schema';
import { CardCategory } from '@/contracts/common.schema';
import { IMarketplaceRepository } from '../repository.types';

export class D1MarketplaceRepository implements IMarketplaceRepository {
  private customDb?: AppDatabase;
  private defaultSellerId = 'local-user';

  constructor(db?: AppDatabase) {
    this.customDb = db;
  }

  private getDatabase(): AppDatabase {
    if (this.customDb) {
      return this.customDb;
    }
    return getDb();
  }

  constMapRowToListing = (row: typeof marketListings.$inferSelect): MarketListing => {
    return MarketListingSchema.parse({
      id: row.id,
      sellerName: row.sellerName,
      sellerAvatar: row.sellerAvatar,
      sellerRating: row.sellerRating,
      sellerSalesCount: row.sellerSalesCount,
      contactPlatform: row.contactPlatform,
      contactValue: row.contactValue,
      cardName: row.cardName,
      category: row.category,
      setName: row.setName,
      officialPrice: row.officialPrice,
      askingPrice: row.askingPrice,
      soldPrice: row.soldPrice ?? undefined,
      soldAt: row.soldAt ?? undefined,
      portfolioCardId: row.portfolioCardId ?? undefined,
      buyInCost: row.buyInCost ?? undefined,
      condition: row.condition,
      photos: row.photos,
      notes: row.notes,
      location: row.location,
      createdAt: row.createdAt,
      status: row.status,
      isOwner: row.sellerId === this.defaultSellerId,
    });
  };

  getAll = async (filter?: { category?: CardCategory; status?: ListingStatus }): Promise<MarketListing[]> => {
    const db = this.getDatabase();
    const conditions = [];

    if (filter?.category && filter.category !== 'all') {
      conditions.push(eq(marketListings.category, filter.category));
    }
    if (filter?.status) {
      conditions.push(eq(marketListings.status, filter.status));
    }

    const query = db.select().from(marketListings);
    const rows = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(desc(marketListings.createdAt))
      : await query.orderBy(desc(marketListings.createdAt));

    return rows.map((row) => this.constMapRowToListing(row));
  };

  getById = async (id: string): Promise<MarketListing | null> => {
    const db = this.getDatabase();
    const rows = await db.select().from(marketListings).where(eq(marketListings.id, id)).limit(1);

    if (rows.length === 0) {
      return null;
    }

    return this.constMapRowToListing(rows[0]);
  };

  create = async (
    input: CreateListingInput,
    seller: { name: string; avatar: string; id?: string }
  ): Promise<MarketListing> => {
    const validated = CreateListingInputSchema.parse(input);
    const db = this.getDatabase();

    const newId = `listing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newRecord: InsertMarketListingRow = {
      id: newId,
      sellerId: seller.id || this.defaultSellerId,
      sellerName: seller.name,
      sellerAvatar: seller.avatar,
      sellerRating: 5.0,
      sellerSalesCount: 1,
      contactPlatform: validated.contactPlatform,
      contactValue: validated.contactValue,
      cardName: validated.cardName,
      category: validated.category,
      setName: validated.setName,
      officialPrice: validated.officialPrice,
      askingPrice: validated.askingPrice,
      condition: validated.condition,
      photos: validated.photos,
      notes: validated.notes,
      location: validated.location,
      portfolioCardId: validated.portfolioCardId ?? null,
      buyInCost: validated.buyInCost ?? null,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await db.insert(marketListings).values(newRecord);
    const created = await this.getById(newId);

    if (!created) {
      throw new Error('建立商品單失敗，未能於資料庫查得新建之記錄');
    }

    return created;
  };

  updateStatus = async (
    id: string,
    status: ListingStatus,
    soldPrice?: number
  ): Promise<MarketListing> => {
    const db = this.getDatabase();
    const existing = await this.getById(id);

    if (!existing) {
      throw new Error(`找不到 ID 為 ${id} 之掛單記錄`);
    }

    const finalSoldPrice = status === 'sold' ? (soldPrice ?? existing.askingPrice) : null;
    const finalSoldAt = status === 'sold' ? new Date().toISOString() : null;

    await db
      .update(marketListings)
      .set({
        status,
        soldPrice: finalSoldPrice,
        soldAt: finalSoldAt,
      })
      .where(eq(marketListings.id, id));

    // 副作用處理：若商品售出且關聯個人持倉，則將持倉張數扣減 1 (依據 SPEC.md 1.3)
    if (status === 'sold' && existing.portfolioCardId) {
      try {
        const assetRows = await db
          .select()
          .from(cardAssets)
          .where(eq(cardAssets.id, existing.portfolioCardId))
          .limit(1);

        if (assetRows.length > 0) {
          const currentAsset = assetRows[0];
          if (currentAsset.quantity > 1) {
            await db
              .update(cardAssets)
              .set({ quantity: currentAsset.quantity - 1 })
              .where(eq(cardAssets.id, currentAsset.id));
          } else {
            await db.delete(cardAssets).where(eq(cardAssets.id, currentAsset.id));
          }
        }
      } catch (assetErr) {
        console.warn('[MarketplaceRepository] 售出後同步扣減持倉時發生異常:', assetErr);
      }
    }

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`更新後無法取得掛單 ${id}`);
    }

    return updated;
  };

  delete = async (id: string): Promise<boolean> => {
    const db = this.getDatabase();
    const existing = await this.getById(id);
    if (!existing) {
      return false;
    }

    await db.delete(marketListings).where(eq(marketListings.id, id));
    return true;
  };
}
