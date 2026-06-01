import { SectionHeader } from "./SectionHeader";

const PICKS = [
  { s: "BAJFINANCE", entry: "7,212", target: "7,890", stop: "6,920" },
  { s: "DIVISLAB", entry: "5,840", target: "6,255", stop: "5,640" },
  { s: "JSWSTEEL", entry: "942", target: "1,003", stop: "908" },
  { s: "TITAN", entry: "3,520", target: "3,724", stop: "3,410" },
  { s: "DLF", entry: "812", target: "879", stop: "780" },
];

export function WeeklyPicks() {
  return (
    <section id="picks" className="relative py-16 sm:py-20 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Weekly Picks"
          title="Top stocks for this week"
        />
        <div className="overflow-hidden rounded-xl border border-white/10 bg-card/60">
          <div className="grid grid-cols-4 px-5 py-3 text-xs uppercase tracking-wider text-white/40 border-b border-white/10">
            <div>Stock</div>
            <div>Entry</div>
            <div>Target</div>
            <div>Stop Loss</div>
          </div>
          {PICKS.map((p) => (
            <div
              key={p.s}
              className="grid grid-cols-4 items-center px-5 py-3.5 border-b border-white/5 last:border-0 text-sm"
            >
              <div className="font-semibold text-white">{p.s}</div>
              <div className="text-white/80">₹{p.entry}</div>
              <div className="text-emerald-400">₹{p.target}</div>
              <div className="text-red-400">₹{p.stop}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
