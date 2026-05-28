import { SectionHeader } from "./SectionHeader";
import { Target, Trophy, Activity, CheckCircle2 } from "lucide-react";

const STATS = [
  { icon: Target, label: "Today's Accuracy", value: "82%", sub: "5 of 6 ideas in profit" },
  { icon: Trophy, label: "Monthly Win Rate", value: "71%", sub: "Last 30 sessions" },
  { icon: Activity, label: "Active Trades", value: "12", sub: "Across timeframes" },
  { icon: CheckCircle2, label: "Closed Trades", value: "184", sub: "Year to date" },
];

export function ResearchPerformance() {
  return (
    <section id="performance" className="relative py-20 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Research Performance"
          title="Transparent track record"
          description="A live snapshot of how our research is performing — educational only, not advice."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-card/60 p-5 hover:border-[var(--gold)]/30 hover:-translate-y-0.5 transition"
                style={{ animation: `fadeUp 600ms ${i * 80}ms both` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-white/45">{s.label}</span>
                  <Icon className="h-4 w-4 text-[var(--gold)]" />
                </div>
                <p className="mt-3 text-3xl font-black gold-text">{s.value}</p>
                <p className="mt-1 text-xs text-white/55">{s.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
