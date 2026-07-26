'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationKey, translations } from '@/locales/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'pokemon_collector_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'zh-TW' || savedLang === 'zh-CN')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.en;
    let text = dict[key] || translations.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(`{${paramKey}}`, String(value));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
