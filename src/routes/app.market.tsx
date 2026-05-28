import { createFileRoute } from "@tanstack/react-router";
import { Gauge, ArrowUpRight, ArrowDownRight, Calendar, Activity } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { NiftyLiveCard, BankNiftyLiveCard } from "@/components/app/LiveIndexCard";

export const Route = createFileRoute("/app/market")({
  component: MarketPage,
});

const SECTORS = [
  { name: "IT", pct: "+1.42%", up: true },
  { name: "Banking", pct: "-0.31%", up: false },
  { name: "Auto", pct: "+2.05%", up: true },
  { name: "Pharma", pct: "+0.78%", up: true },
  { name: "Metals", pct: "-0.92%", up: false },
  { name: "FMCG", pct: "+0.21%", up: true },
  { name: "Energy", pct: "+1.10%", up: true },
  { name: "Realty", pct: "-1.45%", up: false },
];

const GAINERS = [
  { s: "TATAMOTORS", p: "972.10", c: "+4.12%" },
  { s: "ADANIENT", p: "2,845.50", c: "+3.85%" },
  { s: "BAJAJ-AUTO", p: "9,210.40", c: "+3.12%" },
  { s: "HINDALCO", p: "682.05", c: "+2.78%" },
];

const LOSERS = [
  { s: "HDFCBANK", p: "1,648.90", c: "-2.10%" },
  { s: "INDUSINDBK", p: "1,015.30", c: "-1.78%" },
  { s: "ASIANPAINT", p: "2,432.10", c: "-1.42%" },
  { s: "NESTLEIND", p: "2,210.80", c: "-1.18%" },
];

const BULK = [
  { stock: "DIVISLAB", buyer: "Aditya Birla MF", qty: "4.2L", price: "4,210" },
  { stock: "SBIN", buyer: "Goldman Sachs", qty: "12.8L", price: "812" },
  { stock: "JSWSTEEL", buyer: "HDFC MF", qty: "6.1L", price: "918" },
];

const IPOS = [
  { name: "BrightTech Solutions", date: "May 26 – 28", band: "₹220 – 240", lot: "60" },
  { name: "NovaPharma Labs", date: "May 27 – 29", band: "₹485 – 510", lot: "30" },
  { name: "InfraGrid India", date: "Jun 02 – 04", band: "₹78 – 84", lot: "175" },
];

function MarketPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <PageHeader
        eyebrow="Market"
        title="Today's Market Overview"
        description="Indices, sector breadth, top movers and FII/DII positioning at a glance."
      />

      {/* Indices + Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NiftyLiveCard />
        <BankNiftyLiveCard />
        <div className="rounded-xl border border-[var(--gold)]/25 bg-gradient-to-b from-[var(--gold)]/10 to-card/60 p-4">
          <div className="flex items-center gap-2 text-[var(--gold)]">
            <Gauge className="h-4 w-4" />
            <p className="text-[10px] uppercase tracking-wider font-semibold">Market Sentiment</p>
          </div>
          <p className="mt-2 text-xl font-bold text-emerald-400">Bullish</p>
          <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400" style={{ width: "72%" }} />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-white/45">
            <span>Bearish</span><span>Neutral</span><span>Bullish</span>
          </div>
          <p className="mt-3 text-xs text-white/55">Breadth positive · VIX cooling at 13.8 · A/D ratio 2.1:1</p>
        </div>
      </div>

      {/* Sectors */}
      <div className="mt-6 rounded-xl border border-white/10 bg-card/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Sector Performance</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SECTORS.map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2.5">
              <span className="text-xs text-white/80">{s.name}</span>
              <span className={`text-xs font-semibold ${s.up ? "text-emerald-400" : "text-red-400"}`}>{s.pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gainers / Losers */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {[
          { title: "Top Gainers", icon: ArrowUpRight, color: "text-emerald-400", rows: GAINERS, up: true },
          { title: "Top Losers", icon: ArrowDownRight, color: "text-red-400", rows: LOSERS, up: false },
        ].map((g) => {
          const Icon = g.icon;
          return (
            <div key={g.title} className="rounded-xl border border-white/10 bg-card/60 p-5">
              <h3 className={`text-sm font-semibold ${g.color} flex items-center gap-1.5 mb-3`}>
                <Icon className="h-4 w-4" /> {g.title}
              </h3>
              <ul className="divide-y divide-white/5">
                {g.rows.map((r) => (
                  <li key={r.s} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-white">{r.s}</span>
                    <div className="text-right">
                      <p className="text-xs text-white/80">₹{r.p}</p>
                      <p className={`text-[11px] ${g.up ? "text-emerald-400" : "text-red-400"}`}>{r.c}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* FII/DII + Bulk Deals + IPO */}
      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-card/60 p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-[var(--gold)]" /> FII / DII Activity
          </h3>
          <div className="space-y-2">
            <div className="rounded-md bg-white/5 p-3 flex items-center justify-between">
              <span className="text-xs text-white/60">FII (Cash)</span>
              <span className="text-sm font-semibold text-red-400">−₹1,248 Cr</span>
            </div>
            <div className="rounded-md bg-white/5 p-3 flex items-center justify-between">
              <span className="text-xs text-white/60">DII (Cash)</span>
              <span className="text-sm font-semibold text-emerald-400">+₹2,015 Cr</span>
            </div>
            <div className="rounded-md bg-white/5 p-3 flex items-center justify-between">
              <span className="text-xs text-white/60">FII (F&amp;O Idx)</span>
              <span className="text-sm font-semibold text-emerald-400">+₹842 Cr</span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-white/40">Provisional · Updated EOD</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-card/60 p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Bulk Deals</h3>
          <ul className="space-y-2.5">
            {BULK.map((b) => (
              <li key={b.stock + b.buyer} className="text-xs">
                <p className="text-white font-medium">{b.stock} <span className="text-white/40">· {b.qty} @ ₹{b.price}</span></p>
                <p className="text-white/50">Buyer: {b.buyer}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-card/60 p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-[var(--gold)]" /> IPO Calendar
          </h3>
          <ul className="space-y-3">
            {IPOS.map((ipo) => (
              <li key={ipo.name} className="rounded-md bg-white/5 p-3">
                <p className="text-sm font-semibold text-white">{ipo.name}</p>
                <p className="text-[11px] text-white/50">{ipo.date} · Band {ipo.band} · Lot {ipo.lot}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-8 text-[11px] text-white/35">Data placeholders — connect a market data provider (NSE, Upstox, Zerodha Kite) to populate live values.</p>
    </div>
  );
}
