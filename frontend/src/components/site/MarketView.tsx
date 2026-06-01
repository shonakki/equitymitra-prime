import { SectionHeader } from "./SectionHeader";
import { TrendingUp, TrendingDown, Gauge, ArrowUpRight, ArrowDownRight } from "lucide-react";

const INDICES = [
  {
    name: "NIFTY 50",
    value: "24,812",
    change: "+184.30",
    pct: "+0.75%",
    trend: "up" as const,
    note: "Bullish above 24,650",
  },
  {
    name: "BANK NIFTY",
    value: "51,420",
    change: "-126.40",
    pct: "-0.25%",
    trend: "down" as const,
    note: "Sideways with bearish bias",
  },
];

const SECTORS = [
  { name: "IT", pct: "+1.62%", up: true },
  { name: "Auto", pct: "+1.18%", up: true },
  { name: "Energy", pct: "+0.74%", up: true },
  { name: "FMCG", pct: "+0.21%", up: true },
  { name: "Banking", pct: "-0.32%", up: false },
  { name: "Realty", pct: "-0.88%", up: false },
];

const FLOWS = [
  { who: "FII", val: "+₹1,284 Cr", up: true, note: "Cash market net buy" },
  { who: "DII", val: "+₹742 Cr", up: true, note: "Sustained inflows" },
];

export function MarketView() {
  return (
    <section id="market" className="relative py-16 sm:py-20 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Today's Market View" title="Where the market stands" />

        <div className="grid sm:grid-cols-3 gap-4">
          {INDICES.map((i) => {
            const up = i.trend === "up";
            return (
              <div key={i.name} className="rounded-xl border border-white/10 bg-card/60 p-5">
                <p className="text-xs uppercase tracking-wider text-white/50">{i.name}</p>
                <p className="mt-2 text-2xl font-bold text-white">{i.value}</p>
                <p
                  className={`mt-1 text-sm font-medium inline-flex items-center gap-1 ${
                    up ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {i.change} ({i.pct})
                </p>
                <p className="mt-3 text-sm text-white/60">{i.note}</p>
              </div>
            );
          })}

          <div
            className="rounded-xl border p-5"
            style={{
              borderColor: "rgba(212,175,55,0.25)",
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(11,29,58,0.35))",
            }}
          >
            <div className="flex items-center gap-2 text-[var(--gold)]">
              <Gauge className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider font-semibold">
                Market Sentiment
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-emerald-400">Bullish</p>
            <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: "70%" }} />
            </div>
            <p className="mt-3 text-sm text-white/60">Breadth positive, VIX cooling.</p>
          </div>
        </div>

        <div className="mt-5 grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-card/60 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-white/50">
                Sector Performance
              </p>
              <span className="text-[10px] text-white/35">Today</span>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SECTORS.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between rounded-md border border-white/5 bg-black/20 px-3 py-2"
                >
                  <span className="text-sm text-white/80">{s.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      s.up ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {s.up ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {s.pct}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-card/60 p-5">
            <p className="text-xs uppercase tracking-wider text-white/50">FII / DII Activity</p>
            <div className="mt-4 space-y-3">
              {FLOWS.map((f) => (
                <div
                  key={f.who}
                  className="flex items-start justify-between rounded-md border border-white/5 bg-black/20 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{f.who}</p>
                    <p className="text-[11px] text-white/50 mt-0.5">{f.note}</p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      f.up ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {f.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
