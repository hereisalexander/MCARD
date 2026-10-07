'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CommunityPost,
  CommunityPostType,
  INITIAL_COMMUNITY_POSTS,
  CommunityComment,
} from '@/types/community';
import { UserPortfolioItem } from '@/components/PortfolioDashboard';
import { CreatePostModal } from '@/components/CreatePostModal';
import { CommunityPostDetailModal } from '@/components/CommunityPostDetailModal';
import { useLanguage } from '@/context/LanguageContext';
import { communityRepository } from '@/services/communityRepository';

export interface CommunityFeedViewProps {
  portfolio: UserPortfolioItem[];
  onAddCardToPortfolio: (cardName: string, price: number, imageUrl: string) => void;
  onNavigateToMarket?: () => void;
  onNavigateToExplore?: () => void;
}

const STORAGE_KEY = 'mcard_community_posts_v3';

export const CommunityFeedView: React.FC<CommunityFeedViewProps> = ({
  portfolio,
  onAddCardToPortfolio,
  onNavigateToMarket,
  onNavigateToExplore,
}) => {
  const { t } = useLanguage();

  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  

  // Sub Level 2 Pills (Xiaohongshu style)
  const [subFilter, setSubFilter] = useState<string>('綜合');
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Load posts via communityRepository on mount
  useEffect(() => {
    communityRepository.getFeed().then((loadedPosts) => {
      if (loadedPosts && loadedPosts.length > 0) {
        setPosts(loadedPosts as unknown as CommunityPost[]);
      }
    }).catch((err) => {
      console.error('Failed to load community feed via repository:', err);
    });
  }, []);

  const savePosts = (updated: CommunityPost[]) => {
    setPosts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save community posts', e);
    }
  };

  // Filter posts based on SubFilter Pills and search
  const filteredPosts = useMemo(() => {
    let list = posts;


    if (subFilter === '最新') {
      list = [...list].reverse();
    } else if (subFilter === '30周年') {
      list = list.filter((p) =>
        p.title.includes('30') || p.tags.some((t) => t.includes('30'))
      );
    } else if (subFilter === '拆包') {
      list = list.filter((p) => p.isVideo || p.type === 'showcase');
    } else if (subFilter === '卡牌' || subFilter === '寶可夢') {
      list = list.filter((p) => p.tags.some((t) => t.includes('寶可夢') || t.includes('Pokemon')));
    } else if (subFilter === '出清撿漏') {
      list = list.filter((p) => p.type === 'marketplace');
    } else if (subFilter === '手繪卡') {
      list = list.filter((p) => p.tags.some((t) => t.includes('手繪') || t.includes('拼圖')));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return list;
  }, [posts, subFilter, searchQuery]);

  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  // Dual-Column Masonry Split
  const [leftColumn, rightColumn] = useMemo(() => {
    const left: CommunityPost[] = [];
    const right: CommunityPost[] = [];
    displayedPosts.forEach((post, index) => {
      if (index % 2 === 0) {
        left.push(post);
      } else {
        right.push(post);
      }
    });
    return [left, right];
  }, [displayedPosts]);

  const handleToggleLike = async (postId: string) => {
    const postToToggle = posts.find((p) => p.id === postId);
    if (!postToToggle) return;

    const currentlyLiked = Boolean(postToToggle.isLiked);
    const updated = posts.map((post) => {
      if (post.id !== postId) return post;
      return {
        ...post,
        isLiked: !currentlyLiked,
        likes: currentlyLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
      };
    });
    savePosts(updated);

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        isLiked: !currentlyLiked,
        likes: currentlyLiked ? Math.max(0, selectedPost.likes - 1) : selectedPost.likes + 1,
      });
    }

    try {
      const result = await communityRepository.toggleLike(postId);
      if (result) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isLiked: result.isLiked, likes: result.newLikes } : p))
        );
      }
    } catch (err) {
      console.error('持久化按讚至 D1 失敗:', err);
    }
  };

  const handleCreatePost = async (newPost: CommunityPost) => {
    // 樂觀更新前端畫面
    const updated = [newPost, ...posts];
    savePosts(updated);

    try {
      const created = await communityRepository.createPost(
        {
          title: newPost.title,
          content: newPost.content,
          type: newPost.type,
          imageUrl: newPost.imageUrl,
          tags: newPost.tags,
          cardInfo: newPost.cardInfo as any,
        },
        newPost.author
      );

      if (created) {
        // 以後端 D1 回傳之最新記錄 (含正式伺服器 ID) 更新列表
        setPosts((prev) =>
          prev.map((p) => (p.id === newPost.id ? (created as unknown as CommunityPost) : p))
        );
      }
    } catch (err) {
      console.error('發布貼文至 D1 失敗:', err);
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    const tempComment: CommunityComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      authorName: '我 (VIP 藏家)',
      authorAvatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      content: commentText,
      createdAt: '剛剛',
    };

    const updated = posts.map((post) => {
      if (post.id !== postId) return post;
      const comments = post.comments ? [tempComment, ...post.comments] : [tempComment];
      return {
        ...post,
        comments,
        commentsCount: comments.length,
      };
    });

    savePosts(updated);

    if (selectedPost && selectedPost.id === postId) {
      const comments = selectedPost.comments ? [tempComment, ...selectedPost.comments] : [tempComment];
      setSelectedPost({
        ...selectedPost,
        comments,
        commentsCount: comments.length,
      });
    }

    try {
      const createdComment = await communityRepository.addComment(postId, commentText, {
        name: tempComment.authorName,
        avatar: tempComment.authorAvatar,
      });
      if (createdComment) {
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id !== postId) return post;
            return {
              ...post,
              comments: post.comments?.map((c) =>
                c.id === tempComment.id ? (createdComment as unknown as CommunityComment) : c
              ),
            };
          })
        );
      }
    } catch (err) {
      console.error('新增留言至 D1 失敗:', err);
    }
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 6);
      setIsLoadingMore(false);
    }, 400);
  };

  const renderPostCard = (post: CommunityPost) => {
    // Dynamic aspect ratios for genuine Xiaohongshu staggered waterfall rhythm
    const aspectClass =
      post.aspectRatio === 'tall'
        ? 'aspect-[3/4.4]'
        : post.aspectRatio === 'wide'
        ? 'aspect-[4/3]'
        : post.aspectRatio === 'square'
        ? 'aspect-square'
        : 'aspect-[3/3.8]';

    return (
      <div
        key={post.id}
        tabIndex={0}
        role="button"
        aria-label={`查看貼文: ${post.title}`}
        onClick={() => setSelectedPost(post)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedPost(post);
          }
        }}
        className="group mb-3 bg-surface rounded-2xl overflow-hidden border border-hairline/40 hover:border-hairline shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
      >
        {/* Card Visual / Video Area with true staggered aspect ratio */}
        <div className={`relative w-full overflow-hidden bg-black/5 dark:bg-black/20 ${aspectClass}`}>
          <img
            src={post.imageUrl}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.pokemontcg.io/sv3pt5/199_hires.png';
            }}
          />

          {/* Video indicator badges (like screenshot) */}
          {post.isVideo && (
            <>
              {/* Play Icon Top Right */}
              <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white">
                <svg className="w-3 h-3 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              {/* Video Duration Bottom Right */}
              {post.videoDuration && (
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono leading-none backdrop-blur-xs">
                  {post.videoDuration}
                </div>
              )}
            </>
          )}

          {/* Optional Marketplace badge */}
          {post.type === 'marketplace' && post.cardInfo?.price && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[10px] font-bold shadow-sm">
              ${post.cardInfo.price} USD
            </div>
          )}
        </div>

        {/* Text Details Area */}
        <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1">
          <div>
            {/* Title with Xiaohongshu typography */}
            <h3 className="text-xs sm:text-[13px] font-medium text-foreground line-clamp-2 leading-snug tracking-tight mb-1.5 group-hover:text-rose-500 transition-colors">
              {post.title}
            </h3>

            {/* Subtle Tag Pills to naturally enhance height variation */}
            {post.tags && post.tags.length > 0 && post.aspectRatio !== 'wide' && (
              <div className="flex flex-wrap gap-1 mb-2">
                {post.tags.slice(0, 2).map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] text-secondary/70 bg-hairline/30 px-1.5 py-0.5 rounded font-normal"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Bar: 2-Line Author Info (Left) + Heart Like (Right) */}
          <div className="flex items-center justify-between pt-1 border-t border-hairline/30">
            {/* Left: Author Avatar + Name + Date */}
            <div className="flex items-center gap-1.5 min-w-0 pr-1">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-5 h-5 rounded-full object-cover shrink-0 border border-hairline/60"
              />
              <div className="flex flex-col min-w-0 leading-none">
                <span className="text-[11px] font-normal text-foreground/90 truncate max-w-[85px] sm:max-w-[110px]">
                  {post.author.name}
                </span>
                <span className="text-[9px] text-secondary/60 mt-0.5 font-sans">
                  {post.date || '09-18'}
                </span>
              </div>
            </div>

            {/* Right: Heart Like Button with Count */}
            <button
              type="button"
              aria-label="點讚"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleLike(post.id);
              }}
              className="flex items-center gap-1 text-xs text-secondary hover:text-rose-500 transition-colors shrink-0 p-1"
            >
              {post.isLiked ? (
                <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-secondary/70 hover:text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
              <span className={`text-[11px] font-mono leading-none ${post.isLiked ? 'text-rose-500 font-bold' : 'text-secondary/80'}`}>
                {post.likes}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1100px] mx-auto space-y-3 animate-fade-in pb-12">
      {/* Filter Pills & Quick Post Action */}
      <div className="flex items-center justify-between gap-2 py-1 px-1">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
          {['綜合', '最新', '寶可夢', '30周年', '拆包', '科普', '出清撿漏', '手繪卡'].map(
            (pill) => {
              const isSelected = subFilter === pill;
              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setSubFilter(pill)}
                  className={`px-3.5 py-1 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-foreground text-background font-bold shadow-2xs'
                      : 'bg-surface hover:bg-hairline/50 text-secondary border border-hairline/40'
                  }`}
                >
                  {pill}
                </button>
              );
            }
          )}
        </div>

        {/* Right Quick Post Action Button */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="shrink-0 flex items-center gap-1 px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
        >
          <span>✏️</span>
          <span>發文</span>
        </button>
      </div>


      {/* 3. Dual-Column Masonry Feed (Xiaohongshu Layout) */}
      {displayedPosts.length === 0 ? (
        <div className="py-20 text-center bg-surface rounded-2xl border border-hairline/60">
          <p className="text-2xl mb-1">🔍</p>
          <h3 className="text-sm font-bold text-foreground">暫無相關帖子</h3>
          <p className="text-xs text-secondary mt-1">試試切換其他分類標籤</p>
          <button
            type="button"
            onClick={() => setSubFilter('綜合')}
            className="mt-3 px-4 py-1.5 bg-hairline/60 text-foreground text-xs font-medium rounded-full"
          >
            回到綜合
          </button>
        </div>
      ) : (
        <div>
          {/* Dual-column split grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 items-start">
            {/* Left Column */}
            <div className="flex flex-col">
              {leftColumn.map(renderPostCard)}
            </div>

            {/* Right Column */}
            <div className="flex flex-col">
              {rightColumn.map(renderPostCard)}
            </div>
          </div>

          {/* Infinite Scroll / Load More Sentinel */}
          {visibleCount < filteredPosts.length && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-5 py-2 bg-surface hover:bg-hairline/40 text-foreground border border-hairline/50 rounded-full text-xs font-medium shadow-2xs transition-all transform active:scale-95 flex items-center gap-1.5"
              >
                {isLoadingMore ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>加載中...</span>
                  </>
                ) : (
                  <span>加載更多貼文</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        portfolio={portfolio}
        onSubmitPost={handleCreatePost}
      />

      <CommunityPostDetailModal
        post={selectedPost}
        isOpen={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        onToggleLike={handleToggleLike}
        onAddComment={handleAddComment}
        onQuickAddToPortfolio={onAddCardToPortfolio}
        onNavigateToMarket={onNavigateToMarket}
      />
    </div>
  );
};
