import { UniversalCard } from './multiCardService';
import { RawTcgCard, mapRawCardToApiPokemonCard } from './pokemonApi';

// 熱門知名卡牌快取字典，保障在無網路或外部 API 頻率限制時依然能極速渲染 SSR 與 SEO
export const FEATURED_CARDS_CATALOG: Record<string, UniversalCard> = {
  'sv3pt5-199': {
    id: 'sv3pt5-199',
    name: 'Charizard ex',
    category: 'pokemon',
    number: '199',
    set: '151',
    rarity: 'Special Illustration Rare',
    type: 'Fire',
    price: 128.5,
    imageUrl: 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
    artistOrPlayer: 'AKIRA EGAWA',
    tcgplayerUrl: 'https://www.tcgplayer.com/product/517045',
    description: 'Pokémon TCG 151 系列超級人氣 SAR 噴火龍 ex，極致燙金工藝。',
  },
  'base1-4': {
    id: 'base1-4',
    name: 'Charizard',
    category: 'pokemon',
    number: '4',
    set: 'Base Set',
    rarity: 'Rare Holo',
    type: 'Fire',
    price: 420.0,
    imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    artistOrPlayer: 'Mitsuhiro Arita',
    tcgplayerUrl: 'https://www.tcgplayer.com/product/42382',
    description: '1999 年初版無影噴火龍經典代表卡牌，收藏界永恆藍籌象徵。',
  },
  'swsh7-215': {
    id: 'swsh7-215',
    name: 'Umbreon VMAX',
    category: 'pokemon',
    number: '215',
    set: 'Evolving Skies',
    rarity: 'Rare Holo VMAX',
    type: 'Darkness',
    price: 720.0,
    imageUrl: 'https://images.pokemontcg.io/swsh7/215_hires.png',
    artistOrPlayer: 'KEIICHIRO ITO',
    tcgplayerUrl: 'https://www.tcgplayer.com/product/246723',
    description: '蒼空烈流異畫月亮伊布 (Moonbreon)，劍盾世代巔峰神作。',
  },
  'swsh12pt5-GG70': {
    id: 'swsh12pt5-GG70',
    name: 'Giratina VSTAR',
    category: 'pokemon',
    number: 'GG70',
    set: 'Crown Zenith',
    rarity: 'Crown Zenith Galarian Gallery',
    type: 'Dragon',
    price: 145.0,
    imageUrl: 'https://images.pokemontcg.io/swsh12pt5/GG70_hires.png',
    artistOrPlayer: 'Shinji Kanda',
    tcgplayerUrl: 'https://www.tcgplayer.com/product/478107',
    description: '頂級金色異畫騎拉帝納，神田慎二繪製之震撼宇宙視覺。',
  },
  'sv02-254': {
    id: 'sv02-254',
    name: 'Iono',
    category: 'pokemon',
    number: '254',
    set: 'Paldea Evolved',
    rarity: 'Special Illustration Rare',
    type: 'Trainer',
    price: 98.0,
    imageUrl: 'https://images.pokemontcg.io/sv02/254_hires.png',
    artistOrPlayer: 'kirisAki',
    tcgplayerUrl: 'https://www.tcgplayer.com/product/497554',
    description: '帕底亞超人氣道館館主奇樹 SAR，競技與收藏雙重天花板。',
  },
  'base1-58': {
    id: 'base1-58',
    name: 'Pikachu',
    category: 'pokemon',
    number: '58',
    set: 'Base Set',
    rarity: 'Common',
    type: 'Lightning',
    price: 35.0,
    imageUrl: 'https://images.pokemontcg.io/base1/58_hires.png',
    artistOrPlayer: 'Mitsuhiro Arita',
    tcgplayerUrl: 'https://www.tcgplayer.com/product/42408',
    description: '1999 年經典紅頰/黃頰初版皮卡丘，全球最具知名度的電氣鼠。',
  },
  'base1-2': {
    id: 'base1-2',
    name: 'Blastoise',
    category: 'pokemon',
    number: '2',
    set: 'Base Set',
    rarity: 'Rare Holo',
    type: 'Water',
    price: 120.0,
    imageUrl: 'https://images.pokemontcg.io/base1/2_hires.png',
    artistOrPlayer: 'Ken Sugimori',
    tcgplayerUrl: 'https://www.tcgplayer.com/product/42378',
    description: '初代御三家水箭龜無影閃卡，杉森建經典原畫作品。',
  },
  'base1-15': {
    id: 'base1-15',
    name: 'Venusaur',
    category: 'pokemon',
    number: '15',
    set: 'Base Set',
    rarity: 'Rare Holo',
    type: 'Grass',
    price: 85.0,
    imageUrl: 'https://images.pokemontcg.io/base1/15_hires.png',
    artistOrPlayer: 'Mitsuhiro Arita',
    tcgplayerUrl: 'https://www.tcgplayer.com/product/42436',
    description: '初代御三家妙蛙花經典閃卡，草屬性象徵性收藏卡。',
  },
};

