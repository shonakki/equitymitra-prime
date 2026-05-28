import { TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react";
import { marketApi, useLiveQuote, type Quote } from "@/lib/marketApi";
import { MiniChart } from "@/components/site/MiniChart";

const fmt = (n: number | null | undefined, d = 2) =>
  n == null || Number.isNaN(n)
    ? "—"
    : n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

interface Props {
  name: string;
  fetcher: () => Promise<Quote>;
  seed?: number;
}

export function LiveIndexCard({ name, fetcher, seed = 1 }: Props) {
  const { data, loading, error } = useLiveQuote(fetcher, 5000);
  const up = (data?.netChange ?? 0) >= 0;

  return (
    <div className="rounded-xl border border-white/10 bg-card/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-white/45">{name}</p>
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

      {error && !data ? (
        <p className="mt-2 text-[11px] text-red-400">Market Closed - Showing Last Close</p>
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

      <div className="mt-2">
        <MiniChart trend={up ? "up" : "down"} seed={seed} />
      </div>
    </div>
  );
}

export const NiftyLiveCard = () => (
  <LiveIndexCard name="NIFTY 50" fetcher={marketApi.nifty} seed={1} />
);
export const BankNiftyLiveCard = () => (
  <LiveIndexCard name="BANK NIFTY" fetcher={marketApi.banknifty} seed={2} />
);
