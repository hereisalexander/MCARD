'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UniversalCard, CardCategory } from '@/services/multiCardService';
import { CardDetailView } from '@/components/CardDetailView';
import { CardCondition } from '@/components/PortfolioDashboard';
import { LocalPortfolioRepository } from '@/services/portfolioRepository';
import { WishlistItem } from '@/types/wishlist';

interface CardDetailPageClientProps {
  card: UniversalCard | null;
}

const portfolioRepo = new LocalPortfolioRepository();
const WISHLIST_STORAGE_KEY = 'mcard_wishlist_items';

export const CardDetailPageClient: React.FC<CardDetailPageClientProps> = ({ card }) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // 檢查該卡牌是否已在藏家願望清單中
  useEffect(() => {
    if (!card) return;

    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (!raw) return;
      const parsed: WishlistItem[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const found = parsed.some(
          (item) => item.cardName.toLowerCase() === card.name.toLowerCase()
        );
        // 延遲至 Microtask 更新狀態，避免 React 19 級聯渲染警報
        queueMicrotask(() => {
          setIsInWishlist(found);
        });
      }
    } catch (err) {
      console.warn('[CardDetailPage] Failed to check wishlist status:', err);
    }
  }, [card]);

  // 定時清理 Toast 訊息通知
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleBackToExplore = () => {
    startTransition(() => {
      router.push('/');
    });
  };

  const handleSelectCategory = (category: CardCategory) => {
    startTransition(() => {
      router.push(`/?category=${category}`);
    });
  };

  const handleAddCardToPortfolio = async (
    cardName: string,
    price: number,
    imageUrl: string,
    condition: CardCondition,
    category?: CardCategory
  ) => {
    try {
      await portfolioRepo.add({
        cardId: card?.id || `card-${Date.now()}`,
        name: cardName,
        category: category || 'pokemon',
        price: price > 0 ? price : 0,
        buyPrice: price > 0 ? price : 0,
        quantity: 1,
        condition,
        imageUrl: imageUrl || 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
      });
      setNotification(`已成功將「${cardName}」以 ${condition} 品相加入您的資產庫！`);
    } catch (err) {
      console.error('[CardDetailPage] 新增資產失敗:', err);
      setNotification('新增資產至本地收藏庫時發生錯誤。');
    }
  };

  const handleToggleWishlist = (targetCard: UniversalCard) => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      let list: WishlistItem[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];

      const exists = list.some(
        (item) => item.cardName.toLowerCase() === targetCard.name.toLowerCase()
      );

      if (exists) {
        list = list.filter(
          (item) => item.cardName.toLowerCase() !== targetCard.name.toLowerCase()
        );
        setIsInWishlist(false);
        setNotification(`已從願望清單移除「${targetCard.name}」`);
      } else {
        const newItem: WishlistItem = {
          id: `wish-${Date.now()}`,
          cardId: targetCard.id,
          cardName: targetCard.name,
          category: targetCard.category,
          setName: targetCard.set,
          cardNumber: targetCard.number,
          targetPrice: targetCard.price ?? 50,
          baseMarketPrice: targetCard.price ?? 0,
          imageUrl: targetCard.imageUrl,
          addedAt: new Date().toISOString(),
          notes: '由獨立卡牌詳情頁直接追蹤',
        };
        list.push(newItem);
        setIsInWishlist(true);
        setNotification(`已將「${targetCard.name}」加入願望清單降價雷達！`);
      }

      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error('[CardDetailPage] 切換願望清單失敗:', err);
    }
  };

  // 卡片不存在或無效時的早退空狀態防護 (Early return)
  if (!card) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="w-full border-b border-hairline/60 bg-surface/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-ferrari-red rounded-lg"
              aria-label="MCARD 首頁"
              tabIndex={0}
            >
              <div className="w-8 h-8 rounded-lg bg-ferrari-red flex items-center justify-center font-black text-white text-base tracking-tighter">
                M
              </div>
              <span className="font-mono font-bold text-lg tracking-wider text-foreground">
                MCARD
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-3xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 rounded-full bg-surface-hover border border-hairline flex items-center justify-center text-3xl">
            🃏
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              未尋獲卡牌資料
            </h1>
            <p className="text-sm text-text-muted max-w-md">
              該卡牌編號可能不存在、或外部市場資料庫暫時無公開報價。
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-ferrari-red text-white text-sm font-semibold tracking-wide hover:bg-ferrari-red-hover transition-colors shadow-sm cursor-pointer"
            aria-label="返回全站市場探索"
            tabIndex={0}
          >
            返回全站市場探索
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-ferrari-red selection:text-white">
      {/* 獨立卡牌頁專屬頂部導覽列 */}
      <header className="w-full border-b border-hairline/80 bg-surface/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 md:px-10 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-ferrari-red rounded-lg"
              aria-label="MCARD 品牌首頁"
              tabIndex={0}
            >
              <div className="w-8 h-8 rounded-lg bg-ferrari-red flex items-center justify-center font-black text-white text-base tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-bold text-base tracking-wider text-foreground leading-none">
                  MCARD
                </span>
                <span className="text-[10px] text-text-muted font-mono tracking-tight">
                  TCG VAULT
                </span>
              </div>
            </Link>

            <div className="hidden sm:flex items-center gap-2 border-l border-hairline pl-6">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-hover text-text-muted text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                即時行情報價連線中
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/?tab=portfolio"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-hairline bg-surface text-foreground text-xs font-medium hover:bg-surface-hover hover:border-ferrari-red transition-all cursor-pointer shadow-2xs"
              aria-label="查看個人資產庫"
              tabIndex={0}
            >
              <span>查看個人資產</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-ferrari-red text-white text-xs font-semibold hover:bg-ferrari-red-hover transition-colors cursor-pointer shadow-xs"
              aria-label="回到全站探索"
              tabIndex={0}
            >
              <span>回到全站探索</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 浮動操作提示 Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300 pointer-events-none">
          <div className="rounded-xl bg-foreground text-background px-4 py-3 shadow-xl border border-hairline flex items-center gap-3 text-xs font-medium">
            <span className="text-ferrari-red font-bold">✓</span>
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* 獨立卡牌核心內容 */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-10 py-6 pb-24">
        <CardDetailView
          card={card}
          onBack={handleBackToExplore}
          onAddCard={handleAddCardToPortfolio}
          onSelectCategory={handleSelectCategory}
          isInWishlist={isInWishlist}
          onToggleWishlist={handleToggleWishlist}
        />
      </main>

      {/* 獨立頁頁尾簡易品牌宣告 */}
      <footer className="w-full border-t border-hairline/60 bg-surface py-6 text-center text-xs text-text-muted">
        <p className="font-mono text-[11px]">
          MCARD © {new Date().getFullYear()} — Pokémon TCG Market Telemetry & Vault
        </p>
      </footer>
    </div>
  );
};
