'use client';

import React, { useState, useMemo } from 'react';
import { ApiPokemonCard } from '@/services/pokemonApi';
import { CardCondition } from '@/components/PortfolioDashboard';
import { HoloCard } from '@/components/HoloCard';
import { useLanguage } from '@/context/LanguageContext';

type TimeRange = '1M' | '3M' | '6M' | '1Y';

interface CardDetailViewProps {
  card: ApiPokemonCard;
  onBack: () => void;
  onAddCard: (cardName: string, price: number, imageUrl: string, condition: CardCondition) => void;
}

export const CardDetailView: React.FC<CardDetailViewProps> = ({
  card,
  onBack,
  onAddCard,
}) => {
  const { t } = useLanguage();
  const [selectedCondition, setSelectedCondition] = useState<CardCondition>('Ungraded');
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Days count mapping per time range
  const daysCount = useMemo(() => {
    switch (timeRange) {
      case '1M':
        return 30;
      case '3M':
        return 90;
      case '6M':
        return 180;
      case '1Y':
      default:
        return 365;
    }
  }, [timeRange]);

  // Generate a 365-day consistent historical price timeline (Time-Invariant Market Model)
  const fullYearHistory = useMemo(() => {
    const basePrice = card.price;
    let seed = 0;
    for (let i = 0; i < card.id.length; i++) {
      seed += card.id.charCodeAt(i);
    }
    if (selectedCondition === 'PSA 10') seed += 100;
    if (selectedCondition === 'PSA 9') seed += 50;
    if (selectedCondition === 'BGS 10') seed += 200;
    if (selectedCondition === 'BGS Black Label') seed += 500;

    let conditionMultiplier = 1.0;
    if (selectedCondition === 'PSA 10') conditionMultiplier = 2.8;
    if (selectedCondition === 'PSA 9') conditionMultiplier = 1.4;
    if (selectedCondition === 'BGS 10') conditionMultiplier = 3.5;
    if (selectedCondition === 'BGS Black Label') conditionMultiplier = 6.0;

    const targetPrice = basePrice * conditionMultiplier;
    const fullDays = 365;
    const history = [];

    for (let day = fullDays; day >= 1; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      const progress = (fullDays - day) / (fullDays - 1); // 0.0 (365 days ago) to 1.0 (today)
      
      // Smooth multi-frequency organic waves (seasonal + quarterly + subtle smooth micro-wave)
      const seasonalWave = Math.sin(progress * Math.PI * 2.8 + (seed % 5)) * (targetPrice * 0.14);
      const quarterlyWave = Math.cos(progress * Math.PI * 6.5 + (seed % 11)) * (targetPrice * 0.04);
      const smoothMicroWave = Math.sin(progress * Math.PI * 12.0 + (seed % 3)) * (targetPrice * 0.008);

      // Smooth long-term appreciation curve ending exactly at today's market price
      const longTermBaseline = targetPrice * (0.84 + progress * 0.16);
      const val = Math.max(0.5, longTermBaseline + seasonalWave + quarterlyWave + smoothMicroWave);

      history.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        price: Number((day === 1 ? targetPrice : val).toFixed(2)),
      });
    }

    return history;
  }, [card, selectedCondition]);

  // Slice history corresponding to selected time range (1M: last 30 days, 3M: last 90 days, 6M: last 180 days, 1Y: last 365 days)
  const priceHistoryData = useMemo(() => {
    return fullYearHistory.slice(-daysCount);
  }, [fullYearHistory, daysCount]);

  const currentPrice = priceHistoryData[priceHistoryData.length - 1]?.price || card.price;
  const pricesArr = priceHistoryData.map((d) => d.price);
  const rawMinPrice = Math.min(...pricesArr);
  const rawMaxPrice = Math.max(...pricesArr);

  // Dynamic Y Min and Y Max with smart padding to zoom and fit the curve gracefully
  const yRangeDelta = rawMaxPrice - rawMinPrice;
  const yPadding = yRangeDelta > 0 ? yRangeDelta * 0.15 : (rawMaxPrice * 0.08 || 5);
  
  const yMin = Math.max(0, Math.floor(rawMinPrice - yPadding));
  const yMax = Math.ceil(rawMaxPrice + yPadding);
  const yRange = yMax - yMin || 1;

  // Generate 5 smooth dynamic Y-axis tick values
  const yAxisTicks = useMemo(() => {
    const step = yRange / 4;
    return [
      yMax,
      Number((yMin + step * 3).toFixed(1)),
      Number((yMin + step * 2).toFixed(1)),
      Number((yMin + step * 1).toFixed(1)),
      yMin,
    ];
  }, [yMin, yMax, yRange]);

  const startPrice = priceHistoryData[0]?.price || currentPrice;
  const priceChange = currentPrice - startPrice;
  const priceChangePct = startPrice > 0 ? (priceChange / startPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  // Chart Geometry Config
  const svgWidth = 700;
  const svgHeight = 260;
  const marginLeft = 50;
  const marginBottom = 45;
  const marginTop = 15;
  const marginRight = 20;

  const chartInnerWidth = svgWidth - marginLeft - marginRight;
  const chartInnerHeight = svgHeight - marginTop - marginBottom;

  // Calculate raw coordinates dynamically scaling within [yMin, yMax]
  const rawPointsCoords = useMemo(() => {
    return priceHistoryData.map((item, idx) => {
      const x = marginLeft + (idx / (priceHistoryData.length - 1)) * chartInnerWidth;
      const y = marginTop + chartInnerHeight - ((item.price - yMin) / yRange) * chartInnerHeight;
      return { x, y, item };
    });
  }, [priceHistoryData, yMin, yRange, marginLeft, marginTop, chartInnerWidth, chartInnerHeight]);

  // Apply Moving-Average Filter to eliminate high-frequency jagged teeth & yield silk-smooth curves
  const pointsCoords = useMemo(() => {
    if (rawPointsCoords.length < 3) return rawPointsCoords;

    const windowSize = Math.max(3, Math.floor(rawPointsCoords.length / 28) * 2 + 1);
    const halfWin = Math.floor(windowSize / 2);

    return rawPointsCoords.map((point, idx) => {
      // Pin start and end points exact
      if (idx === 0 || idx === rawPointsCoords.length - 1) return point;

      let sumY = 0;
      let count = 0;
      for (let i = Math.max(0, idx - halfWin); i <= Math.min(rawPointsCoords.length - 1, idx + halfWin); i++) {
        sumY += rawPointsCoords[i].y;
        count++;
      }

      return {
        ...point,
        y: sumY / count,
      };
    });
  }, [rawPointsCoords]);

  // Construct smooth SVG path string (d="M ... C ...")
  const pathD = useMemo(() => {
    if (pointsCoords.length === 0) return '';
    return pointsCoords.reduce((acc, point, i, a) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      const prev = a[i - 1];
      const cx1 = prev.x + (point.x - prev.x) / 3;
      const cy1 = prev.y;
      const cx2 = point.x - (point.x - prev.x) / 3;
      const cy2 = point.y;
      return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${point.x},${point.y}`;
    }, '');
  }, [pointsCoords]);

  const areaD = `${pathD} L ${pointsCoords[pointsCoords.length - 1]?.x || svgWidth},${marginTop + chartInnerHeight} L ${marginLeft},${marginTop + chartInnerHeight} Z`;

  // X-Axis sample labels (evenly spaced dates to avoid label overlapping)
  const xAxisLabels = useMemo(() => {
    if (pointsCoords.length === 0) return [];
    
    // Choose exactly 7 evenly spaced tick marks from start to end
    const targetCount = 7;
    const labels = [];
    const step = (pointsCoords.length - 1) / (targetCount - 1);

    for (let i = 0; i < targetCount; i++) {
      const index = Math.min(pointsCoords.length - 1, Math.round(i * step));
      if (pointsCoords[index]) {
        labels.push(pointsCoords[index]);
      }
    }

    return labels;
  }, [pointsCoords]);

  const handleAddClick = () => {
    onAddCard(card.name, currentPrice, card.imageUrl, selectedCondition);
  };

  const lastPoint = pointsCoords[pointsCoords.length - 1];

  return (
    <div className="w-full py-6 max-w-7xl mx-auto px-4 md:px-0 flex flex-col gap-8 animate-fade-in">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between border-b border-primary pb-4">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl border-hairline border-primary bg-surface font-mono text-xs font-bold tracking-[1.5px] hover:bg-foreground hover:text-background transition-all duration-150 cursor-pointer flex items-center gap-2 uppercase"
        >
          {t('back_to_explore')}
        </button>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-xl bg-verge-ultraviolet text-white dark:bg-jelly-mint dark:text-absolute-black font-mono text-[10px] font-bold tracking-[1.5px] uppercase">
            {card.set}
          </span>
          <span className="font-mono text-xs text-text-muted">#{card.number}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left 5 Cols: Card Showcase */}
        <div className="lg:col-span-5 flex flex-col items-center gap-6 bg-surface p-8 rounded-[24px] border-hairline border-primary">
          <div className="w-full max-w-[340px]">
            <HoloCard src={card.imageUrl} alt={card.name} rarity={card.rarity} />
          </div>

          <div className="flex flex-col items-center gap-1 border-t border-primary/40 pt-4 w-full text-center">
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-[1px]">{t('card_artist')}</span>
            <span className="font-mono text-sm font-bold text-foreground">
              {card.artist ? card.artist.toUpperCase() : 'OFFICIAL POKÉMON ARTIST'}
            </span>
          </div>

          {card.tcgplayerUrl && (
            <a
              href={card.tcgplayerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl border-hairline border-primary font-mono text-[11px] font-bold tracking-[1.5px] text-center bg-background hover:border-verge-ultraviolet dark:hover:border-jelly-mint transition-colors duration-150 uppercase"
            >
              {t('view_on_tcgplayer')}
            </a>
          )}
        </div>

        {/* Right 7 Cols: Advanced Price History & Financial Chart */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div>
            <span className="font-mono text-[11px] font-bold text-verge-ultraviolet dark:text-jelly-mint tracking-[2px] uppercase">
              {card.rarity.toUpperCase()} • {card.type.toUpperCase()} ELEMENTAL TYPE
            </span>
            <h1 className="font-display font-bold text-4xl md:text-6xl uppercase tracking-tight text-foreground leading-none mt-2">
              {card.name}
            </h1>
          </div>

          {/* Key Financial Indicators Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface p-5 rounded-[20px] border-hairline border-primary flex flex-col">
              <span className="font-mono text-[9px] text-text-muted tracking-[1px] uppercase">
                {selectedCondition.toUpperCase()} {t('est_market_price')}
              </span>
              <span className="font-mono font-bold text-2xl md:text-3xl text-foreground mt-1">
                ${currentPrice.toFixed(2)}
              </span>
            </div>

            <div className="bg-surface p-5 rounded-[20px] border-hairline border-primary flex flex-col">
              <span className="font-mono text-[9px] text-text-muted tracking-[1px] uppercase">
                {timeRange} {t('price_change_3m')}
              </span>
              <span className={`font-mono font-bold text-xl md:text-2xl mt-1 ${isPositive ? 'text-emerald-500 dark:text-jelly-mint' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}${priceChange.toFixed(2)}
              </span>
              <span className={`font-mono text-xs ${isPositive ? 'text-emerald-500 dark:text-jelly-mint' : 'text-red-500'}`}>
                ({isPositive ? '+' : ''}{priceChangePct.toFixed(1)}%)
              </span>
            </div>

            <div className="bg-surface p-5 rounded-[20px] border-hairline border-primary flex flex-col">
              <span className="font-mono text-[9px] text-text-muted tracking-[1px] uppercase">
                {timeRange} {t('high_low_range')}
              </span>
              <span className="font-mono font-bold text-lg text-foreground mt-1">
                ${rawMinPrice.toFixed(2)} - ${rawMaxPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Reference Screenshot Styled Detailed Price Chart Container */}
          <div className="bg-surface p-6 rounded-[24px] border-hairline border-primary flex flex-col gap-6 shadow-sm">
            
            {/* Chart Title Header & Time Tabs (Exact Reference Style) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/30 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-verge-ultraviolet/10 dark:bg-jelly-mint/10 text-verge-ultraviolet dark:text-jelly-mint flex items-center justify-center font-bold text-sm">
                  ↺
                </span>
                <h3 className="font-display text-xl md:text-2xl font-bold uppercase tracking-wide text-foreground">
                  {t('price_history_title', { condition: selectedCondition })}
                </h3>
              </div>

              {/* Time Range Selector Tabs (1M, 3M, 6M, 1Y) */}
              <div className="flex items-center gap-1.5 bg-background p-1.5 rounded-2xl border border-primary/40 self-start sm:self-auto">
                {(['1M', '3M', '6M', '1Y'] as TimeRange[]).map((range) => {
                  const isActive = timeRange === range;
                  return (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-bold tracking-[1px] transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-surface text-foreground shadow-sm border border-primary/60 font-extrabold'
                          : 'text-text-muted hover:text-foreground'
                      }`}
                    >
                      {range}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* High Precision SVG Line Chart with Grid & Axis Labels */}
            <div className="relative w-full bg-background rounded-2xl p-4 border border-primary/40">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto overflow-visible select-none"
              >
                <defs>
                  {/* Soft Teal / Turquoise Area Fill Gradient */}
                  <linearGradient id="refChartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00c4b4" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00c4b4" stopOpacity="0.01" />
                  </linearGradient>

                  {/* Dot Grid Pattern */}
                  <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="currentColor" className="text-text-muted/15" />
                  </pattern>
                </defs>

                {/* Background Dot Grid Area */}
                <rect
                  x={marginLeft}
                  y={marginTop}
                  width={chartInnerWidth}
                  height={chartInnerHeight}
                  fill="url(#gridPattern)"
                />

                {/* Y-Axis Horizontal Grid Lines & Dynamic Price Labels */}
                {yAxisTicks.map((val, idx) => {
                  const y = marginTop + chartInnerHeight - ((val - yMin) / yRange) * chartInnerHeight;
                  return (
                    <g key={`y-axis-${idx}`}>
                      <line
                        x1={marginLeft}
                        y1={y}
                        x2={marginLeft + chartInnerWidth}
                        y2={y}
                        stroke="currentColor"
                        strokeDasharray="4 4"
                        className="text-text-muted/20"
                        strokeWidth="1"
                      />
                      <text
                        x={marginLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-text-muted font-mono text-[11px]"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Gradient Fill under Bézier Curve with Smooth Morph Animation */}
                <path
                  d={areaD}
                  fill="url(#refChartAreaGradient)"
                  style={{ transition: 'd 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />

                {/* Turquoise Main Curve Line with Smooth Morph Animation */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#00c4b4"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: 'd 0.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease' }}
                />

                {/* X-Axis Slanted Date Labels */}
                {xAxisLabels.map((p, idx) => (
                  <g key={`x-axis-${idx}`} transform={`translate(${p.x}, ${marginTop + chartInnerHeight + 14})`}>
                    <text
                      transform="rotate(-40)"
                      textAnchor="end"
                      className="fill-text-muted font-mono text-[10px]"
                    >
                      {p.item.date}
                    </text>
                  </g>
                ))}

                {/* Current Price Endpoint Dot (Reference Screenshot Dot) */}
                {lastPoint && (
                  <g
                    transform={`translate(${lastPoint.x}, ${lastPoint.y})`}
                    style={{ transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  >
                    <circle r="6" fill="#00c4b4" opacity="0.3" className="animate-ping" />
                    <circle r="4.5" fill="#00c4b4" stroke="#ffffff" strokeWidth="2" />
                  </g>
                )}

                {/* Hover Interaction Overlay Line */}
                {hoveredPointIndex !== null && pointsCoords[hoveredPointIndex] && (
                  <g>
                    <line
                      x1={pointsCoords[hoveredPointIndex].x}
                      y1={marginTop}
                      x2={pointsCoords[hoveredPointIndex].x}
                      y2={marginTop + chartInnerHeight}
                      stroke="#00c4b4"
                      strokeDasharray="3 3"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={pointsCoords[hoveredPointIndex].x}
                      cy={pointsCoords[hoveredPointIndex].y}
                      r="6"
                      fill="#ffffff"
                      stroke="#00c4b4"
                      strokeWidth="3"
                    />
                  </g>
                )}

                {/* Invisible Hover Hit Targets */}
                {pointsCoords.map((p, idx) => (
                  <rect
                    key={`hit-${idx}`}
                    x={p.x - chartInnerWidth / pointsCoords.length / 2}
                    y={marginTop}
                    width={chartInnerWidth / pointsCoords.length}
                    height={chartInnerHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  />
                ))}
              </svg>

              {/* Hover Tooltip Box */}
              {hoveredPointIndex !== null && priceHistoryData[hoveredPointIndex] && (
                <div className="absolute top-4 left-14 bg-foreground text-background font-mono text-[11px] font-bold px-4 py-2 rounded-xl shadow-xl border border-primary uppercase">
                  {priceHistoryData[hoveredPointIndex].fullDate}: ${priceHistoryData[hoveredPointIndex].price.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Condition Picker & Add to Portfolio Bar */}
          <div className="bg-surface p-6 rounded-[24px] border-hairline border-primary flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="font-mono text-[10px] font-bold text-text-muted uppercase">{t('select_condition')}</span>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value as CardCondition)}
                className="bg-background border border-primary rounded-xl px-4 py-3 font-mono text-xs font-bold text-foreground focus:outline-none focus:border-verge-ultraviolet dark:focus:border-jelly-mint cursor-pointer uppercase w-full sm:w-auto"
              >
                <option value="Ungraded">UNGRADED</option>
                <option value="PSA 10">PSA 10 GEM MINT</option>
                <option value="PSA 9">PSA 9 MINT</option>
                <option value="BGS 10">BGS 10 PRISTINE</option>
                <option value="BGS Black Label">BGS BLACK LABEL</option>
              </select>
            </div>

            <button
              onClick={handleAddClick}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-verge-ultraviolet text-white dark:bg-jelly-mint dark:text-absolute-black font-mono text-xs font-bold tracking-[2px] hover:opacity-85 active:opacity-60 transition-all duration-150 cursor-pointer uppercase shadow-lg"
            >
              {t('add_to_portfolio')} (${currentPrice.toFixed(2)})
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
