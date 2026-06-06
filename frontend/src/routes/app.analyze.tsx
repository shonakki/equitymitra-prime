import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  Gauge,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { fetchStockAnalysis, type StockAnalysisData } from "@/lib/stockAnalysis";

export const Route = createFileRoute("/app/analyze")({
  component: AnalyzeStockPage,
});

function Badge({ children, variant }: { children: string; variant: "ghost" | "success" | "warning" | "danger" }) {
  const base =
    variant === "success"
      ? "bg-emerald-500/10 text-emerald-300"
      : variant === "warning"
      ? "bg-amber-500/10 text-amber-300"
      : variant === "danger"
      ? "bg-red-500/10 text-red-300"
      : "bg-white/5 text-white/75";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${base}`}>
      {children}
    </span>
  );
}

function StatCard({ label, value, meta }: { label: string; value: string | number | null; meta?: string }) {
  const display = value == null ? "Data Unavailable" : value;
  return (
    <div className="rounded-3xl border border-white/10 bg-card/60 p-5">
      <p className="text-sm text-white/50 uppercase tracking-[0.2em]">{label}</p>
      <p className="mt-3 text-2xl font-bold text-white leading-none">{display}</p>
      {meta && <p className="mt-2 text-xs text-white/50">{meta}</p>}
    </div>
  );
}

function ScoreMeter({ label, score, accent }: { label: string; score: number; accent: "emerald" | "amber" | "red" }) {
  const width = `${score}%`;
  const track = accent === "emerald" ? "from-emerald-500 to-emerald-300" : accent === "amber" ? "from-amber-500 to-amber-300" : "from-red-500 to-red-300";

  return (
    <div className="rounded-3xl border border-white/10 bg-card/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-white/50 uppercase tracking-[0.2em]">{label}</p>
        <span className="text-sm font-semibold text-white">{score}%</span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${track}`} style={{ width }} />
      </div>
      <p className="mt-3 text-xs text-white/50">Premium institutional score gauge with practical weightings.</p>
    </div>
  );
}

function FieldGrid({ items }: { items: Array<{ label: string; value: string | number | null }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-white/50">{item.label}</p>
          <p className="mt-2 text-sm font-semibold text-white">{item.value == null ? "Data Unavailable" : item.value}</p>
        </div>
      ))}
    </div>
  );
}

function AnalysisCard({ title, icon, children }: { title: string; icon: React.ComponentType<{ className?: string }> ; children: React.ReactNode }) {
  const Icon = icon;
  return (
    <div className="rounded-3xl border border-white/10 bg-card/60 p-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-[var(--gold)]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs text-white/50">Premium institutional research section.</p>
        </div>
      </div>
      <div className="mt-6 space-y-4">{children}</div>
    </div>
  );
}

function formatMetric(value: number | null | undefined, decimals = 2) {
  if (value == null || Number.isNaN(value)) return "Data Unavailable";
  return value.toFixed(decimals);
}

function formatCurrency(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "Data Unavailable";
  return `₹${value.toFixed(2)}`;
}

function formatLargeNumber(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "Data Unavailable";
  if (value >= 1_000_000_000) return `₹${(value / 1_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(2)}B`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}M`;
  return `₹${value.toFixed(2)}`;
}

function formatLargeCount(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "Data Unavailable";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B shares`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M shares`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K shares`;
  return `${value.toLocaleString()} shares`;
}

