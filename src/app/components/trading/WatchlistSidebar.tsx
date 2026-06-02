import { Plus } from "lucide-react";

const AVAILABLE_ASSETS = [
  { symbol: "GBPUSD", label: "GBP / USD", category: "Forex", exchange: "ICE" },
  { symbol: "EURUSD", label: "EUR / USD", category: "Forex", exchange: "ICE" },
  { symbol: "BTCUSD", label: "BTC / USD", category: "Crypto", exchange: "COINBASE" },
  { symbol: "AUDUSD", label: "AUD / USD", category: "Forex", exchange: "ICE" },
];


export default function WatchlistSidebar({
  activeSymbol,
  onAssetSelect,
  livePrice,
  currentHistoryClose,
}: {
  activeSymbol: string;
  onAssetSelect: (asset: typeof AVAILABLE_ASSETS[number]) => void;
  livePrice?: number;
  currentHistoryClose: number;
}) {




  return (
    <div className="w-52 border-l border-zinc-800 bg-[#1c1c1e] hidden md:flex flex-col h-full z-20">
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider uppercase text-zinc-400">Watchlist</span>
        <Plus className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-200 cursor-pointer" />
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/60">
        {AVAILABLE_ASSETS.map((asset) => {
          const isActive = asset.symbol === activeSymbol;
          const isForex = asset.category === "Forex";
          return (
            <div
              key={asset.symbol}
              onClick={() => onAssetSelect(asset)}
              className={`p-3 flex flex-col justify-between cursor-pointer transition text-left ${isActive ? "bg-zinc-800/40 border-l-2 border-sky-500" : "hover:bg-zinc-800/20"
                }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`text-xs font-bold ${isActive ? "text-zinc-100" : "text-zinc-300"}`}>
                  {asset.symbol}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{asset.exchange}</span>
              </div>
              <div className="flex justify-between items-center w-full mt-1">
                <span className="text-[10px] text-zinc-500 truncate max-w-[100px]">{asset.label}</span>
                <span className={`text-xs font-mono font-medium ${isActive ? "text-emerald-400" : "text-zinc-400"}`}>
                  {isActive
                    ? (livePrice ?? currentHistoryClose).toFixed(isForex ? 5 : 2)
                    : "---"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
