const TICKS = [
  { s: "NIFTY 50", p: "24,812.05", c: "+0.84%", up: true },
  { s: "SENSEX", p: "81,402.10", c: "+0.71%", up: true },
  { s: "BANKNIFTY", p: "52,118.45", c: "-0.22%", up: false },
  { s: "RELIANCE", p: "2,945.30", c: "+1.12%", up: true },
  { s: "TCS", p: "4,118.55", c: "+0.45%", up: true },
  { s: "HDFCBANK", p: "1,648.90", c: "-0.31%", up: false },
  { s: "INFY", p: "1,872.20", c: "+0.67%", up: true },
  { s: "ICICIBANK", p: "1,210.80", c: "+0.92%", up: true },
  { s: "SBIN", p: "812.45", c: "-0.18%", up: false },
  { s: "TATAMOTORS", p: "972.10", c: "+2.10%", up: true },
  { s: "ADANIENT", p: "2,488.55", c: "+1.45%", up: true },
  { s: "LT", p: "3,612.00", c: "+0.55%", up: true },
];

export function Ticker() {
  const items = [...TICKS, ...TICKS];
  return (
    <div className="border-y border-white/10 bg-black/40 overflow-hidden">
      <div className="ticker-track flex gap-8 whitespace-nowrap py-3 text-sm">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-2 px-4">
            <span className="font-medium text-white/90">{t.s}</span>
            <span className="text-white/70">{t.p}</span>
            <span className={t.up ? "text-emerald-400" : "text-red-400"}>{t.c}</span>
            <span className="text-white/20">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
