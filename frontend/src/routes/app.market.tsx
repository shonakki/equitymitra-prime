import { createFileRoute } from "@tanstack/react-router";
import { Gauge, ArrowUpRight, ArrowDownRight, Calendar, Activity, RefreshCw, Clock } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { DisclaimerBanner } from "@/components/app/DisclaimerBanner";
import { NiftyLiveCard, BankNiftyLiveCard } from "@/components/app/LiveIndexCard";
import { marketApi, useLiveQuote } from "@/lib/marketApi";

export const Route = createFileRoute("/app/market")({
  component: MarketPage,
});

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/5 ${className}`} />;
}

function formatTime(isoString: string) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch (e) {
    return "";
  }
}

function MarketPage() {
  const { data, loading, error } = useLiveQuote(marketApi.dashboard, 15000);
  const updatedAtStr = data?.updatedAt ? formatTime(data.updatedAt) : "";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <DisclaimerBanner variant="compact" storageKey="em.disclaimer.market" />

      {/* 15-minute data delay notice */}
      <div className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/8 px-4 py-2.5">
        <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <p className="text-xs text-amber-300/80">
          Market data delayed by approximately 15 minutes.
        </p>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          eyebrow="Market"
          title="India Market Overview"
          description="Indices, sector breadth, top movers and sentiment at a glance."
        />
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:self-end">
          {/* Update Timer */}
          {updatedAtStr && (
            <div className="text-[10px] text-white/40 flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin text-[var(--gold)]/40" />
              <span>Updated at {updatedAtStr}</span>
            </div>
          )}
        </div>
      </div>

      {/* INDIA MARKET VIEW */}
          {/* Row 1: Live Indices + Sentiment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NiftyLiveCard />
            <BankNiftyLiveCard />
            
            {/* Market Sentiment */}
            <div className="rounded-xl border border-[var(--gold)]/25 bg-gradient-to-b from-[var(--gold)]/10 to-card/60 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--gold)]">
                    <Gauge className="h-4 w-4" />
                    <p className="text-[10px] uppercase tracking-wider font-semibold">Market Sentiment</p>
                  </div>
                  {loading && <Skeleton className="h-3 w-8" />}
                </div>
                
                {loading ? (
                  <div className="space-y-3 mt-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : error ? (
                  <div className="mt-4 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded p-3">
                    Failed to load sentiment: {error}
                  </div>
                ) : data ? (
                  <div className="mt-2 space-y-3">
                    <p className={`text-xl font-bold ${
                      data.sentiment.value === "Bullish" ? "text-emerald-400" :
                      data.sentiment.value === "Bearish" ? "text-red-400" : "text-amber-400"
                    }`}>
                      {data.sentiment.value}
                    </p>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400 transition-all duration-500" 
                        style={{ width: `${data.sentiment.score}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/45">
                      <span>Bearish</span><span>Neutral</span><span>Bullish</span>
                    </div>
                    <p className="text-xs text-white/55 leading-relaxed mt-3">
                      {data.sentiment.explanation}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Row 2: Sector Performance + Market Breadth */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Sector Performance (2/3 width) */}
            <div className="rounded-xl border border-white/10 bg-card/60 p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Sector Performance</h3>
                {loading && <Skeleton className="h-3.5 w-12" />}
              </div>
              
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded p-4">
                  Failed to load sector performance: {error}
                </div>
              ) : data ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {data.sectors.map((s) => (
                    <div key={s.name} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2.5">
                      <span className="text-xs text-white/80">{s.name}</span>
                      <span className={`text-xs font-semibold ${s.up ? "text-emerald-400" : "text-red-400"}`}>
                        {s.pct}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Market Breadth (1/3 width) */}
            <div className="rounded-xl border border-white/10 bg-card/60 p-5 lg:col-span-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Activity className="h-4 w-4 text-[var(--gold)]" />
                    <h3 className="text-sm">Market Breadth</h3>
                  </div>
                  {loading && <Skeleton className="h-3.5 w-12" />}
                </div>

                {loading ? (
                  <div className="space-y-4">
                    <div className="flex justify-between"><Skeleton className="h-4 w-12" /><Skeleton className="h-4 w-12" /></div>
                    <Skeleton className="h-2 w-full rounded-full" />
                    <div className="space-y-2 mt-4">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded p-4">
                    Failed to load market breadth: {error}
                  </div>
                ) : data ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Advances / Declines Ratio</span>
                      <span className="font-semibold text-white">{data.breadth.ratio}:1</span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden flex">
                      <div 
                        className="h-full bg-emerald-400 transition-all duration-500" 
                        style={{ 
                          width: `${(data.breadth.advances / (data.breadth.advances + data.breadth.declines || 1)) * 100}%` 
                        }} 
                      />
                      <div 
                        className="h-full bg-red-400 transition-all duration-500" 
                        style={{ 
                          width: `${(data.breadth.declines / (data.breadth.advances + data.breadth.declines || 1)) * 100}%` 
                        }} 
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] mt-2">
                      <div className="rounded bg-white/5 p-2">
                        <p className="text-white/40 mb-0.5 font-medium">Advances</p>
                        <p className="text-xs font-bold text-emerald-400">{data.breadth.advances}</p>
                      </div>
                      <div className="rounded bg-white/5 p-2">
                        <p className="text-white/40 mb-0.5 font-medium">Declines</p>
                        <p className="text-xs font-bold text-red-400">{data.breadth.declines}</p>
                      </div>
                      <div className="rounded bg-white/5 p-2">
                        <p className="text-white/40 mb-0.5 font-medium">Unchanged</p>
                        <p className="text-xs font-bold text-white/70">{data.breadth.unchanged}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Row 3: Gainers + Losers + IPO Calendar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Gainers */}
            <div className="rounded-xl border border-white/10 bg-card/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                  <ArrowUpRight className="h-4 w-4" /> Top Gainers
                </h3>
                {loading && <Skeleton className="h-3.5 w-12" />}
              </div>

              {loading ? (
                <ul className="divide-y divide-white/5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="py-2.5 flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <div className="text-right space-y-1">
                        <Skeleton className="h-3.5 w-12 ml-auto" />
                        <Skeleton className="h-3 w-8 ml-auto" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : error ? (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded p-4">
                  Failed to load gainers: {error}
                </div>
              ) : data ? (
                <ul className="divide-y divide-white/5">
                  {data.gainers.map((r) => (
                    <li key={r.s} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-white font-medium">{r.s}</span>
                      <div className="text-right">
                        <p className="text-xs text-white/80">₹{r.p}</p>
                        <p className="text-[11px] text-emerald-400 font-semibold">{r.c}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* Top Losers */}
            <div className="rounded-xl border border-white/10 bg-card/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-red-400 flex items-center gap-1.5">
                  <ArrowDownRight className="h-4 w-4" /> Top Losers
                </h3>
                {loading && <Skeleton className="h-3.5 w-12" />}
              </div>

              {loading ? (
                <ul className="divide-y divide-white/5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="py-2.5 flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <div className="text-right space-y-1">
                        <Skeleton className="h-3.5 w-12 ml-auto" />
                        <Skeleton className="h-3 w-8 ml-auto" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : error ? (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded p-4">
                  Failed to load losers: {error}
                </div>
              ) : data ? (
                <ul className="divide-y divide-white/5">
                  {data.losers.map((r) => (
                    <li key={r.s} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-white font-medium">{r.s}</span>
                      <div className="text-right">
                        <p className="text-xs text-white/80">₹{r.p}</p>
                        <p className="text-[11px] text-red-400 font-semibold">{r.c}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* IPO Calendar */}
            <div className="rounded-xl border border-white/10 bg-card/60 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[var(--gold)]" /> IPO Calendar
                </h3>
                {loading && <Skeleton className="h-3.5 w-12" />}
              </div>

              {loading ? (
                <ul className="space-y-3 flex-1">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <li key={i} className="rounded-md bg-white/5 p-3 space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-full" />
                    </li>
                  ))}
                </ul>
              ) : error ? (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded p-4 flex-1 flex items-center justify-center">
                  Failed to load IPO calendar
                </div>
              ) : data && (!("ipos" in data) || data.ipos === null || (data.ipos && data.ipos.length === 0)) ? (
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-xs text-white/40">
                  <Calendar className="h-8 w-8 stroke-[1.5] mb-2 text-white/20" />
                  <p className="font-medium text-white/60">IPO Data Unavailable</p>
                </div>
              ) : data && "ipos" in data && data.ipos ? (
                <ul className="space-y-3 overflow-y-auto max-h-[220px] flex-1 pr-1 scrollbar-thin">
                  {data.ipos.slice(0, 10).map((ipo) => (
                    <li key={ipo.name} className="rounded-md bg-white/5 p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[11px] font-semibold text-white leading-tight">{ipo.name}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                            ipo.status === "LIVE" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" :
                            "bg-white/10 text-white/60"
                          }`}>
                            {ipo.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/50 mt-1">
                          {ipo.openDate} – {ipo.closeDate}
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                        <span>Band: <span className="text-white/70">{ipo.priceBand}</span></span>
                        {ipo.issueSize !== "N/A" && <span>Size: <span className="text-white/70">{ipo.issueSize}</span></span>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

    </div>
  );
}
