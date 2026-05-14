'use client'
import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useChartSetup } from './hooks/useChartSetup';
import { useTradingData } from './hooks/useTradingData';
import { TIMEFRAMES } from './config/assets';
import { api } from '~/trpc/react';
import { buildMarketNarrativeState } from './engine/marketNarrative.engine';

interface TradingChartProps {
  asset: string;
  setAsset: (asset: string) => void;
}

const GBPUSD_SYMBOL = 'GBPUSDT';
const GBPUSD_LABEL = 'GBPUSD';
const CSV_TIMEFRAMES = TIMEFRAMES.filter((tf) => tf.value === '1d' || tf.value === '1w' || tf.value === '1M');

interface ChartOverlayBand {
  id: string;
  label: string;
  top: number;
  height: number;
  bg: string;
  border: string;
  text: string;
}

interface ChartOverlayTag {
  id: string;
  label: string;
  top: number;
  bg: string;
  text: string;
}

export default function TradingChart({ setAsset }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { chartRef, seriesRef } = useChartSetup(chartContainerRef as any);
  const overlayLinesRef = useRef<any[]>([]);
  const [overlayBands, setOverlayBands] = useState<ChartOverlayBand[]>([]);
  const [overlayTags, setOverlayTags] = useState<ChartOverlayTag[]>([]);

  const [asset] = useState(GBPUSD_SYMBOL);
  const [timeframe, setTimeframe] = useState('1d');
  const [astroClock, setAstroClock] = useState(() => new Date());
  const { loading, error, candleData } = useTradingData(asset, timeframe);

  useEffect(() => {
    setAsset(GBPUSD_SYMBOL);
  }, [setAsset]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAstroClock(new Date());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const astroQuery = api.mundane.calculateChart.useQuery(
    {
      dateTime: astroClock,
      latitude:26.8467,
      longitude: 80.9462,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    {
      enabled: candleData.length > 0,
      staleTime: 45_000,
      refetchOnWindowFocus: false,
    }
  );
  console.log('astroQuery=====', astroQuery.data)
  const marketNarrativeState = useMemo(() => {
    return buildMarketNarrativeState({
      asset,
      timeframe,
      candles: candleData,
      astroChart: astroQuery.data ?? null,
    });
  }, [asset, timeframe, candleData, astroQuery.data]);
  console.log(marketNarrativeState)
  useEffect(() => {
    if (!seriesRef.current) return;

    // Clear previous overlays before drawing the current narrative layer.
    overlayLinesRef.current.forEach((line) => {
      try {
        seriesRef.current.removePriceLine(line);
      } catch {
        // Ignore stale line handles from a chart reset.
      }
    });
    overlayLinesRef.current = [];

    if (!marketNarrativeState) return;

    const addLine = (price: number, title: string, color: string, lineStyle = 2, lineWidth = 1) => {
      const line = seriesRef.current.createPriceLine({
        price,
        color,
        lineWidth,
        lineStyle,
        axisLabelVisible: true,
        title,
      });
      overlayLinesRef.current.push(line);
    };

    addLine(marketNarrativeState.valueZones.anchorHigh, 'ANCHOR HIGH', '#64748b', 2, 1);
    addLine(marketNarrativeState.valueZones.anchorLow, 'ANCHOR LOW', '#64748b', 2, 1);

    marketNarrativeState.liquidityMap.slice(0, 2).forEach((pool) => {
      addLine(
        pool.price,
        pool.side === 'BUY_SIDE' ? 'BUY LIQ' : 'SELL LIQ',
        pool.side === 'BUY_SIDE' ? '#16a34a' : '#dc2626',
        1,
        2,
      );
    });

    marketNarrativeState.valueZones.fibZones.forEach((zone) => {
      const color = zone.isActive ? '#4338ca' : '#94a3b8';
      addLine(zone.high, `${zone.name} HIGH`, color, zone.isActive ? 0 : 2, zone.isActive ? 2 : 1);
      addLine(zone.low, `${zone.name} LOW`, color, zone.isActive ? 0 : 2, zone.isActive ? 2 : 1);
      addLine((zone.high + zone.low) / 2, `${zone.name} MID`, '#64748b', 2, 1);
    });

    if (candleData.length > 1) {
      const recent = candleData.slice(-14);
      const avgRange = recent.reduce((acc, c) => acc + (c.high - c.low), 0) / recent.length;
      const lastClose = candleData[candleData.length - 1]!.close;
      const move = marketNarrativeState.probableNextMove.direction;
      const target = move === 'UP'
        ? lastClose + avgRange
        : move === 'DOWN'
          ? lastClose - avgRange
          : lastClose;

      addLine(target, `PROBABLE ${move}`, '#f59e0b', 1, 2);
    }

    return () => {
      overlayLinesRef.current.forEach((line) => {
        try {
          seriesRef.current?.removePriceLine(line);
        } catch {
          // Ignore stale line handles from a chart reset.
        }
      });
      overlayLinesRef.current = [];
    };
  }, [marketNarrativeState, candleData, seriesRef]);

  useEffect(() => {
    const recalculateOverlayGeometry = () => {
      const series = seriesRef.current;
      const container = chartContainerRef.current;

      if (!series || !container || !marketNarrativeState) {
        setOverlayBands([]);
        setOverlayTags([]);
        return;
      }

      const toY = (price: number): number | null => {
        const coord = series.priceToCoordinate?.(price);
        if (coord === null || coord === undefined || Number.isNaN(coord)) return null;
        return coord;
      };

      const makeBand = (
        low: number,
        high: number,
        id: string,
        label: string,
        bg: string,
        border: string,
        text: string,
      ): ChartOverlayBand | null => {
        const yHigh = toY(high);
        const yLow = toY(low);
        if (yHigh === null || yLow === null) return null;

        const top = Math.max(0, Math.min(yHigh, yLow));
        const bottom = Math.min(container.clientHeight, Math.max(yHigh, yLow));
        const height = Math.max(2, bottom - top);

        return { id, label, top, height, bg, border, text };
      };

      const bands: ChartOverlayBand[] = [];
      const tags: ChartOverlayTag[] = [];

      const anchorMid = (marketNarrativeState.valueZones.anchorHigh + marketNarrativeState.valueZones.anchorLow) / 2;
      const premiumBand = makeBand(
        anchorMid,
        marketNarrativeState.valueZones.anchorHigh,
        'premium-zone',
        'PREMIUM ZONE',
        'rgba(251, 113, 133, 0.10)',
        'rgba(244, 63, 94, 0.35)',
        '#be123c',
      );
      const discountBand = makeBand(
        marketNarrativeState.valueZones.anchorLow,
        anchorMid,
        'discount-zone',
        'DISCOUNT ZONE',
        'rgba(34, 197, 94, 0.10)',
        'rgba(22, 163, 74, 0.35)',
        '#15803d',
      );

      if (premiumBand) bands.push(premiumBand);
      if (discountBand) bands.push(discountBand);

      marketNarrativeState.valueZones.fibZones.forEach((zone) => {
        const fibBand = makeBand(
          zone.low,
          zone.high,
          zone.name,
          zone.isActive ? `${zone.name} ACTIVE` : zone.name,
          zone.isActive ? 'rgba(79, 70, 229, 0.16)' : 'rgba(100, 116, 139, 0.08)',
          zone.isActive ? 'rgba(67, 56, 202, 0.55)' : 'rgba(100, 116, 139, 0.28)',
          zone.isActive ? '#3730a3' : '#475569',
        );
        if (fibBand) bands.push(fibBand);
      });

      const avgRange = candleData.length > 1
        ? candleData.slice(-14).reduce((acc, c) => acc + (c.high - c.low), 0) / Math.min(14, candleData.length)
        : 0;
      const liqBuffer = Math.max(avgRange * 0.12, 0.0004);

      marketNarrativeState.liquidityMap.forEach((pool, idx) => {
        const liqBand = makeBand(
          pool.price - liqBuffer,
          pool.price + liqBuffer,
          `liq-${idx}`,
          pool.side === 'BUY_SIDE' ? 'BUY LIQUIDITY POOL' : 'SELL LIQUIDITY POOL',
          pool.side === 'BUY_SIDE' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)',
          pool.side === 'BUY_SIDE' ? 'rgba(5, 150, 105, 0.45)' : 'rgba(220, 38, 38, 0.45)',
          pool.side === 'BUY_SIDE' ? '#047857' : '#b91c1c',
        );
        if (liqBand) bands.push(liqBand);

        const y = toY(pool.price);
        if (y !== null) {
          tags.push({
            id: `tag-liq-${idx}`,
            label: `${pool.side === 'BUY_SIDE' ? 'BUY LIQ' : 'SELL LIQ'} ${pool.price.toFixed(4)}`,
            top: y,
            bg: pool.side === 'BUY_SIDE' ? '#10b981' : '#ef4444',
            text: '#ffffff',
          });
        }
      });

      const lastClose = candleData[candleData.length - 1]?.close;
      if (lastClose && avgRange > 0) {
        const target = marketNarrativeState.probableNextMove.direction === 'UP'
          ? lastClose + avgRange
          : marketNarrativeState.probableNextMove.direction === 'DOWN'
            ? lastClose - avgRange
            : lastClose;

        const y = toY(target);
        if (y !== null) {
          tags.push({
            id: 'tag-probable',
            label: `PROBABLE ${marketNarrativeState.probableNextMove.direction} ${target.toFixed(4)}`,
            top: y,
            bg: '#f59e0b',
            text: '#111827',
          });
        }
      }

      setOverlayBands(bands);
      setOverlayTags(tags);
    };

    recalculateOverlayGeometry();
    const interval = setInterval(recalculateOverlayGeometry, 400);
    window.addEventListener('resize', recalculateOverlayGeometry);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', recalculateOverlayGeometry);
    };
  }, [marketNarrativeState, candleData, seriesRef]);

  if (seriesRef.current && candleData.length > 0) {
    seriesRef.current.setData(candleData);
    chartRef.current?.timeScale().fitContent();
  }

  const currentAssetData = { symbol: GBPUSD_LABEL, icon: '£', name: 'British Pound / US Dollar' };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">

      {/* --- BENTO HEADER --- */}
      <div className="p-6 border-b border-slate-50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Asset & Timeframe Cluster */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 cursor-default">
                <span className="text-lg leading-none">{currentAssetData?.icon}</span>
                <span>{currentAssetData?.name}</span>
                <span className="text-[9px] font-black tracking-[0.15em] text-white/60">ONLY</span>
              </button>
            </div>

            <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
              {CSV_TIMEFRAMES.map(tf => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-tighter rounded-xl transition-all ${timeframe === tf.value
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full animate-pulse">
                <Loader2 size={12} className="animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-widest">Syncing</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">Live Registry</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className="text-base">⚠️</span> Registry Connection Error: {error}
          </div>
        )}
      </div>

      {/* --- CHART STAGE --- */}
      <div className="flex-1 relative bg-slate-50/30">
        {marketNarrativeState && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {overlayBands.map((band) => (
              <div
                key={band.id}
                className="absolute left-0 right-0 border-y"
                style={{
                  top: `${band.top}px`,
                  height: `${band.height}px`,
                  background: band.bg,
                  borderColor: band.border,
                }}
              >
                <div
                  className="absolute left-3 top-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest"
                  style={{ background: 'rgba(255,255,255,0.75)', color: band.text }}
                >
                  {band.label}
                </div>
              </div>
            ))}

            {overlayTags.map((tag) => (
              <div
                key={tag.id}
                className="absolute right-2 -translate-y-1/2 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow"
                style={{ top: `${tag.top}px`, background: tag.bg, color: tag.text }}
              >
                {tag.label}
              </div>
            ))}
          </div>
        )}

        {marketNarrativeState && (
          <div className="absolute left-4 top-4 z-20 rounded-2xl border border-white/70 bg-white/80 backdrop-blur px-3 py-2 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Chart Narrative Overlay</div>
            <div className="text-[11px] font-bold text-slate-700 mt-1">
              {marketNarrativeState.marketPhase} · {marketNarrativeState.participantsControl.replaceAll('_', ' ')}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {marketNarrativeState.probableNextMove.direction} {Math.round(marketNarrativeState.probableNextMove.confidence * 100)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              FIB: {marketNarrativeState.valueZones.fibZones.length} zones · LIQ: {marketNarrativeState.liquidityMap.length} pools
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Astro: {marketNarrativeState.astroWindows.slice(0, 2).map((w) => `${w.planet} ${w.etaHours}h`).join(' | ') || 'No near trigger'}
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="absolute inset-0" />
      </div>
    </div>
  );
}