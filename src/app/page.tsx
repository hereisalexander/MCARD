'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { StoryStream } from '@/components/StoryStream';
import { CardGrid } from '@/components/CardGrid';
import { SetsView } from '@/components/SetsView';
import { PortfolioDashboard, UserPortfolioItem } from '@/components/PortfolioDashboard';

interface ToastState {
  show: boolean;
  message: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('stream');
  const [portfolio, setPortfolio] = useState<UserPortfolioItem[]>([]);
  const [selectedSetFilter, setSelectedSetFilter] = useState<string>('ALL');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '' });

  // Load portfolio from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pokemon_portfolio');
    if (saved) {
      try {
        setPortfolio(JSON.parse(saved));
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

  const handleAddCard = (cardName: string, price: number, imageUrl: string) => {
    const newItem: UserPortfolioItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: cardName,
      price,
      imageUrl,
      addedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
    const updated = [newItem, ...portfolio];
    savePortfolio(updated);
    
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

  const handleSelectSetFromSets = (setName: string) => {
    setSelectedSetFilter(setName);
    setActiveTab('explore');
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

  // Calculate portfolio stats
  const portfolioValue = portfolio.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          // Reset set filter when going back to explore directly
          if (tab === 'explore') {
            setSelectedSetFilter('ALL');
          }
        }}
        portfolioCount={portfolio.length}
        portfolioValue={portfolioValue}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        {activeTab === 'stream' && (
          <StoryStream onAddCard={handleAddCard} />
        )}
        
        {activeTab === 'explore' && (
          <CardGrid onAddCard={handleAddCard} initialSetFilter={selectedSetFilter} />
        )}

        {activeTab === 'sets' && (
          <SetsView portfolio={portfolio} onSelectSet={handleSelectSetFromSets} />
        )}

        {activeTab === 'showcase' && (
          <PortfolioDashboard
            portfolio={portfolio}
            onRemoveCard={handleRemoveCard}
            portfolioValue={portfolioValue}
            mode="showcase"
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioDashboard
            portfolio={portfolio}
            onRemoveCard={handleRemoveCard}
            portfolioValue={portfolioValue}
            mode="portfolio"
          />
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
            <a href="#" className="hover:text-deep-link-blue transition-colors duration-150">TERMS</a>
            <span>/</span>
            <a href="#" className="hover:text-deep-link-blue transition-colors duration-150">PRIVACY</a>
            <span>/</span>
            <a href="#" className="hover:text-deep-link-blue transition-colors duration-150">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

