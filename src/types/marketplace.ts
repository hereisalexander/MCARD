import { CardCategory } from '@/services/multiCardService';

export type ListingCondition =
  | 'PSA 10'
  | 'PSA 9'
  | 'BGS 9.5'
  | 'CGC 10'
  | 'Ungraded Near Mint'
  | 'Played';

export type ListingStatus = 'active' | 'reserved' | 'sold';
export type ContactPlatform = 'line' | 'instagram' | 'phone' | 'email';

export interface CardListing {
  id: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRating?: number; // e.g. 5.0
  sellerSalesCount?: number; // e.g. 14
  contactPlatform: ContactPlatform;
  contactValue: string;
  cardName: string;
  category: CardCategory;
  setName: string;
  officialPrice: number;
  askingPrice: number;
  soldPrice?: number;
  soldAt?: string;
  portfolioCardId?: string;
  buyInCost?: number;
  condition: ListingCondition;
  photos: string[];
  notes: string;
  location: string;
  createdAt: string;
  status: ListingStatus;
  isOwner?: boolean;
}

export const INITIAL_MARKETPLACE_LISTINGS: CardListing[] = [
  {
    id: 'listing-charizard-151',
    sellerName: 'RedTrainer_99',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    sellerRating: 5.0,
    sellerSalesCount: 18,
    contactPlatform: 'line',
    contactValue: 'red_trainer_tw',
    cardName: 'Charizard ex #199/165 (SAR)',
    category: 'pokemon',
    setName: 'Pokémon 151',
    officialPrice: 245,
    askingPrice: 210,
    condition: 'PSA 10',
    photos: [
      'https://images.pokemontcg.io/sv3pt5/199_hires.png',
    ],
    notes: '日版 151 初代御三家，親送美國 PSA 滿分 10 分標！四角無白邊，附原廠防刮保護袋，台北捷運藍線可面交。',
    location: '台灣台北 / 7-11店到店',
    createdAt: '10 分鐘前',
    status: 'active',
  },
  {
    id: 'listing-pikachu-sparks',
    sellerName: 'PikaCollector_HK',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    sellerRating: 4.9,
    sellerSalesCount: 32,
    contactPlatform: 'instagram',
    contactValue: 'pika_vault_hk',
    cardName: 'Pikachu ex #238 (Special Illustration Rare)',
    category: 'pokemon',
    setName: 'Surging Sparks',
    officialPrice: 380,
    askingPrice: 340,
    condition: 'Ungraded Near Mint',
    photos: [
      'https://images.pokemontcg.io/sv8/238_hires.png',
    ],
    notes: '最新超電激流星晶皮卡丘！開出後立即入內膽加磁吸卡磚，零指紋無下場，誠可小議。',
    location: '香港旺角 / 順豐速運',
    createdAt: '1 小時前',
    status: 'active',
  },
  {
    id: 'listing-jordan-fleer',
    sellerName: 'VintageHoops_Pro',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    sellerRating: 5.0,
    sellerSalesCount: 9,
    contactPlatform: 'line',
    contactValue: 'jordan_vault86',
    cardName: '1986 Fleer #57 Michael Jordan Rookie',
    category: 'nba',
    setName: '1986-87 Fleer Basketball',
    officialPrice: 4200,
    askingPrice: 3950,
    condition: 'PSA 9',
    photos: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80',
    ],
    notes: '籃球之神喬丹傳奇新秀卡！PSA 9 Mint 品相，居中率完美，附鑑定編號官網可查驗，高價卡建議台北面交驗卡。',
    location: '台灣台北 (限面交)',
    createdAt: '3 小時前',
    status: 'active',
  },
  {
    id: 'listing-blue-eyes',
    sellerName: 'KaibaCorp_TW',
    sellerAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
    sellerRating: 4.8,
    sellerSalesCount: 25,
    contactPlatform: 'line',
    contactValue: 'blueeyes_master',
    cardName: '青眼白龍 (Blue-Eyes White Dragon) 20th 浮雕',
    category: 'yugioh',
    setName: 'Yu-Gi-Oh! 20th Anniversary',
    officialPrice: 180,
    askingPrice: 165,
    condition: 'BGS 9.5',
    photos: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    ],
    notes: 'BGS 9.5 金標，全品項角邊面均在 9.5 以上，經典收藏必備，可店到店寄送免運。',
    location: '台灣台中 / 全家店到店',
    createdAt: '昨天',
    status: 'active',
  },
  {
    id: 'listing-gengar-vmax-alt',
    sellerName: 'PokemonMaster_99',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    sellerRating: 5.0,
    sellerSalesCount: 42,
    contactPlatform: 'line',
    contactValue: 'gengar_collector',
    cardName: '耿鬼 VMAX #271 (Special Art Rare)',
    category: 'pokemon',
    setName: 'Fusion Strike',
    officialPrice: 320,
    askingPrice: 300,
    soldPrice: 295,
    soldAt: '2026-09-24',
    condition: 'PSA 10',
    photos: [
      'https://images.pokemontcg.io/swsh8/271_hires.png',
    ],
    notes: '超人氣耿鬼大吞噬異畫！已於昨日順利面交完成，買家極度滿意。',
    location: '台灣台北 / 面交完成',
    createdAt: '3 天前',
    status: 'sold',
  },
];
