import { UTCTimestamp } from "lightweight-charts";

export interface CandlestickData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

/**
 * Generates an initial historical baseline dataset populated with candlesticks immediately.
 * Dynamically scales pricing structures and decimal precisions based on asset ranges.
 */
export function generateMockHistory(
  timeframeSeconds: number, 
  count = 60, 
  initialBasePrice = 1.26500
): CandlestickData[] {
  const data: CandlestickData[] = [];
  const now = Math.floor(Date.now() / 1000);
  let basePrice = initialBasePrice;

  // Dynamically configure volatility step ranges and decimal points based on asset valuation
  let volatilityMultiplier = 0.0006;
  let wickMultiplier = 0.0003;
  let precision = 5;

  if (basePrice > 10000) {
    // Crypto Configuration (e.g., BTCUSD)
    volatilityMultiplier = 150.0;
    wickMultiplier = 75.0;
    precision = 2;
  } else if (basePrice > 10) {
    // Stocks Configuration (e.g., AAPL)
    volatilityMultiplier = 0.45;
    wickMultiplier = 0.25;
    precision = 2;
  } else {
    // Forex Configuration (e.g., GBPUSD, EURUSD)
    volatilityMultiplier = 0.0006;
    wickMultiplier = 0.0003;
    precision = 5;
  }

  for (let i = count; i > 0; i--) {
    const candleTime = (now - i * timeframeSeconds) - ((now - i * timeframeSeconds) % timeframeSeconds);
    
    // Create random walked candle variations scaled by the asset type profile
    const change = (Math.random() - 0.5) * volatilityMultiplier;
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * wickMultiplier;
    const low = Math.min(open, close) - Math.random() * wickMultiplier;

    data.push({
      time: candleTime as UTCTimestamp,
      open: Number(open.toFixed(precision)),
      high: Number(high.toFixed(precision)),
      low: Number(low.toFixed(precision)),
      close: Number(close.toFixed(precision)),
    });

    basePrice = close;
  }
  return data;
}