/**
 * Utility to resolve accurate card photo for marketplace listings,
 * correcting any legacy mock unsplash URLs to genuine TCG/Sports card scans.
 */
export const getListingCardPhoto = (cardName?: string, photos?: string[]): string => {
  const photo = photos?.[0] || '';
  const name = cardName || '';

  // 1. 青眼白龍 (Blue-Eyes White Dragon)
  if (name.includes('青眼白龍') || name.includes('Blue-Eyes') || photo.includes('1607604276583')) {
    return 'https://images.ygoprodeck.com/images/cards/89631139.jpg';
  }

  // 2. 1986 Fleer Michael Jordan Rookie
  if (
    name.includes('Michael Jordan') ||
    name.includes('Jordan') ||
    name.includes('1986 Fleer') ||
    photo.includes('1546519638')
  ) {
    return '/images/cards/nba-jordan.jpg';
  }

  // 3. Fallback to provided photo or default Pokémon card
  return photo || 'https://images.pokemontcg.io/sv3pt5/199_hires.png';
};
