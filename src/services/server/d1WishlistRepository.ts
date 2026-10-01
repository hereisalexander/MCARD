import { eq, desc } from 'drizzle-orm';
import { AppDatabase, getDb } from '@/db';
import { wishlistItems, InsertWishlistItemRow } from '@/db/schema';
import { WishlistItem } from '@/types/wishlist';
import { CardCategory } from '@/services/multiCardService';

export class D1WishlistRepository {
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

  private mapRowToItem = (row: typeof wishlistItems.$inferSelect): WishlistItem => {
    return {
      id: row.id,
      cardId: row.cardId,
      cardName: row.cardName,
      setName: row.setName,
      imageUrl: row.imageUrl,
      category: row.category as CardCategory,
      targetPrice: row.targetPrice ?? undefined,
      baseMarketPrice: row.baseMarketPrice,
      addedAt: row.addedAt,
      notes: row.notes ?? undefined,
    };
  };

  getAll = async (userId: string = this.defaultUserId): Promise<WishlistItem[]> => {
    const db = this.getDatabase();
    const rows = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.userId, userId))
      .orderBy(desc(wishlistItems.addedAt));

    return rows.map((r) => this.mapRowToItem(r));
  };

  add = async (item: WishlistItem, userId: string = this.defaultUserId): Promise<WishlistItem> => {
    const db = this.getDatabase();
    const newRecord: InsertWishlistItemRow = {
      id: item.id || `wish-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      cardId: item.cardId,
      cardName: item.cardName,
      category: item.category,
      setName: item.setName,
      imageUrl: item.imageUrl,
      targetPrice: item.targetPrice ?? null,
      baseMarketPrice: item.baseMarketPrice,
      notes: item.notes ?? null,
      addedAt: item.addedAt || new Date().toISOString(),
    };

    await db.insert(wishlistItems).values(newRecord);
    return this.mapRowToItem(newRecord as typeof wishlistItems.$inferSelect);
  };

  update = async (id: string, updates: Partial<WishlistItem>): Promise<WishlistItem> => {
    const db = this.getDatabase();
    const updatePayload: Partial<InsertWishlistItemRow> = {};
    if (updates.targetPrice !== undefined) updatePayload.targetPrice = updates.targetPrice;
    if (updates.notes !== undefined) updatePayload.notes = updates.notes;

    await db.update(wishlistItems).set(updatePayload).where(eq(wishlistItems.id, id));
    const rows = await db.select().from(wishlistItems).where(eq(wishlistItems.id, id)).limit(1);

    if (rows.length === 0) {
      throw new Error(`找不到 ID 為 ${id} 之願望清單項目`);
    }

    return this.mapRowToItem(rows[0]);
  };

  remove = async (id: string): Promise<boolean> => {
    const db = this.getDatabase();
    await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
    return true;
  };
}
