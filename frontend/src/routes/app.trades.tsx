import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { TradeCard, type Trade } from "@/components/app/TradeCard";
import { Plus, Lock, Crown } from "lucide-react";
import { usePlan } from "@/lib/auth";
import { getAllowedTradeCategories, canAccessWealthCreator } from "@/lib/subscription";
import { UpgradeGate } from "@/components/app/UpgradeGate";
import type { PlanId } from "@/lib/subscription";

export const Route = createFileRoute("/app/trades")({
  component: TradesPage,
});

const CATS = ["Positional", "Swing", "Mid Term", "Long Term", "F&O", "Wealth Creator"] as const;
type Cat = typeof CATS[number];

/** Plan required to unlock each category */
const CAT_PLAN: Record<Cat, PlanId> = {
  "Positional":     "Starter",
  "Swing":          "Starter",
  "Mid Term":       "Premium",
  "Long Term":      "Premium",
  "F&O":            "Premium",
  "Wealth Creator": "Founder",
};

const ALL: Trade[] = [
  {
    s: "RELIANCE", exch: "NSE • F&O", category: "F&O", side: "Bullish", setup: "Breakout",
    entry: "2,945", t1: "2,985", t2: "3,020", sl: "2,922",
    risk: "Low", potential: "+2.5%",
    notes: "Breakout above prior swing high with rising volume. Volume confirming the move.",
  },
  {
    s: "TATAMOTORS", exch: "NSE • Daily", category: "Swing", side: "Bullish", setup: "ATE",
    entry: "968", t1: "1,005", t2: "1,040", sl: "948",
    risk: "Medium", potential: "+7.4%",
    notes: "After-Trend-Entry on daily with strong follow-through volume. Auto breadth supportive.",
  },
  {
    s: "HDFCBANK", exch: "NSE • Daily", category: "Positional", side: "Bearish", setup: "Reversal",
    entry: "1,648", t1: "1,612", t2: "1,580", sl: "1,672",
    risk: "Medium", potential: "+4.1%",
    notes: "Rejection from supply zone with weak follow-through. Banknifty heaviness adds confluence.",
  },
  {
    s: "DIVISLAB", exch: "NSE • Weekly", category: "Mid Term", side: "Bullish", setup: "Pullback",
    entry: "4,210", t1: "4,520", t2: "4,860", sl: "4,020",
    risk: "Low", potential: "+15.4%",
    notes: "Pullback into demand on weekly with rising relative strength vs Nifty Pharma.", premium: true,
  },
  {
    s: "VBL", exch: "NSE • Weekly", category: "Long Term", side: "Bullish", setup: "Trend Continuation",
    entry: "1,520", t1: "1,720", t2: "1,950", sl: "1,420",
    risk: "Low", potential: "+28.3%",
    notes: "Trend continuation post a clean higher-low structure. Premium valuation justified by FCF growth.", premium: true,
  },
  {
    s: "KAYNES", exch: "NSE • Weekly", category: "Wealth Creator", side: "Bullish", setup: "ATE",
    entry: "5,420", t1: "7,200", t2: "9,400", sl: "4,800",
    risk: "High", potential: "+73.4%",
    notes: "EMS sector tailwind + capacity expansion thesis. Position-size strictly per risk plan.", premium: true,
  },
  {
    s: "JSWSTEEL", exch: "NSE • Daily", category: "Positional", side: "Bullish", setup: "Breakout",
    entry: "918", t1: "962", t2: "1,005", sl: "892",
    risk: "Medium", potential: "+9.4%",
    notes: "Breakout from multi-week base on rising volumes. Metals sector turning.",
  },
  {
    s: "TITAN", exch: "NSE • Daily", category: "Swing", side: "Bullish", setup: "Pullback",
    entry: "3,420", t1: "3,540", t2: "3,680", sl: "3,360",
    risk: "Low", potential: "+7.6%",
    notes: "Healthy pullback to 50-DEMA. Consumption theme intact.",
  },
  {
    s: "NIFTY", exch: "NSE • F&O", category: "F&O", side: "Bullish", setup: "Breakout",
    entry: "17,500", t1: "18,200", t2: "18,900", sl: "17,200",
    risk: "Medium", potential: "+6.0%",
    notes: "Index breakout on strong open interest and momentum.",
  },
];

function CategoryTabs({
  active,
  onChange,
  allowed,
}: {
  active: Cat;
  onChange: (c: Cat) => void;
  allowed: Set<Cat>;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-card/60 p-2 flex items-center gap-1 overflow-x-auto">
      {CATS.map((c) => {
        const isAllowed = allowed.has(c);
        const isActive = active === c;
        const isFounderOnly = CAT_PLAN[c] === "Founder";
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`shrink-0 rounded-md px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
              isActive
                ? "gold-gradient text-black"
                : isAllowed
                ? "text-white/70 hover:text-white hover:bg-white/5"
                : "text-white/35 hover:bg-white/5 cursor-pointer"
            }`}
          >
            {!isAllowed && (
              isFounderOnly
                ? <Crown className="h-3 w-3 shrink-0 text-amber-400" />
                : <Lock className="h-3 w-3 shrink-0" />
            )}
            {c}
          </button>
        );
      })}
    </div>
  );
}

function TradesPage() {
  const plan = usePlan();
  const allowed = getAllowedTradeCategories(plan);
  const isWealthCreatorAllowed = canAccessWealthCreator(plan);

  // Default to first accessible category
  const defaultCat = allowed.has("Positional") ? "Positional" : CATS[0];
  const [active, setActive] = useState<Cat>(defaultCat);

  const handleTabChange = (c: Cat) => {
    setActive(c);
  };

  // Check if current tab is locked
  const isCurrentLocked = !allowed.has(active);
  const requiredPlan = CAT_PLAN[active];

  const visible = ALL.filter((t) => t.category === active);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <PageHeader
        eyebrow="Trade Ideas"
        title="Daily research-led setups"
        description="Filter by timeframe. Every idea ships with entry, two targets, stop loss and a documented thesis."
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[var(--gold)]/40 text-[var(--gold)] text-xs font-semibold px-3 py-2 hover:bg-[var(--gold)]/5 transition">
            <Plus className="h-3.5 w-3.5" /> Admin: Add Trade
          </button>
        }
      />

      <CategoryTabs active={active} onChange={handleTabChange} allowed={allowed} />

      {isCurrentLocked ? (
        <div className="mt-8">
          <UpgradeGate
            requiredPlan={requiredPlan}
            feature={`${active} Trades`}
            description={
              active === "Wealth Creator"
                ? "Wealth Creator is an exclusive Founder feature — long-duration, high-conviction ideas with 70%+ return potential."
                : `${active} trade ideas are available from the ${requiredPlan} plan and above.`
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-white/45">
              No {active.toLowerCase()} setups posted yet. Check back soon.
            </div>
          ) : (
            visible.map((t, i) => <TradeCard key={t.s + t.category} t={t} index={i} />)
          )}
        </div>
      )}
    </div>
  );
}

