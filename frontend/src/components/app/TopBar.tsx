import { useEffect, useState } from "react";
import { Search, Bell, Menu, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { marketApi, useLiveQuote, type Quote } from "@/lib/marketApi";

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

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { user } = useAuth();
  const { data: nifty } = useLiveQuote(marketApi.nifty, 5000);
  const { data: sensex } = useLiveQuote(marketApi.sensex, 5000);
  const { data: banknifty } = useLiveQuote(marketApi.banknifty, 5000);

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

      <div className="ml-auto flex items-center gap-2 flex-1 max-w-md">
        <div className="flex-1 flex items-center gap-2 rounded-md border border-white/10 bg-card/60 px-3 py-1.5 focus-within:border-[var(--gold)]/50 transition">
          <Search className="h-3.5 w-3.5 text-white/40" />
          <input
            placeholder="Search stocks, e.g. RELIANCE…"
            className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/35"
          />
          <kbd className="hidden sm:block text-[10px] text-white/35 border border-white/10 rounded px-1.5 py-0.5">⌘ K</kbd>
        </div>
      </div>

      <button className="relative text-white/60 hover:text-white" title="Notifications">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
      </button>

      <div className="h-8 w-8 rounded-full gold-gradient grid place-items-center text-xs font-bold text-black" title={user?.phone}>
        {user?.name?.[0] ?? "T"}
      </div>
    </header>
  );
}
