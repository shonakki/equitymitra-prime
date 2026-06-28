import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Users, CreditCard, TrendingUp,
  Video, FileText, Megaphone, Settings, LogOut, ShieldCheck
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV_ITEMS = [
  { to: "/admin",              label: "Dashboard",     icon: LayoutDashboard, exact: true },
  { to: "/admin/users",        label: "Users",         icon: Users },
  { to: "/admin/payments",     label: "Payments",      icon: CreditCard },
  { to: "/admin/trades",       label: "Trades CMS",    icon: TrendingUp },
  { to: "/admin/videos",       label: "Videos CMS",    icon: Video },
  { to: "/admin/pdfs",         label: "PDFs CMS",      icon: FileText },
  { to: "/admin/announcements",label: "Announcements", icon: Megaphone },
  { to: "/admin/settings",     label: "Settings",      icon: Settings },
];

function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    // Client-side gate. Auth state hydrates from localStorage on mount.
    const t = setTimeout(() => {
      if (!user) { navigate({ to: "/login" }); return; }
      if (!isAdmin) { navigate({ to: "/app/market" }); }
    }, 50);
    return () => clearTimeout(t);
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Admin Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/10 bg-[oklch(0.14_0.01_60)] flex flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link to="/" className="text-xs font-black tracking-widest text-white">
            EQUITY<span className="gold-text">MITRA</span>
          </Link>
          <div className="mt-2 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--gold)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gold)]">Admin Panel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-[var(--gold)]/15 text-[var(--gold)] font-semibold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-5 pt-3 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full gold-gradient grid place-items-center text-[10px] font-bold text-black">
              {user.name?.[0] ?? "A"}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{user.name}</p>
              <p className="text-[10px] text-white/40">{user.phone || user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate({ to: "/login" }); }}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-red-400 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
