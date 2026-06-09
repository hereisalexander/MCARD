'use client';

import React, { useState, useMemo } from 'react';

export interface PokemonCard {
  id: string;
  name: string;
  number: string;
  set: '151' | 'Evolving Skies' | 'Crown Zenith' | 'Base Set' | 'Twilight Masquerade';
  type: 'Fire' | 'Water' | 'Grass' | 'Psychic' | 'Darkness' | 'Lightning';
  rarity: 'Common' | 'Holo Rare' | 'Ultra Rare' | 'Illustration Rare' | 'Special Illustration Rare' | 'Promo';
  price: number;
  imageUrl: string;
}

interface CardGridProps {
  onAddCard: (cardName: string, price: number, imageUrl: string) => void;
  initialSetFilter?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({ onAddCard, initialSetFilter = 'ALL' }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSet, setSelectedSet] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  React.useEffect(() => {
    if (initialSetFilter) {
      setSelectedSet(initialSetFilter);
    }
  }, [initialSetFilter]);

  const cardsData: PokemonCard[] = [
    {
      id: 'p1',
      name: 'Charizard ex',
      number: '199/165',
      set: '151',
      type: 'Fire',
      rarity: 'Special Illustration Rare',
      price: 134.50,
      imageUrl: 'https://images.pokemontcg.io/sv3pt5/199_hires.png',
    },
    {
      id: 'p2',
      name: 'Umbreon VMAX',
      number: '215/203',
      set: 'Evolving Skies',
      type: 'Darkness',
      rarity: 'Special Illustration Rare',
      price: 850.00,
      imageUrl: 'https://images.pokemontcg.io/swsh7/215_hires.png',
    },
    {
      id: 'p3',
      name: 'Pikachu',
      number: '160/159',
      set: 'Crown Zenith',
      type: 'Lightning',
      rarity: 'Illustration Rare',
      price: 12.80,
      imageUrl: 'https://images.pokemontcg.io/swsh12pt5/160_hires.png',
    },
    {
      id: 'p4',
      name: 'Mew ex',
      number: '205/165',
      set: '151',
      type: 'Psychic',
      rarity: 'Special Illustration Rare',
      price: 88.00,
      imageUrl: 'https://images.pokemontcg.io/sv3pt5/205_hires.png',
    },
    {
      id: 'p5',
      name: 'Rayquaza VMAX',
      number: '218/203',
      set: 'Evolving Skies',
      type: 'Lightning',
      rarity: 'Special Illustration Rare',
      price: 380.00,
      imageUrl: 'https://images.pokemontcg.io/swsh7/218_hires.png',
    },
    {
      id: 'p6',
      name: 'Charizard Holo',
      number: '4/102',
      set: 'Base Set',
      type: 'Fire',
      rarity: 'Holo Rare',
      price: 350.00,
      imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    },
    {
      id: 'p7',
      name: 'Blastoise ex',
      number: '200/165',
      set: '151',
      type: 'Water',
      rarity: 'Special Illustration Rare',
      price: 52.00,
      imageUrl: 'https://images.pokemontcg.io/sv3pt5/200_hires.png',
    },
    {
      id: 'p8',
      name: 'Venusaur ex',
      number: '198/165',
      set: '151',
      type: 'Grass',
      rarity: 'Special Illustration Rare',
      price: 46.50,
      imageUrl: 'https://images.pokemontcg.io/sv3pt5/198_hires.png',
    },
    {
      id: 'p9',
      name: 'Ogerpon Teal Mask ex',
      number: '211/167',
      set: 'Twilight Masquerade',
      type: 'Grass',
      rarity: 'Special Illustration Rare',
      price: 65.00,
      imageUrl: 'https://images.pokemontcg.io/sv6/211_hires.png',
    },
    {
      id: 'p10',
      name: 'Mewtwo Holo',
      number: '10/102',
      set: 'Base Set',
      type: 'Psychic',
      rarity: 'Holo Rare',
      price: 95.00,
      imageUrl: 'https://images.pokemontcg.io/base1/10_hires.png',
    },
  ];


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSetSelect = (setName: string) => {
    setSelectedSet(setName);
  };

  const handleTypeSelect = (typeName: string) => {
    setSelectedType(typeName);
  };

  const filteredCards = useMemo(() => {
    return cardsData.filter((card) => {
      const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            card.number.includes(searchQuery);
      const matchesSet = selectedSet === 'ALL' || card.set === selectedSet;
      const matchesType = selectedType === 'ALL' || card.type === selectedType;
      return matchesSearch && matchesSet && matchesType;
    });
  }, [searchQuery, selectedSet, selectedType]);

  const setsList = ['ALL', '151', 'Evolving Skies', 'Crown Zenith', 'Base Set', 'Twilight Masquerade'];
  const typesList = ['ALL', 'Fire', 'Water', 'Grass', 'Psychic', 'Darkness', 'Lightning'];

