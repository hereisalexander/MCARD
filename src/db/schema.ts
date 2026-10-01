import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// 1. 個人持倉卡牌表 (Card Assets)
export const cardAssets = sqliteTable('card_assets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default('local-user'),
  cardId: text('card_id').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull().default('pokemon'),
  price: real('price').notNull().default(0),
  buyPrice: real('buy_price').notNull().default(0),
  quantity: integer('quantity').notNull().default(1),
  condition: text('condition').notNull().default('Ungraded'),
  imageUrl: text('image_url').notNull(),
  notes: text('notes'),
  addedAt: text('added_at').notNull(),
});

export type CardAssetRow = typeof cardAssets.$inferSelect;
export type InsertCardAssetRow = typeof cardAssets.$inferInsert;

// 2. 二手市集商品單表 (Market Listings)
export const marketListings = sqliteTable('market_listings', {
  id: text('id').primaryKey(),
  sellerId: text('seller_id').notNull().default('local-user'),
  sellerName: text('seller_name').notNull(),
  sellerAvatar: text('seller_avatar').notNull(),
  sellerRating: real('seller_rating').notNull().default(5.0),
  sellerSalesCount: integer('seller_sales_count').notNull().default(0),
  contactPlatform: text('contact_platform').notNull(),
  contactValue: text('contact_value').notNull(),
  cardName: text('card_name').notNull(),
  category: text('category').notNull().default('pokemon'),
  setName: text('set_name').notNull(),
  officialPrice: real('official_price').notNull().default(0),
  askingPrice: real('asking_price').notNull(),
  soldPrice: real('sold_price'),
  soldAt: text('sold_at'),
  portfolioCardId: text('portfolio_card_id'),
  buyInCost: real('buy_in_cost'),
  condition: text('condition').notNull(),
  photos: text('photos', { mode: 'json' }).$type<string[]>().notNull(),
  notes: text('notes').notNull().default(''),
  location: text('location').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
});

export type MarketListingRow = typeof marketListings.$inferSelect;
export type InsertMarketListingRow = typeof marketListings.$inferInsert;

// 3. 社群動態貼文表 (Community Posts)
export const communityPosts = sqliteTable('community_posts', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  authorAvatar: text('author_avatar').notNull(),
  authorHandle: text('author_handle').notNull(),
  authorBadge: text('author_badge'),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  type: text('type').notNull().default('showcase'),
  title: text('title').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url').notNull(),
  additionalImages: text('additional_images', { mode: 'json' }).$type<string[]>(),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  likes: integer('likes').notNull().default(0),
  commentsCount: integer('comments_count').notNull().default(0),
  location: text('location'),
  cardInfo: text('card_info', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});

export type CommunityPostRow = typeof communityPosts.$inferSelect;
export type InsertCommunityPostRow = typeof communityPosts.$inferInsert;

// 4. 社群留言表 (Community Comments)
export const communityComments = sqliteTable('community_comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  authorAvatar: text('author_avatar').notNull(),
  content: text('content').notNull(),
  likes: integer('likes').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export type CommunityCommentRow = typeof communityComments.$inferSelect;
export type InsertCommunityCommentRow = typeof communityComments.$inferInsert;

// 5. 心願追蹤表 (Wishlist Items)
export const wishlistItems = sqliteTable('wishlist_items', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default('local-user'),
  cardId: text('card_id').notNull(),
  cardName: text('card_name').notNull(),
  category: text('category').notNull().default('pokemon'),
  setName: text('set_name').notNull(),
  imageUrl: text('image_url').notNull(),
  targetPrice: real('target_price'),
  baseMarketPrice: real('base_market_price').notNull().default(0),
  notes: text('notes'),
  addedAt: text('added_at').notNull(),
});

export type WishlistItemRow = typeof wishlistItems.$inferSelect;
export type InsertWishlistItemRow = typeof wishlistItems.$inferInsert;
