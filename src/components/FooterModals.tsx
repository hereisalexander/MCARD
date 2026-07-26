'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export type FooterModalType = 'terms' | 'privacy' | null;

interface FooterModalsProps {
  activeModal: FooterModalType;
  onClose: () => void;
}

export const FooterModals: React.FC<FooterModalsProps> = ({ activeModal, onClose }) => {
  const { t, language } = useLanguage();

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface border-hairline border-primary rounded-[28px] p-6 md:p-8 max-w-lg w-full shadow-2xl relative flex flex-col gap-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 w-8 h-8 rounded-full bg-background border border-primary flex items-center justify-center font-mono text-xs font-bold text-text-muted hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* TERMS MODAL */}
        {activeModal === 'terms' && (
          <div className="flex flex-col gap-4">
            <div>
              <span className="font-mono text-[10px] font-bold text-verge-ultraviolet dark:text-jelly-mint tracking-[2px] uppercase">
                LEGAL & DISCLAIMER
              </span>
              <h3 className="font-display font-bold text-2xl md:text-3xl uppercase text-foreground mt-1">
                TERMS OF SERVICE
              </h3>
            </div>
            <div className="font-body text-xs text-text-muted leading-relaxed space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <p>
                {language === 'en'
                  ? 'Welcome to The Collectr Stream. By using this service, you agree to our terms regarding card valuation data, API usage, and copyright disclosures.'
                  : language === 'zh-TW'
                  ? '歡迎使用 The Collectr Stream 寶可夢卡牌平台。使用本服務即代表您同意我們關於卡牌估估數據、API 使用與版權聲明之條款。'
                  : '欢迎使用 The Collectr Stream 宝可梦卡牌平台。使用本服务即代表您同意我们关于卡牌估值数据、API 使用与版权声明之条款。'}
              </p>
              <h4 className="font-mono font-bold text-foreground text-xs uppercase pt-2">
                1. INTELLECTUAL PROPERTY & COPYRIGHT
              </h4>
              <p>
                Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and GAME FREAK. All card images and trademarks belong to their respective owners. This application is an unofficial fan-made tool and is not affiliated with or endorsed by The Pokémon Company or Nintendo.
              </p>
              <h4 className="font-mono font-bold text-foreground text-xs uppercase pt-2">
                2. MARKET PRICE & INVESTMENT DISCLAIMER
              </h4>
              <p>
                All market prices, ROI calculations, and historical charts are fetched from live TCGPlayer / Cardmarket API data or derived estimates. They are for educational and tracking purposes only and do not constitute financial advice.
              </p>
            </div>
          </div>
        )}

        {/* PRIVACY MODAL */}
        {activeModal === 'privacy' && (
          <div className="flex flex-col gap-4">
            <div>
              <span className="font-mono text-[10px] font-bold text-verge-ultraviolet dark:text-jelly-mint tracking-[2px] uppercase">
                DATA PROTECTION
              </span>
              <h3 className="font-display font-bold text-2xl md:text-3xl uppercase text-foreground mt-1">
                PRIVACY POLICY
              </h3>
            </div>
            <div className="font-body text-xs text-text-muted leading-relaxed space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <p>
                {language === 'en'
                  ? 'Your privacy is paramount. We adhere to a strict Local-First privacy architecture.'
                  : language === 'zh-TW'
                  ? '您的隱私至關重要。我們遵循嚴格的 本地優先 (Local-First) 隱私防護架構。'
                  : '您的隐私至关重要。我们遵循严格的 本地优先 (Local-First) 隐私防护架构。'}
              </p>
              <div className="p-3.5 bg-background border border-primary rounded-xl font-mono text-[11px]">
                <span className="font-bold text-emerald-500 dark:text-jelly-mint">✓ LOCAL STORAGE ONLY</span>
                <p className="mt-1 text-text-muted text-[10px]">
                  All portfolio items, purchase costs, and language preferences are stored locally inside your browser. No personal card holdings are tracked or sold to third parties.
                </p>
              </div>
              <h4 className="font-mono font-bold text-foreground text-xs uppercase pt-2">
                COOKIES & ANALYTICS
              </h4>
              <p>
                We do not use invasive tracking cookies or third-party advertising scripts.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
