'use client';

import React, { useState } from 'react';
import { CardListing } from '@/types/marketplace';
import { useLanguage } from '@/context/LanguageContext';
import {
  LocationIcon,
  DocumentIcon,
  CheckCircleIcon,
  CopyIcon,
  TrashIcon,
  CloseIcon,
  CameraIcon,
  FireIcon,
  SparklesIcon,
  StarIcon,
} from '@/components/icons/AppIcons';

export interface ListingDetailModalProps {
  listing: CardListing | null;
  onClose: () => void;
  onMarkAsSold?: (listingId: string) => void;
  onDeleteListing?: (listingId: string) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onMarkAsSold,
  onDeleteListing,
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState<boolean>(false);

  if (!listing) return null;

  const handleCopyContact = () => {
    navigator.clipboard.writeText(listing.contactValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const priceDiff = listing.officialPrice > 0
    ? ((listing.askingPrice - listing.officialPrice) / listing.officialPrice) * 100
    : 0;
  const isDiscounted = priceDiff < 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-surface border border-hairline/80 rounded-2xl shadow-2xl p-5 sm:p-6 my-auto text-foreground max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-ferrari-red rounded-full" />
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-surface-hover text-text-muted border border-hairline/60">
              {listing.condition}
            </span>
            <span className="text-xs text-text-muted font-mono">{listing.setName}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label={t('modal_close')}
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto pr-1 py-4 flex-1 flex flex-col md:flex-row gap-5">
          {/* Left: Real Photo Display */}
          <div className="w-full md:w-1/2 flex flex-col gap-2">
            <div className="relative aspect-[2.5/3.5] w-full bg-surface-hover rounded-xl overflow-hidden border border-hairline/80 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={listing.photos[0] || 'https://images.pokemontcg.io/sv3pt5/199_hires.png'}
                alt={listing.cardName}
                className="w-full h-full object-contain select-none"
              />
              {listing.status === 'sold' && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="px-4 py-1.5 bg-text-muted/40 text-white font-bold text-lg uppercase tracking-widest rounded-lg border border-white/20">
                    {t('marketplace_deal_sold_badge')} (SOLD)
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-text-muted text-center font-mono">
              <CameraIcon className="w-3.5 h-3.5 text-text-muted" />
              <span>{t('modal_photo_hint')}</span>
            </div>
          </div>

          {/* Right: Info, Price Comparison & Contact */}
          <div className="w-full md:w-1/2 flex flex-col justify-between gap-4">
            <div>
              {/* Card Name */}
              <h2 id="listing-detail-title" className="font-sans font-bold text-lg sm:text-xl text-foreground tracking-tight mb-2">
                {listing.cardName}
              </h2>

              {/* Price Box */}
              <div className="p-3.5 bg-surface-hover/70 rounded-xl border border-hairline/70 mb-4 flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-text-muted font-medium">{t('modal_asking_price')}</span>
                  <span className="font-mono text-2xl font-black text-ferrari-red">
                    ${listing.askingPrice.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1.5 border-t border-hairline/60">
                  <span className="text-text-muted">{t('modal_official_ref')}</span>
                  <span className="line-through text-text-muted font-bold">
                    ${listing.officialPrice.toLocaleString('en-US')}
                  </span>
                </div>

                {/* Discount Badge */}
                {isDiscounted ? (
                  <div className="mt-1 text-xs font-mono text-semantic-success font-bold flex items-center gap-1.5">
                    <FireIcon className="w-3.5 h-3.5 text-semantic-success" />
                    <span>
                      {t('modal_below_market', {
                        pct: Math.abs(priceDiff).toFixed(1),
                        save: (listing.officialPrice - listing.askingPrice).toFixed(0),
                      })}
                    </span>
                  </div>
                ) : priceDiff > 0 ? (
                  <div className="mt-1 text-xs font-mono text-accent-yellow font-bold flex items-center gap-1.5">
                    <SparklesIcon className="w-3.5 h-3.5 text-accent-yellow" />
                    <span>{t('modal_premium', { pct: priceDiff.toFixed(1) })}</span>
                  </div>
                ) : null}
              </div>

              {/* Seller Profile Pill */}
              <div className="flex items-center gap-3 p-3 bg-surface-hover/40 rounded-xl border border-hairline/50 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.sellerAvatar}
                  alt={listing.sellerName}
                  className="w-10 h-10 rounded-full border border-hairline object-cover shrink-0"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-sans font-bold text-xs text-foreground truncate">
                    {listing.sellerName}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <StarIcon className="w-3 h-3 text-accent-yellow" />
                      <span>{t('modal_seller_rating', { rating: listing.sellerRating || 5.0 })}</span>
                    </span>
                    <span>•</span>
                    <span>{t('modal_seller_sales', { count: listing.sellerSalesCount || 1 })}</span>
                    <span>•</span>
                    <span>{t('modal_posted_at', { time: listing.createdAt })}</span>
                  </div>
                </div>
              </div>

              {/* Location & Notes */}
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <LocationIcon className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span className="font-semibold text-foreground shrink-0">{t('modal_trade_location')}</span>
                  <span className="truncate">{listing.location}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
                    <DocumentIcon className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span>{t('modal_condition_notes')}</span>
                  </div>
                  <p className="p-2.5 bg-surface-hover/50 rounded-lg text-text-muted text-[11px] leading-relaxed border border-hairline/40">
                    {listing.notes}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-hairline/60 flex flex-col gap-2">
              {listing.status === 'sold' ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center flex flex-col gap-1 items-center">
                  <div className="flex items-center gap-1.5 font-sans font-bold text-sm text-emerald-500">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    <span>{t('marketplace_deal_completed')}</span>
                  </div>
                  {listing.soldPrice && (
                    <span className="font-mono text-xs text-text-muted">
                      {t('marketplace_realized_price')}: ${listing.soldPrice.toLocaleString('en-US')} USD
                    </span>
                  )}
                </div>
              ) : listing.isOwner ? (
                /* Owner Controls */
                <div className="flex items-center gap-2">
                  {onMarkAsSold && (
                    <button
                      onClick={() => onMarkAsSold(listing.id)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      <span>{t('marketplace_mark_sold')}</span>
                    </button>
                  )}
                  {onDeleteListing && (
                    <button
                      onClick={() => onDeleteListing(listing.id)}
                      className="px-4 py-2.5 rounded-xl bg-surface-hover hover:bg-ferrari-red hover:text-white font-bold text-xs transition-colors cursor-pointer text-text-muted flex items-center gap-1"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      <span>{t('marketplace_delist')}</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Buyer Contact Button */
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={handleCopyContact}
                    className="w-full py-3 rounded-xl bg-ferrari-red hover:bg-ferrari-red-hover active:bg-ferrari-red-active text-white font-bold text-sm tracking-wide transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <CopyIcon className="w-4 h-4" />
                    <span>
                      {t('modal_copy_contact', {
                        platform: listing.contactPlatform.toUpperCase(),
                        val: listing.contactValue,
                      })}
                    </span>
                    {copied && <span className="text-xs bg-black/40 px-2 py-0.5 rounded-md">{t('modal_copied')}</span>}
                  </button>
                  <span className="text-[10px] text-text-muted text-center font-mono">
                    {t('modal_safety_tip')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

