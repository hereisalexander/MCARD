// Valid Navigation Tab IDs across Server and Client Components
export const VALID_TABS = [
  'stream',
  'explore',
  'market',
  'sets',
  'portfolio',
  'account',
  'wishlist',
  'watchlist',
  'showcase',
] as const;

export type NavigationTab = (typeof VALID_TABS)[number];

export const normalizeNavigationTab = (rawTab?: string | null): NavigationTab => {
  if (!rawTab) return 'stream';
  if (rawTab === 'watchlist') return 'wishlist';
  if ((VALID_TABS as readonly string[]).includes(rawTab)) {
    return rawTab as NavigationTab;
  }
  return 'stream';
};

