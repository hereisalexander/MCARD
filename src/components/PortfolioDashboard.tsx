'use client';

import React, { useState, useRef } from 'react';
import { HoloCard } from '@/components/HoloCard';
import { useLanguage } from '@/context/LanguageContext';

export type CardCondition = 'Ungraded' | 'PSA 10' | 'PSA 9' | 'BGS 10' | 'BGS Black Label';

export interface UserPortfolioItem {
  id: string;
  name: string;
  price: number; // Current market price
  buyPrice: number; // Purchased cost
  quantity: number; // Quantity owned
  condition: CardCondition;
  imageUrl: string;
  addedAt: string;
}

interface PortfolioDashboardProps {
  portfolio: UserPortfolioItem[];
  onRemoveCard: (id: string) => void;
  onUpdateCard: (updatedItem: UserPortfolioItem) => void;
  onImportPortfolio: (importedItems: UserPortfolioItem[]) => void;
  portfolioValue: number;
  mode: 'portfolio' | 'showcase';
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  portfolio,
  onRemoveCard,
  onUpdateCard,
  onImportPortfolio,
  portfolioValue,
  mode,
}) => {
  const { t } = useLanguage();
  const [editingBuyPriceId, setEditingBuyPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newCardName, setNewCardName] = useState<string>('');
  const [newCardPrice, setNewCardPrice] = useState<string>('');
  const [newCardQuantity, setNewCardQuantity] = useState<number>(1);
  const [newCardCondition, setNewCardCondition] = useState<CardCondition>('Ungraded');
  const [newCardImage, setNewCardImage] = useState<string>('');

  // Total cost calculation
  const totalCost = portfolio.reduce((acc, curr) => acc + ((curr.buyPrice ?? curr.price) * (curr.quantity || 1)), 0);
  const totalPnl = portfolioValue - totalCost;
  const totalRoi = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const isPnlPositive = totalPnl >= 0;

  // Handlers
  const handleQuantityChange = (item: UserPortfolioItem, delta: number) => {
    const newQty = (item.quantity || 1) + delta;
    if (newQty <= 0) {
      onRemoveCard(item.id);
      return;
    }
    onUpdateCard({ ...item, quantity: newQty });
  };

  const handleConditionChange = (item: UserPortfolioItem, newCondition: CardCondition) => {
    onUpdateCard({ ...item, condition: newCondition });
  };

  const handleStartEditingBuyPrice = (item: UserPortfolioItem) => {
    setEditingBuyPriceId(item.id);
    setEditPriceValue((item.buyPrice ?? item.price).toString());
  };

  const handleSaveBuyPrice = (item: UserPortfolioItem) => {
    const parsed = parseFloat(editPriceValue);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateCard({ ...item, buyPrice: parsed });
    }
    setEditingBuyPriceId(null);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(portfolio, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pokemon_portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = e.target.files?.[0];
    if (!fileObj) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportPortfolio(parsed);
        }
      } catch (err) {
        console.error('Failed to parse portfolio JSON backup file:', err);
      }
    };
    reader.readAsText(fileObj);
    e.target.value = '';
  };

  const handleAddCustomCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName) return;

    const priceNum = parseFloat(newCardPrice) || 10.0;
    const newItem: UserPortfolioItem = {
      id: `custom-${Date.now()}`,
      name: newCardName,
      price: priceNum,
      buyPrice: priceNum,
      quantity: newCardQuantity || 1,
      condition: newCardCondition,
      imageUrl: newCardImage || 'https://images.pokemontcg.io/sv3pt5/183_hires.png',
      addedAt: new Date().toLocaleDateString(),
    };

    onUpdateCard(newItem);
    setNewCardName('');
    setNewCardPrice('');
    setNewCardQuantity(1);
    setNewCardCondition('Ungraded');
    setNewCardImage('');
    setIsModalOpen(false);
  };

  const aokiCards = [
    {
      id: 'a1',
      name: 'Charizard Base Set Shadowless Holo',
      rarity: 'PSA 10 GEM MINT',
      value: 420000,
      imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    },
    {
      id: 'a2',
      name: 'Illustrator Pikachu Promo',
      rarity: 'PSA 9 MINT',
      value: 350000,
      imageUrl: 'https://images.pokemontcg.io/promo/pika_hires.png',
    },
    {
      id: 'a3',
      name: 'Lugia First Edition Neo Genesis Holo',
      rarity: 'PSA 10 GEM MINT',
      value: 72500,
      imageUrl: 'https://images.pokemontcg.io/neo1/9_hires.png',
    },
  ];

  const getConditionBadgeStyle = (condition: CardCondition) => {
    switch (condition) {
      case 'PSA 10':
        return 'bg-amber-400/20 text-amber-500 border-amber-500/40 dark:bg-amber-400/15 dark:text-amber-300';
      case 'BGS Black Label':
        return 'bg-purple-600/20 text-purple-400 border-purple-500/40 dark:bg-purple-500/20 dark:text-purple-300';
      case 'BGS 10':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 dark:bg-cyan-500/20 dark:text-cyan-300';
      case 'PSA 9':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40 dark:bg-blue-500/20 dark:text-blue-300';
      case 'Ungraded':
      default:
        return 'bg-primary/10 text-text-muted border-primary/30';
    }
  };

  if (mode === 'showcase') {
    return (
      <div className="w-full py-8 max-w-7xl mx-auto px-4 md:px-0 animate-fade-in">
        <div className="mb-8 border-b border-primary pb-4">
          <span className="font-mono text-[11px] font-bold text-verge-ultraviolet dark:text-jelly-mint tracking-[2px] uppercase">
            3D HOLOGRAPHIC GALLERY
          </span>
          <h2 className="font-display font-bold text-4xl md:text-6xl uppercase text-foreground">
            MY CARD SHOWCASE
          </h2>
        </div>

        {portfolio.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-[24px] border-hairline border-dashed">
            <p className="font-display text-2xl uppercase text-text-muted mb-2">{t('empty_portfolio_title')}</p>
            <span className="font-mono text-xs text-text-muted">{t('empty_portfolio_subtitle')}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {portfolio.map((item) => (
              <div key={item.id} className="flex flex-col gap-4">
                <HoloCard src={item.imageUrl} alt={item.name} />
                <div className="flex justify-between items-center bg-surface p-4 rounded-xl border-hairline border-primary">
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-lg uppercase truncate max-w-[140px] text-foreground">
                      {item.name}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted uppercase">
                      {item.condition} • QTY: {item.quantity}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-base text-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Celebrity Showcase */}
        <div className="mt-16 border-t border-primary pt-8">
          <div className="mb-6">
            <span className="font-mono text-[11px] font-bold text-verge-ultraviolet dark:text-jelly-mint tracking-[2px] uppercase">
              CELEBRITY HIGHLIGHT
            </span>
            <h3 className="font-display font-bold text-2xl md:text-3xl uppercase text-foreground">
              STEVE AOKI&apos;S HOLO VAULT
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {aokiCards.map((card) => (
              <div key={card.id} className="bg-surface p-5 rounded-[20px] border-hairline border-primary flex flex-col justify-between">
                <div>
                  <div className="w-full mb-4">
                    <HoloCard src={card.imageUrl} alt={card.name} rarity={card.rarity} />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-500 font-mono text-[9px] font-bold tracking-[1px] uppercase">
                    {card.rarity}
                  </span>
                  <h4 className="font-display font-bold text-lg uppercase text-foreground mt-2">
                    {card.name}
                  </h4>
                </div>
                <div className="border-t border-primary pt-3 mt-4 flex justify-between items-center">
                  <span className="font-mono text-[10px] text-text-muted uppercase">{t('est_market_price')}</span>
                  <span className="font-mono font-bold text-lg text-foreground">
                    ${card.value.toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 max-w-7xl mx-auto px-4 md:px-0 flex flex-col gap-8 animate-fade-in">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-primary pb-4">
        <div>
          <span className="font-mono text-[11px] font-bold tracking-[2px] text-verge-ultraviolet dark:text-jelly-mint uppercase">
            {t('portfolio_title')}
          </span>
          <h2 className="font-display font-bold text-4xl md:text-6xl uppercase tracking-tight text-foreground leading-none mt-1">
            {t('nav_portfolio')}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportJson}
            className="px-4 py-2 rounded-xl bg-surface border-hairline border-primary font-mono text-[10px] font-bold tracking-[1px] hover:bg-foreground hover:text-background transition-all duration-150 cursor-pointer uppercase"
          >
            {t('export_json')}
          </button>
          <button
            onClick={handleImportClick}
            className="px-4 py-2 rounded-xl bg-surface border-hairline border-primary font-mono text-[10px] font-bold tracking-[1px] hover:bg-foreground hover:text-background transition-all duration-150 cursor-pointer uppercase"
          >
            {t('import_json')}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-verge-ultraviolet text-white dark:bg-jelly-mint dark:text-absolute-black font-mono text-[10px] font-bold tracking-[1px] hover:opacity-85 transition-all duration-150 cursor-pointer uppercase"
          >
            {t('add_custom_card')}
          </button>
        </div>
      </div>

      {/* Key Portfolio Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-6 rounded-[20px] border-hairline border-primary flex flex-col justify-between">
          <span className="font-mono text-[10px] font-bold text-text-muted tracking-[1px] uppercase">
            {t('portfolio_total_value')}
          </span>
          <span className="font-mono font-bold text-3xl md:text-4xl text-foreground mt-3">
            ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-surface p-6 rounded-[20px] border-hairline border-primary flex flex-col justify-between">
          <span className="font-mono text-[10px] font-bold text-text-muted tracking-[1px] uppercase">
            {t('portfolio_buy_in_cost')}
          </span>
          <span className="font-mono font-bold text-2xl md:text-3xl text-foreground mt-3">
            ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-surface p-6 rounded-[20px] border-hairline border-primary flex flex-col justify-between">
          <span className="font-mono text-[10px] font-bold text-text-muted tracking-[1px] uppercase">
            {t('portfolio_total_pnl')}
          </span>
          <span className={`font-mono font-bold text-2xl md:text-3xl mt-3 ${isPnlPositive ? 'text-emerald-500 dark:text-jelly-mint' : 'text-red-500'}`}>
            {isPnlPositive ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-surface p-6 rounded-[20px] border-hairline border-primary flex flex-col justify-between">
          <span className="font-mono text-[10px] font-bold text-text-muted tracking-[1px] uppercase">
            {t('portfolio_total_roi')}
          </span>
          <span className={`font-mono font-bold text-2xl md:text-3xl mt-3 ${isPnlPositive ? 'text-emerald-500 dark:text-jelly-mint' : 'text-red-500'}`}>
            {isPnlPositive ? '+' : ''}{totalRoi.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Portfolio Items List Table */}
      {portfolio.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-[24px] border-hairline border-dashed">
          <p className="font-display text-2xl uppercase text-text-muted mb-2">{t('empty_portfolio_title')}</p>
          <span className="font-mono text-xs text-text-muted">{t('empty_portfolio_subtitle')}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {portfolio.map((item) => {
            const qty = item.quantity || 1;
            const buyP = item.buyPrice ?? item.price;
            const itemTotalCost = buyP * qty;
            const itemMarketVal = item.price * qty;
            const itemProfit = itemMarketVal - itemTotalCost;
            const isProfitable = itemProfit >= 0;

            return (
              <div
                key={item.id}
                className="flex flex-col md:flex-row md:items-center justify-between bg-surface border-hairline border-primary rounded-[20px] p-5 gap-4 hover:border-verge-ultraviolet dark:hover:border-jelly-mint transition-all duration-150"
              >
                {/* Left: Card Info & Image */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-20 bg-background rounded-lg border border-primary overflow-hidden flex items-center justify-center p-1 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.name} className="object-contain max-h-full max-w-full" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display font-bold text-lg md:text-xl uppercase text-foreground leading-tight">
                        {item.name}
                      </h4>
                      {/* Condition Selector Badge */}
                      <select
                        value={item.condition || 'Ungraded'}
                        onChange={(e) => handleConditionChange(item, e.target.value as CardCondition)}
                        className={`px-2 py-0.5 rounded-lg border font-mono text-[9px] font-bold tracking-[1px] uppercase cursor-pointer focus:outline-none ${getConditionBadgeStyle(
                          item.condition || 'Ungraded'
                        )}`}
                      >
                        <option value="Ungraded">UNGRADED</option>
                        <option value="PSA 10">PSA 10</option>
                        <option value="PSA 9">PSA 9</option>
                        <option value="BGS 10">BGS 10</option>
                        <option value="BGS Black Label">BGS BLACK LABEL</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-[10px] text-text-muted">
                      <span>ADDED ON {item.addedAt.toUpperCase()}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <span>COST:</span>
                        {editingBuyPriceId === item.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editPriceValue}
                            onChange={(e) => setEditPriceValue(e.target.value)}
                            onBlur={() => handleSaveBuyPrice(item)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveBuyPrice(item)}
                            autoFocus
                            className="w-16 px-1 bg-background border border-primary rounded text-foreground font-mono text-xs focus:outline-none"
                          />
                        ) : (
                          <button
                            onClick={() => handleStartEditingBuyPrice(item)}
                            className="font-bold underline hover:text-verge-ultraviolet dark:hover:text-jelly-mint"
                            title="Click to edit buy-in price"
                          >
                            ${buyP.toFixed(2)}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Quantity & Profit/Loss */}
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-primary pt-3 md:pt-0">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-primary rounded-xl overflow-hidden bg-background">
                    <button
                      onClick={() => handleQuantityChange(item, -1)}
                      className="px-3 py-1 font-mono text-xs font-bold text-text-muted hover:bg-surface transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-mono text-xs font-bold text-foreground">
                      {qty}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item, 1)}
                      className="px-3 py-1 font-mono text-xs font-bold text-text-muted hover:bg-surface transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Market Value & P&L */}
                  <div className="flex flex-col text-right font-mono">
                    <span className="font-bold text-base text-foreground">
                      ${itemMarketVal.toFixed(2)}
                    </span>
                    <span className={`text-xs font-bold ${isProfitable ? 'text-emerald-500 dark:text-jelly-mint' : 'text-red-500'}`}>
                      {isProfitable ? '+' : ''}${itemProfit.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveCard(item.id)}
                    className="p-2 text-text-muted hover:text-red-500 transition-colors font-mono text-xs font-bold"
                    aria-label={`Remove ${item.name} from portfolio`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border-hairline border-primary rounded-[24px] p-6 md:p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <h3 className="font-display font-bold text-2xl uppercase text-foreground mb-4">
              {t('add_card_modal_title')}
            </h3>

            <form onSubmit={handleAddCustomCardSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-bold text-text-muted uppercase">
                  {t('card_name_label')}
                </label>
                <input
                  type="text"
                  required
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  placeholder="E.G. CHARIZARD EX..."
                  className="bg-background border border-primary rounded-xl px-4 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-verge-ultraviolet dark:focus:border-jelly-mint"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] font-bold text-text-muted uppercase">
                    {t('purchase_price_label')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newCardPrice}
                    onChange={(e) => setNewCardPrice(e.target.value)}
                    placeholder="120.00"
                    className="bg-background border border-primary rounded-xl px-4 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-verge-ultraviolet dark:focus:border-jelly-mint"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] font-bold text-text-muted uppercase">
                    {t('quantity_label')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCardQuantity}
                    onChange={(e) => setNewCardQuantity(parseInt(e.target.value) || 1)}
                    className="bg-background border border-primary rounded-xl px-4 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-verge-ultraviolet dark:focus:border-jelly-mint"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-bold text-text-muted uppercase">
                  {t('select_condition')}
                </label>
                <select
                  value={newCardCondition}
                  onChange={(e) => setNewCardCondition(e.target.value as CardCondition)}
                  className="bg-background border border-primary rounded-xl px-4 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-verge-ultraviolet dark:focus:border-jelly-mint"
                >
                  <option value="Ungraded">UNGRADED</option>
                  <option value="PSA 10">PSA 10</option>
                  <option value="PSA 9">PSA 9</option>
                  <option value="BGS 10">BGS 10</option>
                  <option value="BGS Black Label">BGS BLACK LABEL</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-bold text-text-muted uppercase">
                  {t('image_url_label')}
                </label>
                <input
                  type="url"
                  value={newCardImage}
                  onChange={(e) => setNewCardImage(e.target.value)}
                  placeholder="HTTPS://..."
                  className="bg-background border border-primary rounded-xl px-4 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-verge-ultraviolet dark:focus:border-jelly-mint"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-background border border-primary font-mono text-xs font-bold text-text-muted hover:text-foreground uppercase"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-verge-ultraviolet text-white dark:bg-jelly-mint dark:text-absolute-black font-mono text-xs font-bold uppercase shadow-md"
                >
                  {t('confirm_add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
