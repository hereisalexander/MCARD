'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { CommunityFeedView } from '@/components/CommunityFeedView';
import { CardGrid } from '@/components/CardGrid';
import { SetsView } from '@/components/SetsView';
import { PortfolioDashboard, UserPortfolioItem, CardCondition } from '@/components/PortfolioDashboard';
import { CardDetailView } from '@/components/CardDetailView';
import { UniversalCard, CardCategory } from '@/services/multiCardService';
import { CardGrade, CardCategory as ContractCardCategory } from '@/contracts/common.schema';
import Link from 'next/link';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CardListing, isDemoListing, ListingStatus, INITIAL_MARKETPLACE_LISTINGS } from '@/types/marketplace';
import { MarketplaceView } from '@/components/MarketplaceView';
import { CreateListingModal } from '@/components/CreateListingModal';
import { ListingDetailModal } from '@/components/ListingDetailModal';
import { CardScannerModal } from '@/components/CardScannerModal';
import { WishlistItem, INITIAL_WISHLIST_ITEMS } from '@/types/wishlist';
import { WishlistView } from '@/components/WishlistView';
import { AddToWishlistModal } from '@/components/AddToWishlistModal';
import { VersusFloatBar } from '@/components/VersusFloatBar';
import { CardVersusModal } from '@/components/CardVersusModal';
import { AccountProfileView } from '@/components/AccountProfileView';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { portfolioRepository } from '@/services/portfolioRepository';
import { marketplaceRepository } from '@/services/marketplaceRepository';
import { VALID_TABS, normalizeNavigationTab } from '@/constants/navigation';

// Helper to resolve initial active tab from URL query param or localStorage
const getInitialActiveTab = (fallbackTab?: string): string => {
  if (fallbackTab) return normalizeNavigationTab(fallbackTab);
  if (typeof window === 'undefined') return 'stream';
  const urlParams = new URLSearchParams(window.location.search);
  const urlTab = urlParams.get('tab');
  const savedTab = localStorage.getItem('mcard_active_tab');

  return normalizeNavigationTab(urlTab || savedTab);
};

interface ToastState {
  show: boolean;
  message: string;
}

export interface HomeClientProps {
  initialTab?: string;
}

