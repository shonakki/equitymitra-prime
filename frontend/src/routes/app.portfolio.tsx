import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, LayoutGrid, Rows3, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/app/portfolio")({
  component: PortfolioPage,
});

type Risk = "Low" | "Medium" | "High";
type Holding = {
  s: string;
  entry: number;
  current: number;
  days: number;
  risk: Risk;
  notes: string;
};

const HOLDINGS: Holding[] = [
  { s: "RELIANCE", entry: 2820, current: 2945, days: 24, risk: "Low", notes: "Energy + retail thesis. Holding through earnings." },
  { s: "TATAMOTORS", entry: 968, current: 1040, days: 18, risk: "Medium", notes: "ATE swing — trailing SL at cost." },
  { s: "HDFCBANK", entry: 1720, current: 1648, days: 41, risk: "Medium", notes: "Reviewing thesis on weak Q-on-Q growth." },
  { s: "KAYNES", entry: 4900, current: 5420, days: 62, risk: "High", notes: "High-conviction EMS bet — staggered exits planned." },
  { s: "DIVISLAB", entry: 3980, current: 4210, days: 38, risk: "Low", notes: "Pharma rotation play — adding on pullbacks." },
  { s: "VBL", entry: 1320, current: 1520, days: 78, risk: "Low", notes: "Long-term compounder — trim only above ₹1,700." },
];

function pct(entry: number, current: number) {
  return ((current - entry) / entry) * 100;
}

function RiskPill({ level }: { level: Risk }) {
  const map = {
    Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    High: "bg-red-500/15 text-red-400 border-red-500/30",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${map[level]}`}>
      {level}
    </span>
  );
}

function ReturnCell({ entry, current }: { entry: number; current: number }) {
  const r = pct(entry, current);
  const up = r >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
      {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {up ? "+" : ""}{r.toFixed(2)}%
    </span>
  );
}

function PortfolioPage() {
  const [view, setView] = useState<"card" | "table">("card");

  const totalInv = HOLDINGS.reduce((a, h) => a + h.entry, 0);
  const totalCur = HOLDINGS.reduce((a, h) => a + h.current, 0);
  const overall = pct(totalInv, totalCur);
  const winners = HOLDINGS.filter((h) => h.current >= h.entry).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <PageHeader
        eyebrow="Portfolio"
        title="Portfolio Tracker"
        description="Track every position with entry, current price, return and notes — all in one view."
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-md gold-gradient text-black text-xs font-semibold px-3 py-2">
            <Plus className="h-3.5 w-3.5" /> Add Holding
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Holdings" value={HOLDINGS.length.toString()} />
        <Kpi label="Winners" value={`${winners} / ${HOLDINGS.length}`} accent="text-emerald-400" />
        <Kpi label="Overall Return" value={`${overall >= 0 ? "+" : ""}${overall.toFixed(2)}%`} accent={overall >= 0 ? "text-emerald-400" : "text-red-400"} />
        <Kpi label="Active Risk" value="Balanced" accent="gold-text" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-[var(--gold)]" />
          Current Holdings
        </h3>
        <div className="rounded-md border border-white/10 bg-card/60 p-1 flex items-center gap-1">
          <button
            onClick={() => setView("card")}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1 ${view === "card" ? "gold-gradient text-black" : "text-white/60 hover:text-white"}`}
          >
            <LayoutGrid className="h-3 w-3" /> Card
          </button>
          <button
            onClick={() => setView("table")}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1 ${view === "table" ? "gold-gradient text-black" : "text-white/60 hover:text-white"}`}
          >
            <Rows3 className="h-3 w-3" /> Table
          </button>
        </div>
      </div>

      {view === "card" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HOLDINGS.map((h) => (
            <article key={h.s} className="rounded-2xl border border-white/10 bg-card/60 p-5 hover:border-[var(--gold)]/30 transition">
              <header className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">{h.s}</h4>
                  <p className="text-[11px] text-white/45">Held {h.days} days</p>
                </div>
                <RiskPill level={h.risk} />
              </header>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-md bg-white/5 py-2">
                  <p className="text-white/45 text-[9px] uppercase">Entry</p>
                  <p className="mt-0.5 font-semibold text-white">₹{h.entry.toLocaleString()}</p>
                </div>
                <div className="rounded-md bg-white/5 py-2">
                  <p className="text-white/45 text-[9px] uppercase">Current</p>
                  <p className="mt-0.5 font-semibold text-white">₹{h.current.toLocaleString()}</p>
                </div>
                <div className="rounded-md bg-[var(--gold)]/10 py-2">
                  <p className="text-white/45 text-[9px] uppercase">Return</p>
                  <p className="mt-0.5"><ReturnCell entry={h.entry} current={h.current} /></p>
                </div>
              </div>
              <div className="mt-3 rounded-md border border-white/5 bg-black/20 p-3">
                <p className="text-[9px] uppercase tracking-wider text-[var(--gold)] font-semibold mb-1">Notes</p>
                <p className="text-xs text-white/65 leading-relaxed">{h.notes}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-card/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-[10px] uppercase tracking-wider text-white/50">
                <tr>
                  <th className="text-left px-4 py-3">Stock</th>
                  <th className="text-right px-4 py-3">Entry</th>
                  <th className="text-right px-4 py-3">Current</th>
                  <th className="text-right px-4 py-3">Return %</th>
                  <th className="text-right px-4 py-3">Days</th>
                  <th className="text-center px-4 py-3">Risk</th>
                  <th className="text-left px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {HOLDINGS.map((h) => (
                  <tr key={h.s} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-semibold text-white">{h.s}</td>
                    <td className="px-4 py-3 text-right font-mono text-white/85">₹{h.entry.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-white/85">₹{h.current.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right"><ReturnCell entry={h.entry} current={h.current} /></td>
                    <td className="px-4 py-3 text-right text-white/65">{h.days}</td>
                    <td className="px-4 py-3 text-center"><RiskPill level={h.risk} /></td>
                    <td className="px-4 py-3 text-white/55 text-xs max-w-[260px] truncate">{h.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-card/60 p-4">
      <p className="text-[10px] uppercase tracking-wider text-white/45">{label}</p>
      <p className={`mt-1 text-xl font-bold ${accent ?? "text-white"}`}>{value}</p>
    </div>
  );
}
