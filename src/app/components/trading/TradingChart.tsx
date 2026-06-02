"use client";

import { createSeriesMarkers } from "lightweight-charts";
import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  ISeriesApi,
  IChartApi,
  UTCTimestamp,
  SeriesMarker,
  IPriceLine,
} from "lightweight-charts";

export interface CandlestickData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

type HorizonMode = "short" | "intermediate" | "long";

interface FibAnchor {
  time: UTCTimestamp;
  price: number;
}

export default function TradingChart({
  history,
  setHistory,
  timeframeSeconds,
  livePrice,
  activeTool,
  symbol,
}: {
  history: CandlestickData[];
  setHistory: React.Dispatch<React.SetStateAction<CandlestickData[]>>;
  timeframeSeconds: number;
  livePrice?: number;
  activeTool: string;
  symbol: string;
}) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [horizon, setHorizon] = useState<HorizonMode>("intermediate");
  const [fibPoints, setFibPoints] = useState<FibAnchor[]>([]);
  const fibLinesRef = useRef<IPriceLine[]>([]);

  const stateRef = useRef({ fibPoints, activeTool, history });
  useEffect(() => {
    stateRef.current = { fibPoints, activeTool, history };
  }, [fibPoints, activeTool, history]);

  const runPriceActionEngine = (
    series: ISeriesApi<"Candlestick">,
    data: CandlestickData[],
    mode: HorizonMode
  ) => {
    const windowMap: Record<HorizonMode, number> = { short: 2, intermediate: 5, long: 12 };
    const k = windowMap[mode];
    if (data.length < k * 2 + 1) return;

    const markers: SeriesMarker<UTCTimestamp>[] = [];
    let lastHighVal = 0;
    let lastLowVal = Infinity;

    for (let i = k; i < data.length - k; i++) {
      const current = data[i]!;
      let isPivotHigh = true;
      let isPivotLow = true;

      for (let j = 1; j <= k; j++) {
        if (data[i - j]!.high >= current.high || data[i + j]!.high > current.high) isPivotHigh = false;
        if (data[i - j]!.low <= current.low || data[i + j]!.low < current.low) isPivotLow = false;
      }

      if (isPivotHigh) {
        const label = current.high > lastHighVal ? "HH" : "LH";
        markers.push({ time: current.time, position: "aboveBar", color: label === "HH" ? "#26a69a" : "#f59e0b", shape: "arrowDown", text: label });
        lastHighVal = current.high;
      }
      if (isPivotLow) {
        const label = current.low < lastLowVal && lastLowVal !== Infinity ? "LL" : "HL";
        markers.push({ time: current.time, position: "belowBar", color: label === "LL" ? "#ef5350" : "#3b82f6", shape: "arrowUp", text: label });
        lastLowVal = current.low;
      }
    }
    createSeriesMarkers(series, markers);
  };

  const calculateAndRenderFibZones = (series: ISeriesApi<"Candlestick">, p1: FibAnchor, p2: FibAnchor) => {
    fibLinesRef.current.forEach((line) => series.removePriceLine(line));
    fibLinesRef.current = [];

    const priceDelta = p2.price - p1.price;
    const fib705 = p2.price - priceDelta * 0.705;
    const fib786 = p2.price - priceDelta * 0.786;

    const createLevel = (price: number, label: string, color: string) => 
      series.createPriceLine({ price, color, lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: label });

    fibLinesRef.current.push(createLevel(p1.price, "0.0%", "#a1a1aa"), createLevel(fib705, "70.5%", "#ff9800"), createLevel(fib786, "78.6%", "#ef5350"), createLevel(p2.price, "100%", "#a1a1aa"));
  };

  useEffect(() => {
    if (!chartContainerRef.current || history.length === 0) return;

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: { background: { type: ColorType.Solid, color: "#060607" }, textColor: "#888888", fontSize: 11, fontFamily: "monospace" },
      grid: { vertLines: { color: "#161617" }, horzLines: { color: "#161617" } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: "#222224" },
      timeScale: { borderColor: "#222224", timeVisible: true },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, { upColor: "#26a69a", downColor: "#ef5350", borderVisible: false, wickUpColor: "#26a69a", wickDownColor: "#ef5350" });
    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    candlestickSeries.setData(history);
    runPriceActionEngine(candlestickSeries, history, horizon);
    chart.timeScale().fitContent();

    chart.subscribeClick((param) => {
      const { activeTool: tool, fibPoints: currentPoints } = stateRef.current;
      if (tool !== "fib" || !param.time || !param.point) return;
      const price = candlestickSeries.coordinateToPrice(param.point.y);
      if (price === null) return;
      const newAnchor = { time: param.time as UTCTimestamp, price };
      if (currentPoints.length === 0 || currentPoints.length >= 2) {
        setFibPoints([newAnchor]);
        fibLinesRef.current.forEach((line) => candlestickSeries.removePriceLine(line));
      } else {
        const updated = [currentPoints[0]!, newAnchor];
        setFibPoints(updated);
        calculateAndRenderFibZones(candlestickSeries, updated[0]!, newAnchor);
      }
    });

    const handleResize = () => chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.remove(); };
  }, [symbol, timeframeSeconds, history.length]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-[var(--color-primary-dark)] rounded-2xl overflow-hidden border border-white/[0.05]">
      {/* CONTROL CONSOLE */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-[#0c0c0d]/80 backdrop-blur border border-white/[0.05] p-2 rounded-xl shadow-2xl">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold text-zinc-500 uppercase px-1 tracking-wider">Horizon:</span>
          {(["short", "intermediate", "long"] as HorizonMode[]).map((mode) => (
            <button key={mode} onClick={() => setHorizon(mode)} className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${horizon === mode ? "bg-sky-500/20 text-sky-400" : "text-zinc-500"}`}>
              {mode === "short" ? "ST" : mode === "intermediate" ? "IT" : "LT"}
            </button>
          ))}
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}