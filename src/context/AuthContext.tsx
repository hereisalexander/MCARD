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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'pokemon_collector_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Load active user session on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        setUser(JSON.parse(savedSession));
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
    }
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
      id: 'usr_google_151',
      name: 'Ash Ketchum',
      email: 'ash.ketchum@palette.town',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ash',
      provider: 'google',
      joinedAt: new Date().toLocaleDateString(),
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
