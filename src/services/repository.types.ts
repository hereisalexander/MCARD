import {
  CardAsset,
  CreateCardAssetInput,
  UpdateCardAssetInput,
  PortfolioSummary,
} from '@/contracts/portfolio.schema';
import {
  MarketListing,
  CreateListingInput,
  ListingStatus,
} from '@/contracts/marketplace.schema';
import {
  CommunityPost,
  CommunityComment,
  CreatePostInput,
  CommunityPostType,
} from '@/contracts/community.schema';
import { CardCategory } from '@/contracts/common.schema';

// 投資組合倉儲介面
export interface IPortfolioRepository {
  getAll(): Promise<CardAsset[]>;
  getById(id: string): Promise<CardAsset | null>;
  add(input: CreateCardAssetInput): Promise<CardAsset>;
  update(id: string, updates: UpdateCardAssetInput): Promise<CardAsset>;
  remove(id: string): Promise<boolean>;
  getSummary(): Promise<PortfolioSummary>;
  importBackup(jsonString: string): Promise<{ success: boolean; importedCount: number; errors?: string[] }>;
  exportBackup(): Promise<string>;
}

// 二手市集倉儲介面
export interface IMarketplaceRepository {
  getAll(filter?: { category?: CardCategory; status?: ListingStatus }): Promise<MarketListing[]>;
  getById(id: string): Promise<MarketListing | null>;
  create(input: CreateListingInput, seller: { name: string; avatar: string }): Promise<MarketListing>;
  updateStatus(id: string, status: ListingStatus, soldPrice?: number): Promise<MarketListing>;
  delete(id: string): Promise<boolean>;
}

// 社群動態倉儲介面
export interface ICommunityRepository {
  getFeed(filterType?: CommunityPostType): Promise<CommunityPost[]>;
  getById(id: string): Promise<CommunityPost | null>;
  createPost(input: CreatePostInput, author: { id: string; name: string; avatar: string; handle: string; badge?: string }): Promise<CommunityPost>;
  toggleLike(postId: string): Promise<{ isLiked: boolean; newLikes: number }>;
  addComment(postId: string, content: string, author: { name: string; avatar: string }): Promise<CommunityComment>;
  deletePost(postId: string): Promise<boolean>;
}
