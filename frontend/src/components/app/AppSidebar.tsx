import { Link, useRouterState } from "@tanstack/react-router";
import {
  Eye, LineChart, TrendingUp,
  Briefcase, History, GraduationCap, StickyNote, CreditCard, User, LogOut, X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { label: "Watchlist", to: "/app", icon: Eye },
  { label: "Markets", to: "/app/market", icon: LineChart },
  { label: "Trade", to: "/app/trades", icon: TrendingUp },
  { label: "Portfolio Tracker", to: "/app/portfolio", icon: Briefcase },
  { label: "Past Performance", to: "/app/performance", icon: History },
  { label: "Learning Videos", to: "/app/learning", icon: GraduationCap },
  { label: "Notes PDF Library", to: "/app/notes", icon: StickyNote },
  { label: "My Subscription", to: "/app/account", icon: CreditCard },
  { label: "Profile", to: "/app/account", icon: User },
];

export function AppSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();

  return (
    <aside className="h-full w-64 shrink-0 border-r border-white/10 bg-sidebar/95 backdrop-blur flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <Link to="/" className="font-bold tracking-widest text-white text-base">
          EQUITY<span className="gold-text">MITRA</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <p className="px-2 mb-2 text-[10px] uppercase tracking-[0.2em] text-white/35">
            Login
          </p>
          <ul className="space-y-0.5">
            {NAV.map((n) => {
              const active = pathname === n.to;
              const Icon = n.icon;
              return (
                <li key={n.label}>
                  <Link
                    to={n.to}
                    onClick={onClose}
                    className={`group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition ${
                      active
                        ? "bg-[var(--gold)]/10 text-[var(--gold)]"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{n.label}</span>
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-xl border border-[var(--gold)]/25 bg-gradient-to-b from-[var(--gold)]/10 to-transparent p-3">
          <p className="text-[10px] uppercase tracking-wider text-[var(--gold)] font-semibold">
            Prime Member
          </p>
          <p className="mt-1 text-sm text-white">Unlock high-conviction calls + PDFs</p>
          <Link
            to="/"
            hash="pricing"
            className="mt-2 inline-block rounded-md gold-gradient text-black text-xs font-semibold px-2.5 py-1.5"
          >
            Upgrade →
          </Link>
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-8 w-8 rounded-full gold-gradient grid place-items-center text-xs font-bold text-black">
            {user?.name?.[0] ?? "T"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white truncate">{user?.name ?? "Trader"}</p>
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
