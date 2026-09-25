/**
 * MCARD Affiliate Marketing Configuration & URL Generators
 * Supports:
 * 1. eBay Partner Network (EPN)
 * 2. TCGPlayer Affiliate Network
 */

// Default configuration - replace with user's actual affiliate credentials
export const AFFILIATE_CONFIG = {
  // eBay Partner Network (EPN)
  ebay: {
    enabled: true,
    campaignId: process.env.NEXT_PUBLIC_EBAY_CAMP_ID || '5338901234', // EPN Campaign ID (replace with yours)
    customId: 'mcard-web',
    siteId: '0', // 0 = US, 3 = UK, etc.
  },
  // TCGplayer Affiliate / Partnerize
  tcgplayer: {
    enabled: true,
    partnerId: process.env.NEXT_PUBLIC_TCGPLAYER_PARTNER_ID || 'mcard', // Partner code
    utmSource: 'mcard',
  },
};

export interface AffiliateCardInfo {
  name: string;
  set?: string;
  number?: string;
  rarity?: string;
  category?: string;
  condition?: string;
  tcgplayerUrl?: string;
}

/**
 * Telemetry: track outbound affiliate link clicks for conversion analysis.
 */
export const trackAffiliateClick = (
  merchant: 'ebay' | 'tcgplayer',
  cardName: string,
  destinationUrl: string
): void => {
  try {
    const timestamp = new Date().toISOString();
    const eventData = { merchant, cardName, timestamp, destinationUrl };

    // 1. Log to console for developer telemetry
    console.info(`[MCARD Affiliate] Outbound Click: ${merchant.toUpperCase()} -> ${cardName}`, eventData);

    // 2. Persist click count in localStorage for conversion stats
    const key = 'mcard_affiliate_clicks';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = [eventData, ...(Array.isArray(existing) ? existing.slice(0, 99) : [])];
    localStorage.setItem(key, JSON.stringify(updated));

    // 3. Trigger Google Analytics if present
    if (typeof window !== 'undefined' && 'gtag' in window && typeof (window as unknown as { gtag: unknown }).gtag === 'function') {
      ((window as unknown as { gtag: (...args: unknown[]) => void }).gtag)('event', 'affiliate_click', {
        event_category: 'Monetization',
        event_label: `${merchant}:${cardName}`,
        destination_url: destinationUrl,
      });
    }
  } catch (err) {
    console.debug('Failed to record affiliate click telemetry:', err);
  }
};

/**
 * Generate an eBay Partner Network (EPN) affiliate search link for a given card.
 */
export const getEbayAffiliateUrl = (card: AffiliateCardInfo): string => {
  // Construct precise search keywords (e.g. "Charizard ex 199/165 151 PSA 10")
  const conditionKeyword = card.condition && card.condition !== 'Ungraded' ? card.condition : '';

  const searchTerms = [
    card.name,
    card.number ? `#${card.number}` : '',
    card.set || '',
    conditionKeyword,
    card.category === 'pokemon' ? 'pokemon card' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const encodedQuery = encodeURIComponent(searchTerms.trim());
  const baseUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}&_sop=12`; // _sop=12: Best Match / Newly Listed

  const { campaignId, customId, siteId } = AFFILIATE_CONFIG.ebay;

  // Standard EPN redirect / query tracking parameters
  const params = new URLSearchParams({
    mkcid: '1',
    mkrid: '711-53200-19255-0',
    siteid: siteId,
    campid: campaignId,
    customid: customId,
    toolid: '10001',
    mkevt: '1',
  });

  return `${baseUrl}&${params.toString()}`;
};

/**
 * Generate a TCGPlayer affiliate link for a given card.
 */
export const getTcgplayerAffiliateUrl = (card: AffiliateCardInfo): string => {
  // If card has a direct URL from Pokémon TCG API
  if (card.tcgplayerUrl && card.tcgplayerUrl.startsWith('http')) {
    try {
      const url = new URL(card.tcgplayerUrl);
      url.searchParams.set('utm_source', AFFILIATE_CONFIG.tcgplayer.utmSource);
      url.searchParams.set('utm_medium', 'affiliate');
      url.searchParams.set('partner', AFFILIATE_CONFIG.tcgplayer.partnerId);
      return url.toString();
    } catch {
      return card.tcgplayerUrl;
    }
  }

  // Fallback to TCGPlayer search if direct URL is not present
  const query = encodeURIComponent(`${card.name} ${card.set || ''}`.trim());
  return `https://www.tcgplayer.com/search/all/product?q=${query}&utm_source=${AFFILIATE_CONFIG.tcgplayer.utmSource}&utm_medium=affiliate`;
};
