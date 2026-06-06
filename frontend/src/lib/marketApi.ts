/**
 * Frontend API client for EquityMitra backend (Angel One proxy).
 * Backend handles all credentials — frontend only consumes REST endpoints.
 */
import { useEffect, useRef, useState } from "react";

const API_BASE =
  (
    (import.meta as any).env?.VITE_API_BASE ||
    "https://equitymitra-prime-production.up.railway.app"
  ).replace(/\/$/, "");
const API_KEY = (import.meta as any).env?.VITE_API_KEY || "";

export interface Quote {
  key: string;
  symbol: string;
  exchange: string;
  token: string | null;
  ltp: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  netChange: number | null;
  percentChange: number | null;
  volume: number | null;
  raw?: unknown;
  companyName?: string | null;
  sector?: string | null;
  industry?: string | null;
  marketCap?: number | null;
  pe?: number | null;
  pb?: number | null;
  roe?: number | null;
  roce?: number | null;
  debtToEquity?: number | null;
  revenueGrowth?: number | null;
  profitGrowth?: number | null;
}

export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string>) || {}),
  };
  if (API_KEY) headers["x-em-key"] = API_KEY;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  const json = (await res.json()) as { ok: boolean; data: T; error?: string };
  if (!json.ok) throw new Error(json.error || "API error");
  return json.data;
}

export interface SectorPerformance {
  name: string;
  pct: string;
  up: boolean;
}

export interface GainerLoserRow {
  s: string;
  p: string;
  c: string;
}

export interface MarketBreadth {
  advances: number;
  declines: number;
  unchanged: number;
  ratio: string;
}

export interface MarketSentiment {
  value: string;
  score: number;
  explanation: string;
}

export interface IPOCalendarItem {
  name: string;
  openDate: string;
  closeDate: string;
  issueSize: string;
  priceBand: string;
  lotSize: string;
  status: string;
}

export interface DashboardData {
  sectors: SectorPerformance[];
  gainers: GainerLoserRow[];
  losers: GainerLoserRow[];
  breadth: MarketBreadth;
  sentiment: MarketSentiment;
  ipos: IPOCalendarItem[] | null;
  updatedAt: string;
}

export const marketApi = {
  nifty: () => apiFetch<Quote>("/api/nifty"),
  banknifty: () => apiFetch<Quote>("/api/banknifty"),
  finnifty: () => apiFetch<Quote>("/api/finnifty"),
  sensex: () => apiFetch<Quote>("/api/sensex"),
  watchlist: (symbols?: string[]) =>
    apiFetch<Quote[]>(
      `/api/watchlist${symbols?.length ? `?symbols=${symbols.join(",")}` : ""}`
    ),
  stock: (symbol: string) => apiFetch<Quote>(`/api/stock/${symbol.toUpperCase()}`),
  dashboard: () => apiFetch<DashboardData>("/api/dashboard"),
};

/**
 * Polls a market endpoint at a fixed interval. Pauses when tab is hidden.
 */
export function useLiveQuote<T>(
  fetcher: () => Promise<T>,
  intervalMs = 5000,
  deps: ReadonlyArray<unknown> = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      try {
        const d = await fetcherRef.current();
        if (cancelled) return;
        setData(d);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
        if (!cancelled && !document.hidden) {
          timer = setTimeout(tick, intervalMs);
        }
      }
    };

    tick();

    const onVis = () => {
      if (!document.hidden && !timer) tick();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);

  return { data, loading, error };
}
