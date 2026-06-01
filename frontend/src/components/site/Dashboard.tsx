import { useRef, useState } from "react";
import {
  Star, TrendingUp, TrendingDown, Activity, Send, Upload, ImageIcon,
  LineChart, Crown, Check, BarChart3,
} from "lucide-react";
import { MiniChart } from "./MiniChart";

type Timeframe = "Intraday" | "Swing" | "Positional" | "Long Term";

const WATCHLIST = [
  { s: "RELIANCE", p: "2,945.30", c: "+1.12%", up: true },
  { s: "TATAMOTORS", p: "972.10", c: "+2.10%", up: true },
  { s: "HDFCBANK", p: "1,648.90", c: "-0.31%", up: false },
  { s: "INFY", p: "1,872.20", c: "+0.67%", up: true },
  { s: "SBIN", p: "812.45", c: "-0.18%", up: false },
  { s: "ICICIBANK", p: "1,210.80", c: "+0.92%", up: true },
];

const INDICES = [
  { name: "NIFTY 50", value: "24,812", chg: "+184.30 (+0.75%)", up: true },
  { name: "BANK NIFTY", value: "51,420", chg: "-126.40 (-0.25%)", up: false },
];

const FII_DII = [
  { label: "FII", value: "−₹1,248 Cr", up: false },
  { label: "DII", value: "+₹2,015 Cr", up: true },
];

type Card = {
  s: string;
  exch: string;
  tf: Timeframe;
  side: "Bullish" | "Bearish";
  entry: string;
  t1: string;
  t2: string;
  sl: string;
  risk: "Low" | "Medium" | "High";
  notes: string;
};

const CARDS: Card[] = [
  {
    s: "RELIANCE", exch: "NSE • 15m", tf: "Intraday", side: "Bullish",
    entry: "2,945", t1: "2,985", t2: "3,020", sl: "2,922",
    risk: "Low",
    notes: "Breakout above prior swing high with rising volume. Volume confirming the move; trail SL above the day low.",
  },
  {
    s: "TATAMOTORS", exch: "NSE • Daily", tf: "Swing", side: "Bullish",
    entry: "968", t1: "1,005", t2: "1,040", sl: "948",
    risk: "Medium",
    notes: "Inside-bar breakout on the daily with strong follow-through volume. Auto sector breadth supportive.",
  },
  {
    s: "HDFCBANK", exch: "NSE • Daily", tf: "Positional", side: "Bearish",
    entry: "1,648", t1: "1,612", t2: "1,580", sl: "1,672",
    risk: "Medium",
    notes: "Rejection from supply zone with weak follow-through. Banknifty heaviness adds confluence.",
  },
  {
    s: "DIVISLAB", exch: "NSE • Weekly", tf: "Long Term", side: "Bullish",
    entry: "4,210", t1: "4,520", t2: "4,860", sl: "4,020",
    risk: "Low",
    notes: "Long base breakout on weekly with rising relative strength vs Nifty Pharma.",
  },
];

const TIMEFRAMES: Timeframe[] = ["Intraday", "Swing", "Positional", "Long Term"];

