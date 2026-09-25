'use client';

import React, { useState, useRef } from 'react';
import { CardListing, ListingCondition, ContactPlatform } from '@/types/marketplace';
import { UserPortfolioItem } from '@/components/PortfolioDashboard';
import { CardCategory } from '@/services/multiCardService';
import { TrendingDownIcon, TagIcon, CloseIcon, CameraIcon } from '@/components/icons/AppIcons';
import { useLanguage } from '@/context/LanguageContext';

export interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: UserPortfolioItem[];
  onSubmitListing: (listing: CardListing) => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  onSubmitListing,
}) => {
  const { t } = useLanguage();
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [category, setCategory] = useState<CardCategory>('pokemon');
  const [setName, setSetName] = useState<string>('');
  const [officialPrice, setOfficialPrice] = useState<number>(100);
  const [askingPrice, setAskingPrice] = useState<string>('90');
  const [condition, setCondition] = useState<ListingCondition>('Ungraded Near Mint');
  const [contactPlatform, setContactPlatform] = useState<ContactPlatform>('line');
  const [contactValue, setContactValue] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle auto-fill when selecting an item from the user's portfolio
  const handleSelectPortfolioItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = e.target.value;
    setSelectedPortfolioId(itemId);

    if (!itemId) return;

    const found = portfolio.find((item) => item.id === itemId);
    if (!found) return;

    setCardName(found.name);
    setCategory(found.category || 'pokemon');
    setOfficialPrice(found.price || 100);
    setAskingPrice(found.price.toString());
    setPhotoPreview(found.imageUrl);

    // Map portfolio condition to listing condition
    if (found.condition === 'PSA 10') setCondition('PSA 10');
    else if (found.condition === 'PSA 9') setCondition('PSA 9');
    else if (found.condition === 'BGS 10') setCondition('BGS 9.5');
    else setCondition('Ungraded Near Mint');
  };

  // Handle local camera or photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setPhotoPreview(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Calculate discount percentage relative to official price
  const numAskingPrice = parseFloat(askingPrice) || 0;
  const priceDifference = officialPrice > 0 ? ((numAskingPrice - officialPrice) / officialPrice) * 100 : 0;
  const isDiscounted = priceDifference < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!cardName.trim()) {
      setErrorMsg(t('create_modal_err_name'));
      return;
    }
    if (numAskingPrice <= 0) {
      setErrorMsg(t('create_modal_err_price'));
      return;
    }
    if (!contactValue.trim()) {
      setErrorMsg(t('create_modal_err_contact'));
      return;
    }

    const newListing: CardListing = {
      id: `user-listing-${Date.now()}`,
      sellerName: '我 (My Vault)',
      sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      sellerRating: 5.0,
      sellerSalesCount: 1,
      contactPlatform,
      contactValue: contactValue.trim(),
      cardName: cardName.trim(),
      category,
      setName: setName.trim() || 'Custom Set',
      officialPrice,
      askingPrice: numAskingPrice,
      condition,
      photos: [
        photoPreview || 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
      ],
      notes: notes.trim() || t('create_modal_default_notes'),
      location: location.trim() || t('create_modal_default_location'),
      createdAt: 'Just now',
      status: 'active',
      isOwner: true,
    };

    onSubmitListing(newListing);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-listing-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-surface border border-hairline/80 rounded-2xl shadow-2xl p-5 sm:p-6 my-auto text-foreground max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-ferrari-red rounded-full" />
            <h3 id="create-listing-title" className="font-sans font-bold text-base sm:text-lg tracking-wide text-foreground">
              {t('create_modal_title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label={t('cancel')}
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 py-4 flex-1 flex flex-col gap-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-ferrari-red/10 border border-ferrari-red/30 text-ferrari-red font-semibold text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ferrari-red" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Import from Portfolio */}
          {portfolio.length > 0 && (
            <div className="p-3 bg-surface-hover/70 rounded-xl border border-hairline/60">
              <label className="text-[11px] font-bold text-ferrari-red mb-1.5 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-ferrari-red" />
                <span>{t('create_modal_import_label')}</span>
              </label>
              <select
                value={selectedPortfolioId}
                onChange={handleSelectPortfolioItem}
                className="w-full h-9 px-3 bg-surface text-foreground border border-hairline/80 rounded-lg text-xs font-semibold focus:outline-none focus:border-ferrari-red cursor-pointer"
              >
                <option value="">{t('create_modal_import_placeholder')}</option>
                {portfolio.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.condition || 'Ungraded'}) - ${item.price}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Card Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-muted mb-1">{t('create_modal_card_name')}</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder={t('create_modal_card_name_ph')}
                className="w-full h-9 px-3 bg-surface-hover/60 border border-hairline/80 rounded-lg text-foreground focus:outline-none focus:border-ferrari-red"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-text-muted mb-1">{t('create_modal_category')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CardCategory)}
                className="w-full h-9 px-3 bg-surface-hover/60 border border-hairline/80 rounded-lg text-foreground focus:outline-none focus:border-ferrari-red cursor-pointer"
              >
                <option value="pokemon">{t('cat_pokemon')}</option>
                <option value="nba">{t('cat_nba')}</option>
                <option value="yugioh">{t('cat_yugioh')}</option>
                <option value="onepiece">{t('cat_onepiece')}</option>
                <option value="dragonball">{t('cat_dragonball')}</option>
                <option value="fifa">{t('cat_fifa')}</option>
              </select>
            </div>
          </div>

          {/* Pricing & Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-muted mb-1">{t('create_modal_ref_price')}</label>
              <input
                type="number"
                value={officialPrice}
                onChange={(e) => setOfficialPrice(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 bg-surface-hover/40 border border-hairline/60 rounded-lg text-text-muted font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">{t('create_modal_asking_price')}</label>
              <input
                type="number"
                step="any"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                placeholder={t('create_modal_asking_price_ph')}
                className="w-full h-9 px-3 bg-surface-hover/80 border border-hairline/80 rounded-lg text-foreground font-mono font-bold focus:outline-none focus:border-ferrari-red"
                required
              />
            </div>
          </div>

          {/* Live Discount Indicator Badge */}
          {numAskingPrice > 0 && officialPrice > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-hover text-xs font-mono">
              <span className="text-text-muted">{t('create_modal_comparison')}</span>
              {isDiscounted ? (
                <span className="text-semantic-success font-bold flex items-center gap-1">
                  <TrendingDownIcon className="w-3.5 h-3.5 text-semantic-success" />
                  <span>
                    {t('create_modal_below_market', {
                      pct: Math.abs(priceDifference).toFixed(1),
                      save: (officialPrice - numAskingPrice).toFixed(1),
                    })}
                  </span>
                </span>
              ) : priceDifference === 0 ? (
                <span className="text-text-muted font-bold">{t('create_modal_equal_market')}</span>
              ) : (
                <span className="text-accent-yellow font-bold">
                  {t('create_modal_above_market', { pct: priceDifference.toFixed(1) })}
                </span>
              )}
            </div>
          )}

          {/* Condition & Set */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-muted mb-1">{t('create_modal_condition_label')}</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ListingCondition)}
                className="w-full h-9 px-2 sm:px-3 bg-surface-hover/60 border border-hairline/80 rounded-lg text-foreground focus:outline-none focus:border-ferrari-red cursor-pointer"
              >
                <option value="PSA 10">{t('create_modal_cond_psa10')}</option>
                <option value="PSA 9">{t('create_modal_cond_psa9')}</option>
                <option value="BGS 9.5">{t('create_modal_cond_bgs95')}</option>
                <option value="CGC 10">{t('create_modal_cond_cgc10')}</option>
                <option value="Ungraded Near Mint">{t('create_modal_cond_raw_nm')}</option>
                <option value="Played">{t('create_modal_cond_played')}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-text-muted mb-1">{t('create_modal_series_label')}</label>
              <input
                type="text"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                placeholder={t('create_modal_series_ph')}
                className="w-full h-9 px-3 bg-surface-hover/60 border border-hairline/80 rounded-lg text-foreground focus:outline-none focus:border-ferrari-red"
              />
            </div>
          </div>

          {/* Photo Upload & Camera */}
          <div>
            <label className="block font-semibold text-text-muted mb-1.5">
              {t('create_modal_photo_label')}
            </label>
            <div className="flex items-center gap-3">
              {photoPreview ? (
                <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-hairline shadow-xs shrink-0 bg-surface-hover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview('')}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                    aria-label="Remove photo"
                  >
                    <CloseIcon className="w-2.5 h-2.5" />
                  </button>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-10 px-4 rounded-xl bg-surface-hover hover:bg-surface border border-hairline text-foreground font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <CameraIcon className="w-4 h-4 text-ferrari-red" />
                <span>{photoPreview ? t('create_modal_photo_change') : t('create_modal_photo_upload')}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-muted mb-1">{t('create_modal_contact_label')}</label>
              <div className="flex gap-2">
                <select
                  value={contactPlatform}
                  onChange={(e) => setContactPlatform(e.target.value as ContactPlatform)}
                  className="h-9 px-2 bg-surface-hover/60 border border-hairline/80 rounded-lg text-foreground focus:outline-none focus:border-ferrari-red font-semibold cursor-pointer shrink-0"
                >
                  <option value="line">LINE ID</option>
                  <option value="instagram">Instagram</option>
                  <option value="phone">Phone / SMS</option>
                  <option value="email">Email</option>
                </select>
                <input
                  type="text"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={t('create_modal_contact_ph')}
                  className="w-full h-9 px-3 bg-surface-hover/60 border border-hairline/80 rounded-lg text-foreground focus:outline-none focus:border-ferrari-red font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-text-muted mb-1">{t('create_modal_location_label')}</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('create_modal_location_ph')}
                className="w-full h-9 px-3 bg-surface-hover/60 border border-hairline/80 rounded-lg text-foreground focus:outline-none focus:border-ferrari-red"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-text-muted mb-1">{t('create_modal_notes_label')}</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('create_modal_notes_ph')}
              className="w-full p-2.5 bg-surface-hover/60 border border-hairline/80 rounded-lg text-foreground focus:outline-none focus:border-ferrari-red text-xs resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline/60 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-hover text-text-muted hover:text-foreground font-semibold cursor-pointer transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-ferrari-red hover:bg-ferrari-red-hover text-white font-bold cursor-pointer transition-colors shadow-sm active:scale-95"
            >
              {t('create_modal_submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

