'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { StoryStream } from '@/components/StoryStream';
import { CardGrid } from '@/components/CardGrid';
import { SetsView } from '@/components/SetsView';
import { PortfolioDashboard, UserPortfolioItem, CardCondition } from '@/components/PortfolioDashboard';
import { CardDetailView } from '@/components/CardDetailView';
import { ApiPokemonCard } from '@/services/pokemonApi';

interface ToastState {
  show: boolean;
  message: string;
}

import { FooterModals, FooterModalType } from '@/components/FooterModals';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('stream');
  const [portfolio, setPortfolio] = useState<UserPortfolioItem[]>([]);
  const [selectedSetFilter, setSelectedSetFilter] = useState<string>('ALL');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '' });
  const [footerModal, setFooterModal] = useState<FooterModalType>(null);
  
  // State for Full-Page Card Detail View
  const [selectedDetailCard, setSelectedDetailCard] = useState<ApiPokemonCard | null>(null);

  // Load portfolio from localStorage on mount & perform safe migration for old items
  useEffect(() => {
    const saved = localStorage.getItem('pokemon_portfolio');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const migrated: UserPortfolioItem[] = parsed.map((item: Partial<UserPortfolioItem>) => ({
            id: item.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name || 'Unknown Card',
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
    
    // Show Verge style toast
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

  const handleSelectCardDetail = (card: ApiPokemonCard) => {
    setSelectedDetailCard(card);
  };

  const handleBackFromDetail = () => {
    setSelectedDetailCard(null);
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
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Full Page Card Detail View when card is selected */}
        {selectedDetailCard ? (
          <CardDetailView
            card={selectedDetailCard}
            onBack={handleBackFromDetail}
            onAddCard={handleAddCard}
          />
        ) : (
          <>
            {activeTab === 'stream' && (
              <StoryStream onAddCard={handleAddCard} />
            )}
            
            {activeTab === 'explore' && (
              <CardGrid
                onAddCard={handleAddCard}
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

      {/* Verge Styled Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background border-hairline border-primary px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.15)] flex items-center gap-3 animate-slide-in">
          <span className="w-2 h-2 rounded-full bg-jelly-mint dark:bg-verge-ultraviolet animate-ping" />
          <span className="font-mono text-xs font-bold tracking-[1.5px] uppercase">
            {toast.message}
          </span>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-primary py-8 px-4 md:px-8 mt-12 bg-surface text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[10px] tracking-[1.5px] text-text-muted uppercase">
            © 2026 THE POKÉMON STREAM. INSPIRED BY THE VERGE. ALL RIGHTS RESERVED.
          </span>
          <div className="flex gap-4 font-mono text-[10px] tracking-[1.5px] text-text-muted">
            <button
              onClick={() => setFooterModal('terms')}
              className="hover:text-deep-link-blue transition-colors duration-150 uppercase cursor-pointer"
            >
              TERMS
            </button>
            <span>/</span>
            <button
              onClick={() => setFooterModal('privacy')}
              className="hover:text-deep-link-blue transition-colors duration-150 uppercase cursor-pointer"
            >
              PRIVACY
            </button>
          </div>
        </div>
      </footer>

      {/* Footer Interactive Modals */}
      <FooterModals activeModal={footerModal} onClose={() => setFooterModal(null)} />
    </div>
  );
}
