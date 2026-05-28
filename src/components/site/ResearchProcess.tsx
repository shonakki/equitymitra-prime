import { SectionHeader } from "./SectionHeader";
import { TrendingUp, Layers, BarChart3, CandlestickChart, Shield, Rocket } from "lucide-react";

const STEPS = [
  { icon: TrendingUp, title: "Market Trend", desc: "Identify the dominant trend across indices and breadth." },
  { icon: Layers, title: "Price Structure", desc: "Map higher-highs, lower-lows and key inflection zones." },
  { icon: BarChart3, title: "Volume Analysis", desc: "Confirm intent with participation and delivery data." },
  { icon: CandlestickChart, title: "ATE Setup", desc: "Wait for the After-Trend-Entry trigger to align." },
  { icon: Shield, title: "Risk / Reward", desc: "Define entry, two targets and a hard stop before sizing." },
  { icon: Rocket, title: "Trade Execution", desc: "Execute mechanically and journal the outcome." },
];

export function ResearchProcess() {
  return (
    <section id="process" className="relative py-20 border-t border-white/5">
      <div className="absolute inset-0 grid-bg opacity-25 pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Research Process"
          title="How Every Trade Idea Is Created"
          description="A repeatable 6-step framework — no opinions, no guesswork."
        />

        <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li
                key={s.title}
                className="group relative rounded-2xl border border-white/10 bg-card/60 p-5 hover:border-[var(--gold)]/40 hover:-translate-y-0.5 transition"
                style={{ animation: `fadeUp 600ms ${i * 80}ms both` }}
              >
                <div className="absolute -top-3 left-5 h-7 w-7 rounded-full gold-gradient text-black grid place-items-center text-xs font-black shadow-lg">
                  {String(i + 1).padStart(2, "0")}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10 text-[var(--gold)]/50">
                    <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
                      <path d="M0 7h18M14 1l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 shrink-0 rounded-md grid place-items-center border"
                    style={{
                      background: "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(11,29,58,0.4))",
                      borderColor: "rgba(212,175,55,0.3)",
                      color: "var(--gold)",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{s.title}</h3>
                    <p className="mt-1 text-xs text-white/60 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}
