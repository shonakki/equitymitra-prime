import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { Scale } from "lucide-react";

export const Route = createFileRoute("/legal")({
  component: LegalLayout,
});

const LEGAL_LINKS = [
  { to: "/legal/disclaimer",   label: "Disclaimer" },
  { to: "/legal/terms",        label: "Terms & Conditions" },
  { to: "/legal/privacy",      label: "Privacy Policy" },
  { to: "/legal/refund",       label: "Refund Policy" },
  { to: "/legal/risk",         label: "Risk Disclosure" },
];

function LegalLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-white/10 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link to="/" className="font-black tracking-widest text-white text-sm">
            EQUITY<span className="gold-text">MITRA</span>
          </Link>
          <span className="text-white/20">/</span>
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <Scale className="h-4 w-4 text-[var(--gold)]" />
            Legal
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 flex flex-col lg:flex-row gap-8">
        {/* Sidebar nav */}
        <aside className="lg:w-56 shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-white/35 font-bold mb-3">Legal Pages</p>
          <nav className="space-y-1">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  pathname === l.to
                    ? "bg-[var(--gold)]/15 text-[var(--gold)] font-semibold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 pt-4 border-t border-white/10">
            <Link to="/app/market" className="text-xs text-[var(--gold)]/70 hover:text-[var(--gold)]">← Back to Dashboard</Link>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 prose prose-invert prose-sm max-w-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
