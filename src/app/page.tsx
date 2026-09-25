'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { PaddockTelemetry } from '@/components/PaddockTelemetry';
import { CardGrid } from '@/components/CardGrid';
import { SetsView } from '@/components/SetsView';
import { PortfolioDashboard, UserPortfolioItem, CardCondition } from '@/components/PortfolioDashboard';
import { CardDetailView } from '@/components/CardDetailView';
import { UniversalCard, CardCategory } from '@/services/multiCardService';
import { FooterModals, FooterModalType } from '@/components/FooterModals';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CardListing, INITIAL_MARKETPLACE_LISTINGS, ListingStatus } from '@/types/marketplace';
import { MarketplaceView } from '@/components/MarketplaceView';
import { CreateListingModal } from '@/components/CreateListingModal';
import { ListingDetailModal } from '@/components/ListingDetailModal';
import { WishlistItem, INITIAL_WISHLIST_ITEMS } from '@/types/wishlist';
import { WishlistView } from '@/components/WishlistView';
import { AddToWishlistModal } from '@/components/AddToWishlistModal';
import { VersusFloatBar } from '@/components/VersusFloatBar';
import { CardVersusModal } from '@/components/CardVersusModal';
import { useLanguage } from '@/context/LanguageContext';

interface ToastState {
  show: boolean;
  message: string;
}

