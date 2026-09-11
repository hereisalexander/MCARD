'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Language } from '@/locales/translations';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<string>('All');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { language, setLanguage, t } = useLanguage();
  const { user, isLoggedIn, openAuthModal, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Global keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
        if (activeTab !== 'explore') {
          onTabChange('explore');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeTab, onTabChange]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
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

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onTabChange('explore');
    }
  };

  const handleSearchSubmit = () => {
    onTabChange('explore');
  };

  // TCG Sub-navigation items (TCGPlayer styled bottom bar)
  const navItems = [
    { id: 'stream', label: t('nav_stream') },
    { id: 'explore', label: t('nav_explore') },
    { id: 'sets', label: t('nav_sets') },
    { id: 'showcase', label: t('nav_showcase') },
    { id: 'portfolio', label: t('nav_portfolio') },
  ];

  return (
    <header className="w-full bg-surface border-b border-hairline/60 sticky top-0 z-40 backdrop-blur-md bg-surface/95 transition-colors duration-200 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 md:px-10">
        
        {/* UPPER TIER: TCGPlayer Pro Ecommerce Header (Height: 68px) */}
        <div className="h-16 md:h-18 flex items-center justify-between gap-4 md:gap-8">
          
          {/* 1. Left Brand Identity: MCARD Logo */}
          <div
            onClick={() => handleLinkClick('stream')}
            onKeyDown={(e) => handleLinkKeyDown(e, 'stream')}
            tabIndex={0}
            role="button"
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
            aria-label="Navigate to Home"
          >
            {/* Ferrari Rosso Corsa Vertical Accent */}
            <div className="w-1.5 h-6 rounded-full bg-ferrari-red group-hover:scale-y-110 transition-transform duration-150" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-sans font-bold text-lg sm:text-xl tracking-wider text-foreground">
                  MCARD
                </span>
                <span className="text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full bg-surface-hover text-text-muted border border-hairline/60">
                  Pro Vault
                </span>
              </div>
              <span className="text-[10px] text-text-muted tracking-wide font-normal -mt-0.5 hidden lg:block">
                Pokémon TCG Market Telemetry
              </span>
            </div>
          </div>

          {/* 2. Center: TCGPlayer Signature Composite Search Bar */}
          <div className="flex-1 max-w-3xl hidden md:flex items-center">
            <div className="flex items-center w-full bg-surface-hover/60 border border-hairline focus-within:border-ferrari-red focus-within:ring-2 focus-within:ring-ferrari-red/10 rounded-xl transition-all duration-150 h-10 overflow-hidden">
              
              {/* Category Dropdown (TCGPlayer 'All ▾') */}
              <div className="relative border-r border-hairline/70 bg-transparent h-full flex items-center px-3.5 shrink-0">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer pr-4 appearance-none"
                  aria-label="Filter search category"
                >
                  <option value="All" className="bg-surface text-foreground">All</option>
                  <option value="Cards" className="bg-surface text-foreground">Cards</option>
                  <option value="Sets" className="bg-surface text-foreground">Sets</option>
                  <option value="PSA10" className="bg-surface text-foreground">PSA 10</option>
                </select>
                <span className="absolute right-2.5 pointer-events-none text-[8px] text-text-muted">
                  ▼
                </span>
              </div>

              {/* Main Search Input */}
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchInputKeyDown}
                onFocus={() => {
                  if (activeTab !== 'explore') onTabChange('explore');
                }}
                className="w-full bg-transparent text-foreground placeholder:text-text-muted/60 text-xs px-3.5 focus:outline-none tracking-wide"
                aria-label="Search Pokémon database"
              />

              {/* Keyboard Shortcut '/' Hint */}
              <kbd className="hidden xl:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-text-muted bg-surface border border-hairline rounded-md select-none mr-2 shrink-0 shadow-2xs">
                /
              </kbd>

              {/* Search Submit Button */}
              <button
                onClick={handleSearchSubmit}
                className="h-full px-4 text-text-muted hover:text-ferrari-red hover:bg-surface/80 flex items-center justify-center transition-colors duration-150 cursor-pointer shrink-0"
                aria-label="Submit search"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 3. Right Utilities: Theme Toggle + Language + Telemetry + Member Area */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-surface-hover/70 hover:bg-surface-hover border border-hairline/80 text-foreground transition-all duration-150 cursor-pointer"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                /* Sun Icon for switching to light */
                <svg className="w-4 h-4 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                /* Moon Icon for switching to dark */
                <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Language Selector */}
            <div className="relative shrink-0">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="h-9 pl-3 pr-6 border border-hairline/80 rounded-xl font-sans text-xs font-semibold bg-surface-hover/70 text-foreground hover:bg-surface-hover transition-colors cursor-pointer focus:outline-none appearance-none tracking-wide"
                aria-label={t('nav_select_language')}
              >
                <option value="en" className="bg-surface text-foreground">EN</option>
                <option value="zh-TW" className="bg-surface text-foreground">繁中</option>
                <option value="zh-CN" className="bg-surface text-foreground">简中</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-text-muted font-bold">
                ▼
              </span>
            </div>

            {/* Member Sign In / Profile */}
            {isLoggedIn && user ? (
              <div className="h-9 flex items-center gap-2 bg-surface-hover/70 border border-hairline/80 px-3 rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-4 h-4 rounded-full bg-background border border-hairline object-cover"
                />
                <span className="font-sans text-xs font-semibold text-foreground max-w-[80px] truncate">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="ml-1 text-text-muted hover:text-ferrari-red font-sans text-xs font-bold transition-colors cursor-pointer"
                  title={t('auth_logout')}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="h-9 px-3.5 rounded-xl bg-surface-hover/70 hover:bg-surface-hover border border-hairline/80 text-foreground hover:text-ferrari-red font-sans text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{t('auth_login')}</span>
              </button>
            )}

            {/* Portfolio Cart / Telemetry Vault Pill */}
            <button
              onClick={() => onTabChange('portfolio')}
              className="h-9 px-3.5 rounded-xl bg-ferrari-red hover:bg-ferrari-red-hover active:bg-ferrari-red-active text-white font-sans text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer flex items-center gap-2 shrink-0 shadow-sm"
              aria-label="View My Portfolio Vault"
            >
              {/* Shopping Bag / Vault Icon */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden sm:inline font-mono font-bold">
                ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-white text-[10px] font-bold tabular-nums">
                {portfolioCount}
              </span>
            </button>
          </div>
        </div>

        {/* LOWER TIER: Modern Clean Sub-Navigation Bar */}
        <div className="flex items-center justify-between border-t border-hairline/60 overflow-x-auto no-scrollbar py-1">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  onKeyDown={(e) => handleLinkKeyDown(e, item.id)}
                  tabIndex={0}
                  className={`font-sans text-sm sm:text-[15px] font-medium tracking-wide px-4 py-2 rounded-lg whitespace-nowrap cursor-pointer transition-all duration-150 shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-surface-hover text-ferrari-red font-semibold shadow-2xs'
                      : 'text-text-muted hover:text-foreground hover:bg-surface-hover/50'
                  }`}
                  aria-label={`Navigate to ${item.label} section`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

        </div>
      </div>
    </header>
  );
};
