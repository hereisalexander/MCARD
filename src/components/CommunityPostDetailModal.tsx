'use client';

import React, { useState } from 'react';
import { CommunityPost } from '@/types/community';
import { CloseIcon } from '@/components/icons/AppIcons';
import { HoloCard } from '@/components/HoloCard';

export interface CommunityPostDetailModalProps {
  post: CommunityPost | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onQuickAddToPortfolio?: (cardName: string, price: number, imageUrl: string) => void;
  onNavigateToMarket?: () => void;
}

export const CommunityPostDetailModal: React.FC<CommunityPostDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  onToggleLike,
  onAddComment,
  onQuickAddToPortfolio,
  onNavigateToMarket,
}) => {
  const [commentInput, setCommentInput] = useState<string>('');

  if (!isOpen || !post) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    onAddComment(post.id, commentInput.trim());
    setCommentInput('');
  };

  const handleLikeClick = () => {
    onToggleLike(post.id);
  };

  const isMarketplace = post.type === 'marketplace' && post.cardInfo?.isForSale;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-surface border border-hairline w-full max-w-4xl h-[92vh] max-h-[850px] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Large Visual Card Display */}
        <div className="w-full md:w-1/2 bg-black/40 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-hairline/60 relative overflow-hidden">
          {/* Tag badge top left */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-md shadow-lg ${
                post.type === 'marketplace'
                  ? 'bg-amber-500/90 text-white'
                  : post.type === 'grading'
                  ? 'bg-blue-600/90 text-white'
                  : post.type === 'discussion'
                  ? 'bg-purple-600/90 text-white'
                  : 'bg-ferrari-red/90 text-white'
              }`}
            >
              {post.type === 'marketplace' && '🏷️ 撿漏出清'}
              {post.type === 'grading' && '🏆 送檢開箱'}
              {post.type === 'discussion' && '💬 交流討論'}
              {post.type === 'showcase' && '🎁 開箱曬卡'}
            </span>

            {post.cardInfo?.condition && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface/80 text-foreground border border-hairline/80 backdrop-blur-md">
                {post.cardInfo.condition}
              </span>
            )}
          </div>

          {/* Close button for mobile inside left container */}
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="md:hidden absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white/80 hover:text-white"
          >
            <CloseIcon className="w-5 h-5" />
          </button>

          {/* 3D Holo Card Display */}
          <div className="max-w-[280px] sm:max-w-[320px] w-full flex items-center justify-center py-4">
            <HoloCard
              src={post.imageUrl}
              alt={post.cardInfo?.cardName || post.title}
              rarity={post.cardInfo?.condition || 'HOLO'}
            />
          </div>

          {/* Quick card action bar below image */}
          {post.cardInfo && (
            <div className="w-full max-w-sm mt-3 bg-surface/90 border border-hairline p-3 rounded-2xl flex items-center justify-between">
              <div className="truncate pr-2">
                <p className="text-xs font-bold text-foreground truncate">{post.cardInfo.cardName}</p>
                {post.cardInfo.price && (
                  <p className="text-xs font-mono text-emerald-500 font-bold">
                    ${post.cardInfo.price.toLocaleString()} USD
                    {post.cardInfo.originalPrice && (
                      <span className="text-[10px] text-secondary line-through ml-1.5 font-normal">
                        ${post.cardInfo.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </p>
                )}
              </div>
              {onQuickAddToPortfolio && (
                <button
                  type="button"
                  onClick={() =>
                    onQuickAddToPortfolio(
                      post.cardInfo?.cardName || post.title,
                      post.cardInfo?.price || 100,
                      post.imageUrl
                    )
                  }
                  className="px-3 py-1.5 bg-hairline/50 hover:bg-hairline text-foreground text-xs font-bold rounded-xl transition-all whitespace-nowrap"
                >
                  + 加到資產
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Post Details & Interactive Comments */}
        <div className="w-full md:w-1/2 flex flex-col h-full bg-surface">
          {/* Header with author info */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-hairline/60">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover border border-hairline"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-foreground">{post.author.name}</span>
                  {post.author.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-ferrari-red/10 text-ferrari-red border border-ferrari-red/20">
                      {post.author.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-secondary">
                  <span>{post.author.handle}</span>
                  <span>•</span>
                  <span>{post.createdAt}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="關閉"
              className="hidden md:flex p-2 rounded-full hover:bg-hairline/40 text-secondary transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content & Comments Section */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Title */}
            <h1 id="post-detail-title" className="text-base sm:text-lg font-bold text-foreground leading-snug">
              {post.title}
            </h1>

            {/* Post Description */}
            <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-background text-ferrari-red hover:underline cursor-pointer border border-hairline/50"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Location Tag */}
            {post.location && (
              <div className="flex items-center gap-1.5 text-xs text-secondary">
                <span>📍</span>
                <span>{post.location}</span>
              </div>
            )}

            {/* Marketplace Callout if for sale */}
            {isMarketplace && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    🔥 賣家出清好價
                  </p>
                  <p className="text-lg font-black text-foreground">
                    ${post.cardInfo?.price?.toLocaleString()} USD
                    {post.cardInfo?.discountPercent && (
                      <span className="text-xs font-bold text-emerald-500 ml-2">
                        降價 {post.cardInfo.discountPercent}%
                      </span>
                    )}
                  </p>
                </div>
                {onNavigateToMarket && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToMarket();
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    前往市集查看
                  </button>
                )}
              </div>
            )}

            <div className="border-t border-hairline/60 pt-4">
              <h2 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">
                全部留言 ({post.comments?.length || post.commentsCount || 0})
              </h2>

              {/* Comments List */}
              <div className="space-y-3">
                {(!post.comments || post.comments.length === 0) ? (
                  <p className="text-xs text-secondary/60 py-4 text-center">
                    目前尚無留言，留下你的第一條評論吧！
                  </p>
                ) : (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2.5 text-xs">
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 bg-background p-2.5 rounded-xl border border-hairline/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-foreground">{comment.authorName}</span>
                          <span className="text-[10px] text-secondary">{comment.createdAt}</span>
                        </div>
                        <p className="text-foreground/90 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom Bar: Like Button & Comment Input */}
          <div className="p-3 sm:p-4 border-t border-hairline/60 bg-background/50 flex flex-col gap-2.5">
            <form onSubmit={handleSendComment} className="flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="說點什麼... 支持一下樓主"
                className="flex-1 bg-surface border border-hairline rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-ferrari-red transition-all"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="px-4 py-2 bg-ferrari-red disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all hover:bg-ferrari-red/90"
              >
                發布
              </button>
            </form>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleLikeClick}
                  aria-label="點讚"
                  className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-ferrari-red transition-colors"
                >
                  <span
                    className={`text-base transition-transform transform active:scale-125 ${
                      post.isLiked ? 'text-ferrari-red' : 'text-secondary/60'
                    }`}
                  >
                    ❤️
                  </span>
                  <span className={post.isLiked ? 'text-ferrari-red font-bold' : ''}>
                    {post.likes}
                  </span>
                </button>
                <span className="text-xs text-secondary">
                  💬 {post.comments?.length || post.commentsCount || 0} 評論
                </span>
              </div>

              <span className="text-[10px] text-secondary">
                分享此動態 🔗
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
