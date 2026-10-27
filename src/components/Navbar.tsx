'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Language } from '@/locales/translations';
import { CardCategory } from '@/services/multiCardService';
import {
  MenuIcon,
  CloseIcon,
  SearchIcon,
  CameraIcon,
  TagIcon,
  HeartIcon,
} from '@/components/icons/AppIcons';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  portfolioCount: number;
  portfolioValue: number;
  selectedCategory: CardCategory;
  onCategoryChange: (category: CardCategory) => void;
  onSelectSet?: (setName: string) => void;
  wishlistCount?: number;
  onOpenScanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  portfolioCount,
  portfolioValue: _portfolioValue,
  selectedCategory,
  onCategoryChange,
  onSelectSet,
  wishlistCount = 0,
  onOpenScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { language, setLanguage, t } = useLanguage();
  const { user, isLoggedIn, openAuthModal, logout } = useAuth();

  // Slide-over Drawer Menu State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

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

  const _handleSetSelect = (setName: string) => {
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
          <div className="h-16 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6">
            
            {/* 1. Left Section: Brand Logo & Desktop Navigation Links (鎖定固定間距，徹底消除動態推擠) */}
            <div className="flex items-center gap-4 lg:gap-8 justify-self-start shrink-0">
              {/* Brand Logo */}
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

                <div className="flex items-center">
                  <span className="font-sans font-bold text-lg sm:text-xl tracking-wider text-foreground group-hover:text-ferrari-red transition-colors duration-150">
                    MCARD
                  </span>
                </div>
              </div>

              {/* Desktop Web Navigation Links (桌面網頁版主要導航) */}
              <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 shrink-0" aria-label="主要網頁導航">
                {[
                  { id: 'stream', label: t('nav_stream') || '動態' },
                  { id: 'explore', label: t('nav_explore') || '探索' },
                  { id: 'market', label: t('nav_market') || '市場' },
                ].map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className="group py-2 px-3 flex flex-col items-center justify-center font-sans text-xs tracking-wide cursor-pointer transition-colors"
                    >
                      <span
                        className={`transition-colors duration-150 ${
                          isActive
                            ? 'text-foreground font-bold'
                            : 'text-text-muted group-hover:text-foreground font-semibold'
                        }`}
                      >
                        {item.label}
                      </span>
                      <span
                        className={`mt-1.5 h-[2.5px] rounded-full transition-all duration-200 ${
                          isActive
                            ? 'w-full bg-ferrari-red opacity-100 shadow-[0_1px_6px_rgba(230,0,0,0.35)]'
                            : 'w-0 bg-transparent opacity-0 group-hover:w-1/2 group-hover:bg-hairline group-hover:opacity-100'
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* 2. Center: Global Search Input (精準居中於 1fr 空間內，寬度自適應但不推擠兩側) */}
            <div className="w-full max-w-xl mx-auto px-2 hidden sm:flex items-center justify-center">
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
                {onOpenScanner && (
                  <button
                    type="button"
                    onClick={onOpenScanner}
                    tabIndex={0}
                    aria-label={t('ai_camera_btn') || 'AI 拍照識卡'}
                    title={t('ai_camera_desc') || '拍照辨識與聯網搜價'}
                    className="h-full px-2.5 text-text-muted hover:text-ferrari-red flex items-center justify-center transition-colors cursor-pointer shrink-0 border-l border-hairline/80 hover:bg-surface-hover/80"
                  >
                    <CameraIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="h-full px-3 text-text-muted hover:text-ferrari-red flex items-center justify-center transition-colors cursor-pointer shrink-0 text-xs font-semibold"
                >
                  {language === 'en' ? 'Search' : '搜尋'}
                </button>
              </div>
            </div>

            {/* 3. Right Utilities & Drawer Toggle Button (固定寬度，靠右對齊，0 像素形變) */}
            <div className="flex items-center gap-2 sm:gap-2.5 justify-self-end shrink-0">

              {/* Desktop Account Portal Pill (絕對角標佈局，水合前後按鈕內部圖標文字與寬度 100% 絕對靜止) */}
              <button
                type="button"
                onClick={() => onTabChange('account')}
                className={`relative h-9 px-3 rounded-xl border font-sans text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 shrink-0 w-[84px] sm:w-[96px] ${
                  activeTab === 'account'
                    ? 'border-ferrari-red text-foreground bg-surface-hover shadow-2xs ring-1 ring-ferrari-red/30 font-bold'
                    : 'bg-surface-hover/70 hover:bg-surface-hover border-hairline/80 text-foreground'
                }`}
                aria-label="個人帳戶與資產庫"
                title="個人帳戶與資產庫"
              >
                {isLoggedIn && user?.avatarUrl && !user.avatarUrl.includes('dicebear') ? (
                  <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-hairline">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <svg className="w-4 h-4 text-inherit shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
                <span className="hidden sm:inline truncate">
                  {isLoggedIn && user ? user.name : (t('nav_account') || '帳戶')}
                </span>
                {portfolioCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-mono font-bold tabular-nums bg-ferrari-red text-white flex items-center justify-center shadow-xs border border-surface">
                    {portfolioCount}
                  </span>
                )}
              </button>

              {/* MASTER EXPANDABLE MENU TOGGLE BUTTON (漢堡導航展開按鈕) */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen((prev) => !prev)}
                className={`h-9 px-3 rounded-xl border font-sans text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 shrink-0 sm:w-[104px] ${
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
            <div className="w-screen max-w-sm bg-surface/98 backdrop-blur-2xl border-l border-hairline/80 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left">
              
              {/* Drawer Top Area */}
              <div>
                {/* Header */}
                <div className="px-5 py-4 border-b border-hairline/60 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-3.5 rounded-full bg-ferrari-red" />
                    <span className="font-sans font-bold text-sm text-foreground tracking-wide">
                      {language === 'en' ? 'Quick Menu & Settings' : '功能選單與偏好'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-xl bg-surface-hover hover:bg-surface-hover/80 text-text-muted hover:text-foreground border border-hairline/60 transition-colors cursor-pointer"
                    aria-label="關閉選單"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Drawer Body Content */}
                <div className="p-5 flex flex-col gap-4.5">
                  
                  {/* 1. Member Profile / Login Card (頂部個人狀態) */}
                  <div className="p-3 rounded-2xl bg-surface-hover/60 border border-hairline/80">
                    {isLoggedIn && user ? (
                      <div className="flex items-center justify-between">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            onTabChange('account');
                            setIsDrawerOpen(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              onTabChange('account');
                              setIsDrawerOpen(false);
                            }
                          }}
                          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-background border border-hairline flex items-center justify-center shrink-0 overflow-hidden text-text-muted">
                            {user.avatarUrl && !user.avatarUrl.includes('dicebear') ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-foreground truncate flex items-center gap-1">
                              {user.name}
                              <span className="text-[10px] text-ferrari-red font-mono font-semibold">→</span>
                            </span>
                            <span className="text-[10px] text-text-muted truncate">{user.email}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={logout}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface hover:bg-surface-hover text-rose-500 border border-hairline/60 cursor-pointer shrink-0"
                        >
                          {t('auth_logout')}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
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
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-ferrari-red text-white hover:bg-ferrari-red-hover cursor-pointer shadow-2xs"
                        >
                          {t('auth_login')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. Core Portals (六宮格快速直達，對齊平衡) */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                      {language === 'en' ? 'Core Portals' : '快速功能直達'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          id: 'explore',
                          label: t('nav_explore') || '探索',
                          icon: <SearchIcon className="w-3.5 h-3.5 shrink-0" />,
                        },
                        {
                          id: 'account',
                          label: t('nav_account') || '個人帳戶',
                          badge: portfolioCount > 0 ? `${portfolioCount}` : undefined,
                          icon: (
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          ),
                        },
                        {
                          id: 'wishlist',
                          label: language === 'en' ? 'Wishlist' : '願望清單',
                          badge: wishlistCount > 0 ? `${wishlistCount}` : undefined,
                          icon: <HeartIcon className="w-3.5 h-3.5 shrink-0" filled={activeTab === 'wishlist'} />,
                        },
                        {
                          id: 'sets',
                          label: language === 'en' ? 'Card Sets' : '卡包全集 (160+)',
                          icon: (
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 3h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7H4a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-1" />
                            </svg>
                          ),
                        },
                        {
                          id: 'market',
                          label: t('nav_market') || '市場',
                          icon: <TagIcon className="w-3.5 h-3.5 shrink-0" />,
                        },
                        {
                          id: 'stream',
                          label: t('nav_stream') || '動態',
                          icon: (
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          ),
                        },
                      ].map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleTabClick(item.id)}
                            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                              isActive
                                ? 'bg-ferrari-red text-white border-ferrari-red shadow-xs font-bold'
                                : 'bg-surface-hover/50 hover:bg-surface-hover text-foreground border-hairline/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={isActive ? 'text-white' : 'text-text-muted'}>
                                {item.icon}
                              </span>
                              <span className="truncate">{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-rose-500 text-white shrink-0 ml-1">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {onOpenScanner && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDrawerOpen(false);
                          onOpenScanner();
                        }}
                        className="w-full mt-1.5 h-10 px-3.5 rounded-xl bg-ferrari-red/10 border border-ferrari-red/30 hover:bg-ferrari-red/15 text-ferrari-red flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                      >
                        <CameraIcon className="w-4 h-4" />
                        <span>{t('ai_camera_btn') || 'AI 拍照識卡'}</span>
                      </button>
                    )}
                  </div>

                  {/* 3. Card Category Pills (輕量小膠囊) */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                        {language === 'en' ? 'Categories' : '卡牌品類過濾'}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono font-semibold">
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
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                              isCatSelected
                                ? 'bg-surface-hover border-ferrari-red text-ferrari-red font-bold shadow-2xs'
                                : 'bg-surface text-text-muted hover:text-foreground border-hairline/60'
                            }`}
                          >
                            {t(cat.labelKey)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Language Selector */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-hover/40 border border-hairline/60">
                    <span className="text-xs font-semibold text-text-muted">
                      {t('nav_select_language')}
                    </span>
                    <div className="flex items-center gap-1">
                      {(['zh-TW', 'en', 'zh-CN'] as Language[]).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleLanguageChange(lang)}
                          className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold cursor-pointer transition-all ${
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
              <div className="p-3 border-t border-hairline/60 shrink-0 text-center bg-surface-hover/20">
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
