import { useEffect, useRef, useState } from "react";
import { Bell, Menu, TrendingUp, TrendingDown, Clock, User, CreditCard, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { marketApi, useLiveQuote, type Quote } from "@/lib/marketApi";
import { useRegion, type Region } from "@/lib/region";
import { useNavigate, Link } from "@tanstack/react-router";

const FALLBACK_TICKERS = [
  { name: "NIFTY", value: "—", chg: "—", pct: "—", up: true },
  { name: "SENSEX", value: "—", chg: "—", pct: "—", up: true },
  { name: "BANKNIFTY", value: "—", chg: "—", pct: "—", up: false },
];

const fmt = (n: number | null | undefined, d = 2) =>
  n == null || Number.isNaN(n)
    ? "—"
    : n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

function toTicker(name: string, q: Quote | null) {
  if (!q || q.ltp == null) return { name, value: "—", chg: "—", pct: "—", up: true };
  const up = (q.netChange ?? 0) >= 0;
  return {
    name,
    value: fmt(q.ltp),
    chg: `${up ? "+" : ""}${fmt(q.netChange)}`,
    pct: `${up ? "+" : ""}${fmt(q.percentChange)}%`,
    up,
  };
}

function useIstNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function MarketStatus() {
  const now = useIstNow();
  // Convert to IST (UTC+5:30)
  const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60_000);
  const day = ist.getDay(); // 0 Sun .. 6 Sat
  const mins = ist.getHours() * 60 + ist.getMinutes();
  const isWeekday = day >= 1 && day <= 5;
  const open = isWeekday && mins >= 555 && mins <= 930; // 09:15 – 15:30
  const time = ist.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return (
    <div className="hidden md:flex items-center gap-2 pr-3 mr-1 border-r border-white/10">
      <span
        className={`relative inline-flex h-2 w-2 rounded-full ${
          open ? "bg-emerald-400" : "bg-red-400"
        }`}
      >
        {open && (
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-70" />
        )}
      </span>
      <span
        className={`text-[10px] uppercase tracking-wider font-semibold ${
          open ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {open ? "Market Open" : "Market Closed"}
      </span>
      <span className="inline-flex items-center gap-1 text-[11px] text-white/55 font-mono">
        <Clock className="h-3 w-3" /> {time} IST
      </span>
    </div>
  );
}

function ProfileMenu({ user, onClose }: { user: { name?: string; email?: string | null; phone?: string | null } | null; onClose: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate({ to: "/" });
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-[#1a1a1a] shadow-2xl overflow-hidden z-50">
      {/* User info */}
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-xs font-semibold text-white truncate">{user?.name ?? "Member"}</p>
        <p className="text-[11px] text-white/45 truncate">{user?.email ?? user?.phone ?? ""}</p>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <Link
          to="/app/account"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/75 hover:bg-white/5 hover:text-white transition"
        >
          <User className="h-4 w-4 text-[var(--gold)]" />
          My Profile
        </Link>
        <Link
          to="/app/subscription"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/75 hover:bg-white/5 hover:text-white transition"
        >
          <CreditCard className="h-4 w-4 text-[var(--gold)]" />
          My Subscription
        </Link>
        <Link
          to="/app/account"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/75 hover:bg-white/5 hover:text-white transition"
        >
          <Settings className="h-4 w-4 text-[var(--gold)]" />
          Settings
        </Link>
      </div>

      {/* Logout */}
      <div className="py-1 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { user } = useAuth();
  const { region, setRegion } = useRegion();
  const { data: nifty } = useLiveQuote(marketApi.nifty, 5000);
  const { data: sensex } = useLiveQuote(marketApi.sensex, 5000);
  const { data: banknifty } = useLiveQuote(marketApi.banknifty, 5000);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const tickers = [
    toTicker("NIFTY", nifty),
    toTicker("SENSEX", sensex),
    toTicker("BANKNIFTY", banknifty),
  ];
  const displayTickers = tickers.every((t) => t.value === "—" && t.chg === "—" && t.pct === "—")
    ? FALLBACK_TICKERS
    : tickers;

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-white/10 bg-background/85 backdrop-blur flex items-center gap-3 px-3 sm:px-5">
      <button
        onClick={onMenu}
        className="lg:hidden text-white/70 hover:text-white"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <MarketStatus />

      <div className="hidden lg:flex items-center gap-4 mr-2">
        {displayTickers.map((t) => (
          <div key={t.name} className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-white/45">{t.name}</span>
            <span className="text-xs font-semibold text-white">{t.value}</span>
            <span className={`text-[11px] inline-flex items-center gap-0.5 ${t.up ? "text-emerald-400" : "text-red-400"}`}>
              {t.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {t.pct}
            </span>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="ml-auto" />

      {/* India / USA Toggle */}
      <div className="flex items-center rounded-lg border border-white/10 bg-card/60 p-0.5 gap-0.5">
        {(["IN", "US"] as Region[]).map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            title={r === "IN" ? "India" : "USA"}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition ${
              region === r
                ? "gold-gradient text-black"
                : "text-white/50 hover:text-white"
            }`}
          >
            {r === "IN" ? "🇮🇳" : "🇺🇸"}
            <span className="hidden sm:inline">{r === "IN" ? "India" : "USA"}</span>
          </button>
        ))}
      </div>

      <button className="relative text-white/60 hover:text-white" title="Notifications">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
      </button>

      {/* Profile avatar + dropdown */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen((prev) => !prev)}
          className="h-8 w-8 rounded-full gold-gradient grid place-items-center text-xs font-bold text-black hover:opacity-90 transition"
          title={user?.phone ?? user?.email ?? "User"}
          aria-label="Profile menu"
          aria-haspopup="true"
          aria-expanded={profileOpen}
        >
          {user?.name?.[0]?.toUpperCase() ?? "T"}
        </button>

        {profileOpen && (
          <ProfileMenu user={user} onClose={() => setProfileOpen(false)} />
        )}
      </div>
    </header>
  );
}
