import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/app/coming-soon")({
  validateSearch: (search: Record<string, unknown>): { feature?: string } => {
    return {
      feature: search.feature ? String(search.feature) : undefined,
    };
  },
  component: ComingSoonPage,
});

function ComingSoonPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center space-y-8 fade-up">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 animate-pulse mx-auto">
        <Clock className="h-8 w-8" />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
          USA FEATURES
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Launching Soon
        </h1>
        <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed">
          The USA section of EquityMitra is currently under development.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-card/40 p-6 text-left max-w-md mx-auto space-y-4 shadow-xl">
        <p className="text-xs uppercase tracking-wider font-semibold text-[var(--gold)]">
          Upcoming Features:
        </p>
        <ul className="space-y-2.5 text-sm text-white/80 font-medium">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            US Stock Analysis
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            US Portfolio Tracking
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            US Trading Setups
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            US Market Research
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            Learning Videos
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            PDF Library
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            Institutional Analysis
          </li>
        </ul>
      </div>

      <p className="text-[11px] text-white/40">
        These features will be released in future updates.
      </p>
    </div>
  );
}
