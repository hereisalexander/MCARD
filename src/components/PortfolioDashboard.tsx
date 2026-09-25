'use client';

import React, { useState, useRef, useMemo } from 'react';
import { HoloCard } from '@/components/HoloCard';
import { useLanguage } from '@/context/LanguageContext';
import { CardCategory } from '@/services/multiCardService';
import { TagIcon } from '@/components/icons/AppIcons';

export type CardCondition = 'Ungraded' | 'PSA 10' | 'PSA 9' | 'BGS 10' | 'BGS Black Label';

export interface UserPortfolioItem {
  id: string;
  name: string;
  category?: CardCategory;
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
  listings?: import('@/types/marketplace').CardListing[];
  onNavigateToMarket?: () => void;
}

const CATEGORY_COLORS: Record<CardCategory, { label: string; barColor: string; textColor: string }> = {
  all: { label: 'ALL', barColor: 'bg-primary', textColor: 'text-primary' },
  pokemon: { label: 'POKÉMON', barColor: 'bg-amber-400', textColor: 'text-amber-500' },
  yugioh: { label: 'YU-GI-OH!', barColor: 'bg-purple-500', textColor: 'text-purple-400' },
  onepiece: { label: 'ONE PIECE', barColor: 'bg-red-500', textColor: 'text-red-400' },
  dragonball: { label: 'DRAGON BALL', barColor: 'bg-orange-500', textColor: 'text-orange-400' },
  nba: { label: 'NBA', barColor: 'bg-blue-500', textColor: 'text-blue-400' },
  fifa: { label: 'FIFA', barColor: 'bg-emerald-500', textColor: 'text-emerald-400' },
};

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  portfolio,
  onRemoveCard,
  onUpdateCard,
  onImportPortfolio,
  portfolioValue,
  mode,
  listings = [],
  onNavigateToMarket,
}) => {
  const { t } = useLanguage();
  const [editingBuyPriceId, setEditingBuyPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CardCategory>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newCardName, setNewCardName] = useState<string>('');
  const [newCardCategory, setNewCardCategory] = useState<CardCategory>('pokemon');
  const [newCardPrice, setNewCardPrice] = useState<string>('');
  const [newCardQuantity, setNewCardQuantity] = useState<number>(1);
  const [newCardCondition, setNewCardCondition] = useState<CardCondition>('Ungraded');
  const [newCardImage, setNewCardImage] = useState<string>('');

  // Total cost calculation
  const totalCost = portfolio.reduce((acc, curr) => acc + ((curr.buyPrice ?? curr.price) * (curr.quantity || 1)), 0);
  const totalPnl = portfolioValue - totalCost;
  const totalRoi = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const isPnlPositive = totalPnl >= 0;

  // Category Breakdown Analysis
  const categoryBreakdown = useMemo(() => {
    const totalVal = portfolio.reduce((acc, curr) => acc + curr.price * (curr.quantity || 1), 0);
    const map: Partial<Record<CardCategory, { value: number; count: number; percentage: number }>> = {};

    portfolio.forEach((item) => {
      const cat = item.category || 'pokemon';
      const itemVal = item.price * (item.quantity || 1);
      if (!map[cat]) {
        map[cat] = { value: 0, count: 0, percentage: 0 };
      }
      map[cat]!.value += itemVal;
      map[cat]!.count += (item.quantity || 1);
    });

    if (totalVal > 0) {
      Object.keys(map).forEach((k) => {
        const key = k as CardCategory;
        map[key]!.percentage = (map[key]!.value / totalVal) * 100;
      });
    }

    return { totalVal, breakdown: map };
  }, [portfolio]);

  // Handlers
  const handleQuantityChange = (item: UserPortfolioItem, delta: number) => {
    const newQty = (item.quantity || 1) + delta;
    if (newQty <= 0) {
      onRemoveCard(item.id);
      return;
    }
    onUpdateCard({
      ...item,
      quantity: newQty,
    });
  };

  const handleConditionChange = (item: UserPortfolioItem, condition: CardCondition) => {
    onUpdateCard({
      ...item,
      condition,
    });
  };

  const handleStartEditingBuyPrice = (item: UserPortfolioItem) => {
    setEditingBuyPriceId(item.id);
    setEditPriceValue((item.buyPrice ?? item.price).toString());
  };

  const handleSaveBuyPrice = (item: UserPortfolioItem) => {
    const num = parseFloat(editPriceValue);
    if (!isNaN(num) && num >= 0) {
      onUpdateCard({
        ...item,
        buyPrice: num,
      });
    }
    setEditingBuyPriceId(null);
  };

  // Export JSON Handler
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(portfolio, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tcg_portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Handler
  const handleTriggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          const validated: UserPortfolioItem[] = parsed.map((item: Partial<UserPortfolioItem>) => ({
            id: item.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name || 'Imported Card',
            category: item.category || 'pokemon',
            price: typeof item.price === 'number' ? item.price : 0,
            buyPrice: typeof item.buyPrice === 'number' ? item.buyPrice : (item.price || 0),
            quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
            condition: item.condition || 'Ungraded',
            imageUrl: item.imageUrl || 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
            addedAt: item.addedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          }));
          onImportPortfolio(validated);
          alert(`Successfully imported ${validated.length} cards into your portfolio!`);
        } else {
          alert('Invalid backup format. Expected a JSON array.');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Add Custom Card Submit
  const handleAddCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim() || !newCardPrice) return;

    const priceNum = parseFloat(newCardPrice);
    if (isNaN(priceNum) || priceNum < 0) return;

    const newItem: UserPortfolioItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newCardName.trim(),
      category: newCardCategory,
      price: priceNum,
      buyPrice: priceNum,
      quantity: newCardQuantity > 0 ? newCardQuantity : 1,
      condition: newCardCondition,
      imageUrl: newCardImage.trim() || 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
      addedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    onUpdateCard(newItem);
    setIsModalOpen(false);
    setNewCardName('');
    setNewCardPrice('');
    setNewCardQuantity(1);
    setNewCardCondition('Ungraded');
    setNewCardImage('');
  };

  // Filtered Portfolio based on Category Filter
  const filteredPortfolio = useMemo(() => {
    if (selectedCategoryFilter === 'all') return portfolio;
    return portfolio.filter((item) => (item.category || 'pokemon') === selectedCategoryFilter);
  }, [portfolio, selectedCategoryFilter]);

  // Showcase Demo Cards
  const showcaseCards = [
    {
      id: 'a1',
      name: 'Charizard Base Set 1st Edition Shadowless',
      rarity: 'BGS 10 PRISTINE',
      value: 420000,
      imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    },
    {
      id: 'a2',
      name: 'Michael Jordan 1986 Fleer RC #57',
      rarity: 'PSA 10 GEM MINT',
      value: 350000,
      imageUrl: '/images/cards/nba-jordan.jpg',
    },
    {
      id: 'a3',
      name: 'Monkey.D.Luffy Gear 5 Manga SEC',
      rarity: 'BGS Black Label 10',
      value: 12500,
      imageUrl: 'https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP05/OP05-119_p1_EN.webp',
    },
  ];

  if (mode === 'showcase') {
    return (
      <div className="w-full py-8 animate-fade-in">
        <div className="mb-8 border-b border-hairline/60 pb-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-ferrari-red tracking-wider uppercase">
              3D VAULT GALLERY
            </span>
            <h2 className="font-sans font-medium text-3xl md:text-4xl text-foreground tracking-tight mt-1">
              {t('nav_showcase')}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {showcaseCards.map((card) => (
            <div
              key={card.id}
              className="bg-surface rounded-2xl p-6 border border-hairline/70 flex flex-col items-center gap-5 hover:border-hairline transition-all duration-200 shadow-sm"
            >
              <div className="w-full max-w-[280px]">
                <HoloCard src={card.imageUrl} alt={card.name} rarity={card.rarity} />
              </div>

              <div className="flex flex-col items-center text-center gap-1.5 w-full">
                <span className="rounded-full px-3 py-1 font-mono text-[10px] font-bold tracking-wider bg-ferrari-red/10 text-ferrari-red border border-ferrari-red/30">
                  {card.rarity}
                </span>
                <h3 className="font-sans font-medium text-lg text-foreground line-clamp-1">{card.name}</h3>
                <span className="font-mono text-xl font-bold text-foreground mt-1">
                  ${card.value.toLocaleString('en-US')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 flex flex-col gap-6 animate-fade-in">
      {/* Hidden File Input for JSON Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Top Header & Export/Import Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-6 rounded-2xl border border-hairline/70 shadow-sm">
        <div>
          <span className="text-[11px] font-semibold text-ferrari-red tracking-wider uppercase">
            CROSS-CATEGORY PORTFOLIO & P&L
          </span>
          <h2 className="font-sans font-medium text-2xl md:text-3xl text-foreground tracking-tight mt-1">
            {t('portfolio_title')}
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportJson}
            className="h-9 px-4 rounded-lg bg-surface-hover hover:bg-surface border border-hairline/80 font-mono text-xs font-semibold tracking-wide text-foreground transition-colors cursor-pointer shadow-sm"
          >
            {t('export_json')}
          </button>
          <button
            onClick={handleTriggerImport}
            className="h-9 px-4 rounded-lg bg-surface-hover hover:bg-surface border border-hairline/80 font-mono text-xs font-semibold tracking-wide text-foreground transition-colors cursor-pointer shadow-sm"
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

      {/* Multi-Category Asset Allocation Bar */}
      {categoryBreakdown.totalVal > 0 && (
        <div className="bg-surface p-5 rounded-2xl border border-hairline/70 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-text-muted uppercase tracking-wider">
              {t('cat_breakdown_title')}
            </span>
            <span className="font-mono text-xs text-text-muted">
              {portfolio.length} Cards Total
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-surface-hover gap-0.5">
            {Object.entries(categoryBreakdown.breakdown).map(([catKey, data]) => {
              const cat = catKey as CardCategory;
              const meta = CATEGORY_COLORS[cat] || CATEGORY_COLORS.all;
              return (
                <div
                  key={catKey}
                  style={{ width: `${data.percentage}%` }}
                  className={`${meta.barColor} transition-all duration-300`}
                  title={`${meta.label}: ${data.percentage.toFixed(1)}% ($${data.value.toFixed(2)})`}
                />
              );
            })}
          </div>

          {/* Legend Badges */}
          <div className="flex items-center gap-3 flex-wrap pt-1">
            {Object.entries(categoryBreakdown.breakdown).map(([catKey, data]) => {
              const cat = catKey as CardCategory;
              const meta = CATEGORY_COLORS[cat] || CATEGORY_COLORS.all;
              return (
                <div key={catKey} className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className={`w-2 h-2 rounded-full ${meta.barColor}`} />
                  <span className="text-foreground font-semibold">{meta.label}</span>
                  <span className="text-text-muted">({data.percentage.toFixed(1)}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {(['all', 'pokemon', 'yugioh', 'onepiece', 'dragonball', 'nba', 'fifa'] as CardCategory[]).map((cat) => {
          const meta = CATEGORY_COLORS[cat];
          const isSelected = selectedCategoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-ferrari-red text-white border-ferrari-red shadow-sm'
                  : 'bg-surface hover:bg-surface-hover text-text-muted border-hairline/70'
              }`}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Portfolio Items List Table */}
      {filteredPortfolio.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-hairline border-dashed">
          <p className="font-sans font-medium text-2xl uppercase text-foreground mb-2">{t('empty_portfolio_title')}</p>
          <span className="font-mono text-xs text-text-muted">{t('empty_portfolio_subtitle')}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredPortfolio.map((item) => {
            const qty = item.quantity || 1;
            const buyP = item.buyPrice ?? item.price;
            const itemTotalCost = buyP * qty;
            const itemMarketVal = item.price * qty;
            const itemProfit = itemMarketVal - itemTotalCost;
            const isProfitable = itemProfit >= 0;
            const catMeta = CATEGORY_COLORS[item.category || 'pokemon'] || CATEGORY_COLORS.pokemon;

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
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-bold tracking-wide border border-hairline/60 ${catMeta.textColor}`}>
                        {catMeta.label}
                      </span>
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

                      {/* Marketplace Active Listing Badge */}
                      {(() => {
                        const activeListing = listings.find(
                          (l) =>
                            l.isOwner &&
                            l.status === 'active' &&
                            (l.portfolioCardId === item.id ||
                              l.cardName.toLowerCase() === item.name.toLowerCase())
                        );
                        if (!activeListing) return null;
                        return (
                          <button
                            onClick={onNavigateToMarket}
                            className="px-2 py-0.5 rounded-full bg-ferrari-red/10 border border-ferrari-red/30 text-ferrari-red font-mono text-[9px] font-bold flex items-center gap-1 hover:bg-ferrari-red hover:text-white transition-colors cursor-pointer"
                            title="點擊前往市集查看該卡刊登"
                          >
                            <TagIcon className="w-2.5 h-2.5" />
                            <span>市集刊登中 · ${activeListing.askingPrice.toLocaleString()}</span>
                          </button>
                        );
                      })()}
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

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveCard(item.id)}
                    className="p-2 text-text-muted hover:text-ferrari-red transition-colors cursor-pointer"
                    title={t('delete_action')}
                  >
                    🗑
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
          <div className="bg-surface text-foreground border border-hairline/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="font-sans font-medium text-xl mb-4 text-foreground">
              {t('add_card_modal_title')}
            </h3>

            <form onSubmit={handleAddCustomSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-text-muted tracking-wide">
                  {t('card_name_label')}
                </label>
                <input
                  type="text"
                  required
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  placeholder="e.g. Michael Jordan 1986 Fleer"
                  className="h-11 bg-surface-hover border border-hairline rounded-xl px-4 font-sans text-xs text-foreground focus:outline-none focus:border-ferrari-red focus:ring-2 focus:ring-ferrari-red/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-text-muted tracking-wide">
                  Category (品類)
                </label>
                <select
                  value={newCardCategory}
                  onChange={(e) => setNewCardCategory(e.target.value as CardCategory)}
                  className="h-11 bg-surface-hover border border-hairline rounded-xl px-4 font-mono text-xs text-foreground focus:outline-none focus:border-ferrari-red cursor-pointer"
                >
                  <option value="pokemon">寶可夢 (Pokémon)</option>
                  <option value="yugioh">遊戲王 (Yu-Gi-Oh!)</option>
                  <option value="onepiece">海賊王 (One Piece)</option>
                  <option value="dragonball">七龍珠 (Dragon Ball)</option>
                  <option value="nba">NBA 籃球球星卡</option>
                  <option value="fifa">FIFA 足球球星卡</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
