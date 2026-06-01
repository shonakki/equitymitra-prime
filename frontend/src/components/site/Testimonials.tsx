import { SectionHeader } from "./SectionHeader";
import { UserCircle2 } from "lucide-react";

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 bg-black/30">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Member Stories"
          title="Member Results & Success Stories"
          description="Real member experiences will be displayed here."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-dashed border-white/15 bg-card/40 p-8 flex flex-col items-center text-center min-h-[220px] justify-center"
            >
              <UserCircle2 className="h-10 w-10 text-white/25" />
              <p className="mt-4 text-sm text-white/55">Member story coming soon</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-[var(--gold)]/70">
                Reserved space
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
