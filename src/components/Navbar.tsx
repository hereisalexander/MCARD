'use client';

import React, { useState, useEffect } from 'react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  portfolioCount: number;
  portfolioValue: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  portfolioCount,
  portfolioValue,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleThemeToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLinkClick = (tabName: string) => {
    onTabChange(tabName);
  };

  const handleLinkKeyDown = (event: React.KeyboardEvent, tabName: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTabChange(tabName);
    }
  };

  const navItems = [
    { id: 'stream', label: 'STREAM' },
    { id: 'explore', label: 'EXPLORE' },
    { id: 'sets', label: 'SETS' },
    { id: 'showcase', label: 'SHOWCASE' },
    { id: 'portfolio', label: 'PORTFOLIO' },
  ];

  return (
    <header className="w-full bg-background border-b border-primary py-6 px-4 md:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Top bar: Massive Logo & Theme/Info */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-[11px] font-bold tracking-[2px] text-verge-ultraviolet dark:text-jelly-mint mb-1">
              POKÉMON TCG COLLECTOR PORTAL
            </span>
            <h1 className="font-display font-bold uppercase text-5xl md:text-8xl tracking-tighter leading-[0.8] text-foreground select-none">
              THE POKÉMON STREAM
            </h1>
          </div>
          
          {/* Ticker / Theme Switcher */}
          <div className="flex items-center gap-4 self-start md:self-end">
            <div className="hidden sm:flex flex-col text-right font-mono text-[11px]">
              <span className="text-text-muted">PORTFOLIO VALUE</span>
              <span className="font-bold text-foreground text-sm">
                ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="hidden sm:block h-8 w-[1px] bg-border-primary" />
            
            {mounted && (
              <button
                onClick={handleThemeToggle}
                className="px-4 py-2 border-hairline rounded-2xl font-mono text-[11px] font-bold tracking-[1px] bg-surface hover:bg-foreground hover:text-background hover:border-transparent transition-all duration-150 cursor-pointer"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                THEME: {theme.toUpperCase()}
              </button>
            )}
          </div>
        </div>

        {/* Bottom bar: Navigation tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-primary pt-4 gap-4">
          <nav className="flex flex-wrap gap-2 md:gap-6" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  onKeyDown={(e) => handleLinkKeyDown(e, item.id)}
                  tabIndex={0}
                  className={`relative font-mono text-[12px] font-bold tracking-[1.5px] py-2 px-1 cursor-pointer transition-colors duration-150 hover:text-deep-link-blue ${
                    isActive
                      ? 'text-foreground border-b-2 border-verge-ultraviolet dark:border-jelly-mint'
                      : 'text-text-muted'
                  }`}
                  aria-label={`Navigate to ${item.label} section`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Small Stats for Mobile */}
          <div className="flex items-center justify-between sm:hidden bg-surface p-3 rounded-xl border-hairline">
            <span className="font-mono text-[10px] tracking-[1px] text-text-muted">MY CARDS: {portfolioCount}</span>
            <span className="font-mono text-[11px] font-bold text-foreground">
              ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          {/* Quick Subscribe/CTA styled button */}
          <div className="hidden sm:block">
            <button
              onClick={() => onTabChange('portfolio')}
              className="px-5 py-2 rounded-2xl bg-verge-ultraviolet text-white dark:bg-jelly-mint dark:text-absolute-black font-mono text-[11px] font-bold tracking-[1.5px] hover:opacity-80 active:opacity-60 transition-all duration-150 cursor-pointer"
              aria-label="View My Collection"
            >
              MY COLLECTION ({portfolioCount})
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
