'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { language, setLanguage, t } = useLanguage();
  const { user, isLoggedIn, openAuthModal, logout } = useAuth();

  // Load theme preference asynchronously on mount
  useEffect(() => {
    const timer = setTimeout(() => {
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
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Global keyboard shortcut '/' to focus search (Polymarket-style)
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

  const navItems = [
    { id: 'stream', label: t('nav_stream') },
    { id: 'explore', label: t('nav_explore') },
    { id: 'sets', label: t('nav_sets') },
    { id: 'showcase', label: t('nav_showcase') },
    { id: 'portfolio', label: t('nav_portfolio') },
  ];

  return (
    <header className="w-full bg-background border-b border-primary/15 py-3.5 px-4 md:px-8 transition-colors duration-200 sticky top-0 z-40 backdrop-blur-md bg-background/95">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo with Polymarket-style Beta Pill Badge */}
          <div
            onClick={() => handleLinkClick('stream')}
            onKeyDown={(e) => handleLinkKeyDown(e, 'stream')}
            tabIndex={0}
            role="button"
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            aria-label="Navigate to Home Stream"
          >
            <div className="w-8 h-8 rounded-xl bg-verge-ultraviolet dark:bg-jelly-mint flex items-center justify-center text-white dark:text-absolute-black font-black text-sm shadow-sm group-hover:scale-105 transition-transform duration-150">
              ⚡
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-sans font-extrabold text-base sm:text-lg tracking-tight text-foreground">
                  POKÉMON STREAM
                </span>
                <span className="font-sans text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-blue-600/10 text-blue-600 dark:bg-jelly-mint/15 dark:text-jelly-mint uppercase">
                  BETA
                </span>
              </div>
              <span className="font-sans text-[10px] text-text-muted tracking-normal font-medium -mt-0.5 hidden sm:block">
                TCG Portfolio & Real-time Market Analytics
              </span>
            </div>
          </div>

          {/* Quick Search Bar (Polymarket Aesthetic with '/' Shortcut) */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <div className="flex items-center w-full bg-surface border border-primary/15 hover:border-primary/30 focus-within:border-blue-500 dark:focus-within:border-jelly-mint rounded-xl px-3 py-1.5 transition-all shadow-2xs">
              <svg
                className="w-3.5 h-3.5 text-text-muted mr-2 shrink-0"
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
                className="w-full bg-transparent text-foreground placeholder:text-text-muted/60 text-xs font-sans focus:outline-none"
                aria-label="Quick search cards and expansions"
              />
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono text-text-muted bg-background border border-primary/15 rounded shadow-2xs select-none ml-2 shrink-0">
                /
              </kbd>
            </div>
          </div>

          {/* Right Action Controls: Portfolio Value + Language + Theme + Auth */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Total Portfolio Value Pill (Tabular Nums) */}
            <div
              onClick={() => onTabChange('portfolio')}
              className="hidden lg:flex items-center gap-2 bg-surface hover:bg-surface/80 border border-primary/15 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-150"
              title={t('nav_total_portfolio_value')}
            >
              <span className="font-sans text-[11px] text-text-muted font-medium">
                {t('nav_portfolio')}:
              </span>
              <span className="font-sans font-bold text-xs tabular-nums text-foreground">
                ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative shrink-0">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="h-8 pl-2.5 pr-6 border border-primary/15 rounded-xl font-sans text-xs font-semibold bg-surface text-foreground hover:border-primary/30 transition-all duration-150 cursor-pointer focus:outline-none appearance-none flex items-center"
                aria-label={t('nav_select_language')}
              >
                <option value="en">EN</option>
                <option value="zh-TW">繁中</option>
                <option value="zh-CN">简中</option>
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-text-muted font-bold">
                ▼
              </span>
            </div>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={handleThemeToggle}
                className="h-8 w-8 border border-primary/15 rounded-xl font-sans text-xs font-semibold bg-surface hover:bg-foreground hover:text-background transition-all duration-150 cursor-pointer shrink-0 flex items-center justify-center shadow-2xs"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            )}

            {/* Auth Profile / Login Button */}
            {isLoggedIn && user ? (
              <div className="h-8 flex items-center gap-2 bg-surface border border-primary/15 rounded-xl px-2.5 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-4 h-4 rounded-full bg-background border border-primary/40 object-cover"
                />
                <span className="font-sans text-xs font-semibold text-foreground max-w-[70px] sm:max-w-[80px] truncate">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="ml-1 text-text-muted hover:text-red-500 font-sans text-xs font-bold transition-colors"
                  title={t('auth_logout')}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="h-8 px-3.5 sm:px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-jelly-mint dark:text-absolute-black dark:hover:opacity-90 font-sans text-xs font-semibold transition-all duration-150 cursor-pointer shadow-xs shrink-0 flex items-center justify-center"
              >
                {t('auth_login')}
              </button>
            )}
          </div>
        </div>

        {/* Bottom Navigation Tabs (Collectr & Polymarket Modern Pill Navigation) */}
        <div className="flex items-center justify-between pt-1 overflow-hidden">
          <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  onKeyDown={(e) => handleLinkKeyDown(e, item.id)}
                  tabIndex={0}
                  className={`font-sans text-xs sm:text-sm font-semibold py-1.5 px-3 rounded-lg whitespace-nowrap cursor-pointer transition-all duration-150 shrink-0 ${
                    isActive
                      ? 'bg-foreground text-background dark:bg-jelly-mint dark:text-absolute-black shadow-xs font-bold'
                      : 'text-text-muted hover:text-foreground hover:bg-surface'
                  }`}
                  aria-label={`Navigate to ${item.label} section`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Collection Badge Button for Tablet / Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => onTabChange('portfolio')}
              className="h-7 px-3 rounded-lg bg-surface hover:bg-primary/10 border border-primary/15 text-foreground font-sans text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center gap-1.5"
              aria-label="View My Collection"
            >
              <span>{t('nav_portfolio')}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-[10px] font-bold tabular-nums">
                {portfolioCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
