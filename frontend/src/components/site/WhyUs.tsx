import { ShieldCheck, BrainCircuit, GraduationCap, CandlestickChart } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const ITEMS = [
  {
    Icon: BrainCircuit,
    title: "Research Based Trading",
    desc: "Every idea backed by structure, data and technical reasoning — not tips or hype.",
  },
  {
    Icon: CandlestickChart,
    title: "ATE Price & Volume Concept",
    desc: "Read price and volume behavior through ATE concepts and real market structure.",
  },
  {
    Icon: GraduationCap,
    title: "Experience Based Learning",
    desc: "Lessons drawn from real screen time and market experience.",
  },
  {
    Icon: ShieldCheck,
    title: "Risk Management First",
    desc: "Protect capital first and focus on consistency on every setup.",
  },
];

export function WhyUs() {
  return (
    <section id="why" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why EquityMitra?"
          title="A research desk, not a tip channel"
          description="Built on process, discipline and the same concepts used by professional trading desks."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ITEMS.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-white/10 bg-card/70 backdrop-blur p-6 hover:border-[var(--gold)]/40 hover:-translate-y-1 transition-all"
            >
              <div className="h-11 w-11 rounded-lg bg-[var(--gold)]/10 border border-[var(--gold)]/30 grid place-items-center text-[var(--gold)] group-hover:gold-gradient group-hover:text-black transition">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
