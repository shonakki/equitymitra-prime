import { Link, useRouterState } from "@tanstack/react-router";
import {
  LineChart, TrendingUp,
  Briefcase, History, GraduationCap, StickyNote, CreditCard, User, Search, LogOut, X, BookOpen, Crown,
} from "lucide-react";
import { useAuth, usePlan } from "@/lib/auth";
import { getPlanMeta } from "@/lib/subscription";

type NavItem = {
  label: string;
  to: string;
  icon: React.ElementType;
};

const NAV: NavItem[] = [
  { label: "Markets",          to: "/app/market",       icon: LineChart },
  { label: "Analyze Your Stock", to: "/app/analyze",   icon: Search },
  { label: "Trade",            to: "/app/trades",       icon: TrendingUp },
  { label: "Portfolio Tracker",to: "/app/portfolio",    icon: Briefcase },
  { label: "Past Performance", to: "/app/performance",  icon: History },
  { label: "Learning Videos",  to: "/app/learning",     icon: GraduationCap },
  { label: "Beginner Academy", to: "/app/beginner",     icon: BookOpen },
  { label: "Founder Academy",  to: "/app/founder",      icon: Crown },
  { label: "Notes PDF Library",to: "/app/notes",        icon: StickyNote },
  { label: "My Subscription",  to: "/app/subscription", icon: CreditCard },
  { label: "Profile",          to: "/app/account",      icon: User },
];

export function AppSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  const plan = usePlan();

  const showUpgradeCard = plan !== "Founder";
  const activePlanMeta = getPlanMeta(plan);

  const upgradeLabel =
    plan === "Starter"
      ? "Unlock Premium Features"
      : plan === "Premium"
      ? "Unlock Full Library & More"
      : plan === "PremiumYearly"
      ? "Unlock Lifetime Access"
      : "Access All Features";

  return (
    <aside className="h-full w-64 shrink-0 border-r border-white/10 bg-sidebar/95 backdrop-blur flex flex-col">
      {/* Branding Area: Increased size by ~25%, increased weight, improved tracking */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <Link to="/" className="font-black tracking-[0.16em] text-white text-xl flex items-center gap-1.5 transition hover:opacity-90">
          EQUITY<span className="gold-text">MITRA</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        <div>
          {/* Section Header: Increased size slightly, improved contrast */}
          <p className="px-3 mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/50">
            Navigation
          </p>
          {/* Spacing improved, font size increased, font weight and text contrast improved */}
          <ul className="space-y-1.5">
            {NAV.map((n) => {
              const active = pathname === n.to;
              const Icon = n.icon;
              return (
                <li key={n.label}>
                  <Link
                    to={n.to}
                    onClick={onClose}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                      active
                        ? "bg-[var(--gold)]/15 text-[var(--gold)] font-bold shadow-md shadow-black/20"
                        : "text-white/80 font-semibold hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-[var(--gold)]" : "text-white/50 group-hover:text-white"}`} />
                    <span className="flex-1 tracking-wide">{n.label}</span>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] shrink-0 animate-pulse" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {showUpgradeCard && (
          <div className="rounded-xl border border-[var(--gold)]/25 bg-gradient-to-b from-[var(--gold)]/10 to-transparent p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--gold)] font-bold">
              {activePlanMeta.label}
            </p>
            <p className="mt-1 text-xs text-white/85 leading-normal">{upgradeLabel}</p>
            <Link
              to="/app/subscription"
              onClick={onClose}
              className="mt-2.5 inline-block rounded-md gold-gradient text-black text-xs font-extrabold px-3 py-1.5 shadow-md shadow-black/25 hover:opacity-90 transition"
            >
              Upgrade →
            </Link>
          </div>
        )}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-8 w-8 rounded-full gold-gradient grid place-items-center text-xs font-bold text-black shadow-inner">
            {user?.name?.[0] ?? "T"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user?.name ?? "Trader"}</p>
            <p className="text-[11px] text-white/45 truncate">+91 {user?.phone}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="text-white/50 hover:text-red-400 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