  return (
    <div className="w-full py-6 max-w-7xl mx-auto px-4 md:px-0">
      {/* Search & Filter bar */}
      <div className="flex flex-col gap-6 mb-8 bg-surface p-6 rounded-[20px] border-hairline border-primary">
        <div className="flex flex-col gap-2">
          <label htmlFor="card-search" className="font-mono text-[11px] font-bold tracking-[1.5px] text-text-muted">
            SEARCH POKÉMON DATABASE
          </label>
          <input
            id="card-search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="SEARCH BY NAME (E.G. CHARIZARD, PIKACHU) OR CARD NUMBER..."
            className="w-full bg-background border border-primary rounded-[2px] px-4 py-3 font-body text-sm text-foreground placeholder-text-muted focus:outline-none focus:border-verge-ultraviolet dark:focus:border-jelly-mint transition-colors duration-150"
          />
        </div>

        {/* Set Filters */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] font-bold tracking-[1.5px] text-text-muted">FILTER BY EXPANSION SET</span>
          <div className="flex flex-wrap gap-2">
            {setsList.map((setName) => {
              const isActive = selectedSet === setName;
              return (
                <button
                  key={setName}
                  onClick={() => handleSetSelect(setName)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold tracking-[1px] cursor-pointer border-hairline transition-all duration-150 ${
                    isActive
                      ? 'bg-verge-ultraviolet text-white border-transparent dark:bg-jelly-mint dark:text-absolute-black'
                      : 'bg-background hover:border-verge-ultraviolet dark:hover:border-jelly-mint'
                  }`}
                  aria-label={`Filter cards by set ${setName}`}
                >
                  {setName.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] font-bold tracking-[1.5px] text-text-muted">FILTER BY ELEMENTAL TYPE</span>
          <div className="flex flex-wrap gap-2">
            {typesList.map((typeName) => {
              const isActive = selectedType === typeName;
              return (
                <button
                  key={typeName}
                  onClick={() => handleTypeSelect(typeName)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold tracking-[1px] cursor-pointer border-hairline transition-all duration-150 ${
                    isActive
                      ? 'bg-verge-ultraviolet text-white border-transparent dark:bg-jelly-mint dark:text-absolute-black'
                      : 'bg-background hover:border-verge-ultraviolet dark:hover:border-jelly-mint'
                  }`}
                  aria-label={`Filter cards by elemental type ${typeName}`}
                >
                  {typeName.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div className="flex justify-between items-center mb-6">
        <span className="font-mono text-[11px] font-bold tracking-[1.5px] text-text-muted">
          SHOWING {filteredCards.length} RESULTS
        </span>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-[20px] border-hairline border-dashed">
          <p className="font-display text-2xl uppercase text-text-muted">NO CARDS FOUND MATCHING SEARCH</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-surface border-hairline border-primary rounded-[20px] p-5 flex flex-col justify-between hover:border-verge-ultraviolet dark:hover:border-jelly-mint transition-all duration-150 group"
            >
              <div>
                {/* Polaroid-style image frame */}
                <div className="aspect-[3/4] relative w-full mb-4 rounded-xl overflow-hidden border border-primary bg-[#1e1e1e]/5 dark:bg-black/35 flex items-center justify-center p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="object-contain max-h-full max-w-full rounded-[4px] shadow-sm select-none"
                    loading="lazy"
                  />
                </div>

                {/* Card Tags */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-[20px] bg-verge-ultraviolet/10 dark:bg-jelly-mint/10 text-verge-ultraviolet dark:text-jelly-mint font-mono text-[9px] font-bold tracking-[1px] uppercase">
                    {card.set}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    #{card.number}
                  </span>
                </div>

                {/* Name */}
                <h4 className="font-display text-xl md:text-2xl font-bold uppercase tracking-tight text-foreground group-hover:text-deep-link-blue transition-colors duration-150 mb-1">
                  {card.name}
                </h4>

                {/* Rarity & Type */}
                <div className="flex justify-between items-center text-[11px] text-text-muted mb-4 font-mono">
                  <span>{card.rarity.toUpperCase()}</span>
                  <span>{card.type.toUpperCase()}</span>
                </div>
              </div>

              {/* Price & Action row */}
              <div className="flex items-center justify-between border-t border-primary pt-3 mt-auto">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] tracking-[0.5px] text-text-muted">MARKET PRICE</span>
                  <span className="font-mono font-bold text-base text-foreground">
                    ${card.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  onClick={() => onAddCard(card.name, card.price, card.imageUrl)}
                  className="px-4 py-2 rounded-2xl bg-verge-ultraviolet text-white dark:bg-jelly-mint dark:text-absolute-black font-mono text-[10px] font-bold tracking-[1.5px] hover:opacity-85 active:opacity-60 transition-all duration-150 cursor-pointer"
                  aria-label={`Add ${card.name} to portfolio`}
                >
                  + PORTFOLIO
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
