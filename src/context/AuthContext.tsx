'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  provider?: 'google' | 'email' | string;
  role?: string;
  joinedAt?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authPromptMessage: string | null;
  openAuthModal: (promptMessage?: string) => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  logout: () => Promise<void>;
  requireAuthAction: (action: () => void, promptMessage?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'mcard_user_session';
const OLD_AUTH_STORAGE_KEY = 'pokemon_collector_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);

  // 檢查當前 Session 登入狀態 (向後端 /api/v1/auth/me 驗證)
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/auth/me', { cache: 'no-store' });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const json = await res.json();
      if (json.success && json.data?.user) {
        setUser(json.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('[AuthContext] 驗證 Session 失敗，視為未登入:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 元件掛載時執行 Session 驗證與清理過往 localStorage mock 資料
  useEffect(() => {
    // 徹底清除過往舊版 mock 殘留
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(OLD_AUTH_STORAGE_KEY);
    } catch {}

    // refreshUser 是 async，呼叫後不阻塞 effect，不會造成同步 setState 問題
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUser();
  }, [refreshUser]);

  const openAuthModal = useCallback((promptMessage?: string) => {
    setAuthPromptMessage(promptMessage || null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthPromptMessage(null);
  }, []);

  // 1-Click Google OAuth 轉向（需要整頁跳轉啟動 OAuth flow，不使用 router.push）
  const loginWithGoogle = useCallback(() => {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/api/v1/auth/google';
  }, []);

  // Email 密碼登入
  const loginWithEmail = useCallback(
    async (email: string, password: string): Promise<void> => {
      const res = await fetch('/api/v1/auth/email/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || '登入失敗，請檢查帳號或密碼');
      }

      setUser(json.data);
      closeAuthModal();
    },
    [closeAuthModal]
  );

  // Email 註冊
  const registerWithEmail = useCallback(
    async (email: string, password: string, name: string): Promise<void> => {
      const res = await fetch('/api/v1/auth/email/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || '註冊失敗，請檢查輸入內容');
      }

      setUser(json.data);
      closeAuthModal();
    },
    [closeAuthModal]
  );

  // 更新本機用戶暫存資料
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  // 登出
  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('[AuthContext] 登出 API 呼叫異常:', err);
    } finally {
      setUser(null);
      // 重新載入或重整頁面以更新登入狀態視圖
      window.location.reload();
    }
  }, []);

  // 關鍵操作守衛攔截器 (Auth Guard)
  const requireAuthAction = useCallback(
    (action: () => void, promptMessage?: string): boolean => {
      if (!user) {
        openAuthModal(promptMessage || '此操作需要登入帳號，請先登入後繼續。');
        return false;
      }
      action();
      return true;
    },
    [user, openAuthModal]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        isAuthModalOpen,
        authPromptMessage,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        updateProfile,
        logout,
        requireAuthAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
