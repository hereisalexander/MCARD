'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'mcard_theme';
const OLD_THEME_STORAGE_KEY = 'pokemon_collector_theme';

const applyThemeClass = (targetTheme: ThemeMode) => {
  const root = document.documentElement;
  if (targetTheme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = (localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(OLD_THEME_STORAGE_KEY)) as ThemeMode;
      if (saved && (saved === 'light' || saved === 'dark')) {
        setThemeState(saved);
        applyThemeClass(saved);
      } else {
        applyThemeClass('light');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyThemeClass(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