export const HomeClient: React.FC<HomeClientProps> = ({ initialTab }) => {
  const { t } = useLanguage();
  const { isLoggedIn, openAuthModal } = useAuth();
  
  // Tab state initialized strictly from server-resolved SSR initialTab
  const [activeTab, setActiveTab] = useState<string>(() => {
    return getInitialActiveTab(initialTab);
  });

  const handleTabChange = (nextTab: string) => {
    setSelectedDetailCard(null);
    const normalizedTab = nextTab === 'watchlist' ? 'wishlist' : nextTab;
    setActiveTab(normalizedTab);
    if (normalizedTab === 'explore') {
      setSelectedSetFilter('ALL');
    }
  };

  // 1. Listen to browser back/forward history navigation (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const tabFromUrl = currentParams.get('tab');
      if (tabFromUrl && (VALID_TABS as readonly string[]).includes(tabFromUrl)) {
        setActiveTab(tabFromUrl === 'watchlist' ? 'wishlist' : tabFromUrl);
      } else {
        setActiveTab('stream');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 2. Synchronize activeTab to URL Search Params & localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentUrl = new URL(window.location.href);
    const currentTabInUrl = currentUrl.searchParams.get('tab') || 'stream';

    if (activeTab !== currentTabInUrl) {
      if (activeTab === 'stream') {
        currentUrl.searchParams.delete('tab');
      } else {
        currentUrl.searchParams.set('tab', activeTab);
      }
      window.history.replaceState(null, '', currentUrl.pathname + currentUrl.search);
    }

    localStorage.setItem('mcard_active_tab', activeTab);
  }, [activeTab]);

  const [selectedCategory, setSelectedCategory] = useState<CardCategory>('all');
  const [portfolio, setPortfolio] = useState<UserPortfolioItem[]>([]);
  const [selectedSetFilter, setSelectedSetFilter] = useState<string>('ALL');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '' });
  
  // State for Full-Page Card Detail View
  const [selectedDetailCard, setSelectedDetailCard] = useState<UniversalCard | null>(null);

  // Marketplace State & Modal Controls
  const [listings, setListings] = useState<CardListing[]>(INITIAL_MARKETPLACE_LISTINGS);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState<boolean>(false);
  const [selectedListing, setSelectedListing] = useState<CardListing | null>(null);

  // Wishlist State & Modal
  const [wishlist, setWishlist] = useState<WishlistItem[]>(INITIAL_WISHLIST_ITEMS);
  const [wishlistModalCard, setWishlistModalCard] = useState<UniversalCard | null>(null);

  // Community Stream Search State
  const [streamSearchQuery, setStreamSearchQuery] = useState<string>('');

  // Versus / Comparison State & Modal
  const [comparedCards, setComparedCards] = useState<UniversalCard[]>([]);
  const [isVersusModalOpen, setIsVersusModalOpen] = useState<boolean>(false);

  // AI Camera Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scannerResetKey, setScannerResetKey] = useState<number>(0);

  const handleOpenScanner = () => {
    setIsScannerOpen(true);
    setScannerResetKey((prev) => prev + 1);
  };

  const [scannerListingPrefill, setScannerListingPrefill] = useState<{
    name?: string;
    category?: CardCategory;
    askingPrice?: number;
    condition?: string;
    photoUrl?: string;
    cardNumber?: string;
    setName?: string;
  } | null>(null);

  // Load portfolio, marketplace & wishlist from repositories & localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // 1. Load Portfolio via Repository (Zod validated)
      portfolioRepository.getAll().then((assets) => {
        if (assets && assets.length > 0) {
          setPortfolio(assets as unknown as UserPortfolioItem[]);
        }
      }).catch((e) => {
        console.error('Failed to load portfolio via repository:', e);
      });

      // 2. Load Marketplace Listings via Repository (Zod validated)
      marketplaceRepository.getAll().then((loadedListings) => {
        if (loadedListings) {
          const cleaned = (loadedListings as unknown as CardListing[]).filter(
            (item) => !isDemoListing(item)
          );
          setListings(cleaned);
        }
      }).catch((e) => {
        console.error('Failed to load marketplace listings via repository:', e);
      });

      // 3. Load Wishlist Items
      const savedWishlist = localStorage.getItem('mcard_wishlist_items');
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          if (Array.isArray(parsedWishlist)) {
            // Filter out legacy dummy demo items
            const cleaned = parsedWishlist.filter(
              (item: WishlistItem) => item.id !== 'wish-mewtwo-vstar' && item.id !== 'wish-luffy-gear5'
            );
            setWishlist(cleaned);
            if (cleaned.length !== parsedWishlist.length) {
              localStorage.setItem('mcard_wishlist_items', JSON.stringify(cleaned));
            }
          }
        } catch (e) {
          console.error('Failed to parse wishlist from localStorage', e);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save portfolio to localStorage & repository when changed
  const savePortfolio = (updated: UserPortfolioItem[]) => {
    setPortfolio(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pokemon_portfolio', JSON.stringify(updated));
      localStorage.setItem('mcard_portfolio_assets', JSON.stringify(updated));
    }
  };

  // Save marketplace listings to localStorage & repository safely
  const saveListings = (updated: CardListing[]) => {
    setListings(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mcard_marketplace_listings', JSON.stringify(updated));
      } catch (err) {
        console.warn('localStorage 配額限制，降級處理後重新寫入:', err);
        try {
          const lightweight = updated.map((item) => ({
            ...item,
            photos: item.photos.map((p) =>
              p.length > 2000 ? 'https://images.pokemontcg.io/sv3pt5/199_hires.png' : p
            ),
          }));
          localStorage.setItem('mcard_marketplace_listings', JSON.stringify(lightweight));
        } catch (innerErr) {
          console.error('無法儲存市集清單至 localStorage:', innerErr);
        }
      }
    }
  };

  // Save wishlist to localStorage
  const saveWishlist = (updated: WishlistItem[]) => {
    setWishlist(updated);
    localStorage.setItem('mcard_wishlist_items', JSON.stringify(updated));
  };

  // Wishlist Handlers
  const handleToggleWishlist = (card: UniversalCard) => {
    if (!isLoggedIn) {
      openAuthModal('請先登入帳號以追蹤心願卡牌。');
      return;
    }
    const existingIndex = wishlist.findIndex(
      (w) => w.cardName.toLowerCase() === card.name.toLowerCase()
    );
    if (existingIndex >= 0) {
      const updated = wishlist.filter((_, idx) => idx !== existingIndex);
      saveWishlist(updated);
      setToast({ show: true, message: '已移出願望清單' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    } else {
      setWishlistModalCard(card);
    }
  };

  const handleConfirmAddToWishlist = (newItem: WishlistItem) => {
    if (!isLoggedIn) {
      openAuthModal('請先登入帳號以加入心願追蹤清單。');
      return;
    }
    const updated = [newItem, ...wishlist];
    saveWishlist(updated);
    setToast({
      show: true,
      message: `已將「${newItem.cardName}」加入心願清單 (目標入手價 $${newItem.targetPrice} USD)`,
    });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const handleRemoveFromWishlist = (id: string) => {
    const updated = wishlist.filter((item) => item.id !== id);
    saveWishlist(updated);
    setToast({ show: true, message: '已移出願望清單' });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleUpdateWishlistItem = (updatedItem: WishlistItem) => {
    const updated = wishlist.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    saveWishlist(updated);
    setToast({ show: true, message: '已更新目標價格與備註' });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  // Versus / Compare Handlers
  const handleToggleCompare = (card: UniversalCard) => {
    const exists = comparedCards.some((c) => c.id === card.id);
    if (exists) {
      setComparedCards((prev) => prev.filter((c) => c.id !== card.id));
    } else {
      if (comparedCards.length >= 4) {
        setToast({ show: true, message: '最多同時對比 4 張卡牌' });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
        return;
      }
      setComparedCards((prev) => [...prev, card]);
      setToast({ show: true, message: `已將「${card.name}」加入多卡對比列` });
      setTimeout(() => setToast({ show: false, message: '' }), 2000);
    }
  };

  const handleRemoveComparedCard = (cardId: string) => {
    setComparedCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const handleClearCompare = () => {
    setComparedCards([]);
  };

  const handleLaunchCompare = () => {
    if (comparedCards.length >= 2) {
      setIsVersusModalOpen(true);
    }
  };

  const handleCreateListing = async (newListing: CardListing) => {
    // 確保即使未處於 Cloudflare D1 或離線狀態，本機也能立即上架顯示
    const updated = [newListing, ...listings];
    saveListings(updated);

    // 自動解除或對齊分類過濾，確保新上架商品第一時間呈現在螢幕上
    if (selectedCategory !== 'all' && selectedCategory !== newListing.category) {
      setSelectedCategory('all');
    }

    setToast({
      show: true,
      message: `已成功上架「${newListing.cardName}」到市場`,
    });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);

    try {
      const created = await marketplaceRepository.create(
        {
          cardName: newListing.cardName,
          category: (newListing.category as unknown as ContractCardCategory) || 'pokemon',
          setName: newListing.setName,
          officialPrice: newListing.officialPrice,
          askingPrice: newListing.askingPrice,
          condition: newListing.condition,
          photos: newListing.photos,
          notes: newListing.notes,
          location: newListing.location,
          contactPlatform: newListing.contactPlatform,
          contactValue: newListing.contactValue,
          buyInCost: newListing.buyInCost,
          portfolioCardId: newListing.portfolioCardId,
        },
        {
          name: newListing.sellerName,
          avatar: newListing.sellerAvatar,
        }
      );
      if (created) {
        setListings((prev) =>
          prev.map((item) => (item.id === newListing.id ? (created as unknown as CardListing) : item))
        );
      }
    } catch (e) {
      console.warn('同步上架商品至遠端 API 失敗，已安全儲存於本地備用:', e);
    }
  };

  const handleUpdateListingStatus = async (
    listingId: string,
    status: ListingStatus,
    soldPrice?: number,
    syncToPortfolio?: boolean
  ) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const targetListing = listings.find((l) => l.id === listingId);

    const updated = listings.map((item) =>
      item.id === listingId
        ? {
            ...item,
            status,
            soldPrice: soldPrice !== undefined ? soldPrice : item.askingPrice,
            soldAt: nowStr,
          }
        : item
    );
    saveListings(updated);

    if (selectedListing?.id === listingId) {
      setSelectedListing({
        ...selectedListing,
        status,
        soldPrice: soldPrice !== undefined ? soldPrice : selectedListing.askingPrice,
        soldAt: nowStr,
      });
    }

    if (status === 'sold' && syncToPortfolio && targetListing) {
      const matchedIdx = portfolio.findIndex(
        (p) =>
          (targetListing.portfolioCardId && p.id === targetListing.portfolioCardId) ||
          p.name.toLowerCase() === targetListing.cardName.toLowerCase()
      );

      if (matchedIdx >= 0) {
        const item = portfolio[matchedIdx];
        if (item.quantity && item.quantity > 1) {
          const updatedPortfolio = [...portfolio];
          updatedPortfolio[matchedIdx] = {
            ...item,
            quantity: item.quantity - 1,
          };
          savePortfolio(updatedPortfolio);
        } else {
          const updatedPortfolio = portfolio.filter((_, idx) => idx !== matchedIdx);
          savePortfolio(updatedPortfolio);
        }
      }

      setToast({
        show: true,
        message: `已成功結案！成交價 $${(soldPrice || targetListing.askingPrice).toLocaleString()} USD，並已自投資庫存扣除。`,
      });
      setTimeout(() => setToast({ show: false, message: '' }), 4000);
    }

    try {
      await marketplaceRepository.updateStatus(listingId, status, soldPrice);
    } catch (e) {
      console.error('更新市集狀態至 D1 失敗:', e);
    }
  };

  const handleUpdateListingPrice = async (listingId: string, newPrice: number) => {
    const updated = listings.map((item) =>
      item.id === listingId ? { ...item, askingPrice: newPrice } : item
    );
    saveListings(updated);
    if (selectedListing?.id === listingId) {
      setSelectedListing({ ...selectedListing, askingPrice: newPrice });
    }
    setToast({ show: true, message: `已將卡牌售價調整為 $${newPrice.toLocaleString()} USD` });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleDeleteListing = async (listingId: string) => {
    const updated = listings.filter((item) => item.id !== listingId);
    saveListings(updated);
    setSelectedListing(null);
    setToast({ show: true, message: '卡牌商品已成功下架' });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);

    try {
      await marketplaceRepository.delete(listingId);
    } catch (e) {
      console.error('刪除市集商品至 D1 失敗:', e);
    }
  };

  const handleAddCard = (
    name: string,
    price: number,
    imageUrl: string,
    condition: CardCondition = 'Ungraded',
    category: CardCategory = 'pokemon',
    buyPrice?: number,
    quantity?: number
  ) => {
    const actualBuyPrice = buyPrice !== undefined && buyPrice >= 0 ? buyPrice : price;
    const actualQuantity = quantity !== undefined && quantity > 0 ? quantity : 1;

    const existingIndex = portfolio.findIndex(
      (item) => item.name.toLowerCase() === name.toLowerCase() && (item.condition || 'Ungraded') === condition
    );

    let updatedPortfolio: UserPortfolioItem[];

    if (existingIndex >= 0) {
      const existing = portfolio[existingIndex];
      const newQty = (existing.quantity || 1) + actualQuantity;
      const existingTotalCost = (existing.buyPrice ?? existing.price) * (existing.quantity || 1);
      const newTotalCost = actualBuyPrice * actualQuantity;
      const weightedBuyPrice = Number(((existingTotalCost + newTotalCost) / newQty).toFixed(2));

      updatedPortfolio = [...portfolio];
      updatedPortfolio[existingIndex] = {
        ...existing,
        price,
        buyPrice: weightedBuyPrice,
        quantity: newQty,
        addedAt: new Date().toLocaleDateString('zh-TW'),
      };
    } else {
      const newCard: UserPortfolioItem = {
        id: `card-${Date.now()}`,
        name,
        price,
        imageUrl,
        addedAt: new Date().toLocaleDateString('zh-TW'),
        condition,
        category,
        buyPrice: actualBuyPrice,
        quantity: actualQuantity,
      };
      updatedPortfolio = [newCard, ...portfolio];
    }

    savePortfolio(updatedPortfolio);

    const safeCat: ContractCardCategory =
      category === 'all' ? 'pokemon' : (category as unknown as ContractCardCategory);

    portfolioRepository
      .add({
        cardId: `card-${Date.now()}`,
        name,
        category: safeCat,
        price,
        imageUrl,
        condition: condition as CardGrade,
        buyPrice: actualBuyPrice,
        quantity: actualQuantity,
      })
      .catch((e) => {
        console.error('儲存資產至 D1 失敗:', e);
      });

    setToast({
      show: true,
      message: `ADDED: ${name.toUpperCase()} (x${actualQuantity}) TO PORTFOLIO`,
    });
  };

  // AI Scanner Quick Action Handlers
  const handleScannerAddToVault = (cardData: {
    name: string;
    category: string;
    price: number | null;
    buyPrice: number;
    condition: string;
    imageUrl: string;
    cardNumber?: string;
    setName?: string;
  }) => {
    if (!isLoggedIn) {
      openAuthModal('請先登入帳號以將卡牌保存至個人收藏庫。');
      return;
    }
    handleAddCard(
      cardData.name,
      cardData.price || 0,
      cardData.imageUrl,
      (cardData.condition as CardCondition) || 'Ungraded',
      (cardData.category as CardCategory) || 'pokemon',
      cardData.buyPrice
    );
    setToast({
      show: true,
      message: `📸 AI 識卡成功！已將「${cardData.name}」存入資產庫`,
    });
  };

  const handleScannerCreateListing = (cardData: {
    name: string;
    category?: string;
    askingPrice: number;
    condition: string;
    photoUrl: string;
    cardNumber?: string;
    setName?: string;
  }) => {
    if (!isLoggedIn) {
      openAuthModal('請先登入帳號以將掃描卡牌刊登至二手市集。');
      return;
    }
    setScannerListingPrefill({
      name: cardData.name,
      category: (cardData.category as CardCategory) || 'pokemon',
      askingPrice: cardData.askingPrice,
      condition: cardData.condition,
      photoUrl: cardData.photoUrl,
      cardNumber: cardData.cardNumber,
      setName: cardData.setName,
    });
    setIsCreateListingOpen(true);
  };

  const handleRemoveCard = (id: string) => {
    const updated = portfolio.filter((item) => item.id !== id);
    savePortfolio(updated);
    portfolioRepository.remove(id).catch((e) => {
      console.error('從 D1 移除卡牌失敗:', e);
    });
  };

  const handleUpdateCard = (updatedItem: UserPortfolioItem) => {
    const updated = portfolio.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    savePortfolio(updated);
    portfolioRepository.update(updatedItem.id, {
      condition: updatedItem.condition as CardGrade,
      buyPrice: updatedItem.buyPrice,
      quantity: updatedItem.quantity,
    }).catch((e) => {
      console.error('更新 D1 資產失敗:', e);
    });
  };

  const handleImportPortfolio = (imported: UserPortfolioItem[]) => {
    const sanitized = imported.map((c) => ({
      ...c,
      id: c.id || `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      quantity: c.quantity && c.quantity > 0 ? c.quantity : 1,
      buyPrice: typeof c.buyPrice === 'number' ? c.buyPrice : c.price,
      condition: c.condition || 'Ungraded',
    }));
    savePortfolio(sanitized);
    setToast({
      show: true,
      message: `RESTORED ${sanitized.length} CARDS TO PORTFOLIO`,
    });
  };

  const handleSelectSetFromSets = (setName: string) => {
    setSelectedSetFilter(setName);
    handleTabChange('explore');
  };

  const handleSelectCardDetail = (card: UniversalCard) => {
    setSelectedDetailCard(card);
    if (card.category) {
      setSelectedCategory(card.category);
    }
  };

  const handleBackFromDetail = () => {
    setSelectedDetailCard(null);
  };

  const handleSelectCategory = (cat: CardCategory) => {
    setSelectedCategory(cat);
    if (selectedDetailCard) {
      setSelectedDetailCard(null);
    }
    setSelectedSetFilter('ALL');
  };

  // Hide toast after timeout
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Total Portfolio Market Value considering card quantities
  const portfolioValue = portfolio.reduce((acc, curr) => acc + (curr.price * (curr.quantity || 1)), 0);
  const portfolioItemCount = portfolio.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  return (
    <div className="flex flex-col min-h-screen min-h-dvh bg-background text-foreground transition-colors duration-200">
      <Navbar
        activeTab={selectedDetailCard ? 'explore' : activeTab}
        onTabChange={handleTabChange}
        portfolioCount={portfolioItemCount}
        portfolioValue={portfolioValue}
        selectedCategory={selectedCategory}
        onCategoryChange={handleSelectCategory}
        wishlistCount={wishlist.length}
        onOpenScanner={handleOpenScanner}
        searchQuery={activeTab === 'stream' ? streamSearchQuery : undefined}
        onSearchChange={(q) => {
          if (activeTab === 'stream') {
            setStreamSearchQuery(q);
          }
        }}
        onSelectSet={(setName) => {
          setSelectedCategory('pokemon');
          handleSelectSetFromSets(setName);
        }}
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-10 py-6 pb-32 md:pb-6">
        {/* Full Page Card Detail View when card is selected */}
        {selectedDetailCard ? (
          <CardDetailView
            card={selectedDetailCard}
            onBack={handleBackFromDetail}
            onAddCard={(name, price, img, cond, cat) => handleAddCard(name, price, img, cond, cat || selectedCategory)}
            onSelectCategory={handleSelectCategory}
            isInWishlist={wishlist.some(
              (w) => w.cardName.toLowerCase() === selectedDetailCard.name.toLowerCase()
            )}
            onToggleWishlist={handleToggleWishlist}
          />
        ) : (
          <>
            {activeTab === 'stream' && (
              <CommunityFeedView
                portfolio={portfolio}
                searchQuery={streamSearchQuery}
                onAddCardToPortfolio={(name, price, img) =>
                  handleAddCard(name, price, img, 'Ungraded', 'pokemon')
                }
                onNavigateToMarket={() => handleTabChange('market')}
                onNavigateToExplore={() => handleTabChange('explore')}
              />
            )}
            
            {activeTab === 'explore' && (
              <CardGrid
                category={selectedCategory}
                onSelectCategory={handleSelectCategory}
                onAddCard={(name, price, img, cond, cat) => handleAddCard(name, price, img, cond, cat || selectedCategory)}
                onSelectCardDetail={handleSelectCardDetail}
                initialSetFilter={selectedSetFilter}
                wishlistCardNames={wishlist.map((w) => w.cardName)}
                onToggleWishlist={handleToggleWishlist}
                comparedCardIds={comparedCards.map((c) => c.id)}
                onToggleCompare={handleToggleCompare}
              />
            )}

            {activeTab === 'wishlist' && (
              <WishlistView
                wishlist={wishlist}
                listings={listings}
                onRemoveFromWishlist={handleRemoveFromWishlist}
                onUpdateWishlistItem={handleUpdateWishlistItem}
                onNavigateToExplore={() => handleTabChange('explore')}
                onSelectMarketplaceListing={(listing) => {
                  setSelectedListing(listing);
                  handleTabChange('market');
                }}
              />
            )}

            {activeTab === 'sets' && (
              <SetsView portfolio={portfolio} onSelectSet={handleSelectSetFromSets} />
            )}

            {activeTab === 'showcase' && (
              <PortfolioDashboard
                portfolio={portfolio}
                onRemoveCard={handleRemoveCard}
                onUpdateCard={handleUpdateCard}
                onImportPortfolio={handleImportPortfolio}
                portfolioValue={portfolioValue}
                mode="showcase"
              />
            )}

            {activeTab === 'market' && (
              <MarketplaceView
                listings={listings}
                category={selectedCategory}
                onSelectCategory={handleSelectCategory}
                onOpenCreateListing={() => {
                  if (!isLoggedIn) {
                    openAuthModal('請先登入帳號以刊登商品至二手市集。');
                    return;
                  }
                  setIsCreateListingOpen(true);
                }}
                onSelectListing={(listing) => setSelectedListing(listing)}
                onUpdateListingStatus={handleUpdateListingStatus}
                onUpdateListingPrice={handleUpdateListingPrice}
                onDeleteListing={handleDeleteListing}
                portfolio={portfolio}
              />
            )}

            {activeTab === 'portfolio' && (
              <PortfolioDashboard
                portfolio={portfolio}
                onRemoveCard={handleRemoveCard}
                onUpdateCard={handleUpdateCard}
                onImportPortfolio={handleImportPortfolio}
                portfolioValue={portfolioValue}
                mode="portfolio"
                listings={listings}
                onNavigateToMarket={() => handleTabChange('market')}
                onOpenScanner={handleOpenScanner}
              />
            )}

            {activeTab === 'account' && (
              <AccountProfileView
                onNavigateToTab={handleTabChange}
                portfolioCount={portfolioItemCount}
                portfolioValue={portfolioValue}
                wishlistCount={wishlist.length}
                listingsCount={listings.filter((l) => l.status === 'active').length}
              />
            )}
          </>
        )}
      </main>

      {/* Telemetry Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-20 md:bottom-24 right-6 z-50 bg-surface text-foreground border border-hairline/80 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in">
          <span className="w-2 h-2 rounded-full bg-ferrari-red animate-ping" />
          <span className="font-sans text-xs font-semibold tracking-wide text-foreground">
            {toast.message}
          </span>
        </div>
      )}

      {/* Modern footer with Affiliate Disclosure */}
      <footer className="w-full border-t border-hairline/60 py-10 px-4 md:px-10 mt-16 mb-20 md:mb-24 bg-surface text-center transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-3.5 bg-ferrari-red" />
              <span className="font-sans text-[11px] tracking-[0.5px] text-text-muted">
                © 2026 MCARD. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 font-sans text-[11px] tracking-[0.5px] text-text-muted">
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors duration-150 cursor-pointer"
              >
                Terms
              </Link>
              <span>/</span>
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors duration-150 cursor-pointer"
              >
                Privacy
              </Link>
            </div>
          </div>

          {/* FTC & Merchant Affiliate Compliance Statement */}
          <div className="border-t border-hairline/40 pt-4 text-left">
            <p className="font-sans text-[10px] text-text-muted/80 leading-relaxed max-w-4xl">
              {t('affiliate_disclosure_footer')}
            </p>
          </div>
        </div>
      </footer>

      {/* Marketplace Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateListingOpen}
        onClose={() => {
          setIsCreateListingOpen(false);
          setScannerListingPrefill(null);
        }}
        portfolio={portfolio}
        onSubmitListing={handleCreateListing}
        onOpenScanner={handleOpenScanner}
        initialData={scannerListingPrefill}
      />

      {/* AI Camera Scanner Modal */}
      <CardScannerModal
        isOpen={isScannerOpen}
        resetKey={scannerResetKey}
        onClose={() => setIsScannerOpen(false)}
        onAddToVault={handleScannerAddToVault}
        onCreateListing={handleScannerCreateListing}
      />

      {/* Marketplace Listing Detail & Contact Modal */}
      <ListingDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onMarkAsSold={(id) => handleUpdateListingStatus(id, 'sold', undefined, true)}
        onDeleteListing={handleDeleteListing}
      />

      {/* Add To Wishlist Target Price Modal */}
      <AddToWishlistModal
        card={wishlistModalCard}
        isOpen={wishlistModalCard !== null}
        onClose={() => setWishlistModalCard(null)}
        onConfirmAdd={handleConfirmAddToWishlist}
        category={selectedCategory}
      />

      {/* Versus Comparison Floating Bar */}
      <VersusFloatBar
        selectedCards={comparedCards}
        onRemoveCard={handleRemoveComparedCard}
        onClearAll={handleClearCompare}
        onLaunchCompare={handleLaunchCompare}
      />

      {/* Versus Multi-Line Comparison Modal */}
      <CardVersusModal
        cards={comparedCards}
        isOpen={isVersusModalOpen}
        onClose={() => setIsVersusModalOpen(false)}
        onAddCardToPortfolio={(card) =>
          handleAddCard(card.name, card.price ?? 0, card.imageUrl, 'Ungraded', card.category)
        }
      />

      {/* Mobile Bottom Navigation Bar (Fixed bottom for mobile app experience) */}
      <MobileBottomNav
        activeTab={selectedDetailCard ? 'explore' : activeTab}
        onTabChange={handleTabChange}
        portfolioCount={portfolioItemCount}
        onOpenScanner={handleOpenScanner}
      />
    </div>
  );
};
