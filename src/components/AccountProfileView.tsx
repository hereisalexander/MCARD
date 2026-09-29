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

const AVATAR_PRESETS = [
  { name: 'Ash Ketchum (小智)', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ash' },
  { name: 'Seto Kaiba (海馬瀨人)', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kaiba' },
  { name: 'Trainer Red (赤紅)', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RedTrainer' },
  { name: 'Misty (小霞)', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MistyWater' },
  { name: 'Steven Stone (大吾)', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StevenStone' },
  { name: 'Cynthia (竹蘭)', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CynthiaSinnoh' },
];

export const AccountProfileView: React.FC<AccountProfileViewProps> = ({
  onNavigateToTab,
  portfolioCount,
  portfolioValue,
  wishlistCount,
  listingsCount,
}) => {
  const { user, isLoggedIn, logout, updateProfile, switchDemoProfile, openAuthModal } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(user?.name || '');
  const [editAvatar, setEditAvatar] = useState<string>(user?.avatarUrl || '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleStartEdit = () => {
    if (!user) return;
    setEditName(user.name);
    setEditAvatar(user.avatarUrl);
    setIsEditing(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateProfile({
      name: editName.trim(),
      avatarUrl: editAvatar,
    });
    setIsEditing(false);
    showStatus('個人資料已成功更新！');
  };

  const handleSelectPresetAvatar = (url: string) => {
    setEditAvatar(url);
  };

  const handleSwitchDemo = (preset: 'ash' | 'kaiba' | 'red') => {
    switchDemoProfile(preset);
    showStatus(`已成功切換為測試身分！`);
  };

  const handleLogout = () => {
    logout();
    onNavigateToTab('explore');
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-surface-hover flex items-center justify-center border border-hairline mb-6">
          <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">尚未登入帳戶</h2>
        <p className="text-sm text-text-muted max-w-sm mb-6 leading-relaxed">
          登入後即可在跨裝置同步您的個人卡牌收藏庫、追蹤心願清單降價動態與發布市集交易。
        </p>
        <button
          type="button"
          onClick={openAuthModal}
          className="h-11 px-8 rounded-xl bg-ferrari-red text-white hover:bg-ferrari-red-hover active:bg-ferrari-red-active text-xs font-bold tracking-wide transition-all shadow-sm cursor-pointer"
        >
          {t('auth_login')}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-6 flex flex-col gap-8 animate-fade-in">
      {/* Status Toast Banner */}
      {statusMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-surface border border-emerald-500/40 text-emerald-600 px-5 py-2.5 rounded-full shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {statusMessage}
        </div>
      )}

      {/* 1. Main Profile Card Header */}
      <div className="relative w-full rounded-2xl bg-surface border border-hairline/80 overflow-hidden shadow-xs">
        {/* Decorative Top Accent Bar */}
        <div className="h-24 sm:h-32 w-full bg-gradient-to-r from-ferrari-red via-rose-600 to-amber-500 opacity-90 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-3 right-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-mono font-bold text-white tracking-widest uppercase border border-white/20">
            PRO COLLECTOR
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar with Status Pip */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-background border-4 border-surface shadow-md shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-surface" title="在線已同步" />
            </div>

            {/* Name & Credentials */}
            <div className="flex flex-col pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {user.name}
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-ferrari-red/10 border border-ferrari-red/20 text-ferrari-red text-[10px] font-bold uppercase tracking-wider font-mono">
                  {user.provider === 'google' ? 'Google 認證' : 'Email 認證'}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
              <p className="text-[11px] text-text-muted/70 mt-1 font-mono">
                會員註冊日期：{user.joinedAt || '2026/01/01'}
              </p>
            </div>
          </div>

          {/* Action: Edit Profile Button */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
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
          </div>
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

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2">快速選擇預設大頭貼</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(p.url)}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                        editAvatar === p.url ? 'border-ferrari-red ring-2 ring-ferrari-red/30 scale-105' : 'border-hairline hover:border-text-muted'
                      }`}
                      title={p.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                    </button>
                  ))}
                </div>
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

      {/* 2. Quick Vault & Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Portfolio Value */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateToTab('portfolio')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateToTab('portfolio'); }}
          className="p-4 rounded-2xl bg-surface border border-hairline/80 hover:border-ferrari-red/40 transition-all duration-150 cursor-pointer shadow-2xs group flex flex-col justify-between"
        >
          <span className="text-[11px] font-semibold text-text-muted tracking-wide">個人資產庫總值</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-2 group-hover:text-ferrari-red transition-colors">
            ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-text-muted/80 mt-1 flex items-center gap-1">
            前往資產庫 →
          </span>
        </div>

        {/* Portfolio Count */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateToTab('portfolio')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateToTab('portfolio'); }}
          className="p-4 rounded-2xl bg-surface border border-hairline/80 hover:border-ferrari-red/40 transition-all duration-150 cursor-pointer shadow-2xs group flex flex-col justify-between"
        >
          <span className="text-[11px] font-semibold text-text-muted tracking-wide">庫存持倉卡牌</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-2 group-hover:text-ferrari-red transition-colors">
            {portfolioCount} <span className="text-xs font-normal text-text-muted">張</span>
          </span>
          <span className="text-[10px] text-text-muted/80 mt-1 flex items-center gap-1">
            檢視所有卡牌 →
          </span>
        </div>

        {/* Wishlist Tracking */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateToTab('wishlist')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateToTab('wishlist'); }}
          className="p-4 rounded-2xl bg-surface border border-hairline/80 hover:border-rose-500/40 transition-all duration-150 cursor-pointer shadow-2xs group flex flex-col justify-between"
        >
          <span className="text-[11px] font-semibold text-text-muted tracking-wide">心願目標追蹤</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-rose-500 mt-2">
            {wishlistCount} <span className="text-xs font-normal text-text-muted">張</span>
          </span>
          <span className="text-[10px] text-text-muted/80 mt-1 flex items-center gap-1">
            檢視願望清單 →
          </span>
        </div>

        {/* Marketplace Active Listings */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigateToTab('market')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigateToTab('market'); }}
          className="p-4 rounded-2xl bg-surface border border-hairline/80 hover:border-amber-500/40 transition-all duration-150 cursor-pointer shadow-2xs group flex flex-col justify-between"
        >
          <span className="text-[11px] font-semibold text-text-muted tracking-wide">市集上架中商品</span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-amber-500 mt-2">
            {listingsCount} <span className="text-xs font-normal text-text-muted">件</span>
          </span>
          <span className="text-[10px] text-text-muted/80 mt-1 flex items-center gap-1">
            前往卡牌市集 →
          </span>
        </div>
      </div>

      {/* 3. Developer Sandbox: Instant Profile Switcher (開發測試專用) */}
      <div className="w-full rounded-2xl bg-surface border border-hairline/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-sm font-bold tracking-wide uppercase text-foreground">
              開發測試工具：快速切換測試身分 (Dev Sandbox)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-text-muted bg-surface-hover px-2 py-0.5 rounded-md border border-hairline">
            DEVELOPMENT ONLY
          </span>
        </div>
        <p className="text-xs text-text-muted mb-4 leading-relaxed">
          在開發階段，您可隨時點擊下方預設角色快速切換會員身分，以驗證市集不同賣家/買家、頭像以及權限連動體驗：
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleSwitchDemo('ash')}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              user.id === 'usr_ash_001' ? 'border-ferrari-red bg-ferrari-red/5' : 'border-hairline hover:bg-surface-hover'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ash" alt="Ash" className="w-9 h-9 rounded-full bg-background border border-hairline shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">小智 (Ash Ketchum)</span>
              <span className="text-[10px] text-text-muted">真新鎮寶可夢大師</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchDemo('kaiba')}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              user.id === 'usr_kaiba_002' ? 'border-ferrari-red bg-ferrari-red/5' : 'border-hairline hover:bg-surface-hover'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kaiba" alt="Kaiba" className="w-9 h-9 rounded-full bg-background border border-hairline shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">海馬瀨人 (Seto Kaiba)</span>
              <span className="text-[10px] text-text-muted">海馬娛樂集團社長</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchDemo('red')}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              user.id === 'usr_red_003' ? 'border-ferrari-red bg-ferrari-red/5' : 'border-hairline hover:bg-surface-hover'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=RedTrainer" alt="Red" className="w-9 h-9 rounded-full bg-background border border-hairline shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">赤紅 (Trainer Red)</span>
              <span className="text-[10px] text-text-muted">白銀山頂級傳奇藏家</span>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Settings & Preferences Card */}
      <div className="w-full rounded-2xl bg-surface border border-hairline/80 p-5 sm:p-6 shadow-2xs flex flex-col gap-5">
        <h2 className="text-sm font-bold tracking-wide uppercase text-foreground">
          帳戶偏好與系統設定 (Preferences & System)
        </h2>

        {/* Theme Setting */}
        <div className="flex items-center justify-between py-2 border-b border-hairline/60">
          <div>
            <span className="text-xs font-semibold text-foreground">介面主題外觀</span>
            <p className="text-[11px] text-text-muted mt-0.5">切換白晝純淨模式或法拉利暗黑賽道主題</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="h-8 px-3.5 rounded-lg border border-hairline/80 bg-surface-hover font-sans text-xs font-semibold text-foreground hover:border-text-muted transition-colors cursor-pointer flex items-center gap-2"
          >
            {theme === 'dark' ? '🌙 暗黑賽道模式' : '☀️ 白晝純淨模式'}
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

      {/* 5. Logout & Account Exit */}
      <div className="w-full flex items-center justify-between pt-2">
        <span className="text-xs text-text-muted">
          切換為訪客模式將隱藏個人帳戶頁面。
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
    </div>
  );
};
