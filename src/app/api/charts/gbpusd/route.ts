import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CsvCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

function parseDateToUtcMs(mmddyyyy: string): number {
  const [month, day, year] = mmddyyyy.split("/").map((v) => Number(v));
  return Date.UTC(year, month - 1, day);
}

function getWeekKey(utcMs: number): string {
  const d = new Date(utcMs);
  const year = d.getUTCFullYear();
  const jan1 = Date.UTC(year, 0, 1);
  const dayOfYear = Math.floor((utcMs - jan1) / 86_400_000) + 1;
  const week = Math.ceil(dayOfYear / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function getMonthKey(utcMs: number): string {
  const d = new Date(utcMs);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function aggregateCandles(source: CsvCandle[], timeframe: string): CsvCandle[] {
  if (timeframe !== "1w" && timeframe !== "1M") {
    return source;
  }

  const grouped = new Map<string, CsvCandle[]>();

  for (const candle of source) {
    const key = timeframe === "1w" ? getWeekKey(candle.time) : getMonthKey(candle.time);
    const list = grouped.get(key);
    if (list) list.push(candle);
    else grouped.set(key, [candle]);
  }

  return Array.from(grouped.values())
    .map((bucket) => {
      const ordered = bucket.sort((a, b) => a.time - b.time);
      const first = ordered[0]!;
      const last = ordered[ordered.length - 1]!;

      return {
        time: first.time,
        open: first.open,
        high: Math.max(...ordered.map((c) => c.high)),
        low: Math.min(...ordered.map((c) => c.low)),
        close: last.close,
      };
    })
    .sort((a, b) => a.time - b.time);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get("timeframe") ?? "1d";
    const limit = Number(url.searchParams.get("limit") ?? "150");

    const csvPath = path.join(process.cwd(), "charts", "GBPUSD.csv");
    const raw = await fs.readFile(csvPath, "utf8");

    const rows = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => Boolean(line));

    const [, ...dataRows] = rows;

    const parsed = dataRows
      .map((line) => {
        const [date, open, high, low, close] = line.split(",");
        const candle: CsvCandle = {
          time: parseDateToUtcMs(date),
          open: Number(open.replaceAll('"', "")),
          high: Number(high.replaceAll('"', "")),
          low: Number(low.replaceAll('"', "")),
          close: Number(close.replaceAll('"', "")),
        };
        return candle;
      })
      .filter((c) => Number.isFinite(c.open) && Number.isFinite(c.high) && Number.isFinite(c.low) && Number.isFinite(c.close))
      .sort((a, b) => a.time - b.time);

    const aggregated = aggregateCandles(parsed, timeframe);
    const selected = aggregated.slice(-Math.max(1, limit));

    const klines = selected.map((c) => [c.time, c.open, c.high, c.low, c.close]);

    return NextResponse.json({
      symbol: "GBPUSD",
      timeframe,
      candles: klines,
      source: "charts/GBPUSD.csv",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load GBPUSD CSV chart data",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