function AnalyzeStockPage() {
  const [query, setQuery] = useState("");
  const [analysis, setAnalysis] = useState<StockAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const symbol = query.trim().toUpperCase();
    if (!symbol) {
      setError("Enter a valid NSE stock symbol to generate analysis.");
      setAnalysis(null);
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const data = await fetchStockAnalysis(symbol);
      setAnalysis(data);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      setError(message || "Unable to fetch data for this symbol.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      <PageHeader
        eyebrow="Premium Research"
        title="Analyze Your Stock"
        description="Search any NSE stock symbol and generate a complete institutional-grade equity research dashboard." 
      />

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-card/60 p-6">
          <p className="text-sm text-white/60">Enter the NSE symbol you want to analyze, then click Analyze for a full research overview.</p>
          <form className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]" onSubmit={handleSubmit}>
            <label className="w-full">
              <span className="sr-only">Stock symbol</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Enter NSE stock symbol, e.g. RELIANCE"
                className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-3xl bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[var(--gold)]/90"
            >
              <Search className="mr-2 h-4 w-4" />
              Analyze
            </button>
          </form>
          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}
          {submitted && !query.trim() && !error && (
            <p className="mt-4 text-sm text-red-400">Enter a valid NSE stock symbol to generate analysis.</p>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[var(--gold)]/10 to-card/60 p-6">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--gold)] font-semibold">Premium Insight</p>
          <h2 className="mt-3 text-xl font-bold text-white">Smart stock research for every NSE symbol</h2>
          <p className="mt-3 text-sm text-white/60 leading-relaxed">
            Institutional-style dashboards, technical scores, fundamental health checks, operator risk and AI conviction — all served in a single premium workflow.
          </p>
          <div className="mt-6 space-y-3">
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">All NSE segments</p>
              <p className="mt-2 text-xs text-white/60">Large cap, mid cap, small cap, micro cap and SME support.</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Fast & responsive</p>
              <p className="mt-2 text-xs text-white/60">Built for premium users who need research on demand.</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Institutional flavor</p>
              <p className="mt-2 text-xs text-white/60">Clear cards, score gauges and actionable verdicts in one view.</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-card/60 p-6 text-center text-white/60">
          <Activity className="mx-auto mb-3 h-10 w-10 text-[var(--gold)] animate-spin" />
          <p className="text-sm">Loading the latest research dashboard...</p>
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-3xl border border-white/10 bg-card/60 p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--gold)]">Stock Overview</p>
                  <h2 className="mt-2 text-3xl font-bold text-white">{analysis.stockOverview.symbol}</h2>
                  <p className="mt-1 text-sm text-white/50">{analysis.stockOverview.companyName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="ghost">{analysis.stockOverview.exchange}</Badge>
                  <Badge variant="success">{analysis.stockOverview.segment}</Badge>
                  <Badge variant="warning">{analysis.stockOverview.sector}</Badge>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <StatCard
                  label="Last Price"
                  value={analysis.stockOverview.lastPrice == null ? null : `₹${analysis.stockOverview.lastPrice.toFixed(2)}`}
                  meta={
                    analysis.stockOverview.change == null || analysis.stockOverview.percentChange == null
                      ? undefined
                      : `${analysis.stockOverview.change > 0 ? "+" : ""}${analysis.stockOverview.change.toFixed(2)} (${analysis.stockOverview.percentChange.toFixed(2)}%)`
                  }
                />
                <StatCard label="Market Cap" value={analysis.stockOverview.marketCap == null ? null : formatLargeNumber(analysis.stockOverview.marketCap)} meta={`Avg vol ${analysis.stockOverview.avgVolume == null ? "Data Unavailable" : formatLargeCount(analysis.stockOverview.avgVolume)}`} />
                <StatCard label="Delivery" value={analysis.stockOverview.deliveryPercent == null ? null : `${analysis.stockOverview.deliveryPercent}%`} meta={`Listed since ${analysis.stockOverview.listingDate ?? "Data Unavailable"}`} />
                <StatCard label="Exchange" value={analysis.stockOverview.exchange} meta={`${analysis.stockOverview.segment}`} />
              </div>
            </div>

            <div className="grid gap-4">
              <ScoreMeter label="Overall Score" score={analysis.overallScore} accent={analysis.overallScore >= 75 ? "emerald" : analysis.overallScore >= 55 ? "amber" : "red"} />
              <div className="rounded-3xl border border-white/10 bg-card/60 p-6">
                <p className="text-sm text-white/50 uppercase tracking-[0.2em]">Conviction</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <StatCard label="Conviction" value={`${analysis.convictionScore}%`} />
                  <StatCard label="Risk Level" value={analysis.riskLevel} />
                  <StatCard label="Action" value={analysis.suggestedAction} meta={analysis.suggestedHoldingPeriod} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <AnalysisCard title="Technical Analysis" icon={Gauge}>
              <FieldGrid
                items={[
                  { label: "RSI", value: analysis.technical.rsi == null ? null : formatMetric(analysis.technical.rsi, 1) },
                  { label: "Trend", value: analysis.technical.trend },
                  { label: "Momentum", value: analysis.technical.momentum },
                  { label: "Support", value: analysis.technical.support == null ? null : `₹${analysis.technical.support.toFixed(2)}` },
                  { label: "Resistance", value: analysis.technical.resistance == null ? null : `₹${analysis.technical.resistance.toFixed(2)}` },
                  { label: "Technical Score", value: `${analysis.technical.score}%` },
                ]}
              />
            </AnalysisCard>

            <AnalysisCard title="Fundamental Analysis" icon={BarChart3}>
              <FieldGrid
                items={[
                  { label: "PE", value: analysis.fundamental.pe == null ? null : `${analysis.fundamental.pe.toFixed(1)}` },
                  { label: "PB", value: analysis.fundamental.pb == null ? null : `${analysis.fundamental.pb.toFixed(2)}` },
                  { label: "ROE", value: analysis.fundamental.roe == null ? null : `${analysis.fundamental.roe}%` },
                  { label: "ROCE", value: analysis.fundamental.roce == null ? null : `${analysis.fundamental.roce}%` },
                  { label: "Debt/Equity", value: analysis.fundamental.debtToEquity == null ? null : `${analysis.fundamental.debtToEquity.toFixed(2)}` },
                  { label: "Promoter Holding", value: analysis.fundamental.promoterHolding == null ? null : `${analysis.fundamental.promoterHolding}%` },
                  { label: "Revenue Growth", value: analysis.fundamental.revenueGrowth == null ? null : `${analysis.fundamental.revenueGrowth}%` },
                  { label: "Profit Growth", value: analysis.fundamental.profitGrowth == null ? null : `${analysis.fundamental.profitGrowth}%` },
                  { label: "Fundamental Score", value: `${analysis.fundamental.score}%` },
                ]}
              />
            </AnalysisCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <AnalysisCard title="Operator Risk Analysis" icon={ShieldCheck}>
              <FieldGrid
                items={[
                  { label: "Liquidity Risk", value: analysis.operatorRisk.liquidityRisk },
                  { label: "Volume Quality", value: analysis.operatorRisk.volumeQuality },
                  { label: "Delivery Strength", value: analysis.operatorRisk.deliveryStrength },
                  { label: "Operator Activity", value: analysis.operatorRisk.operatorActivity },
                  { label: "Risk Level", value: analysis.operatorRisk.riskLevel },
                ]}
              />
            </AnalysisCard>

            <div className="space-y-4">
              <AnalysisCard title="Strengths" icon={TrendingUp}>
                <ul className="space-y-3">
                  {analysis.strengths.map((item) => (
                    <li key={item} className="rounded-3xl bg-white/5 p-4 text-sm text-white/70">
                      <div className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        <span>{item}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </AnalysisCard>
              <AnalysisCard title="Risks" icon={TrendingDown}>
                <ul className="space-y-3">
                  {analysis.risks.map((item) => (
                    <li key={item} className="rounded-3xl bg-white/5 p-4 text-sm text-white/70">
                      <div className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
                        <span>{item}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </AnalysisCard>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--gold)]/25 bg-gradient-to-br from-[var(--gold)]/10 via-card to-card p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)]">EquityMitra AI Verdict</p>
                <h3 className="mt-2 text-2xl font-bold text-white">{analysis.suggestedAction} with {analysis.suggestedHoldingPeriod}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{analysis.aiVerdict}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-white/5 p-4 text-sm text-white/80">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">Overall Score</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{analysis.overallScore}%</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4 text-sm text-white/80">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">Conviction</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{analysis.convictionScore}%</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4 text-sm text-white/80">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">Risk Level</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{analysis.riskLevel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-card/60 p-6 text-center text-white/60">
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-[var(--gold)]" />
          <p className="text-sm">Generate a premium stock research dashboard by entering any NSE symbol above.</p>
        </div>
      )}
    </div>
  );
}
