'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Language } from '@/locales/translations';
import { CardCategory } from '@/services/multiCardService';
import {
  HeartIcon,
  MenuIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
} from '@/components/icons/AppIcons';

interface PokemonSetItem {
  id: string;
  name: string;
  code: string;
  jpName: string;
  highlight: string;
  badge?: 'HOT' | 'NEW';
}

const MEGA_POKEMON_SETS: PokemonSetItem[] = [
  { id: 'm4-ninja-spinner', name: 'Ninja Spinner', code: 'M4', jpName: 'ニンジャスピナー', highlight: '超級甲賀忍蛙 ex', badge: 'HOT' },
  { id: 'm3-nihil-zero', name: 'Nihil Zero', code: 'M3', jpName: 'ムニキスゼロ', highlight: '超級基格爾德 ex (Z神)', badge: 'NEW' },
  { id: 'm2a-mega-dream-ex', name: 'MEGA Dream ex', code: 'M2a', jpName: 'MEGAドリームex', highlight: '年度壓軸高規格豪華包', badge: 'HOT' },
  { id: 'm5-abyss-eye', name: 'Abyss Eye', code: 'M5', jpName: 'アビスアイ', highlight: '超級勾魂眼 / 暗影深淵系', badge: 'NEW' },
  { id: 'm6-storm-emeralda', name: 'Storm Emeralda', code: 'M6', jpName: 'ストームエメラルダ', highlight: '超級烈空坐 ex (風暴翡翠)', badge: 'NEW' },
];

