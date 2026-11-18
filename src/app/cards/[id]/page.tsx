import type { Metadata } from 'next';
import { fetchCardByIdForSSR } from '@/services/cardDetailService';
import { CardDetailPageClient } from './CardDetailPageClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { id } = await params;
  const card = await fetchCardByIdForSSR(id);

  if (!card) {
    return {
      title: '卡牌未尋獲 | MCARD',
      description: '未在 MCARD 市場行情庫中找到指定的寶可夢卡牌。',
    };
  }

  const priceText =
    typeof card.price === 'number' && card.price > 0
      ? `目前二級市場參考行情 $${card.price.toFixed(2)} USD。`
      : '即時行情持續追蹤中。';

  const title = `${card.name} #${card.number} · ${card.set} | MCARD 數位卡牌行情庫`;
  const description = `${card.name}（${card.set} #${card.number}，${card.rarity}）詳細歷史價格走勢圖、繪師 ${
    card.artistOrPlayer || 'Official'
  }、卡牌品相評級與即時市場行情。${priceText}`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mcard.app';
  const pageUrl = `${siteUrl}/cards/${encodeURIComponent(card.id)}`;

  return {
    title,
    description,
    keywords: [
      card.name,
      card.set,
      `#${card.number}`,
      card.rarity,
      'Pokémon TCG',
      '寶可夢卡牌',
      '歷史價格走勢',
      '卡牌行情',
      'PSA 10 估值',
      'MCARD',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'MCARD Vault',
      locale: 'zh_TW',
      type: 'website',
      images: card.imageUrl
        ? [
            {
              url: card.imageUrl,
              width: 734,
              height: 1024,
              alt: `${card.name} #${card.number} - ${card.set}`,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: card.imageUrl ? [card.imageUrl] : [],
    },
  };
};

export default async function CardPage({ params }: PageProps) {
  const { id } = await params;
  const card = await fetchCardByIdForSSR(id);

  return <CardDetailPageClient card={card} />;
}
