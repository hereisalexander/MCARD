'use client';

import React, { useState, useEffect } from 'react';
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
  const { language, setLanguage, t } = useLanguage();
  const { user, isLoggedIn, openAuthModal, logout } = useAuth();

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

  const navItems = [
    { id: 'stream', label: t('nav_stream') },
    { id: 'explore', label: t('nav_explore') },
    { id: 'sets', label: t('nav_sets') },
    { id: 'showcase', label: t('nav_showcase') },
    { id: 'portfolio', label: t('nav_portfolio') },
  ];

  return (
    <header className="w-full bg-background border-b border-primary py-6 px-4 md:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Top bar: Responsive Logo & Theme/Language/Auth Switchers */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-[2px] text-verge-ultraviolet dark:text-jelly-mint mb-1.5">
              POKÉMON TCG COLLECTOR PORTAL
            </span>
            <h1 className="font-display font-bold uppercase text-2.5xl sm:text-4xl md:text-7xl tracking-tighter leading-none text-foreground select-none">
              THE POKÉMON STREAM
            </h1>
          </div>
          
          {/* Ticker / Language / Theme / User Auth Switcher (Single Line Horizontal Toolbar) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 self-start sm:self-end">
            <div className="hidden lg:flex flex-col text-right font-mono text-[10px] shrink-0">
              <span className="text-text-muted">{t('nav_total_portfolio_value')}</span>
              <span className="font-bold text-foreground text-xs">
                ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="hidden lg:block h-7 w-[1px] bg-border-primary shrink-0" />
            
            {/* Language Selector Dropdown */}
            <div className="relative shrink-0">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="h-8 pl-3 pr-7 sm:pr-8 border-hairline rounded-2xl font-mono text-[10px] font-bold tracking-[1px] bg-surface text-foreground border-primary hover:border-verge-ultraviolet dark:hover:border-jelly-mint transition-all duration-150 cursor-pointer focus:outline-none uppercase appearance-none flex items-center"
                aria-label={t('nav_select_language')}
              >
                <option value="en" className="bg-surface text-foreground font-mono text-xs">ENGLISH</option>
                <option value="zh-TW" className="bg-surface text-foreground font-mono text-xs">繁體中文</option>
                <option value="zh-CN" className="bg-surface text-foreground font-mono text-xs">简体中文</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-text-muted font-bold">
                ▼
              </span>
            </div>

            {mounted && (
              <button
                onClick={handleThemeToggle}
                className="h-8 px-2.5 sm:px-3 border-hairline rounded-2xl font-mono text-[10px] font-bold tracking-[1px] bg-surface hover:bg-foreground hover:text-background hover:border-transparent transition-all duration-150 cursor-pointer shrink-0 flex items-center justify-center"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                THEME: {theme.toUpperCase()}
              </button>
            )}

            {/* Auth Member Profile Button or Log in */}
            {isLoggedIn && user ? (
              <div className="h-8 flex items-center gap-2 bg-surface border-hairline border-primary rounded-2xl px-2.5 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-4 h-4 rounded-full bg-background border border-primary/50 object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] font-bold text-foreground leading-tight max-w-[70px] sm:max-w-[80px] truncate">
                    {user.name.toUpperCase()}
                  </span>
                  <span className="font-mono text-[7px] text-emerald-500 dark:text-jelly-mint font-bold leading-none flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-jelly-mint animate-pulse" />
                    ONLINE
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="ml-1 text-text-muted hover:text-red-500 font-mono text-[9px] font-bold uppercase transition-colors"
                  title={t('auth_logout')}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="h-8 px-3.5 sm:px-4 rounded-2xl bg-verge-ultraviolet text-white dark:bg-jelly-mint dark:text-absolute-black font-mono text-[10px] font-bold tracking-[1.5px] hover:opacity-85 active:opacity-60 transition-all duration-150 cursor-pointer shadow-sm uppercase shrink-0 flex items-center justify-center"
              >
                {t('auth_login')}
              </button>
            )}
          </div>
        </div>

        {/* Bottom bar: Mobile Horizontal Scrollable Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-primary pt-3 gap-3 overflow-hidden">
          <nav className="flex flex-nowrap overflow-x-auto no-scrollbar gap-4 sm:gap-6 py-1 scroll-smooth" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  onKeyDown={(e) => handleLinkKeyDown(e, item.id)}
                  tabIndex={0}
                  className={`relative font-mono text-[11px] sm:text-[12px] font-bold tracking-[1.5px] py-1.5 px-0.5 whitespace-nowrap cursor-pointer transition-colors duration-150 shrink-0 hover:text-deep-link-blue ${
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

          {/* Mobile Bottom Portfolio Bar */}
          <div className="flex items-center justify-between sm:hidden bg-surface px-4 py-2.5 rounded-xl border-hairline border-primary">
            <span className="font-mono text-[10px] font-bold tracking-[1px] text-text-muted uppercase">
              MY CARDS: <strong className="text-foreground">{portfolioCount}</strong>
            </span>
            <span className="font-mono text-[12px] font-bold text-foreground">
              ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          {/* Quick Subscribe/CTA styled button for Desktop */}
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
