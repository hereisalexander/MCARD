'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CommunityPost,
  INITIAL_COMMUNITY_POSTS,
  CommunityComment,
} from '@/types/community';
import { CardTagInfo } from '@/contracts/community.schema';
import { UserPortfolioItem } from '@/components/PortfolioDashboard';
import { CreatePostModal } from '@/components/CreatePostModal';
import { CommunityPostDetailModal } from '@/components/CommunityPostDetailModal';
import { communityRepository } from '@/services/communityRepository';

export interface CommunityFeedViewProps {
  portfolio: UserPortfolioItem[];
  onAddCardToPortfolio: (cardName: string, price: number, imageUrl: string) => void;
  onNavigateToMarket?: () => void;
  onNavigateToExplore?: () => void;
}

const STORAGE_KEY = 'mcard_community_posts_v6';

export const CommunityFeedView: React.FC<CommunityFeedViewProps> = ({
  portfolio,
  onAddCardToPortfolio,
  onNavigateToMarket,
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [subFilter, setSubFilter] = useState<string>('綜合');
  const [searchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Load posts via communityRepository on mount & purge obsolete pure-card caches
  useEffect(() => {
    // 1. Purge obsolete local storage caches from earlier versions
    if (typeof window !== 'undefined') {
      ['mcard_community_posts_v1', 'mcard_community_posts_v2', 'mcard_community_posts_v3', 'mcard_community_posts_v4', 'mcard_community_posts_v5'].forEach(
        (key) => {
          try {
            localStorage.removeItem(key);
          } catch {}
        }
      );
    }

    communityRepository
      .getFeed()
      .then((loadedPosts) => {
        // 2. Filter out any obsolete pure digital card images (pokemontcg.io)
        const cleanUserPosts = (loadedPosts as unknown as CommunityPost[]).filter(
          (p) =>
            !p.imageUrl.includes('images.pokemontcg.io') &&
            !INITIAL_COMMUNITY_POSTS.some((init) => init.id === p.id)
        );

        const merged = [...cleanUserPosts, ...INITIAL_COMMUNITY_POSTS];
        setPosts(merged);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch (e) {
          console.error('Failed to update community cache', e);
        }
      })
      .catch((err) => {
        console.error('Failed to load community feed via repository:', err);
        setPosts(INITIAL_COMMUNITY_POSTS);
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
      list = list.filter(
        (p) => p.title.includes('30') || p.tags.some((t) => t.includes('30'))
      );
    } else if (subFilter === '拆包') {
      list = list.filter((p) => p.isVideo || p.type === 'showcase');
    } else if (subFilter === '卡牌' || subFilter === '寶可夢') {
      list = list.filter((p) =>
        p.tags.some((t) => t.includes('寶可夢') || t.includes('Pokemon'))
      );
    } else if (subFilter === '出清撿漏') {
      list = list.filter((p) => p.type === 'marketplace');
    } else if (subFilter === '手繪卡') {
      list = list.filter((p) =>
        p.tags.some((t) => t.includes('手繪') || t.includes('拼圖'))
      );
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

  // Xiaohongshu-style Adaptive Multi-Column Masonry (Mobile: 2 cols, Tablet: 3 cols, Desktop: 4 cols)
  const [columnCount, setColumnCount] = useState<number>(2);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setColumnCount(4);
      } else if (width >= 768) {
        setColumnCount(3);
      } else {
        setColumnCount(2);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const masonryColumns = useMemo(() => {
    const cols: CommunityPost[][] = Array.from({ length: columnCount }, () => []);
    displayedPosts.forEach((post, index) => {
      cols[index % columnCount].push(post);
    });
    return cols;
  }, [displayedPosts, columnCount]);

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
          prev.map((p) =>
            p.id === postId
              ? { ...p, isLiked: result.isLiked, likes: result.newLikes }
              : p
          )
        );
      }
    } catch (err) {
      console.error('持久化按讚至 D1 失敗:', err);
    }
  };

  const handleCreatePost = async (newPost: CommunityPost) => {
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
          cardInfo: newPost.cardInfo as unknown as CardTagInfo,
        },
        newPost.author
      );

      if (created) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === newPost.id ? (created as unknown as CommunityPost) : p
          )
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
      setVisibleCount((prev) => prev + 8);
      setIsLoadingMore(false);
    }, 300);
  };

  const renderPostCard = (post: CommunityPost, colIdx = 0, postIdx = 0) => {
    // Staggered Height Algorithm: Left column starts compact, right column starts tall.
    // Creates an authentic Xiaohongshu 90px~110px dynamic vertical offset!
    const getCoverHeightClass = () => {
      if (post.aspectRatio === 'tall') return 'h-[255px] sm:h-[295px]';
      if (post.aspectRatio === 'square') return 'h-[165px] sm:h-[190px]';
      if (post.aspectRatio === 'wide') return 'h-[145px] sm:h-[170px]';

      // Checkerboard stagger: (colIdx + postIdx) % 2 determines tall vs compact
      const isTall = (colIdx + postIdx) % 2 === 1;
      return isTall ? 'h-[255px] sm:h-[295px]' : 'h-[165px] sm:h-[190px]';
    };

    return (
      <article
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
        className="group bg-surface rounded-2xl overflow-hidden border border-hairline/60 hover:border-hairline shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col focus:outline-hidden focus:ring-2 focus:ring-ferrari-red/40"
      >
        {/* Card Visual Container: Enhanced Staggered Height (Xiaohongshu Flow) */}
        <div
          className={`relative w-full ${getCoverHeightClass()} bg-gradient-to-b from-hairline/20 to-hairline/50 dark:from-neutral-900/60 dark:to-neutral-950/80 overflow-hidden transition-all duration-300 ${
            post.imageUrl.includes('unsplash') || post.imageUrl.startsWith('blob:')
              ? ''
              : 'p-2.5 sm:p-3 flex items-center justify-center'
          }`}
        >
          <img
            src={post.imageUrl}
            alt={post.title}
            loading="lazy"
            className={
              post.imageUrl.includes('unsplash') || post.imageUrl.startsWith('blob:')
                ? 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                : 'max-h-full max-w-full w-auto h-auto object-contain rounded-md drop-shadow-md group-hover:scale-104 transition-transform duration-300'
            }
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800&auto=format&fit=crop&q=80';
            }}
          />

          {/* Video indicator badge */}
          {post.isVideo && (
            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono flex items-center gap-1 shadow-xs">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {post.videoDuration && <span>{post.videoDuration}</span>}
            </div>
          )}
        </div>

        {/* Text Details Area: Unconstrained tight fit */}
        <div className="p-3 flex flex-col gap-2">
          <div>
            {/* Title with clean clamp */}
            <h3 className="text-xs sm:text-[13px] font-semibold text-foreground line-clamp-2 leading-snug tracking-tight mb-1 group-hover:text-ferrari-red transition-colors">
              {post.title}
            </h3>

            {/* Optional snippet preview */}
            {post.content && (
              <p className="text-[11px] text-text-muted line-clamp-1 mb-2 font-normal leading-normal">
                {post.content}
              </p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 2).map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] text-text-muted bg-hairline/40 px-1.5 py-0.5 rounded font-normal hover:text-foreground transition-colors"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Bar: Author info + Like Heart */}
          <div className="flex items-center justify-between pt-2 border-t border-hairline/40">
            {/* Left: Author Avatar + Name + Date */}
            <div className="flex items-center gap-1.5 min-w-0 pr-1">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-5 h-5 rounded-full object-cover shrink-0 border border-hairline/60"
              />
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-[11px] font-medium text-foreground truncate max-w-[90px] sm:max-w-[120px]">
                  {post.author.name}
                </span>
                <span className="text-[9px] text-text-muted font-sans">
                  {post.date || '09-18'}
                </span>
              </div>
            </div>

            {/* Right: Heart Like Button */}
            <button
              type="button"
              aria-label="點讚"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleLike(post.id);
              }}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-ferrari-red transition-colors shrink-0 p-1 cursor-pointer"
            >
              {post.isLiked ? (
                <svg className="w-3.5 h-3.5 text-ferrari-red" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 hover:text-ferrari-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
              <span className={`text-[11px] font-mono leading-none ${post.isLiked ? 'text-ferrari-red font-bold' : 'text-text-muted'}`}>
                {post.likes}
              </span>
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="max-w-[1320px] mx-auto space-y-4 animate-fade-in pb-12 px-2 sm:px-4">
      {/* Filter Pills & Quick Post Action */}
      <div className="flex items-center justify-between gap-3 py-1">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 py-1">
          {['綜合', '最新', '寶可夢', '30周年', '拆包', '科普', '出清撿漏', '手繪卡'].map(
            (pill) => {
              const isSelected = subFilter === pill;
              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setSubFilter(pill)}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer ${isSelected
                      ? 'bg-foreground text-background font-bold shadow-2xs'
                      : 'bg-surface hover:bg-hairline/50 text-text-muted border border-hairline/60'
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
          className="shrink-0 px-4 py-1.5 bg-ferrari-red hover:bg-ferrari-red-hover text-white rounded-full text-xs font-semibold shadow-xs transition-all transform active:scale-95 cursor-pointer"
        >
          發布動態
        </button>
      </div>

      {/* Adaptive Responsive Multi-Column Feed */}
      {displayedPosts.length === 0 ? (
        <div className="py-20 text-center bg-surface rounded-2xl border border-hairline/60">
          <p className="text-3xl mb-2">🔍</p>
          <h3 className="text-sm font-bold text-foreground">暫無相關帖子</h3>
          <p className="text-xs text-text-muted mt-1">試試切換其他分類標籤</p>
          <button
            type="button"
            onClick={() => setSubFilter('綜合')}
            className="mt-4 px-4 py-1.5 bg-hairline/60 text-foreground text-xs font-medium rounded-full cursor-pointer hover:bg-hairline transition-colors"
          >
            回到綜合
          </button>
        </div>
      ) : (
        <div>
          {/* Xiaohongshu Staggered Multi-Column Masonry Flow */}
          <div
            className="grid gap-3 sm:gap-4.5 items-start"
            style={{
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            }}
          >
            {masonryColumns.map((colPosts, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-3 sm:gap-4.5">
                {colPosts.map((post, postIdx) => renderPostCard(post, colIdx, postIdx))}
              </div>
            ))}
          </div>

          {/* Infinite Scroll / Load More Sentinel */}
          {visibleCount < filteredPosts.length && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-5 py-2 bg-surface hover:bg-hairline/40 text-foreground border border-hairline/60 rounded-full text-xs font-medium shadow-2xs transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                {isLoadingMore ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-ferrari-red animate-ping" />
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