// 根據 ID 推導合成優雅的備用卡牌資料，防止任何未知 ID 造成 SSR 崩潰
const deriveFallbackCard = (cardId: string): UniversalCard => {
  const parts = cardId.split('-');
  const setId = parts.length > 1 ? parts[0] : 'tcg';
  const cardNumber = parts.length > 1 ? parts.slice(1).join('-') : '001';

  return {
    id: cardId,
    name: `Card #${cardNumber}`,
    category: 'pokemon',
    number: cardNumber,
    set: setId.toUpperCase(),
    rarity: 'Rare Holo',
    type: 'Normal',
    price: null,
    imageUrl: `https://images.pokemontcg.io/${encodeURIComponent(setId)}/${encodeURIComponent(cardNumber)}_hires.png`,
    artistOrPlayer: 'Official Card Illustrator',
    description: `Pokémon TCG 精選卡牌 ${cardId}，即時二級市場行情即將解鎖。`,
  };
};

/**
 * 伺服器端統一卡牌獲取服務 (支援 pokemontcg.io API + 智慧備用字典 + 動態降級)
 */
export const fetchCardByIdForSSR = async (id: string): Promise<UniversalCard> => {
  if (!id || typeof id !== 'string') {
    return deriveFallbackCard('unknown');
  }

  const normalizedId = id.trim();

  // 若在已知精選熱門卡牌目錄中，先記錄以備 fallback
  const cachedMatch = FEATURED_CARDS_CATALOG[normalizedId];

  try {
    const directApiUrl = `https://api.pokemontcg.io/v2/cards/${encodeURIComponent(normalizedId)}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (process.env.POKEMON_TCG_API_KEY) {
      headers['X-Api-Key'] = process.env.POKEMON_TCG_API_KEY;
    }

    const response = await fetch(directApiUrl, {
      headers,
      next: { revalidate: 3600 }, // Next.js 快取 1 小時
    });

    if (response.ok) {
      const json = await response.json();
      if (json && json.data) {
        const rawCard = json.data as RawTcgCard;
        const apiCard = mapRawCardToApiPokemonCard(rawCard);
        return {
          id: apiCard.id,
          name: apiCard.name,
          category: 'pokemon',
          number: apiCard.number,
          set: apiCard.set,
          rarity: apiCard.rarity,
          type: apiCard.type,
          price: apiCard.price,
          imageUrl: apiCard.imageUrl || (cachedMatch?.imageUrl ?? ''),
          artistOrPlayer: apiCard.artist || 'Official Card Illustrator',
          tcgplayerUrl: apiCard.tcgplayerUrl,
          description: cachedMatch?.description || `${apiCard.name} (${apiCard.set} #${apiCard.number}) 即時市場行情與走勢。`,
        };
      }
    }
  } catch (error) {
    console.warn(`[SSR Card Fetcher] Failed to fetch card ${normalizedId} from upstream:`, error);
  }

  // 外部 API 失敗或無回傳時，使用精選字典或動態合成防護
  if (cachedMatch) {
    return cachedMatch;
  }

  return deriveFallbackCard(normalizedId);
};
