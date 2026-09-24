'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Language } from '@/locales/translations';
import { CardCategory } from '@/services/multiCardService';

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
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  portfolioCount,
  portfolioValue,
  selectedCategory,
  onCategoryChange,
  onSelectSet,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
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

  // Pokémon Sets Dropdown State & Handlers
  const [isPokemonDropdownOpen, setIsPokemonDropdownOpen] = useState<boolean>(false);
  const [pokemonDropdownTab, setPokemonDropdownTab] = useState<'mega' | 'classic'>('mega');
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterPokemon = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsPokemonDropdownOpen(true);
  };

  const handleMouseLeavePokemon = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsPokemonDropdownOpen(false);
    }, 200);
  };

  const handleTogglePokemonDropdown = () => {
    setIsPokemonDropdownOpen((prev) => !prev);
  };

  const handleSelectPokemonCategory = () => {
    onCategoryChange('pokemon');
    onTabChange('explore');
    if (onSelectSet) {
      onSelectSet('ALL');
    }
  };

  const handleSelectPokemonSet = (setName: string) => {
    setIsPokemonDropdownOpen(false);
    onCategoryChange('pokemon');
    if (onSelectSet) {
      onSelectSet(setName);
    } else {
      onTabChange('explore');
    }
  };

  const handleGoToAllSets = () => {
    setIsPokemonDropdownOpen(false);
    onTabChange('sets');
  };


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
                Multi-TCG & Sports Cards Telemetry
              </span>
            </div>
          </div>

          {/* 2. Center: TCGPlayer Signature Composite Search Bar */}
          <div className="flex-1 max-w-3xl hidden md:flex items-center">
            <div className="flex items-center w-full bg-surface-hover/60 border border-hairline focus-within:border-ferrari-red focus-within:ring-2 focus-within:ring-ferrari-red/10 rounded-xl transition-all duration-150 h-10 overflow-hidden">
              
              {/* Category Dropdown (Integrated Multi-Category Selector) */}
              <div className="relative border-r border-hairline/70 bg-transparent h-full flex items-center px-3 shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const cat = e.target.value as CardCategory;
                    onCategoryChange(cat);
                    onTabChange('explore');
                  }}
                  className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer pr-4 appearance-none"
                  aria-label="Filter card category"
                >
                  <option value="all" className="bg-surface text-foreground">{t('cat_all')}</option>
                  <option value="pokemon" className="bg-surface text-foreground">{t('cat_pokemon')}</option>
                  <option value="yugioh" className="bg-surface text-foreground">{t('cat_yugioh')}</option>
                  <option value="onepiece" className="bg-surface text-foreground">{t('cat_onepiece')}</option>
                  <option value="dragonball" className="bg-surface text-foreground">{t('cat_dragonball')}</option>
                  <option value="nba" className="bg-surface text-foreground">{t('cat_nba')}</option>
                  <option value="fifa" className="bg-surface text-foreground">{t('cat_fifa')}</option>
                </select>
                <span className="absolute right-2 pointer-events-none text-[8px] text-text-muted">
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

        {/* LOWER TIER: Multi-Category & Feature Navigation Bar */}
        <div className="flex items-center justify-between border-t border-hairline/60 overflow-x-auto md:overflow-visible no-scrollbar py-1">
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto md:overflow-visible no-scrollbar scroll-smooth py-0.5" aria-label="Main Navigation">
            {/* 1. Category Tabs (Pure Text, No Icons, with Pokémon Sets Dropdown) */}
            {([
              { id: 'all', labelKey: 'cat_all' },
              { id: 'pokemon', labelKey: 'cat_pokemon' },
              { id: 'yugioh', labelKey: 'cat_yugioh' },
              { id: 'onepiece', labelKey: 'cat_onepiece' },
              { id: 'dragonball', labelKey: 'cat_dragonball' },
              { id: 'nba', labelKey: 'cat_nba' },
              { id: 'fifa', labelKey: 'cat_fifa' },
            ] as const).map((cat) => {
              const isSelected = activeTab === 'explore' && selectedCategory === cat.id;

              if (cat.id === 'pokemon') {
                return (
                  <div
                    key={cat.id}
                    className="relative shrink-0"
                    onMouseEnter={handleMouseEnterPokemon}
                    onMouseLeave={handleMouseLeavePokemon}
                  >
                    <button
                      onClick={handleSelectPokemonCategory}
                      tabIndex={0}
                      className={`font-sans text-xs sm:text-[13px] font-semibold tracking-wide px-3 sm:px-3.5 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all duration-150 inline-flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-surface-hover text-ferrari-red font-bold shadow-2xs'
                          : 'text-text-muted hover:text-foreground hover:bg-surface-hover/50'
                      }`}
                      aria-label={`Filter by ${t(cat.labelKey)} (Hover for expansion sets)`}
                      aria-expanded={isPokemonDropdownOpen}
                      aria-haspopup="true"
                    >
                      <span>{t(cat.labelKey)}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePokemonDropdown();
                        }}
                        className={`text-[9px] transition-transform duration-200 select-none ${
                          isPokemonDropdownOpen ? 'rotate-180 text-ferrari-red' : 'text-text-muted/70'
                        }`}
                        aria-hidden="true"
                      >
                        ▼
                      </span>
                    </button>

                    {/* Pokémon Expansion Sets Floating Dropdown */}
                    {isPokemonDropdownOpen && (
                      <div
                        role="menu"
                        aria-label="Pokémon Sets Navigation Dropdown"
                        className="absolute top-full left-0 mt-2 w-92 sm:w-[480px] bg-surface/98 backdrop-blur-xl border border-hairline/90 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in"
                      >
                        {/* Header & View All Cards Option */}
                        <div className="flex items-center justify-between px-1 pb-3 mb-3 border-b border-hairline/60">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-4 rounded-full bg-ferrari-red" />
                            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-muted">
                              {language === 'en' ? 'Expansions Hub' : '寶可夢卡包系列'}
                            </span>
                          </div>
                          <button
                            onClick={handleSelectPokemonCategory}
                            className="text-xs sm:text-sm font-bold text-ferrari-red hover:underline cursor-pointer"
                            aria-label="View all Pokémon cards"
                          >
                            {language === 'en' ? 'All Pokémon →' : '全部寶可夢 →'}
                          </button>
                        </div>

                        {/* Segmented Tab Switcher: MEGA Era vs Classic */}
                        <div className="flex items-center p-1.5 bg-surface-hover/70 rounded-xl mb-3 border border-hairline/60">
                          <button
                            onClick={() => setPokemonDropdownTab('mega')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                              pokemonDropdownTab === 'mega'
                                ? 'bg-surface text-ferrari-red shadow-xs'
                                : 'text-text-muted hover:text-foreground'
                            }`}
                            aria-label="Show MEGA M Series Sets"
                          >
                            <span className="text-sm">⚡</span>
                            <span>{language === 'en' ? 'MEGA (M Series)' : 'MEGA 世代 (M系列)'}</span>
                            <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-ferrari-red/15 text-ferrari-red font-extrabold tracking-wide">
                              NEW
                            </span>
                          </button>
                          <button
                            onClick={() => setPokemonDropdownTab('classic')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                              pokemonDropdownTab === 'classic'
                                ? 'bg-surface text-foreground shadow-xs'
                                : 'text-text-muted hover:text-foreground'
                            }`}
                            aria-label="Show Classic Sets"
                          >
                            <span className="text-sm">🔥</span>
                            <span>{language === 'en' ? 'Classic Sets' : '經典熱門'}</span>
                          </button>
                        </div>

                        {/* Sets Grid */}
                        <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-0.5 no-scrollbar">
                          {(pokemonDropdownTab === 'mega' ? MEGA_POKEMON_SETS : CLASSIC_POKEMON_SETS).map((set) => (
                            <button
                              key={set.id}
                              onClick={() => handleSelectPokemonSet(set.name)}
                              tabIndex={0}
                              className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl text-left bg-surface-hover/50 hover:bg-ferrari-red/10 hover:border-ferrari-red/40 border border-transparent transition-all duration-150 group cursor-pointer"
                              aria-label={`View set ${set.name}`}
                            >
                              <div className="flex items-center gap-3 min-w-0 pr-2">
                                <span className="font-mono font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-surface border border-hairline/80 text-foreground group-hover:border-ferrari-red/40 group-hover:text-ferrari-red shrink-0 shadow-2xs min-w-[46px] text-center">
                                  {set.code}
                                </span>
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm sm:text-base font-bold text-foreground group-hover:text-ferrari-red truncate">
                                      {set.name}
                                    </span>
                                    <span className="text-xs text-text-muted/80 truncate hidden sm:inline">
                                      {set.jpName}
                                    </span>
                                  </div>
                                  <span className="text-xs sm:text-[13px] text-text-muted/90 font-medium truncate mt-0.5">
                                    {set.highlight}
                                  </span>
                                </div>
                              </div>
                              {set.badge === 'HOT' && (
                                <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold bg-ferrari-red/15 text-ferrari-red rounded-lg shrink-0 uppercase tracking-tight">
                                  HOT
                                </span>
                              )}
                              {set.badge === 'NEW' && (
                                <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold bg-blue-500/15 text-blue-500 dark:text-blue-400 rounded-lg shrink-0 uppercase tracking-tight">
                                  NEW
                                </span>
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Footer: Navigate to complete 160+ sets database */}
                        <div className="mt-3 pt-2.5 border-t border-hairline/60">
                          <button
                            onClick={handleGoToAllSets}
                            tabIndex={0}
                            className="w-full py-2.5 px-3.5 flex items-center justify-between rounded-xl bg-surface-hover/80 hover:bg-surface-hover text-foreground text-xs sm:text-sm font-bold tracking-wide transition-colors cursor-pointer group"
                            aria-label="View all 160+ expansion sets in Sets View"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-ferrari-red text-base font-bold">❖</span>
                              <span>
                                {language === 'en' ? 'View All 160+ Sets Archive' : '瀏覽全部 160+ 卡包圖鑑資料庫'}
                              </span>
                            </span>
                            <span className="text-text-muted group-hover:text-ferrari-red group-hover:translate-x-0.5 transition-transform text-sm font-bold">
                              →
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onCategoryChange(cat.id);
                    onTabChange('explore');
                  }}
                  tabIndex={0}
                  className={`font-sans text-xs sm:text-[13px] font-semibold tracking-wide px-3 sm:px-3.5 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all duration-150 shrink-0 ${
                    isSelected
                      ? 'bg-surface-hover text-ferrari-red font-bold shadow-2xs'
                      : 'text-text-muted hover:text-foreground hover:bg-surface-hover/50'
                  }`}
                  aria-label={`Filter by ${t(cat.labelKey)}`}
                >
                  <span>{t(cat.labelKey)}</span>
                </button>
              );
            })}

            {/* Subtle Divider */}
            <div className="h-4 w-px bg-hairline mx-1 shrink-0" />

            {/* 2. Feature Views */}
            <button
              onClick={() => handleLinkClick('stream')}
              onKeyDown={(e) => handleLinkKeyDown(e, 'stream')}
              tabIndex={0}
              className={`font-sans text-xs sm:text-[13px] font-medium tracking-wide px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all duration-150 shrink-0 ${
                activeTab === 'stream'
                  ? 'bg-surface-hover text-ferrari-red font-semibold'
                  : 'text-text-muted hover:text-foreground hover:bg-surface-hover/50'
              }`}
            >
              {t('nav_stream')}
            </button>

            <button
              onClick={() => handleLinkClick('showcase')}
              onKeyDown={(e) => handleLinkKeyDown(e, 'showcase')}
              tabIndex={0}
              className={`font-sans text-xs sm:text-[13px] font-medium tracking-wide px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all duration-150 shrink-0 ${
                activeTab === 'showcase'
                  ? 'bg-surface-hover text-ferrari-red font-semibold'
                  : 'text-text-muted hover:text-foreground hover:bg-surface-hover/50'
              }`}
            >
              {t('nav_showcase')}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