function ChartUpload({ trend, seed }: { trend: "up" | "down"; seed: number }) {
  const [img, setImg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onFile = (f?: File) => { if (f) setImg(URL.createObjectURL(f)); };
  return (
    <div
      className="relative rounded-lg bg-black/40 p-1.5 group border border-white/5"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
    >
      {img ? (
        <img src={img} alt="Chart" className="w-full h-40 object-cover rounded" />
      ) : (
        <div className="h-40 flex items-center justify-center">
          <MiniChart trend={trend} seed={seed} />
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute inset-1.5 rounded opacity-0 group-hover:opacity-100 bg-black/65 transition flex items-center justify-center gap-2 text-xs font-semibold text-[var(--gold)] border border-dashed border-[var(--gold)]/50"
      >
        {img ? <ImageIcon className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
        {img ? "Replace chart" : "Upload chart image"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? undefined)}
      />
    </div>
  );
}

function RiskDot({ level }: { level: "Low" | "Medium" | "High" }) {
  const color =
    level === "Low" ? "bg-emerald-400" : level === "Medium" ? "bg-amber-400" : "bg-red-400";
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-white/70">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {level} risk
    </span>
  );
}

export function Login() {
  const [active, setActive] = useState<Timeframe>("Intraday");
  const visible = CARDS.filter((c) => c.tf === active);

  return (
    <div className="mx-auto max-w-[1400px] px-3 sm:px-5 lg:px-6 py-5">
      <div className="grid grid-cols-12 gap-4">
        {/* LEFT SIDEBAR */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-white/10 bg-card/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[var(--gold)]" />
                <h3 className="text-sm font-semibold text-white">Watchlist</h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-white/40">Live</span>
            </div>
            <ul className="space-y-1.5">
              {WATCHLIST.map((w) => (
                <li key={w.s} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-white/5 transition">
                  <span className="text-sm text-white/90 font-medium">{w.s}</span>
                  <div className="text-right">
                    <p className="text-xs text-white/80">{w.p}</p>
                    <p className={`text-[10px] ${w.up ? "text-emerald-400" : "text-red-400"}`}>{w.c}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-card/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-[var(--gold)]" />
              <h3 className="text-sm font-semibold text-white">Market Overview</h3>
            </div>
            <div className="space-y-2">
              {INDICES.map((i) => (
                <div key={i.name} className="rounded-md bg-white/5 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">{i.name}</span>
                    {i.up
                      ? <TrendingUp className="h-3 w-3 text-emerald-400" />
                      : <TrendingDown className="h-3 w-3 text-red-400" />}
                  </div>
                  <p className="mt-1 text-base font-bold text-white">{i.value}</p>
                  <p className={`text-[11px] ${i.up ? "text-emerald-400" : "text-red-400"}`}>{i.chg}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-card/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-[var(--gold)]" />
              <h3 className="text-sm font-semibold text-white">FII / DII Activity</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FII_DII.map((f) => (
                <div key={f.label} className="rounded-md bg-white/5 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">{f.label}</p>
                  <p className={`mt-1 text-sm font-semibold ${f.up ? "text-emerald-400" : "text-red-400"}`}>
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-white/40">Cash market • Provisional</p>
          </div>
        </aside>

        {/* CENTER MAIN */}
        <section className="col-span-12 lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-white/10 bg-card/60 p-3 flex items-center gap-2 overflow-x-auto">
            {TIMEFRAMES.map((tf) => {
              const isActive = active === tf;
              return (
                <button
                  key={tf}
                  onClick={() => setActive(tf)}
                  className={`shrink-0 rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "gold-gradient text-black"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tf}
                </button>
              );
            })}
            <div className="ml-auto hidden sm:flex items-center gap-1.5 text-[11px] text-white/40">
              <LineChart className="h-3.5 w-3.5" />
              Today's analysis
            </div>
          </div>

          <div className="space-y-4">
            {visible.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/50">
                No {active.toLowerCase()} setups posted yet. Check back soon.
              </div>
            )}
            {visible.map((c, i) => {
              const bull = c.side === "Bullish";
              return (
                <article key={c.s} className="rounded-xl border border-white/10 bg-card/60 p-5">
                  <header className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{c.s}</h3>
                      <p className="text-[11px] text-white/50 mt-0.5">{c.exch}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        bull ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                      }`}>
                        {bull ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {c.side}
                      </span>
                      <RiskDot level={c.risk} />
                    </div>
                  </header>

                  <div className="mt-4">
                    <ChartUpload trend={bull ? "up" : "down"} seed={i + 3} />
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded-md bg-white/5 py-2">
                      <p className="text-white/45 text-[10px] uppercase">Entry</p>
                      <p className="mt-0.5 font-semibold text-white">₹{c.entry}</p>
                    </div>
                    <div className="rounded-md bg-emerald-500/10 py-2">
                      <p className="text-white/45 text-[10px] uppercase">Target 1</p>
                      <p className="mt-0.5 font-semibold text-emerald-400">₹{c.t1}</p>
                    </div>
                    <div className="rounded-md bg-emerald-500/10 py-2">
                      <p className="text-white/45 text-[10px] uppercase">Target 2</p>
                      <p className="mt-0.5 font-semibold text-emerald-400">₹{c.t2}</p>
                    </div>
                    <div className="rounded-md bg-red-500/10 py-2">
                      <p className="text-white/45 text-[10px] uppercase">Stop</p>
                      <p className="mt-0.5 font-semibold text-red-400">₹{c.sl}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-md border border-white/5 bg-black/20 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--gold)] font-semibold mb-1">Trade notes</p>
                    <p className="text-sm text-white/70 leading-relaxed">{c.notes}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-[var(--gold)]/30 bg-gradient-to-b from-[var(--gold)]/10 to-card/60 p-5">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-[var(--gold)]" />
              <h3 className="text-sm font-semibold gold-text">EquityMitra Prime</h3>
            </div>
            <p className="mt-1 text-[11px] text-white/55">Research-led calls, every market day.</p>

            <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-white/80">Basic</span>
                <span className="text-lg font-bold text-white">₹99<span className="text-xs text-white/40">/mo</span></span>
              </div>
              <ul className="mt-3 space-y-1.5 text-[12px] text-white/70">
                <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-[var(--gold)] mt-0.5 shrink-0" /> Daily Analysis</li>
                <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-[var(--gold)] mt-0.5 shrink-0" /> Weekly Picks</li>
              </ul>
              <button className="mt-4 w-full rounded-md border border-white/15 text-white text-xs font-semibold py-2 hover:bg-white/5 transition">
                Choose Basic
              </button>
            </div>

            <div className="mt-3 rounded-lg border border-[var(--gold)]/40 bg-black/30 p-4 relative">
              <span className="absolute -top-2 right-3 rounded-full gold-gradient text-black text-[10px] font-bold px-2 py-0.5">
                Popular
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold gold-text">Prime</span>
                <span className="text-lg font-bold text-white">₹299<span className="text-xs text-white/40">/mo</span></span>
              </div>
              <ul className="mt-3 space-y-1.5 text-[12px] text-white/80">
                <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-[var(--gold)] mt-0.5 shrink-0" /> Everything in Basic</li>
                <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-[var(--gold)] mt-0.5 shrink-0" /> Monthly investment ideas</li>
                <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-[var(--gold)] mt-0.5 shrink-0" /> Full learning library</li>
                <li className="flex gap-2"><Check className="h-3.5 w-3.5 text-[var(--gold)] mt-0.5 shrink-0" /> Priority Telegram support</li>
              </ul>
              <button className="mt-4 w-full rounded-md gold-gradient text-black text-xs font-bold py-2 hover:opacity-90 transition">
                Go Prime
              </button>
            </div>
          </div>

          <a
            href="https://t.me/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-white text-sm font-semibold py-3 transition"
          >
            <Send className="h-4 w-4" />
            Join Telegram Community
          </a>

          <div className="rounded-xl border border-white/10 bg-card/60 p-4">
            <p className="text-[10px] uppercase tracking-wider text-white/40">Disclaimer</p>
            <p className="mt-2 text-[11px] text-white/55 leading-relaxed">
              EquityMitra shares educational research only. Trade ideas are not investment advice. Please assess your own risk.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
