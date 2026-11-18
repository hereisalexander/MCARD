import type { MetadataRoute } from 'next';
import { FALLBACK_POKEMON_SETS } from '@/services/pokemonApi';
import { FEATURED_CARDS_CATALOG } from '@/services/cardDetailService';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mcard.app';
  const currentDate = new Date();

  // 1. 核心靜態頁面
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // 2. 熱門系列索引路由 (讓爬蟲直接收錄熱門擴充包如 151, Base Set, 蒼空烈流等)
  const setRoutes: MetadataRoute.Sitemap = FALLBACK_POKEMON_SETS.map((set) => ({
    url: `${baseUrl}/?set=${encodeURIComponent(set.name)}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. 獨立卡牌詳情頁 (收錄熱門代表神卡)
  const cardRoutes: MetadataRoute.Sitemap = Object.keys(FEATURED_CARDS_CATALOG).map((cardId) => ({
    url: `${baseUrl}/cards/${encodeURIComponent(cardId)}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...staticRoutes, ...cardRoutes, ...setRoutes];
}
