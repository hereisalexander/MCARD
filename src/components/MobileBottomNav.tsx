'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { TranslationKey } from '@/locales/translations';

export interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  portfolioCount: number;
}

interface NavItem {
  id: string;
  labelKey: TranslationKey;
  fallbackLabel: string;
  icon: (isActive: boolean) => React.ReactNode;
  showBadge?: boolean;
  isAction?: boolean;
  onClick?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  portfolioCount,
}) => {
  const { t } = useLanguage();
  const { user, isLoggedIn, openAuthModal } = useAuth();

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: NavItem[] = [
    {
      id: 'stream',
      labelKey: 'nav_stream',
      fallbackLabel: '即時',
      icon: (isActive: boolean) => (
        <svg
          className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isActive ? '2.5' : '1.8'}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
    {
      id: 'explore',
      labelKey: 'nav_explore',
      fallbackLabel: '探索',
      icon: (isActive: boolean) => (
        <svg
          className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isActive ? '2.5' : '1.8'}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    {
      id: 'market',
      labelKey: 'nav_market',
      fallbackLabel: '市場',
      icon: (isActive: boolean) => (
        <svg
          className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isActive ? '2.5' : '1.8'}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
    {
      id: 'portfolio',
      labelKey: 'nav_portfolio',
      fallbackLabel: '資產',
      showBadge: true,
      icon: (isActive: boolean) => (
        <svg
          className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isActive ? '2.5' : '1.8'}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
    {
      id: 'account',
      labelKey: 'nav_account',
      fallbackLabel: '帳戶',
      isAction: true,
      onClick: openAuthModal,
      icon: () => (
        isLoggedIn && user?.avatarUrl ? (
          <div className="relative w-5 h-5 rounded-full overflow-hidden border border-hairline shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-surface" />
          </div>
        ) : (
          <svg
            className="w-5 h-5 transition-transform duration-150"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )
      ),
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface/98 backdrop-blur-xl border-t border-hairline/80 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] pb-[max(env(safe-area-inset-bottom,0px),10px)] pt-1"
    >
      <div className="flex items-center justify-around h-14 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = !item.isAction && activeTab === item.id;
          const label = t(item.labelKey) || item.fallbackLabel;

          const handleClick = () => {
            if (item.onClick) {
              item.onClick();
              return;
            }
            handleTabClick(item.id);
          };

          const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          };

          return (
            <button
              key={item.id}
              role={item.isAction ? 'button' : 'tab'}
              aria-selected={!item.isAction ? isActive : undefined}
              tabIndex={0}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer transition-all duration-150 select-none touch-manipulation active:scale-95 ${
                isActive
                  ? 'text-ferrari-red font-bold'
                  : 'text-text-muted hover:text-foreground font-medium'
              }`}
            >
              {/* Active Indicator Top Pill */}
              {isActive && (
                <span className="absolute top-0 w-8 h-0.75 bg-ferrari-red rounded-full" />
              )}

              {/* Icon Container with optional Badge */}
              <div className="relative flex items-center justify-center">
                {item.icon(isActive)}

                {item.showBadge && portfolioCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 min-w-4 text-center rounded-full bg-ferrari-red text-white text-[9px] font-bold font-mono shadow-xs tabular-nums">
                    {portfolioCount > 99 ? '99+' : portfolioCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] tracking-wide mt-1 leading-none">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

