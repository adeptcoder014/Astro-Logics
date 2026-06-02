"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { UTCTimestamp } from "lightweight-charts";
import {
  ChevronDown,
  Search,
  Plus,
  Check
} from "lucide-react";
import TradingChart from "./TradingChart";
import TopToolbar from "./TopToolbar";

// --- TYPE DEFINITIONS ---
export interface CandlestickData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

// --- SUB-COMPONENT: TOP TOOLBAR ---
export default function TopToolbar({
  selectedAsset,
  onAssetSelect,
  currentTimeframe,
  onTimeframeChange,
  currentPrice,
  isLoading
}: {
  selectedAsset: typeof AVAILABLE_ASSETS[number];
  onAssetSelect: (asset: typeof AVAILABLE_ASSETS[number]) => void;
  currentTimeframe: typeof TIMEFRAMES[number];
  onTimeframeChange: (tf: typeof TIMEFRAMES[number]) => void;
  currentPrice: number;
  isLoading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isForex = selectedAsset.category === "Forex";

  return (
    <div className="h-12 border-b border-zinc-800 bg-[#1c1c1e] flex items-center justify-between px-3 z-30">
      <div className="flex items-center gap-1 h-full">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 hover:bg-zinc-800 px-3 py-1.5 rounded text-sm font-semibold tracking-wide text-zinc-100 transition"
          >
            <span className="text-emerald-400">{selectedAsset.symbol}</span>
            <span className="text-xs text-zinc-500 font-normal">{selectedAsset.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div className="absolute top-9 left-0 w-64 bg-[#1e1e21] border border-zinc-800 rounded-lg shadow-2xl py-1 z-50">
                <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-zinc-500" />
                  <input type="text" placeholder="Search symbol..." className="bg-transparent text-xs outline-none w-full text-zinc-200" disabled />
                </div>
                {AVAILABLE_ASSETS.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => {
                      onAssetSelect(asset);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-zinc-800 text-left transition"
                  >
                    <div>
                      <div className="font-semibold text-zinc-200">{asset.symbol}</div>
                      <div className="text-[10px] text-zinc-500">{asset.label}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded uppercase">{asset.category}</span>
                      {selectedAsset.symbol === asset.symbol && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="w-[1px] h-5 bg-zinc-800 mx-2" />

        <div className="flex items-center gap-0.5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.label}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition ${currentTimeframe.value === tf.value
                ? "bg-sky-500/10 text-sky-400 font-bold"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="text-right">
          <span className="text-zinc-500 text-[10px] uppercase block leading-none mb-0.5">MT5 Live Bid</span>
          <span className={`font-bold transition-all duration-200 ${isLoading ? 'text-zinc-500' : 'text-emerald-400'}`}>
            {isLoading && currentPrice === 0 ? "LOADING..." : currentPrice.toFixed(isForex ? 5 : 2)}
          </span>
        </div>
      </div>
    </div>
  );
}