export default function Home() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('stream');
  const [selectedCategory, setSelectedCategory] = useState<CardCategory>('all');
  const [portfolio, setPortfolio] = useState<UserPortfolioItem[]>([]);
  const [selectedSetFilter, setSelectedSetFilter] = useState<string>('ALL');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '' });
  const [footerModal, setFooterModal] = useState<FooterModalType>(null);
  
  // State for Full-Page Card Detail View
  const [selectedDetailCard, setSelectedDetailCard] = useState<UniversalCard | null>(null);

  // Marketplace State & Modal Controls
  const [listings, setListings] = useState<CardListing[]>(INITIAL_MARKETPLACE_LISTINGS);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState<boolean>(false);
  const [selectedListing, setSelectedListing] = useState<CardListing | null>(null);

  // Wishlist State & Modal
  const [wishlist, setWishlist] = useState<WishlistItem[]>(INITIAL_WISHLIST_ITEMS);
  const [wishlistModalCard, setWishlistModalCard] = useState<UniversalCard | null>(null);

  // Versus / Comparison State & Modal
  const [comparedCards, setComparedCards] = useState<UniversalCard[]>([]);
  const [isVersusModalOpen, setIsVersusModalOpen] = useState<boolean>(false);

  // Load portfolio, marketplace & wishlist from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // 1. Load Portfolio
      const savedPortfolio = localStorage.getItem('pokemon_portfolio');
      if (savedPortfolio) {
        try {
          const parsed = JSON.parse(savedPortfolio);
          if (Array.isArray(parsed)) {
            const migrated: UserPortfolioItem[] = parsed.map((item: Partial<UserPortfolioItem>) => ({
              id: item.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: item.name || 'Unknown Card',
              category: item.category || 'pokemon',
              price: item.price || 0,
              buyPrice: item.buyPrice ?? item.price ?? 0,
              quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
              condition: item.condition || 'Ungraded',
              imageUrl: item.imageUrl || 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
              addedAt: item.addedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            }));
            setPortfolio(migrated);
          }
        } catch (e) {
          console.error('Failed to parse portfolio from localStorage', e);
        }
      }

      // 2. Load Marketplace Listings
      const savedListings = localStorage.getItem('mcard_marketplace_listings');
      if (savedListings) {
        try {
          const parsedListings = JSON.parse(savedListings);
          if (Array.isArray(parsedListings) && parsedListings.length > 0) {
            setListings(parsedListings);
          }
        } catch (e) {
          console.error('Failed to parse listings from localStorage', e);
        }
      }

      // 3. Load Wishlist Items
      const savedWishlist = localStorage.getItem('mcard_wishlist_items');
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          if (Array.isArray(parsedWishlist) && parsedWishlist.length > 0) {
            setWishlist(parsedWishlist);
          }
        } catch (e) {
          console.error('Failed to parse wishlist from localStorage', e);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save portfolio to localStorage when changed
  const savePortfolio = (updated: UserPortfolioItem[]) => {
    setPortfolio(updated);
    localStorage.setItem('pokemon_portfolio', JSON.stringify(updated));
  };

  // Save marketplace listings to localStorage
  const saveListings = (updated: CardListing[]) => {
    setListings(updated);
    localStorage.setItem('mcard_marketplace_listings', JSON.stringify(updated));
  };

  // Save wishlist to localStorage
  const saveWishlist = (updated: WishlistItem[]) => {
    setWishlist(updated);
    localStorage.setItem('mcard_wishlist_items', JSON.stringify(updated));
  };

  // Wishlist Handlers
  const handleToggleWishlist = (card: UniversalCard) => {
    const existingIndex = wishlist.findIndex(
      (w) => w.cardName.toLowerCase() === card.name.toLowerCase()
    );
    if (existingIndex >= 0) {
      const updated = wishlist.filter((_, idx) => idx !== existingIndex);
      saveWishlist(updated);
      setToast({ show: true, message: `已將「${card.name}」移出願望清單` });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    } else {
      setWishlistModalCard(card);
    }
  };

  const handleConfirmAddToWishlist = (newItem: WishlistItem) => {
    const updated = [newItem, ...wishlist];
    saveWishlist(updated);
    setToast({
      show: true,
      message: `已將「${newItem.cardName}」加入心願清單 (目標入手價 $${newItem.targetPrice} USD)`,
    });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const handleRemoveFromWishlist = (id: string) => {
    const updated = wishlist.filter((w) => w.id !== id);
    saveWishlist(updated);
    setToast({ show: true, message: '已移出願望清單' });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleUpdateWishlistItem = (updatedItem: WishlistItem) => {
    const updated = wishlist.map((w) => (w.id === updatedItem.id ? updatedItem : w));
    saveWishlist(updated);
    setToast({ show: true, message: '已更新目標價格與備註' });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  // Versus Handlers
  const handleToggleCompare = (card: UniversalCard) => {
    const exists = comparedCards.some((c) => c.id === card.id);
    if (exists) {
      setComparedCards(comparedCards.filter((c) => c.id !== card.id));
    } else {
      if (comparedCards.length >= 4) {
        setToast({ show: true, message: '最多同時對比 4 張卡牌' });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
        return;
      }
      setComparedCards([...comparedCards, card]);
      setToast({ show: true, message: `已將「${card.name}」加入走勢對比欄` });
      setTimeout(() => setToast({ show: false, message: '' }), 2500);
    }
  };

  const handleRemoveComparedCard = (cardId: string) => {
    setComparedCards(comparedCards.filter((c) => c.id !== cardId));
  };

  const handleClearCompare = () => {
    setComparedCards([]);
  };

  const handleLaunchCompare = () => {
    if (comparedCards.length >= 2) {
      setIsVersusModalOpen(true);
    }
  };

  const handleCreateListing = (newListing: CardListing) => {
    const updated = [newListing, ...listings];
    saveListings(updated);
    setToast({
      show: true,
      message: `已成功上架「${newListing.cardName}」到市場`,
    });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const handleUpdateListingStatus = (
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

    // Sync sold profit and deduct quantity from Portfolio if requested
    if (syncToPortfolio && status === 'sold' && targetListing) {
      const matchedIndex = portfolio.findIndex(
        (p) =>
          p.id === targetListing.portfolioCardId ||
          p.name.toLowerCase() === targetListing.cardName.toLowerCase()
      );
      if (matchedIndex !== -1) {
        const item = portfolio[matchedIndex];
        if (item.quantity > 1) {
          const updatedPortfolio = [...portfolio];
          updatedPortfolio[matchedIndex] = { ...item, quantity: item.quantity - 1 };
          savePortfolio(updatedPortfolio);
        } else {
          const updatedPortfolio = portfolio.filter((_, idx) => idx !== matchedIndex);
          savePortfolio(updatedPortfolio);
        }
      }
    }

    setToast({
      show: true,
      message: `已成功結案！成交價 $${(soldPrice || targetListing?.askingPrice || 0).toLocaleString()} USD`,
    });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const handleUpdateListingPrice = (listingId: string, newPrice: number) => {
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

  const handleDeleteListing = (listingId: string) => {
    const updated = listings.filter((item) => item.id !== listingId);
    saveListings(updated);
    setSelectedListing(null);
    setToast({ show: true, message: '卡牌商品已成功下架' });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleAddCard = (
    cardName: string,
    price: number,
    imageUrl: string,
    condition: CardCondition = 'Ungraded',
    category: CardCategory = 'pokemon',
    buyPrice?: number
  ) => {
    const cost = buyPrice !== undefined ? buyPrice : price;
    
    // Check if exact same card & condition already exists in portfolio
    const existingIndex = portfolio.findIndex(
      (item) => item.name === cardName && (item.condition || 'Ungraded') === condition
    );

    if (existingIndex >= 0) {
      const updated = [...portfolio];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: (updated[existingIndex].quantity || 1) + 1,
      };
      savePortfolio(updated);
    } else {
      const newItem: UserPortfolioItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: cardName,
        category,
        price,
        buyPrice: cost,
        quantity: 1,
        condition,
        imageUrl,
        addedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
      const updated = [newItem, ...portfolio];
      savePortfolio(updated);
    }
    
    // Show telemetry toast
    setToast({
      show: true,
      message: `ADDED: ${cardName.toUpperCase()} TO PORTFOLIO`,
    });
  };

  const handleRemoveCard = (id: string) => {
    const updated = portfolio.filter((item) => item.id !== id);
    savePortfolio(updated);
  };

  const handleUpdateCard = (updatedItem: UserPortfolioItem) => {
    const updated = portfolio.map((item) => (item.id === updatedItem.id ? updatedItem : item));
    savePortfolio(updated);
  };

  const handleImportPortfolio = (importedItems: UserPortfolioItem[]) => {
    const sanitized: UserPortfolioItem[] = importedItems.map((item) => ({
      id: item.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: item.name || 'Imported Card',
      category: item.category || 'pokemon',
      price: item.price || 0,
      buyPrice: item.buyPrice ?? item.price ?? 0,
      quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
      condition: item.condition || 'Ungraded',
      imageUrl: item.imageUrl || '',
      addedAt: item.addedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));
    savePortfolio(sanitized);
    setToast({
      show: true,
      message: `RESTORED ${sanitized.length} CARDS TO PORTFOLIO`,
    });
  };

  const handleSelectSetFromSets = (setName: string) => {
    setSelectedSetFilter(setName);
    setSelectedDetailCard(null);
    setActiveTab('explore');
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
    setSelectedDetailCard(null);
    setActiveTab('explore');
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
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar
        activeTab={selectedDetailCard ? 'explore' : activeTab}
        onTabChange={(tab) => {
          setSelectedDetailCard(null);
          setActiveTab(tab);
          if (tab === 'explore') {
            setSelectedSetFilter('ALL');
          }
        }}
        portfolioCount={portfolioItemCount}
        portfolioValue={portfolioValue}
        selectedCategory={selectedCategory}
        onCategoryChange={handleSelectCategory}
        wishlistCount={wishlist.length}
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
              <PaddockTelemetry
                onAddCard={(name, price, img) => handleAddCard(name, price, img, 'Ungraded', 'pokemon')}
                onExploreClick={() => setActiveTab('explore')}
                onPortfolioClick={() => setActiveTab('portfolio')}
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
                onNavigateToExplore={() => setActiveTab('explore')}
                onSelectMarketplaceListing={(listing) => {
                  setSelectedListing(listing);
                  setActiveTab('market');
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
                onOpenCreateListing={() => setIsCreateListingOpen(true)}
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
                onNavigateToMarket={() => setActiveTab('market')}
              />
            )}
          </>
        )}
      </main>

      {/* Telemetry Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-surface text-foreground border border-hairline/80 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in">
          <span className="w-2 h-2 rounded-full bg-ferrari-red animate-ping" />
          <span className="font-sans text-xs font-semibold tracking-wide text-foreground">
            {toast.message}
          </span>
        </div>
      )}

      {/* Modern footer with Affiliate Disclosure */}
      <footer className="w-full border-t border-hairline/60 py-10 px-4 md:px-10 mt-16 mb-16 md:mb-0 bg-surface text-center transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-3.5 bg-ferrari-red" />
              <span className="font-sans text-[11px] tracking-[0.5px] text-text-muted">
                © 2026 MCARD. Multi-TCG & Sports Cards Telemetry Edition. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-4 font-sans text-[11px] tracking-[0.5px] text-text-muted">
              <button
                onClick={() => setFooterModal('terms')}
                className="hover:text-foreground transition-colors duration-150 cursor-pointer"
              >
                Terms
              </button>
              <span>/</span>
              <button
                onClick={() => setFooterModal('privacy')}
                className="hover:text-foreground transition-colors duration-150 cursor-pointer"
              >
                Privacy
              </button>
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

      {/* Footer Interactive Modals */}
      <FooterModals activeModal={footerModal} onClose={() => setFooterModal(null)} />

      {/* Marketplace Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        portfolio={portfolio}
        onSubmitListing={handleCreateListing}
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
          handleAddCard(card.name, card.price, card.imageUrl, 'Ungraded', card.category)
        }
      />

      {/* Mobile Bottom Navigation Bar (Fixed bottom for mobile app experience) */}
      <MobileBottomNav
        activeTab={selectedDetailCard ? 'explore' : activeTab}
        onTabChange={(tab) => {
          setSelectedDetailCard(null);
          setActiveTab(tab);
          if (tab === 'explore') {
            setSelectedSetFilter('ALL');
          }
        }}
        portfolioCount={portfolioItemCount}
      />
    </div>
  );
}
