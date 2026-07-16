import { TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react";
import { marketApi, useLiveQuote, type Quote } from "@/lib/marketApi";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

const fmt = (n: number | null | undefined, d = 2) =>
  n == null || Number.isNaN(n)
    ? "—"
    : n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

interface IndexCardProps {
  name: string;
  symbol: string;
  fetcher: () => Promise<Quote>;
  seed: number;
}

export function IndexOverviewCard({ name, symbol, fetcher, seed }: IndexCardProps) {
  // EOD/delayed index data polled every 5 minutes (300000 ms)
  const { data, loading, error } = useLiveQuote(fetcher, 300000);

  const up = (data?.percentChange ?? 0) >= 0;
  const ltp = data?.ltp ?? 0;
  const prevClose = data?.close ?? 0;
  const percentChange = data?.percentChange ?? 0;

  // Chart history data
  const chartData = data?.history || [];
  const minVal = chartData.length > 0 ? Math.min(...chartData.map((d: { date: string; close: number }) => d.close)) * 0.998 : 0;
  const maxVal = chartData.length > 0 ? Math.max(...chartData.map((d: { date: string; close: number }) => d.close)) * 1.002 : 100;
  const strokeColor = up ? "#10b981" : "#ef4444";

  return (
    <div className="rounded-xl border border-white/10 bg-card/60 p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-white/45 font-bold">{name}</p>
          <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-mono border border-amber-400/20">
            Delayed
          </span>
        </div>

        {error && !data ? (
          <div className="h-16 flex items-center justify-center text-xs text-red-400 gap-1.5 font-bold mt-2">
            <AlertCircle className="h-4 w-4" /> Failed to load data
          </div>
        ) : loading && !data ? (
          <div className="h-16 flex items-center justify-center">
            <Loader2 className="h-4 w-4 text-white/40 animate-spin" />
          </div>
        ) : (
          <div className="mt-2 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">{fmt(ltp)}</span>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${up ? "text-emerald-400" : "text-red-400"}`}>
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {percentChange != null ? `${up ? "+" : ""}${fmt(percentChange)}%` : "—"}
              </span>
            </div>
            
            <div className="flex justify-between text-[10px] text-white/50 pt-1 border-t border-white/5">
              <span>Prev Close: <span className="text-white/80 font-mono">{fmt(prevClose)}</span></span>
              <span>Change: <span className={`font-mono ${up ? "text-emerald-400" : "text-red-400"}`}>{data?.netChange != null ? `${up ? "+" : ""}${fmt(data.netChange)}` : "—"}</span></span>
            </div>
          </div>
        )}
      </div>

      {/* 30-Day Line Chart */}
      <div className="h-20 w-full mt-4">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <YAxis domain={[minVal, maxVal]} hide={true} />
              <Line
                type="monotone"
                dataKey="close"
                stroke={strokeColor}
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-white/20 text-[10px]">
            No chart data
          </div>
        )}
      </div>
      
      <p className="mt-2 text-[9px] text-white/30 leading-none text-center">
        Market data delayed by approximately 15 minutes.
      </p>
    </div>
  );
}

export const NiftyLiveCard = () => (
  <IndexOverviewCard name="NIFTY 50" symbol="NIFTY" fetcher={marketApi.nifty} seed={1} />
);

export const BankNiftyLiveCard = () => (
  <IndexOverviewCard name="BANK NIFTY" symbol="BANKNIFTY" fetcher={marketApi.banknifty} seed={2} />
);

export const SensexLiveCard = () => (
  <IndexOverviewCard name="SENSEX" symbol="SENSEX" fetcher={marketApi.sensex} seed={3} />
);

export const FinniftyLiveCard = () => (
  <IndexOverviewCard name="FINNIFTY" symbol="FINNIFTY" fetcher={marketApi.finnifty} seed={4} />
);
