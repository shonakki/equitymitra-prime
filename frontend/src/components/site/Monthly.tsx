import { SectionHeader } from "./SectionHeader";
import { Briefcase, Target, Calendar } from "lucide-react";

const IDEAS = [
  {
    s: "Defence Capex Theme",
    horizon: "6–12 months",
    return: "25–35%",
    note: "Structural order book visibility across HAL, BEL, MAZDOCK. Accumulate on dips.",
  },
  {
    s: "Banking Comeback",
    horizon: "3–6 months",
    return: "15–22%",
    note: "Large-cap private banks at reasonable valuations with strong NIMs and credit growth.",
  },
  {
    s: "EMS / Electronics",
    horizon: "9–18 months",
    return: "30–45%",
    note: "PLI-driven demand. Dixon, Kaynes, Syrma operating in a multi-year tailwind.",
  },
];

export function Monthly() {
  return (
    <section id="monthly" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Monthly Investment Ideas"
          title="Thematic ideas for serious investors"
          description="Forward-looking themes researched by our analyst desk — published the first week of every month."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {IDEAS.map((p, i) => (
            <div
              key={p.s}
              className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-[var(--gold)]/5 to-transparent p-6 hover:border-[var(--gold)]/40 transition"
            >
              <div className="flex items-center gap-2 text-[var(--gold)]">
                <Briefcase className="h-5 w-5" />
                <span className="text-xs uppercase tracking-wider font-semibold">Theme {i + 1}</span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">{p.s}</h3>
              <p className="mt-3 text-sm text-white/65 leading-relaxed">{p.note}</p>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Calendar className="h-4 w-4" /> {p.horizon}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  <Target className="h-4 w-4" /> {p.return}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
