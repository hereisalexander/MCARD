'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Language } from '@/locales/translations';

interface AccountProfileViewProps {
  onNavigateToTab: (tab: string) => void;
  portfolioCount: number;
  portfolioValue: number;
  wishlistCount: number;
  listingsCount: number;
}

export const AccountProfileView: React.FC<AccountProfileViewProps> = ({
  onNavigateToTab,
  portfolioCount,
  portfolioValue,
  wishlistCount,
  listingsCount,
}) => {
  const { user, isLoggedIn, logout, updateProfile, openAuthModal } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(user?.name || '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleStartEdit = () => {
    if (!user) return;
    setEditName(user.name);
    setIsEditing(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateProfile({
      name: editName.trim(),
    });
    setIsEditing(false);
    showStatus('個人暱稱已成功更新！');
  };

  const handleLogout = () => {
    logout();
    onNavigateToTab('explore');
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 flex flex-col gap-8 animate-fade-in">
      {/* Status Toast Banner */}
      {statusMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-surface border border-emerald-500/40 text-emerald-600 px-5 py-2.5 rounded-full shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {statusMessage}
        </div>
      )}

      {/* 1. Main Profile Card Header - 方案 1: 現代金融/極致簡潔風格 (Fintech Clean Style) */}
      <div className="w-full rounded-2xl bg-surface border border-hairline/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4.5 min-w-0">
          {/* Avatar with Status Pip - 最簡約經典人像 */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-surface-hover/80 border border-hairline/90 shadow-2xs shrink-0 flex items-center justify-center text-text-muted">
            {isLoggedIn && user?.avatarUrl && !user.avatarUrl.includes('dicebear') ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-surface-hover/70 flex items-center justify-center text-text-muted/80">
                <svg className="w-8 h-8 sm:w-9 sm:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            {isLoggedIn && (
              <span className="absolute bottom-1.5 right-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface" title="在線已同步" />
            )}
          </div>

          {/* Name & Credentials */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                {isLoggedIn && user ? user.name : t('auth_guest')}
              </h1>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono border ${
                isLoggedIn
                  ? 'bg-ferrari-red/10 border-ferrari-red/20 text-ferrari-red'
                  : 'bg-surface-hover border-hairline text-text-muted'
              }`}>
                {isLoggedIn && user
                  ? (user.provider === 'google' ? 'Google 認證' : 'Email 認證')
                  : '訪客暫存'}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-surface-hover text-text-muted border border-hairline/70">
                {isLoggedIn ? 'PRO COLLECTOR' : 'GUEST MODE'}
              </span>
            </div>

            <p className="text-xs text-text-muted mt-1 truncate">
              {isLoggedIn && user ? user.email : '登入後可啟用跨裝置雲端同步、市集交易與數據恢復'}
            </p>
            <p className="text-[11px] text-text-muted/70 mt-0.5 font-mono">
              {isLoggedIn && user ? `會員建立日期：${user.joinedAt || '2026/01/01'}` : '尚未登入正式帳號'}
            </p>
          </div>
        </div>

        {/* Action Button: Edit Profile (Logged in) or Sign In Button (Guest) */}
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline/60">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="h-9 px-4 rounded-xl border border-hairline/80 bg-surface-hover hover:border-text-muted/40 font-sans text-xs font-semibold text-foreground transition-all duration-150 cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>編輯個人資料</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="h-9.5 px-5 rounded-xl bg-ferrari-red text-white hover:bg-ferrari-red-hover active:bg-ferrari-red-active font-sans text-xs font-bold tracking-wide transition-all duration-150 cursor-pointer shadow-2xs flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>{t('auth_login')} / 註冊</span>
            </button>
          )}
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-surface border border-hairline rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-foreground">編輯個人檔案</h3>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">暱稱 / 藏家代號</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-hairline bg-surface-hover/50 text-foreground text-xs font-medium focus:outline-none focus:border-ferrari-red"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-foreground bg-surface-hover cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-ferrari-red hover:bg-ferrari-red-hover active:bg-ferrari-red-active transition-all cursor-pointer shadow-sm"
                >
                  儲存變更
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Primary Portfolio Vault Entrance Card (專屬核心資產庫入口) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onNavigateToTab('portfolio')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateToTab('portfolio'); }}
        className="w-full rounded-2xl bg-surface border border-hairline/80 hover:border-ferrari-red/50 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-ferrari-red/10 text-ferrari-red flex items-center justify-center shrink-0 border border-ferrari-red/20 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-foreground group-hover:text-ferrari-red transition-colors truncate">
                我的個人卡牌資產庫 (Portfolio Vault)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-ferrari-red text-white text-[10px] font-mono font-bold shrink-0">
                {portfolioCount} 張持倉
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5 truncate">
              追蹤購入成本、即時現值、未實現損益 (P&L / ROI %) 與 PSA 鑑定評級
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-hairline/60">
          <div className="flex flex-col sm:items-end">
            <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">資產總市值</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-ferrari-red hover:bg-ferrari-red-hover text-white text-xs font-bold transition-all shadow-2xs group-hover:shadow-sm flex items-center gap-1.5 shrink-0 pointer-events-none"
          >
            <span>進入資產庫</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Auxiliary Activity Portals (Wishlist & Marketplace) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Wishlist Portal - 我的心願單專屬入口 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateToTab('wishlist')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateToTab('wishlist'); }}
          className="p-4 sm:p-5 rounded-2xl bg-surface border border-hairline/80 hover:border-rose-500/50 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-md group flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground group-hover:text-rose-500 transition-colors truncate">
                  我的心願單 (Wishlist)
                </span>
                <span className="px-2 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold shrink-0">
                  {wishlistCount} 張
                </span>
              </div>
              <span className="text-[11px] text-text-muted truncate mt-0.5">
                追蹤心儀卡牌價格波動與市場動態
              </span>
            </div>
          </div>
          <span className="text-xs text-text-muted group-hover:text-rose-500 transition-colors font-semibold shrink-0">
            檢視清單 →
          </span>
        </div>

        {/* Marketplace Active Listings */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateToTab('market')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateToTab('market'); }}
          className="p-4 sm:p-5 rounded-2xl bg-surface border border-hairline/80 hover:border-amber-500/50 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-md group flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground group-hover:text-amber-500 transition-colors truncate">
                  市集上架商品
                </span>
                <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold shrink-0">
                  {listingsCount} 件
                </span>
              </div>
              <span className="text-[11px] text-text-muted truncate mt-0.5">
                管理已刊登的待售卡牌與交易狀態
              </span>
            </div>
          </div>
          <span className="text-xs text-text-muted group-hover:text-amber-500 transition-colors font-semibold shrink-0">
            前往市集 →
          </span>
        </div>
      </div>

      {/* 3. Settings & Preferences Card */}
      <div className="w-full rounded-2xl bg-surface border border-hairline/80 p-5 sm:p-6 shadow-2xs flex flex-col gap-5">
        <h2 className="text-sm font-bold tracking-wide uppercase text-foreground">
          帳戶偏好與系統設定 (Preferences & System)
        </h2>

        {/* Theme Setting */}
        <div className="flex items-center justify-between py-2 border-b border-hairline/60">
          <div>
            <span className="text-xs font-semibold text-foreground">介面主題外觀</span>
            <p className="text-[11px] text-text-muted mt-0.5">自訂介面視覺主題</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="h-8 px-3.5 rounded-lg border border-hairline/80 bg-surface-hover font-sans text-xs font-semibold text-foreground hover:border-text-muted transition-colors cursor-pointer flex items-center justify-center"
          >
            {theme === 'dark' ? '深色' : '淺色'}
          </button>
        </div>

        {/* Language Setting */}
        <div className="flex items-center justify-between py-2 border-b border-hairline/60">
          <div>
            <span className="text-xs font-semibold text-foreground">顯示語言</span>
            <p className="text-[11px] text-text-muted mt-0.5">切換全站顯示語言</p>
          </div>
          <div className="flex items-center gap-1.5">
            {(['zh-TW', 'zh-CN', 'en'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  language === lang
                    ? 'bg-ferrari-red text-white'
                    : 'bg-surface-hover text-text-muted hover:text-foreground'
                }`}
              >
                {lang === 'zh-TW' ? '繁體' : lang === 'zh-CN' ? '简体' : 'EN'}
              </button>
            ))}
          </div>
        </div>

        {/* Cloud Sync Status */}
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-xs font-semibold text-foreground">雲端自動同步</span>
            <p className="text-[11px] text-text-muted mt-0.5">本地收藏與市集數據已與當前身分保持同步</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-mono font-bold border border-emerald-500/20">
            ✓ SYNCED ACTIVE
          </span>
        </div>
      </div>

      {/* 5. Logout & Account Exit (Only shown when logged in) */}
      {isLoggedIn ? (
        <div className="w-full flex items-center justify-between pt-2">
          <span className="text-xs text-text-muted">
            切換為訪客模式後，您隨時可再次登入恢復資產同步。
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="h-10 px-5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold tracking-wide transition-all cursor-pointer shadow-2xs flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{t('auth_logout')}</span>
          </button>
        </div>
      ) : (
        <div className="w-full flex items-center justify-between pt-2 text-xs text-text-muted">
          <span>目前為訪客體驗模式，隨時點擊右上角或上方按鈕即可進行帳戶登入。</span>
          <button
            type="button"
            onClick={openAuthModal}
            className="text-ferrari-red font-bold hover:underline cursor-pointer"
          >
            立即登入 →
          </button>
        </div>
      )}
    </div>
  );
};