const CLASSIC_POKEMON_SETS: PokemonSetItem[] = [
  { id: '151', name: '151', code: 'SV3.5', jpName: 'ポケモンカード151', highlight: '初代 151 全圖鑑 / 大師球閃', badge: 'HOT' },
  { id: 'Surging Sparks', name: 'Surging Sparks', code: 'SV08', jpName: '超電ブレイカー', highlight: '星晶皮卡丘 ex', badge: 'HOT' },
  { id: 'Crown Zenith', name: 'Crown Zenith', code: 'SWSH12.5', jpName: 'VSTARユニバース', highlight: '王者頂點金卡四神' },
  { id: 'Evolving Skies', name: 'Evolving Skies', code: 'SWSH07', jpName: '蒼空烈流 / イーブイヒーローズ', highlight: '月亮伊布 / 烈空坐', badge: 'HOT' },
  { id: 'Twilight Masquerade', name: 'Twilight Masquerade', code: 'SV06', jpName: '変幻の仮面', highlight: '厄鬼椪 ex 全面具' },
  { id: 'Base Set', name: 'Base Set', code: 'Base', jpName: '第1弾拡張パック', highlight: '初代 1999 傳奇無印' },
];

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  portfolioCount: number;
  portfolioValue: number;
  selectedCategory: CardCategory;
  onCategoryChange: (category: CardCategory) => void;
  onSelectSet?: (setName: string) => void;
  wishlistCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  portfolioCount,
  portfolioValue,
  selectedCategory,
  onCategoryChange,
  onSelectSet,
  wishlistCount = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { language, setLanguage, t } = useLanguage();
  const { user, isLoggedIn, openAuthModal, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Slide-over Drawer Menu State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerPokemonTab, setDrawerPokemonTab] = useState<'mega' | 'classic'>('mega');
  const [isPokemonExpanded, setIsPokemonExpanded] = useState<boolean>(true);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

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

  const handleTabClick = (tabName: string) => {
    onTabChange(tabName);
    setIsDrawerOpen(false);
  };

  const handleSearchSubmit = () => {
    onTabChange('explore');
  };

  const handleCategorySelect = (category: CardCategory) => {
    onCategoryChange(category);
    onTabChange('explore');
    if (category !== 'pokemon') {
      setIsDrawerOpen(false);
    }
  };

  const handleSetSelect = (setName: string) => {
    onCategoryChange('pokemon');
    if (onSelectSet) {
      onSelectSet(setName);
    } else {
      onTabChange('explore');
    }
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* SINGLE CLEAN TIER NAVBAR (Height: 64px) */}
      <header className="w-full bg-surface border-b border-hairline/60 sticky top-0 z-40 backdrop-blur-md bg-surface/95 transition-colors duration-200 shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="h-16 flex items-center justify-between gap-3 sm:gap-6">
            
            {/* 1. Left Brand Logo */}
            <div
              onClick={() => handleTabClick('stream')}
              tabIndex={0}
              role="button"
              className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
              aria-label="Navigate to Home Telemetry"
            >
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/logo-144.png"
                  alt="MCARD Official Logo"
                  width={36}
                  height={36}
                  priority
                  className="w-full h-full object-contain drop-shadow-2xs"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-lg sm:text-xl tracking-wider text-foreground group-hover:text-ferrari-red transition-colors duration-150">
                    MCARD
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-surface-hover text-text-muted border border-hairline/60">
                    Pro Vault
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Center: Global Search Input */}
            <div className="flex-1 max-w-xl mx-2 hidden sm:flex items-center">
              <div className="flex items-center w-full bg-surface-hover/60 border border-hairline focus-within:border-ferrari-red focus-within:ring-2 focus-within:ring-ferrari-red/10 rounded-xl transition-all duration-150 h-9.5 overflow-hidden">
                <div className="pl-3 pr-2 text-text-muted">
                  <SearchIcon className="w-3.5 h-3.5" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  placeholder={language === 'en' ? 'Search 16,000+ cards, sets, artists... (Press /)' : '全圖鑑搜尋 16,000+ 卡牌、系列、繪師... (按 /)'}
                  className="w-full h-full bg-transparent text-xs font-medium text-foreground placeholder:text-text-muted/60 focus:outline-none"
                  aria-label="Global Card Search"
                />
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="h-full px-3 text-text-muted hover:text-ferrari-red flex items-center justify-center transition-colors cursor-pointer shrink-0 text-xs font-semibold"
                >
                  {language === 'en' ? 'Search' : '搜尋'}
                </button>
              </div>
            </div>

            {/* 3. Right Utilities & Drawer Toggle Button */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-surface-hover/70 hover:bg-surface-hover border border-hairline/80 text-foreground transition-all duration-150 cursor-pointer shrink-0"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Wishlist Shortcut Pill */}
              <button
                type="button"
                onClick={() => onTabChange('wishlist')}
                className={`h-9 px-2.5 sm:px-3 rounded-xl border font-sans text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'wishlist'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 shadow-2xs'
                    : 'bg-surface-hover/70 hover:bg-surface-hover border-hairline/80 text-foreground'
                }`}
                title="願望清單"
                aria-label="願望清單"
              >
                <HeartIcon filled={activeTab === 'wishlist'} className="w-3.5 h-3.5" />
                <span className="hidden md:inline">心願</span>
                {wishlistCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold tabular-nums">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Portfolio Vault Pill */}
              <button
                type="button"
                onClick={() => onTabChange('portfolio')}
                className="h-9 px-2.5 sm:px-3.5 rounded-xl bg-ferrari-red hover:bg-ferrari-red-hover active:bg-ferrari-red-active text-white font-sans text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
                aria-label="View My Portfolio Vault"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="font-mono font-bold">
                  ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-white text-[10px] font-bold tabular-nums">
                  {portfolioCount}
                </span>
              </button>

              {/* MASTER EXPANDABLE MENU TOGGLE BUTTON (漢堡導航展開按鈕) */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen((prev) => !prev)}
                className={`h-9 px-3 rounded-xl border font-sans text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer flex items-center gap-2 shrink-0 ${
                  isDrawerOpen
                    ? 'bg-ferrari-red text-white border-ferrari-red shadow-sm'
                    : 'bg-surface-hover/90 hover:bg-surface-hover border-hairline/90 text-foreground hover:border-text-muted'
                }`}
                aria-label={isDrawerOpen ? '關閉導航選單' : '展開導航選單'}
                aria-expanded={isDrawerOpen}
              >
                {isDrawerOpen ? (
                  <CloseIcon className="w-4 h-4 text-white" />
                ) : (
                  <MenuIcon className="w-4 h-4 text-foreground" />
                )}
                <span className="hidden sm:inline font-bold">
                  {language === 'en' ? 'Menu' : '導航選單'}
                </span>
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* FLYOUT SLIDE-OVER DRAWER (從右上角展開的現代化導航面板) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-fade-in"
            aria-hidden="true"
          />

          {/* Slide-over Right Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-md bg-surface/98 backdrop-blur-2xl border-l border-hairline/80 shadow-2xl flex flex-col overflow-y-auto animate-slide-left">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-hairline/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-4 rounded-full bg-ferrari-red" />
                  <span className="font-sans font-bold text-base text-foreground tracking-wide">
                    {language === 'en' ? 'Navigation & Portals' : '系統導航與品類'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl bg-surface-hover hover:bg-surface-hover/80 text-text-muted hover:text-foreground border border-hairline/60 transition-colors cursor-pointer"
                  aria-label="關閉選單"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body Scrollable Content */}
              <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                
                {/* 1. Core Feature Portals */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
                    {language === 'en' ? 'Core Portals' : '主要功能視圖'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'stream', label: t('nav_stream') },
                      { id: 'explore', label: t('nav_explore') },
                      { id: 'market', label: t('nav_market') },
                      { id: 'wishlist', label: language === 'en' ? 'Wishlist' : '願望清單', badge: wishlistCount > 0 ? `${wishlistCount}` : undefined },
                      { id: 'portfolio', label: t('nav_portfolio') },
                    ].map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleTabClick(item.id)}
                          className={`p-3 rounded-xl border text-left font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-between ${
                            isActive
                              ? 'bg-ferrari-red text-white border-ferrari-red shadow-2xs font-bold'
                              : 'bg-surface-hover/60 hover:bg-surface-hover text-foreground border-hairline/60'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-ferrari-red'}`} />
                            <span>{item.label}</span>
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500 text-white">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Card Category Selection */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
                      {language === 'en' ? 'Card Categories' : '探索卡牌品類'}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {selectedCategory.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {([
                      { id: 'all', labelKey: 'cat_all' },
                      { id: 'pokemon', labelKey: 'cat_pokemon' },
                      { id: 'yugioh', labelKey: 'cat_yugioh' },
                      { id: 'onepiece', labelKey: 'cat_onepiece' },
                      { id: 'dragonball', labelKey: 'cat_dragonball' },
                      { id: 'nba', labelKey: 'cat_nba' },
                      { id: 'fifa', labelKey: 'cat_fifa' },
                    ] as const).map((cat) => {
                      const isCatSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategorySelect(cat.id)}
                          className={`px-3 py-1.5 rounded-xl font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                            isCatSelected
                              ? 'bg-surface-hover border-ferrari-red text-ferrari-red font-bold shadow-2xs'
                              : 'bg-surface-hover/40 hover:bg-surface-hover text-text-muted hover:text-foreground border-hairline/60'
                          }`}
                        >
                          {t(cat.labelKey)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Pokémon Expansions Hub (展開系列快速直達) */}
                <div className="flex flex-col gap-2.5 bg-surface-hover/30 border border-hairline/70 p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsPokemonExpanded((prev) => !prev)}
                      className="flex items-center gap-2 cursor-pointer text-left"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-ferrari-red" />
                      <span className="text-xs font-bold text-foreground">
                        {language === 'en' ? 'Pokémon Expansion Sets' : '寶可夢卡包系列庫'}
                      </span>
                      {isPokemonExpanded ? (
                        <ChevronDownIcon className="w-3.5 h-3.5 text-text-muted" />
                      ) : (
                        <ChevronRightIcon className="w-3.5 h-3.5 text-text-muted" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTabClick('sets')}
                      className="text-[11px] font-bold text-ferrari-red hover:underline cursor-pointer"
                    >
                      {language === 'en' ? 'View 160+ Sets →' : '全圖鑑 160+ →'}
                    </button>
                  </div>

                  {isPokemonExpanded && (
                    <div className="flex flex-col gap-2 mt-1">
                      {/* Segmented Tab */}
                      <div className="flex items-center p-1 bg-surface-hover/70 rounded-xl border border-hairline/60">
                        <button
                          type="button"
                          onClick={() => setDrawerPokemonTab('mega')}
                          className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                            drawerPokemonTab === 'mega'
                              ? 'bg-surface text-ferrari-red shadow-2xs'
                              : 'text-text-muted hover:text-foreground'
                          }`}
                        >
                          MEGA 世代 (M)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDrawerPokemonTab('classic')}
                          className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                            drawerPokemonTab === 'classic'
                              ? 'bg-surface text-foreground shadow-2xs'
                              : 'text-text-muted hover:text-foreground'
                          }`}
                        >
                          經典熱門
                        </button>
                      </div>

                      {/* Sets List */}
                      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                        {(drawerPokemonTab === 'mega' ? MEGA_POKEMON_SETS : CLASSIC_POKEMON_SETS).map((set) => (
                          <button
                            key={set.id}
                            type="button"
                            onClick={() => handleSetSelect(set.name)}
                            className="flex items-center justify-between p-2 rounded-xl text-left bg-surface hover:bg-ferrari-red/10 border border-hairline/50 hover:border-ferrari-red/40 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-hover text-foreground shrink-0 border border-hairline/60">
                                {set.code}
                              </span>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-foreground group-hover:text-ferrari-red truncate">
                                  {set.name}
                                </span>
                                <span className="text-[10px] text-text-muted truncate">
                                  {set.highlight}
                                </span>
                              </div>
                            </div>
                            {set.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-ferrari-red/15 text-ferrari-red">
                                {set.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. User Account & Preferences */}
                <div className="flex flex-col gap-3 pt-2 border-t border-hairline/60">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
                    {language === 'en' ? 'Preferences & Account' : '個人偏好與帳號'}
                  </span>

                  {/* Member Login / Profile */}
                  <div className="p-3 rounded-xl bg-surface-hover/50 border border-hairline/60 flex items-center justify-between">
                    {isLoggedIn && user ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-7 h-7 rounded-full bg-background border border-hairline object-cover"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{user.name}</span>
                            <span className="text-[10px] text-text-muted">{user.email}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={logout}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface hover:bg-surface-hover text-rose-500 border border-hairline/60 cursor-pointer"
                        >
                          {t('auth_logout')}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{t('auth_guest')}</span>
                          <span className="text-[10px] text-text-muted">登入以跨裝置同步資產庫</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDrawerOpen(false);
                            openAuthModal();
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-ferrari-red text-white hover:bg-ferrari-red-hover cursor-pointer shadow-2xs"
                        >
                          {t('auth_login')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-hover/50 border border-hairline/60">
                    <span className="text-xs font-semibold text-foreground">
                      {t('nav_select_language')}
                    </span>
                    <div className="flex items-center gap-1">
                      {(['zh-TW', 'en', 'zh-CN'] as Language[]).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleLanguageChange(lang)}
                          className={`px-2 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                            language === lang
                              ? 'bg-ferrari-red text-white'
                              : 'bg-surface text-text-muted hover:text-foreground border border-hairline/60'
                          }`}
                        >
                          {lang === 'zh-TW' ? '繁中' : lang === 'en' ? 'EN' : '简中'}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-hairline/60 shrink-0 text-center bg-surface-hover/20">
                <span className="text-[10px] font-sans text-text-muted">
                  MCARD Pro Telemetry Edition • All rights reserved
                </span>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
