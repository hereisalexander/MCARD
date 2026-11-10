/**
 * Utility to resolve accurate card photo for marketplace listings,
 * correcting any legacy mock unsplash URLs to genuine TCG/Sports card scans.
 */
export const getListingCardPhoto = (cardName?: string, photos?: string[]): string => {
  const photo = photos?.[0] || '';
  if (!photo) return 'https://images.pokemontcg.io/sv3pt5/199_hires.png';

  // 使用者自拍實體卡照（Data URL 或 Blob）一律優先展示真實卡況照片
  if (photo.startsWith('data:image') || photo.startsWith('blob:')) {
    return photo;
  }

  // 修正舊版 Unsplash 示範圖為官方卡圖
  if (photo.includes('1607604276583')) {
    return 'https://images.ygoprodeck.com/images/cards/89631139.jpg';
  }

  if (photo.includes('1546519638')) {
    return '/images/cards/nba-jordan.jpg';
  }

  return photo;
};
