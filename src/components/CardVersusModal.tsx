'use client';

import React, { useState, useMemo } from 'react';
import { UniversalCard } from '@/services/multiCardService';

export interface CardVersusModalProps {
  cards: UniversalCard[];
  isOpen: boolean;
  onClose: () => void;
  onAddCardToPortfolio?: (card: UniversalCard) => void;
}

type TimeRange = '1M' | '3M' | '6M' | '1Y';
type ChartMode = 'price' | 'roi';

const CARD_COLORS = [
  { stroke: '#e7000b', bg: 'rgba(231,0,11,0.1)', text: 'text-ferrari-red', name: '緋紅紅' },
  { stroke: '#2563eb', bg: 'rgba(37,99,235,0.1)', text: 'text-blue-500', name: '皇家藍' },
  { stroke: '#059669', bg: 'rgba(5,150,105,0.1)', text: 'text-emerald-500', name: '翡翠綠' },
  { stroke: '#d97706', bg: 'rgba(217,119,6,0.1)', text: 'text-amber-500', name: '金黃色' },
];

export const CardVersusModal: React.FC<CardVersusModalProps> = ({
  cards,
  isOpen,
  onClose,
  onAddCardToPortfolio,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('3M');
  const [chartMode, setChartMode] = useState<ChartMode>('roi');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const daysCount = useMemo(() => {
    switch (timeRange) {
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y':
      default: return 365;
    }
  }, [timeRange]);

  // Generate deterministic pseudo-historical daily prices for each card
  const historicalData = useMemo(() => {
    const today = new Date('2026-09-25');

    return cards.map((card, cardIndex) => {
      let seed = 0;
      for (let i = 0; i < card.id.length; i++) {
        seed += card.id.charCodeAt(i) * (cardIndex + 1);
      }

      // Generate 365 days points backwards
      const points: { date: string; fullDate: string; price: number; roi: number }[] = [];
      const basePrice = card.price;
      const volatility = 0.08 + (seed % 10) * 0.01;
      const trendSlope = ((seed % 7) - 3) * 0.0008;

      let currentSimPrice = basePrice * (0.8 + ((seed % 40) / 100));

      for (let i = 365; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const daySeed = (seed + i * 17) % 100;
        const deltaPercent = (daySeed / 50 - 1) * volatility + trendSlope;
        currentSimPrice = Math.max(5, currentSimPrice * (1 + deltaPercent));

        if (i === 0) {
          currentSimPrice = basePrice; // Ensure latest point matches current price
        }

        points.push({
          date: `${d.getMonth() + 1}/${d.getDate()}`,
          fullDate: d.toISOString().split('T')[0],
          price: currentSimPrice,
          roi: 0,
        });
      }

      // Slice to selected days
      const slicedPoints = points.slice(points.length - daysCount);
      const startPrice = slicedPoints[0].price;

      // Calculate ROI relative to start of period
      const withRoi = slicedPoints.map((pt) => ({
        ...pt,
        roi: startPrice > 0 ? ((pt.price - startPrice) / startPrice) * 100 : 0,
      }));

      return {
        card,
        color: CARD_COLORS[cardIndex % CARD_COLORS.length],
        points: withRoi,
        startPrice,
        endPrice: card.price,
        periodRoi: startPrice > 0 ? ((card.price - startPrice) / startPrice) * 100 : 0,
        highestPrice: Math.max(...withRoi.map((p) => p.price)),
        lowestPrice: Math.min(...withRoi.map((p) => p.price)),
      };
    });
  }, [cards, daysCount]);

  if (!isOpen || cards.length < 2) return null;

  // Chart coordinates calculation
  const chartWidth = 900;
  const chartHeight = 300;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;
  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Global Min & Max values
  let globalMin = 0;
  let globalMax = 100;

  if (chartMode === 'roi') {
    const allRois = historicalData.flatMap((d) => d.points.map((p) => p.roi));
    globalMin = Math.floor(Math.min(...allRois, -5) / 5) * 5;
    globalMax = Math.ceil(Math.max(...allRois, 10) / 5) * 5;
  } else {
    const allPrices = historicalData.flatMap((d) => d.points.map((p) => p.price));
    globalMin = Math.max(0, Math.floor(Math.min(...allPrices) * 0.9));
    globalMax = Math.ceil(Math.max(...allPrices) * 1.1);
  }

  const valueRange = globalMax - globalMin || 1;

  // Generate SVG path for a dataset
  const generatePath = (points: { price: number; roi: number }[]) => {
    return points
      .map((p, idx) => {
        const val = chartMode === 'roi' ? p.roi : p.price;
        const x = paddingLeft + (idx / (points.length - 1)) * innerWidth;
        const y = paddingTop + innerHeight - ((val - globalMin) / valueRange) * innerHeight;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="versus-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-surface border border-hairline/80 rounded-3xl shadow-2xl p-5 sm:p-7 text-foreground max-h-[92vh] flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-hairline/70 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-6 bg-blue-600 rounded-full" />
            <div>
              <h2 id="versus-title" className="font-sans font-black text-lg sm:text-xl text-foreground tracking-tight">
                卡牌對比與行情疊加分析矩陣 (Card Versus)
              </h2>
              <p className="text-[11px] text-text-muted font-mono">
                同時對比 {cards.length} 張卡牌的歷史走勢、抗跌能力與投資報酬率
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-hover flex items-center justify-center text-text-muted hover:text-foreground text-sm font-bold transition-colors cursor-pointer"
            aria-label="關閉對比"
          >
            ✕
          </button>
        </div>

        {/* Selected Cards Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
          {historicalData.map((item) => (
            <div
              key={item.card.id}
              className="bg-surface-hover/50 p-3 rounded-2xl border border-hairline/60 flex items-center gap-3 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 bottom-0 w-1.5"
                style={{ backgroundColor: item.color.stroke }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.card.imageUrl}
                alt={item.card.name}
                className="w-10 h-14 object-contain rounded bg-background shrink-0 border border-hairline"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-sans font-bold text-xs text-foreground truncate">
                  {item.card.name}
                </span>
                <span className="text-[10px] text-text-muted font-mono truncate">
                  {item.card.set}
                </span>
                <div className="flex items-baseline gap-1.5 mt-1 font-mono">
                  <span className="font-bold text-xs text-foreground">
                    ${item.endPrice.toLocaleString('en-US')}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      item.periodRoi >= 0 ? 'text-emerald-500' : 'text-ferrari-red'
                    }`}
                  >
                    {item.periodRoi >= 0 ? `+${item.periodRoi.toFixed(1)}%` : `${item.periodRoi.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Toolbar: Mode & Time Range */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-t border-hairline/60">
          {/* Left: Chart Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-surface-hover/70 rounded-xl border border-hairline/60">
            <button
              onClick={() => setChartMode('roi')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                chartMode === 'roi'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              % 報酬率疊加模式 (基準對齊)
            </button>
            <button
              onClick={() => setChartMode('price')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                chartMode === 'price'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              $ 絕對金額走勢模式
            </button>
          </div>

          {/* Right: Time Range Pills */}
          <div className="flex items-center gap-1 p-1 bg-surface-hover/70 rounded-xl border border-hairline/60">
            {(['1M', '3M', '6M', '1Y'] as TimeRange[]).map((tr) => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  timeRange === tr
                    ? 'bg-surface text-foreground shadow-2xs'
                    : 'text-text-muted hover:text-foreground'
                }`}
              >
                {tr}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Multi-Line Chart Canvas */}
        <div className="relative w-full bg-surface-hover/30 rounded-2xl border border-hairline/60 p-2 sm:p-4 my-2 select-none overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto overflow-visible"
          >
            {/* Grid Horizontal Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingTop + innerHeight * (1 - ratio);
              const val = globalMin + ratio * valueRange;
              return (
                <g key={`grid-${ratio}`}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    className="text-hairline/40"
                    strokeDasharray={ratio === 0 || ratio === 1 ? 'none' : '3 3'}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-current text-text-muted"
                  >
                    {chartMode === 'roi' ? `${val.toFixed(0)}%` : `$${val.toFixed(0)}`}
                  </text>
                </g>
              );
            })}

            {/* Zero Line if in ROI mode and 0 is in range */}
            {chartMode === 'roi' && globalMin < 0 && globalMax > 0 && (
              <line
                x1={paddingLeft}
                y1={paddingTop + innerHeight - ((0 - globalMin) / valueRange) * innerHeight}
                x2={chartWidth - paddingRight}
                y2={paddingTop + innerHeight - ((0 - globalMin) / valueRange) * innerHeight}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            )}

            {/* Curves for each card */}
            {historicalData.map((d) => (
              <path
                key={d.card.id}
                d={generatePath(d.points)}
                fill="none"
                stroke={d.color.stroke}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            ))}

            {/* Interactive Vertical Scan Crosshair */}
            {hoveredPointIndex !== null && (
              <g>
                <line
                  x1={paddingLeft + (hoveredPointIndex / (daysCount - 1)) * innerWidth}
                  y1={paddingTop}
                  x2={paddingLeft + (hoveredPointIndex / (daysCount - 1)) * innerWidth}
                  y2={paddingTop + innerHeight}
                  stroke="#94a3b8"
                  strokeDasharray="2 2"
                  strokeWidth="1.5"
                />
                {historicalData.map((d) => {
                  const pt = d.points[hoveredPointIndex];
                  if (!pt) return null;
                  const val = chartMode === 'roi' ? pt.roi : pt.price;
                  const cy = paddingTop + innerHeight - ((val - globalMin) / valueRange) * innerHeight;
                  return (
                    <circle
                      key={`pt-${d.card.id}`}
                      cx={paddingLeft + (hoveredPointIndex / (daysCount - 1)) * innerWidth}
                      cy={cy}
                      r="4.5"
                      fill="#ffffff"
                      stroke={d.color.stroke}
                      strokeWidth="2"
                    />
                  );
                })}
              </g>
            )}

            {/* Hover hit areas */}
            {Array.from({ length: daysCount }).map((_, idx) => {
              const x = paddingLeft + (idx / (daysCount - 1)) * innerWidth;
              const step = innerWidth / daysCount;
              return (
                <rect
                  key={`hit-${idx}`}
                  x={x - step / 2}
                  y={paddingTop}
                  width={step}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                />
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredPointIndex !== null && (
            <div className="absolute top-4 right-4 bg-surface/95 border border-hairline/80 rounded-xl p-3 shadow-xl backdrop-blur-md flex flex-col gap-1.5 z-10 font-mono text-xs pointer-events-none">
              <span className="text-[10px] text-text-muted pb-1 border-b border-hairline/50">
                {historicalData[0]?.points[hoveredPointIndex]?.fullDate}
              </span>
              {historicalData.map((d) => {
                const pt = d.points[hoveredPointIndex];
                if (!pt) return null;
                return (
                  <div key={d.card.id} className="flex items-center justify-between gap-4">
                    <span className="font-sans font-bold truncate max-w-[130px]" style={{ color: d.color.stroke }}>
                      {d.card.name}
                    </span>
                    <span className="font-bold text-foreground">
                      ${pt.price.toFixed(1)}{' '}
                      <span className={`text-[10px] ${pt.roi >= 0 ? 'text-emerald-500' : 'text-ferrari-red'}`}>
                        ({pt.roi >= 0 ? `+${pt.roi.toFixed(1)}%` : `${pt.roi.toFixed(1)}%`})
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Matrix Comparison Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-hairline/60 text-text-muted text-[10px] uppercase">
                <th className="py-2.5 px-3">對比卡牌</th>
                <th className="py-2.5 px-3">所屬系列</th>
                <th className="py-2.5 px-3">當前市價</th>
                <th className="py-2.5 px-3">{timeRange} 區間漲跌</th>
                <th className="py-2.5 px-3">歷史最高點</th>
                <th className="py-2.5 px-3">PSA 10 溢價倍數</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline/40">
              {historicalData.map((d) => (
                <tr key={d.card.id} className="hover:bg-surface-hover/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 font-sans font-bold text-foreground">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color.stroke }} />
                      <span className="truncate max-w-[160px]">{d.card.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-text-muted">{d.card.set}</td>
                  <td className="py-3 px-3 font-bold text-foreground">${d.endPrice.toLocaleString('en-US')}</td>
                  <td className="py-3 px-3 font-bold">
                    <span className={d.periodRoi >= 0 ? 'text-emerald-500' : 'text-ferrari-red'}>
                      {d.periodRoi >= 0 ? `+${d.periodRoi.toFixed(1)}%` : `${d.periodRoi.toFixed(1)}%`}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-text-muted">${d.highestPrice.toFixed(1)}</td>
                  <td className="py-3 px-3 text-text-muted font-bold text-amber-500">2.8x</td>
                  <td className="py-3 px-3 text-right">
                    {onAddCardToPortfolio && (
                      <button
                        onClick={() => onAddCardToPortfolio(d.card)}
                        className="px-2.5 py-1 rounded-lg bg-surface-hover hover:bg-ferrari-red hover:text-white transition-colors cursor-pointer text-[10px] font-semibold"
                      >
                        + 入庫
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
