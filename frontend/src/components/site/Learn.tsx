import { SectionHeader } from "./SectionHeader";
import {
  Activity, Brain, ShieldAlert, BarChart3, CandlestickChart, LineChart,
  Layers, Timer, TrendingUp, Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Course = { title: string; desc: string; icon: LucideIcon };

const COURSES: Course[] = [
  { title: "Price Action Foundation", desc: "Read naked charts: structure, supply & demand.", icon: Activity },
  { title: "ATE Price & Volume Concept", desc: "Decode price + volume the ATE way.", icon: CandlestickChart },
  { title: "Market Structure", desc: "Trends, ranges, HH/HL/LH/LL and pivots.", icon: LineChart },
  { title: "Volume Analysis", desc: "Volume as confirmation and conviction.", icon: BarChart3 },
  { title: "Risk Management", desc: "Position sizing & stop loss discipline.", icon: ShieldAlert },
  { title: "Trade Psychology", desc: "Master patience, discipline and conviction.", icon: Brain },
  { title: "Intraday Execution", desc: "Plans, levels and clean intraday entries.", icon: Timer },
  { title: "Swing Trading Setup", desc: "Multi-day setups with defined risk.", icon: TrendingUp },
  { title: "Positional Trading", desc: "Weeks-to-months trend trading.", icon: Layers },
  { title: "Capital Management", desc: "Compounding and long-term capital growth.", icon: Wallet },
];

export function Learn() {
  return (
    <section id="learn" className="relative py-16 sm:py-20 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Learning Academy" title="Learn step by step" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COURSES.map(({ title, desc, icon: Icon }) => (
            <div
              key={title}
              className="rounded-xl border border-white/10 bg-card/60 p-5 hover:border-[var(--gold)]/40 transition"
            >
              <div className="h-10 w-10 rounded-md bg-[var(--gold)]/10 border border-[var(--gold)]/30 grid place-items-center text-[var(--gold)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
