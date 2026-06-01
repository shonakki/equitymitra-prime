import { Check } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const POINTS = [
  "Process over prediction",
  "Risk management first",
  "Real market experience",
  "Research driven approach",
  "Capital preservation",
];

export function MarketPhilosophy() {
  return (
    <section id="philosophy" className="relative py-16 sm:py-20 border-t border-white/5">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Market Philosophy" title="Trade With Logic, Not Emotion" />
        <div
          className="rounded-2xl border p-8 sm:p-10"
          style={{
            borderColor: "rgba(212,175,55,0.25)",
            background:
              "linear-gradient(135deg, rgba(212,175,55,0.06), rgba(11,29,58,0.35))",
          }}
        >
          <ul className="grid sm:grid-cols-2 gap-4">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 h-5 w-5 rounded-full grid place-items-center bg-[var(--gold)]/15 border border-[var(--gold)]/40 text-[var(--gold)]">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-sm text-white/85">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
