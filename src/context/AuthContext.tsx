'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  provider: 'google' | 'email';
  joinedAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, name: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  switchDemoProfile: (profile: 'ash' | 'kaiba' | 'red') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'mcard_user_session';
const OLD_AUTH_STORAGE_KEY = 'pokemon_collector_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Load active user session on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedSession = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(OLD_AUTH_STORAGE_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          // 淨化舊版殘留的 mock 測試帳號 (小智 / 海馬 / 赤紅 / palette-town)
          const isMockUser =
            parsed.id?.startsWith('usr_ash_') ||
            parsed.id?.startsWith('usr_kaiba_') ||
            parsed.id?.startsWith('usr_red_') ||
            parsed.id === 'usr_google_151' ||
            parsed.email?.includes('palette') ||
            parsed.name?.includes('小智');

          if (isMockUser) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem(OLD_AUTH_STORAGE_KEY);
            setUser(null);
          } else {
            setUser(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const saveSession = (userProfile: UserProfile) => {
    setUser(userProfile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userProfile));
    closeAuthModal();
  };

  const loginWithGoogle = () => {
    const googleUser: UserProfile = {
      id: `usr_google_${Date.now()}`,
      name: 'Google 藏家',
      email: 'collector@gmail.com',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleCollector',
      provider: 'google',
      joinedAt: new Date().toLocaleDateString('zh-TW'),
    };
    saveSession(googleUser);
  };

  const loginWithEmail = (email: string, name: string) => {
    const emailUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name || email.split('@')[0],
      email: email,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
      provider: 'email',
      joinedAt: new Date().toLocaleDateString(),
    };
    saveSession(emailUser);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    saveSession(updated);
  };

  const switchDemoProfile = (profile: 'ash' | 'kaiba' | 'red') => {
    const presets: Record<'ash' | 'kaiba' | 'red', UserProfile> = {
      ash: {
        id: 'usr_ash_001',
        name: 'Ash Ketchum (小智)',
        email: 'ash@palette-town.kanto',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ash',
        provider: 'google',
        joinedAt: '2026/01/15',
      },
      kaiba: {
        id: 'usr_kaiba_002',
        name: 'Seto Kaiba (海馬瀨人)',
        email: 'president@kaibacorp.com',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kaiba',
        provider: 'google',
        joinedAt: '2026/02/01',
      },
      red: {
        id: 'usr_red_003',
        name: 'Trainer Red (赤紅)',
        email: 'red@mt-silver.kanto',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RedTrainer',
        provider: 'email',
        joinedAt: '2026/03/10',
      },
    };
    saveSession(presets[profile]);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        loginWithEmail,
        updateProfile,
        switchDemoProfile,
        logout,
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
