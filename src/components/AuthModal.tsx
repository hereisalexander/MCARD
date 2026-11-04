'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    authPromptMessage,
  } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleToggleMode = () => {
    setIsSignUp((prev) => !prev);
    setErrorMessage(null);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isSignUp) {
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '驗證失敗，請再試一次');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface border border-hairline/80 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative flex flex-col gap-5">
        
        {/* Modal Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-6 top-6 w-8 h-8 rounded-full bg-surface-hover border border-hairline flex items-center justify-center font-mono text-xs font-bold text-text-muted hover:text-ferrari-red transition-colors cursor-pointer"
          aria-label={t('auth_close')}
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex flex-col gap-1 pr-8">
          <span className="text-[10px] font-semibold text-ferrari-red tracking-wider uppercase">
            Scuderia Access
          </span>
          <h3 className="font-sans font-medium text-2xl tracking-tight text-foreground leading-tight">
            {isSignUp ? '建立全新帳號' : t('auth_modal_title')}
          </h3>
          <p className="font-sans text-xs text-text-muted mt-1 leading-relaxed">
            {isSignUp ? '註冊即可即時保存專屬卡牌資產與二手交易資訊' : t('auth_modal_subtitle')}
          </p>
        </div>

        {/* 操作攔截提示或雲端提示 */}
        {authPromptMessage ? (
          <div className="p-3.5 bg-ferrari-red/10 border border-ferrari-red/30 rounded-xl flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-ferrari-red mt-1.5 shrink-0" />
            <span className="font-sans text-xs font-medium text-ferrari-red leading-relaxed">
              {authPromptMessage}
            </span>
          </div>
        ) : (
          <div className="p-3.5 bg-surface-hover rounded-xl border border-hairline/60 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-ferrari-red mt-1.5 shrink-0" />
            <span className="font-sans text-xs text-text-muted leading-relaxed">
              {t('auth_cloud_sync_desc')}
            </span>
          </div>
        )}

        {/* 錯誤提示 */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-500 font-medium">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Fast Auth Providers */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-surface-hover border border-hairline font-sans text-xs font-semibold tracking-wide text-foreground hover:border-text-muted transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {/* Google Icon SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {t('auth_continue_google')}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="h-[1px] bg-hairline/60 flex-1" />
          <span className="text-[9px] text-text-muted font-bold tracking-wider uppercase">
            {t('auth_or_divider')}
          </span>
          <div className="h-[1px] bg-hairline/60 flex-1" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
          {isSignUp && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-text-muted tracking-wide">
                {t('auth_name_label')}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex / TCG 藏家"
                className="h-11 bg-surface-hover border border-hairline rounded-xl px-4 text-xs text-foreground focus:outline-none focus:border-ferrari-red focus:ring-2 focus:ring-ferrari-red/10"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-text-muted tracking-wide">
              {t('auth_email_label')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collector@pokemon.com"
              className="h-11 bg-surface-hover border border-hairline rounded-xl px-4 text-xs text-foreground focus:outline-none focus:border-ferrari-red focus:ring-2 focus:ring-ferrari-red/10"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-text-muted tracking-wide">
              {t('auth_password_label')}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 bg-surface-hover border border-hairline rounded-xl px-4 text-xs text-foreground focus:outline-none focus:border-ferrari-red focus:ring-2 focus:ring-ferrari-red/10"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 h-11 rounded-xl bg-ferrari-red text-white hover:bg-ferrari-red-hover active:bg-ferrari-red-active font-sans text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSignUp ? (
              t('auth_sign_up_email')
            ) : (
              t('auth_sign_in_email')
            )}
          </button>
        </form>

        {/* Toggle Sign in / Sign up */}
        <div className="text-center pt-2 border-t border-hairline/60">
          <button
            type="button"
            onClick={handleToggleMode}
            className="text-[11px] text-text-muted hover:text-foreground font-semibold tracking-wide underline cursor-pointer"
          >
            {isSignUp ? '已有帳號？前往登入' : "還沒有帳號？立即註冊"}
          </button>
        </div>

      </div>
    </div>
  );
};
