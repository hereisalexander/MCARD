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

interface ToastState {
  show: boolean;
  message: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('stream');
  const [selectedCategory, setSelectedCategory] = useState<CardCategory>('all');
  const [portfolio, setPortfolio] = useState<UserPortfolioItem[]>([]);
  const [selectedSetFilter, setSelectedSetFilter] = useState<string>('ALL');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '' });
  const [footerModal, setFooterModal] = useState<FooterModalType>(null);
  
  // State for Full-Page Card Detail View
  const [selectedDetailCard, setSelectedDetailCard] = useState<UniversalCard | null>(null);

  // Load portfolio from localStorage on mount & perform safe migration for old items
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('pokemon_portfolio');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
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
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save portfolio to localStorage when changed
  const savePortfolio = (updated: UserPortfolioItem[]) => {
    setPortfolio(updated);
    localStorage.setItem('pokemon_portfolio', JSON.stringify(updated));
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
        onSelectSet={(setName) => {
          setSelectedCategory('pokemon');
          handleSelectSetFromSets(setName);
        }}
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-10 py-6">
        {/* Full Page Card Detail View when card is selected */}
        {selectedDetailCard ? (
          <CardDetailView
            card={selectedDetailCard}
            onBack={handleBackFromDetail}
            onAddCard={(name, price, img, cond, cat) => handleAddCard(name, price, img, cond, cat || selectedCategory)}
            onSelectCategory={handleSelectCategory}
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

            {activeTab === 'portfolio' && (
              <PortfolioDashboard
                portfolio={portfolio}
                onRemoveCard={handleRemoveCard}
                onUpdateCard={handleUpdateCard}
                onImportPortfolio={handleImportPortfolio}
                portfolioValue={portfolioValue}
                mode="portfolio"
              />
            )}
          </>
        )}
      </main>

      {/* Telemetry Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface text-foreground border border-hairline/80 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in">
          <span className="w-2 h-2 rounded-full bg-ferrari-red animate-ping" />
          <span className="font-sans text-xs font-semibold tracking-wide text-foreground">
            {toast.message}
          </span>
        </div>
      )}

      {/* Modern footer */}
      <footer className="w-full border-t border-hairline/60 py-10 px-4 md:px-10 mt-16 bg-surface text-center transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-3.5 bg-ferrari-red" />
            <span className="font-sans text-[11px] tracking-[0.5px] text-text-muted">
              © 2026 MCARD. Multi-TCG & Sports Cards Telemetry Edition. All rights reserved.
            </span>
          </div>
          <div className="flex gap-4 font-sans text-[11px] tracking-[0.5px] text-text-muted">
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
      </footer>

      {/* Footer Interactive Modals */}
      <FooterModals activeModal={footerModal} onClose={() => setFooterModal(null)} />
    </div>
  );
}
