import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { History, TrendingUp, TrendingDown, CheckCircle2, Circle } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/app/performance")({
  component: PerformancePage,
});

const CATS = ["All", "Intraday", "Swing", "Positional", "Mid Term", "Long Term", "Wealth Creator"] as const;
type Cat = typeof CATS[number];

type Row = {
  s: string;
  entry: number;
  current: number;
  status: "Closed" | "Active";
  days: number;
  cat: Exclude<Cat, "All">;
};

const ROWS: Row[] = [
  { s: "TATAMOTORS", entry: 968, current: 1040, status: "Closed", days: 18, cat: "Swing" },
  { s: "RELIANCE", entry: 2820, current: 2945, status: "Active", days: 24, cat: "Positional" },
  { s: "HDFCBANK", entry: 1648, current: 1612, status: "Active", days: 9, cat: "Positional" },
  { s: "DIVISLAB", entry: 3980, current: 4210, status: "Active", days: 38, cat: "Mid Term" },
  { s: "VBL", entry: 1320, current: 1520, status: "Active", days: 78, cat: "Long Term" },
  { s: "KAYNES", entry: 4900, current: 5420, status: "Active", days: 62, cat: "Wealth Creator" },
  { s: "JSWSTEEL", entry: 892, current: 918, status: "Closed", days: 11, cat: "Positional" },
  { s: "TITAN", entry: 3360, current: 3540, status: "Closed", days: 14, cat: "Swing" },
  { s: "INFY", entry: 1620, current: 1742, status: "Closed", days: 22, cat: "Swing" },
  { s: "ICICIBANK", entry: 1180, current: 1245, status: "Closed", days: 31, cat: "Positional" },
  { s: "BAJFINANCE", entry: 6850, current: 6720, status: "Closed", days: 16, cat: "Swing" },
  { s: "SUZLON", entry: 64, current: 78, status: "Closed", days: 45, cat: "Mid Term" },
  { s: "ZOMATO", entry: 152, current: 198, status: "Closed", days: 58, cat: "Mid Term" },
  { s: "DMART", entry: 4100, current: 4520, status: "Closed", days: 73, cat: "Long Term" },
  { s: "POLYCAB", entry: 5240, current: 6180, status: "Closed", days: 92, cat: "Wealth Creator" },
  { s: "ADANIPORTS", entry: 1180, current: 1095, status: "Closed", days: 19, cat: "Intraday" },
  { s: "SBIN", entry: 768, current: 812, status: "Closed", days: 1, cat: "Intraday" },
];

function pct(entry: number, current: number) {
  return ((current - entry) / entry) * 100;
}

function PerformancePage() {
  const [cat, setCat] = useState<Cat>("All");
  const visible = ROWS.filter((r) => cat === "All" || r.cat === cat);

  const stats = useMemo(() => {
    const closed = ROWS.filter((r) => r.status === "Closed");
    const wins = closed.filter((r) => r.current >= r.entry).length;
    const avg = closed.reduce((a, r) => a + pct(r.entry, r.current), 0) / (closed.length || 1);
    const active = ROWS.filter((r) => r.status === "Active").length;
    return {
      winRate: closed.length ? (wins / closed.length) * 100 : 0,
      avgReturn: avg,
      closed: closed.length,
      active,
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <PageHeader
        eyebrow="Track Record"
        title="Past Performance"
        description="Transparent record of every research-led idea — closed and active. For education only, not advice."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} accent="text-emerald-400" />
        <Kpi label="Avg. Return" value={`${stats.avgReturn >= 0 ? "+" : ""}${stats.avgReturn.toFixed(2)}%`} accent={stats.avgReturn >= 0 ? "text-emerald-400" : "text-red-400"} />
        <Kpi label="Closed Ideas" value={stats.closed.toString()} />
        <Kpi label="Active Ideas" value={stats.active.toString()} accent="gold-text" />
      </div>

      <div className="rounded-xl border border-white/10 bg-card/60 p-2 flex items-center gap-1 overflow-x-auto mb-4">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${
              cat === c ? "gold-gradient text-black" : "text-white/65 hover:text-white hover:bg-white/5"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-card/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-[10px] uppercase tracking-wider text-white/50">
              <tr>
                <th className="text-left px-4 py-3 flex items-center gap-1.5"><History className="h-3 w-3" /> Stock</th>
                <th className="text-right px-4 py-3">Entry</th>
                <th className="text-right px-4 py-3">Current</th>
                <th className="text-right px-4 py-3">Return</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Days</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const ret = pct(r.entry, r.current);
                const up = ret >= 0;
                return (
                  <tr key={r.s + r.cat + r.days} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{r.s}</div>
                      <div className="text-[10px] text-white/40">{r.cat}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-white/85">₹{r.entry.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-white/85">₹{r.current.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 text-sm font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
                        {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {up ? "+" : ""}{ret.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.status === "Closed" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-white/70"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Closed</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--gold)]"><Circle className="h-3 w-3 animate-pulse" /> Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-white/65">{r.days}</td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-white/45">No ideas in this category yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-white/35">
        Past performance is educational record-keeping and does not guarantee future results.
      </p>
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
