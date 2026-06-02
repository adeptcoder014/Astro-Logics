"use client";

import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { UTCTimestamp } from "lightweight-charts";
import TradingChart from "./TradingChart";
import WatchlistSidebar from "./WatchlistSidebar";

// --- TYPE DEFINITIONS ---
export interface CandlestickData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

const TIMEFRAMES = [
  { label: "5s", value: 5, tfParam: "S5" },
  { label: "15s", value: 15, tfParam: "S15" },
  { label: "1m", value: 60, tfParam: "M1" },
  { label: "5m", value: 300, tfParam: "M5" },
];

const AVAILABLE_ASSETS = [
  { symbol: "GBPUSD", label: "GBP / USD", category: "Forex", exchange: "ICE" },
  { symbol: "EURUSD", label: "EUR / USD", category: "Forex", exchange: "ICE" },
  { symbol: "BTCUSD", label: "BTC / USD", category: "Crypto", exchange: "COINBASE" },
];

export default function TradingViewTerminal() {
  const [selectedAsset, setSelectedAsset] = useState(AVAILABLE_ASSETS[0]!);
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[2]!);
  const [activeTool] = useState<string>("fib");
  const [history, setHistory] = useState<CandlestickData[]>([]);

  // 1. DATA QUERIES
  const historyQuery = api.trading.getHistory.useQuery(
    { symbol: selectedAsset.symbol, timeframe: timeframe.tfParam, count: 150 },
    { refetchOnWindowFocus: false }
  );

  const liveTickQuery = api.trading.getPrice.useQuery(
    { symbol: selectedAsset.symbol },
    { refetchInterval: 1000, enabled: !historyQuery.isFetching }
  );

  // 2. STATE SYNC
  useEffect(() => {
    if (historyQuery.data?.data) {
      setHistory(historyQuery.data.data as CandlestickData[]);
    }
  }, [historyQuery.data]);

  return (
    // FULL HEIGHT CONTAINER: Matches the layout shell
    <div className="flex w-full h-[calc(100vh-140px)] rounded-2xl border border-white/[0.05] bg-[#060607] overflow-hidden shadow-2xl">
      
      {/* CHART AREA - Expands to fill available space */}
      <div className="flex-1 relative border-r border-white/[0.03]">
        {historyQuery.isFetching ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] font-mono text-white/30 bg-[#060607] z-50">
            <div className="h-6 w-6 border-2 border-[var(--color-accent-orange)] border-t-transparent rounded-full animate-spin mb-3" />
            SYNCHRONIZING ENGINE...
          </div>
        ) : (
          <TradingChart
            history={history}
            setHistory={setHistory}
            timeframeSeconds={timeframe.value}
            livePrice={liveTickQuery.data?.data?.bid}
            activeTool={activeTool}
            symbol={selectedAsset.symbol}
          />
        )}
      </div>

      {/* WATCHLIST SIDEBAR - Fixed Width */}
      <div className="w-64 shrink-0 bg-[#0c0c0d]/50 border-l border-white/[0.03]">
        <WatchlistSidebar
          activeSymbol={selectedAsset.symbol}
          onAssetSelect={setSelectedAsset}
          livePrice={liveTickQuery.data?.data?.bid}
          currentHistoryClose={history[history.length - 1]?.close || 0}
        />
      </div>
    </div>
  );
}