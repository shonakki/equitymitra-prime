import { TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react";
import { marketApi, useLiveQuote, type Quote } from "@/lib/marketApi";
import { useTickChart } from "@/lib/useTickChart";
import { LiveCandleChart } from "@/components/app/LiveCandleChart";

const fmt = (n: number | null | undefined, d = 2) =>
  n == null || Number.isNaN(n)
    ? "—"
    : n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

interface Props {
  name: string;
  symbol: string;          // "NIFTY" | "BANKNIFTY"
  fetcher: () => Promise<Quote>;
  seed?: number;
}

export function LiveIndexCard({ name, symbol, fetcher, seed = 1 }: Props) {
  // REST quote for price/change text (still useful when WS not yet connected)
  const { data, loading, error } = useLiveQuote(fetcher, 5000);
  // Real tick-by-tick candles via backend WebSocket
  const { candles, wsReady } = useTickChart(symbol);

  const up = (data?.netChange ?? 0) >= 0;

  return (
    <div className="rounded-xl border border-white/10 bg-card/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-white/45">{name}</p>
        <div className="flex items-center gap-1.5">
          {/* LIVE dot when WS is streaming */}
          {wsReady && candles.length >= 3 && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          )}
          {loading && !data ? (
            <Loader2 className="h-3.5 w-3.5 text-white/40 animate-spin" />
          ) : error ? (
            <AlertCircle className="h-4 w-4 text-red-400" />
          ) : up ? (
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-400" />
          )}
        </div>
      </div>

      {error && !data ? (
        <p className="mt-2 text-[11px] text-red-400">Market Closed – Showing Last Close</p>
      ) : (
        <>
          <p className="mt-1.5 text-xl font-bold text-white">{fmt(data?.ltp)}</p>
          <p className={`text-xs ${up ? "text-emerald-400" : "text-red-400"}`}>
            {data?.netChange != null ? `${up ? "+" : ""}${fmt(data.netChange)}` : "—"} (
            {data?.percentChange != null ? `${up ? "+" : ""}${fmt(data.percentChange)}%` : "—"})
          </p>
          <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-white/55">
            <span>H: <span className="text-white/80">{fmt(data?.high)}</span></span>
            <span>L: <span className="text-white/80">{fmt(data?.low)}</span></span>
          </div>
        </>
      )}

      {/* Real-time candlestick chart — falls back to mock when market closed */}
      <div className="mt-2">
        <LiveCandleChart
          candles={candles}
          trend={up ? "up" : "down"}
          seed={seed}
        />
      </div>
    </div>
  );
}

export const NiftyLiveCard = () => (
  <LiveIndexCard name="NIFTY 50" symbol="NIFTY" fetcher={marketApi.nifty} seed={1} />
);

export const BankNiftyLiveCard = () => (
  <LiveIndexCard name="BANK NIFTY" symbol="BANKNIFTY" fetcher={marketApi.banknifty} seed={2} />
);
