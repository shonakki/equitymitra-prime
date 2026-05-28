import { SectionHeader } from "./SectionHeader";
import { Award, Target, Users2 } from "lucide-react";

export function About() {
  return (
    <section id="about" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionHeader
            eyebrow="About EquityMitra"
            title="Built by traders, for traders."
          />
          <p className="text-white/70 leading-relaxed">
            EquityMitra is built for traders who are serious about learning. Focused on one thing: turning dedicated learners into
            independent, profitable traders. We combine the ATE Price & Volume Concept, real market structure
            and disciplined risk management — with the kind of mentorship you wish you'd had from day one.
          </p>
          <p className="mt-4 text-white/70 leading-relaxed">
            Our team has spent a decade across prop desks and Indian equity markets. Everything we teach, we
            trade. Every call we publish, we take ourselves.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { Icon: Award, k: "10+ yrs", v: "Market exp." },
              { Icon: Users2, k: "1,000+", v: "Students" },
              { Icon: Target, k: "80%+", v: "Satisfaction" },
            ].map(({ Icon, k, v }) => (
              <div key={v} className="rounded-lg border border-white/10 bg-card p-4">
                <Icon className="h-5 w-5 text-[var(--gold)]" />
                <p className="mt-3 text-lg font-bold text-white">{k}</p>
                <p className="text-xs text-white/50 uppercase tracking-wider">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-[var(--gold)]/10 blur-2xl" />
          <blockquote className="relative rounded-2xl border border-white/10 bg-card p-8">
            <p className="gold-text text-5xl leading-none">"</p>
            <p className="mt-2 text-xl font-medium text-white leading-snug">
              The market does not reward emotion. It rewards process, patience, and protected capital.
            </p>
            <footer className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
              <div className="h-10 w-10 rounded-full gold-gradient grid place-items-center font-bold text-black">
                EM
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Founder, EquityMitra</p>
                <p className="text-xs text-white/50">Full-time trader & mentor</p>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
