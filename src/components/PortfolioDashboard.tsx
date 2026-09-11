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


  if (mode === 'showcase') {
    return (
      <div className="w-full py-8 animate-fade-in">
        <div className="mb-8 border-b border-hairline/60 pb-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-ferrari-red tracking-wider uppercase">
              3D Holographic Vault
            </span>
            <h2 className="font-sans font-medium text-3xl md:text-5xl text-foreground mt-1">
              Curated Showcase
            </h2>
          </div>
          <span className="font-mono text-xs text-text-muted hidden sm:inline tracking-wider">
            Scuderia Private Collection
          </span>
        </div>

        {portfolio.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-hairline/70 border-dashed">
            <p className="font-sans font-medium text-2xl text-foreground mb-2">{t('empty_portfolio_title')}</p>
            <span className="font-mono text-xs text-text-muted">{t('empty_portfolio_subtitle')}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
            {portfolio.map((item) => (
              <div key={item.id} className="flex flex-col gap-3">
                <HoloCard src={item.imageUrl} alt={item.name} />
                <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-hairline/70 shadow-sm">
                  <div className="flex flex-col">
                    <span className="font-sans font-medium text-base truncate max-w-[140px] text-foreground">
                      {item.name}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
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
        <div className="mt-16 border-t border-hairline/60 pt-8">
          <div className="mb-6">
            <span className="text-[11px] font-semibold text-ferrari-red tracking-wider uppercase">
              Prominent Collector
            </span>
            <h3 className="font-sans font-medium text-2xl md:text-3xl text-foreground mt-1">
              Steve Aoki&apos;s Holo Vault
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {aokiCards.map((card) => (
              <div key={card.id} className="bg-surface p-5 rounded-2xl border border-hairline/70 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-full mb-4">
                    <HoloCard src={card.imageUrl} alt={card.name} rarity={card.rarity} />
                  </div>
                  <span className="rounded-full px-2.5 py-0.5 bg-surface-hover border border-hairline/80 text-accent-yellow font-mono text-[9px] font-bold tracking-wide">
                    {card.rarity}
                  </span>
                  <h4 className="font-sans font-medium text-lg text-foreground mt-2">
                    {card.name}
                  </h4>
                </div>
                <div className="border-t border-hairline/60 pt-3 mt-4 flex justify-between items-center">
                  <span className="text-[10px] text-text-muted font-semibold">{t('est_market_price')}</span>
                  <span className="font-mono font-bold text-base text-foreground">
                    ${card.value.toLocaleString()}
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
    <div className="w-full py-6 flex flex-col gap-8 animate-fade-in">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Portfolio Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-hairline/60 pb-5 gap-4">
        <div>
          <span className="text-[11px] font-semibold text-ferrari-red tracking-wider uppercase">
            Asset Telemetry
          </span>
          <h2 className="font-sans font-medium text-3xl md:text-5xl text-foreground tracking-tight mt-1">
            {t('portfolio_title')}
          </h2>
        </div>

        {/* Global Portfolio Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJson}
            className="h-9 px-4 rounded-lg bg-surface hover:bg-surface-hover border border-hairline text-foreground font-sans text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-sm"
          >
            {t('export_json')}
          </button>
          <button
            onClick={handleImportClick}
            className="h-9 px-4 rounded-lg bg-surface hover:bg-surface-hover border border-hairline text-foreground font-sans text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-sm"
          >
            {t('import_json')}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-9 px-5 rounded-lg bg-ferrari-red hover:bg-ferrari-red-hover active:bg-ferrari-red-active text-white font-sans text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-sm"
          >
            {t('add_custom_card')}
          </button>
        </div>
      </div>

      {/* Key Portfolio Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-6 rounded-2xl border border-hairline/70 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-text-muted tracking-wider">
            {t('portfolio_total_value')}
          </span>
          <span className="font-sans font-medium text-3xl md:text-4xl text-foreground tracking-tight mt-3">
            ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-hairline/70 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-text-muted tracking-wider">
            {t('portfolio_buy_in_cost')}
          </span>
          <span className="font-sans font-medium text-2xl md:text-3xl text-foreground tracking-tight mt-3">
            ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-hairline/70 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-text-muted tracking-wider">
            {t('portfolio_total_pnl')}
          </span>
          <span className={`font-sans font-medium text-2xl md:text-3xl tracking-tight mt-3 ${isPnlPositive ? 'text-semantic-success' : 'text-ferrari-red'}`}>
            {isPnlPositive ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-hairline/70 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-text-muted tracking-wider">
            {t('portfolio_total_roi')}
          </span>
          <span className={`font-sans font-medium text-2xl md:text-3xl tracking-tight mt-3 ${isPnlPositive ? 'text-semantic-success' : 'text-ferrari-red'}`}>
            {isPnlPositive ? '+' : ''}{totalRoi.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Portfolio Items List Table */}
      {portfolio.length === 0 ? (
        <div className="text-center py-20 bg-canvas-elevated rounded-none border border-hairline border-dashed">
          <p className="font-sans font-medium text-2xl uppercase text-white mb-2">{t('empty_portfolio_title')}</p>
          <span className="font-mono text-xs text-text-muted">{t('empty_portfolio_subtitle')}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
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
                className="flex flex-col md:flex-row md:items-center justify-between bg-surface border border-hairline/70 rounded-2xl p-5 gap-4 hover:border-hairline hover:shadow-sm transition-all duration-150"
              >
                {/* Left: Card Info & Image */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-20 bg-surface-hover rounded-xl border border-hairline/60 overflow-hidden flex items-center justify-center p-1 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.name} className="object-contain max-h-full max-w-full" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-sans font-medium text-lg text-foreground leading-tight">
                        {item.name}
                      </h4>
                      {/* Condition Selector Badge */}
                      <select
                        value={item.condition || 'Ungraded'}
                        onChange={(e) => handleConditionChange(item, e.target.value as CardCondition)}
                        className="px-2.5 py-0.5 rounded-full border border-hairline/80 font-mono text-[9px] font-semibold tracking-wide cursor-pointer focus:outline-none bg-surface-hover text-foreground"
                      >
                        <option value="Ungraded">UNGRADED</option>
                        <option value="PSA 10">PSA 10</option>
                        <option value="PSA 9">PSA 9</option>
                        <option value="BGS 10">BGS 10</option>
                        <option value="BGS Black Label">BGS BLACK LABEL</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[10px] text-text-muted">
                      <span>ACQUIRED {item.addedAt}</span>
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
                            className="w-16 px-1.5 py-0.5 bg-surface border border-ferrari-red rounded-lg text-foreground font-mono text-xs focus:outline-none"
                          />
                        ) : (
                          <button
                            onClick={() => handleStartEditingBuyPrice(item)}
                            className="font-bold underline text-foreground hover:text-ferrari-red"
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
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-hairline/60 pt-3 md:pt-0">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-hairline/80 rounded-lg overflow-hidden bg-surface-hover">
                    <button
                      onClick={() => handleQuantityChange(item, -1)}
                      className="px-3 py-1 font-mono text-xs font-bold text-text-muted hover:text-foreground hover:bg-surface transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-mono text-xs font-bold text-foreground">
                      {qty}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item, 1)}
                      className="px-3 py-1 font-mono text-xs font-bold text-text-muted hover:text-foreground hover:bg-surface transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Market Value & P&L */}
                  <div className="flex flex-col text-right font-mono">
                    <span className="font-bold text-base text-foreground">
                      ${itemMarketVal.toFixed(2)}
                    </span>
                    <span className={`text-xs font-bold ${isProfitable ? 'text-semantic-success' : 'text-ferrari-red'}`}>
                      {isProfitable ? '+' : ''}${itemProfit.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveCard(item.id)}
                    className="p-2 text-text-muted hover:text-ferrari-red transition-colors font-mono text-xs font-bold cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-hairline/80 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <h3 className="font-sans font-medium text-2xl tracking-tight text-foreground mb-6">
              {t('add_card_modal_title')}
            </h3>

            <form onSubmit={handleAddCustomCardSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-text-muted tracking-wide">
                  {t('card_name_label')}
                </label>
                <input
                  type="text"
                  required
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  placeholder="E.g. Charizard ex..."
                  className="h-11 bg-surface-hover border border-hairline rounded-xl px-4 text-xs text-foreground focus:outline-none focus:border-ferrari-red focus:ring-2 focus:ring-ferrari-red/10 tracking-wide"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-text-muted tracking-wide">
                    {t('purchase_price_label')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newCardPrice}
                    onChange={(e) => setNewCardPrice(e.target.value)}
                    placeholder="120.00"
                    className="h-11 bg-surface-hover border border-hairline rounded-xl px-4 font-mono text-xs text-foreground focus:outline-none focus:border-ferrari-red focus:ring-2 focus:ring-ferrari-red/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-text-muted tracking-wide">
                    {t('quantity_label')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCardQuantity}
                    onChange={(e) => setNewCardQuantity(parseInt(e.target.value) || 1)}
                    className="h-11 bg-surface-hover border border-hairline rounded-xl px-4 font-mono text-xs text-foreground focus:outline-none focus:border-ferrari-red focus:ring-2 focus:ring-ferrari-red/10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-text-muted tracking-wide">
                  {t('select_condition')}
                </label>
                <select
                  value={newCardCondition}
                  onChange={(e) => setNewCardCondition(e.target.value as CardCondition)}
                  className="h-11 bg-surface-hover border border-hairline rounded-xl px-4 font-mono text-xs text-foreground focus:outline-none focus:border-ferrari-red cursor-pointer"
                >
                  <option value="Ungraded">Ungraded</option>
                  <option value="PSA 10">PSA 10</option>
                  <option value="PSA 9">PSA 9</option>
                  <option value="BGS 10">BGS 10</option>
                  <option value="BGS Black Label">BGS Black Label</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-text-muted tracking-wide">
                  {t('image_url_label')}
                </label>
                <input
                  type="url"
                  value={newCardImage}
                  onChange={(e) => setNewCardImage(e.target.value)}
                  placeholder="https://..."
                  className="h-11 bg-surface-hover border border-hairline rounded-xl px-4 font-mono text-xs text-foreground focus:outline-none focus:border-ferrari-red focus:ring-2 focus:ring-ferrari-red/10"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-5 rounded-lg bg-transparent border border-hairline font-sans text-xs font-semibold text-text-muted hover:text-foreground cursor-pointer transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-lg bg-ferrari-red text-white hover:bg-ferrari-red-hover active:bg-ferrari-red-active font-sans text-xs font-semibold transition-colors cursor-pointer shadow-sm"
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
