'use client';

import React, { useState } from 'react';
import { UniversalCard, CardCategory } from '@/services/multiCardService';
import { WishlistItem } from '@/types/wishlist';
import { HeartIcon } from '@/components/icons/AppIcons';

export interface AddToWishlistModalProps {
  card: UniversalCard | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAdd: (item: WishlistItem) => void;
  category: CardCategory;
}

export const AddToWishlistModal: React.FC<AddToWishlistModalProps> = ({
  card,
  isOpen,
  onClose,
  onConfirmAdd,
  category,
}) => {
  const currentPrice = card?.price || 0;
  const [targetPrice, setTargetPrice] = useState<string>(
    currentPrice > 0 ? (currentPrice * 0.85).toFixed(0) : ''
  );
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || !card) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericTarget = parseFloat(targetPrice);
    const newItem: WishlistItem = {
      id: `wish-${card.id}-${Date.now()}`,
      cardId: card.id,
      cardName: card.name,
      cardNumber: card.number,
      setName: card.set,
      imageUrl: card.imageUrl,
      category,
      targetPrice: !isNaN(numericTarget) && numericTarget > 0 ? numericTarget : currentPrice,
      baseMarketPrice: currentPrice,
      addedAt: new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
    };
    onConfirmAdd(newItem);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-surface border border-hairline rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
              <HeartIcon filled={true} className="w-4 h-4" />
            </div>
            <h3 id="wishlist-modal-title" className="font-sans font-bold text-base text-foreground">
              加入願望清單 & 設定目標價
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-foreground p-1 text-sm font-bold transition-colors cursor-pointer"
            aria-label="關閉"
          >
            ✕
          </button>
        </div>

        {/* Card Snapshot */}
        <div className="flex items-center gap-3 py-3 mt-1 bg-surface-hover/50 rounded-xl px-3 border border-hairline/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-12 h-16 object-contain rounded-md bg-background shrink-0 border border-hairline"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-sans font-bold text-xs text-foreground truncate">{card.name}</span>
            <span className="text-[10px] text-text-muted font-mono">{card.set}</span>
            <span className="text-[10px] text-foreground font-mono font-bold mt-0.5">
              當前官方參考價: ${currentPrice.toLocaleString('en-US')} USD
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono font-bold text-foreground">
                期望入手目標價 (USD)
              </label>
              <span className="text-[10px] text-text-muted font-mono">預設為 85 折行情</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">
                $
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="例如: 120"
                className="w-full pl-8 pr-3 py-2 bg-surface-hover/80 text-foreground border border-hairline/80 rounded-xl font-mono text-sm focus:outline-none focus:border-rose-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-foreground mb-1">
              個人筆記 (可選)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如: 等 PSA 10 跌破 $150 收，或台北捷運面交..."
              className="w-full p-2.5 bg-surface-hover/80 text-foreground border border-hairline/80 rounded-xl font-sans text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-foreground bg-surface-hover transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <HeartIcon filled={true} className="w-3.5 h-3.5 text-white" />
              <span>確認加入心願單</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
