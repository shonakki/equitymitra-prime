import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { DisclaimerBanner } from "@/components/app/DisclaimerBanner";
import {
  NiftyLiveCard,
  BankNiftyLiveCard,
  SensexLiveCard,
  FinniftyLiveCard,
} from "@/components/app/LiveIndexCard";
import { marketApi, useLiveQuote } from "@/lib/marketApi";

export const Route = createFileRoute("/app/market")({
  component: MarketPage,
});

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-white/5 ${className}`} />;
}

function IpoCalendar() {
  const { data, loading } = useLiveQuote(marketApi.dashboard, 60 * 60 * 1000);

  return (
    <div className="rounded-xl border border-white/10 bg-card/60 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-[var(--gold)]" /> IPO Calendar
        </h3>
      </div>

      {loading ? (
        <ul className="space-y-3 flex-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="rounded-md bg-white/5 p-3 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-full" />
            </li>
          ))}
        </ul>
      ) : !data || !("ipos" in data) || !data.ipos || data.ipos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-xs text-white/40">
          <Calendar className="h-8 w-8 stroke-[1.5] mb-2 text-white/20" />
          <p className="font-medium text-white/60">IPO Data Unavailable</p>
        </div>
      ) : (
        <ul className="space-y-3 overflow-y-auto max-h-[360px] flex-1 pr-1">
          {data.ipos.slice(0, 10).map((ipo) => (
            <li
              key={ipo.name}
              className="rounded-md bg-white/5 p-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-semibold text-white leading-tight">
                    {ipo.name}
                  </p>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                      ipo.status === "LIVE"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {ipo.status}
                  </span>
                </div>
                <p className="text-[10px] text-white/50 mt-1">
                  {ipo.openDate} – {ipo.closeDate}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                <span>
                  Band: <span className="text-white/70">{ipo.priceBand}</span>
                </span>
                {ipo.issueSize !== "N/A" && (
                  <span>
                    Size: <span className="text-white/70">{ipo.issueSize}</span>
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MarketPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <DisclaimerBanner variant="compact" storageKey="em.disclaimer.market" />

      {/* Data policy notice */}
      <div className="flex flex-col gap-1 rounded-lg border border-amber-500/25 bg-amber-500/8 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-300/80 font-bold">
            Market data displayed with a delay of approximately 15 minutes.
          </p>
        </div>
        <p className="text-[10px] text-amber-400/50 pl-5 leading-normal">
          Market information is updated in accordance with the licensing terms
          of our data providers. Only reliable, legally sourced data is
          displayed.
        </p>
      </div>

      {/* Page header */}
      <PageHeader
        eyebrow="Market"
        title="India Market Overview"
        description="Major index close values and upcoming IPO calendar."
      />

      {/* Index Overview — 4 cards */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
          Major Indices
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <NiftyLiveCard />
          <SensexLiveCard />
          <BankNiftyLiveCard />
          <FinniftyLiveCard />
        </div>
      </div>

      {/* IPO Calendar */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
          IPO Calendar
        </h2>
        <div className="max-w-md">
          <IpoCalendar />
        </div>
      </div>
    </div>
  );
}
