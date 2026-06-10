/**
 * EquityMitra Subscription Access Control
 *
 * Single source of truth for plan capabilities.
 * All gates read from this file.
 */

export type PlanId = "Starter" | "Premium" | "PremiumYearly" | "Founder";

export interface PlanMeta {
  id: PlanId;
  label: string;
  price: string;
  period: string;
  badge: string;
  color: string;
}

export const PLANS: PlanMeta[] = [
  { id: "Starter",      label: "Starter",         price: "₹199",    period: "/ Month",    badge: "STARTER",       color: "#60a5fa" },
  { id: "Premium",      label: "Premium",         price: "₹399",    period: "/ Month",    badge: "MOST POPULAR",  color: "#d4af37" },
  { id: "PremiumYearly",label: "Premium Yearly",  price: "₹4,499",  period: "/ Year",     badge: "BEST VALUE",    color: "#d4af37" },
  { id: "Founder",      label: "Founder Lifetime",price: "₹21,000", period: "/ One Time", badge: "LIFETIME",      color: "#facc15" },
];

export function getPlanMeta(id: PlanId): PlanMeta {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

// ─── Plan tier hierarchy ───────────────────────────────────────────────────────
const PLAN_ORDER: PlanId[] = ["Starter", "Premium", "PremiumYearly", "Founder"];

export function planAtLeast(current: PlanId, required: PlanId): boolean {
  return PLAN_ORDER.indexOf(current) >= PLAN_ORDER.indexOf(required);
}

// ─── Feature access ────────────────────────────────────────────────────────────

export type TradeCategory =
  | "Positional"
  | "Swing"
  | "Mid Term"
  | "Long Term"
  | "F&O"
  | "Wealth Creator";

/** Returns which trade categories the plan can access */
export function getAllowedTradeCategories(plan: PlanId): Set<TradeCategory> {
  if (plan === "Founder") {
    return new Set<TradeCategory>(["Positional", "Swing", "Mid Term", "Long Term", "F&O", "Wealth Creator"]);
  }
  if (planAtLeast(plan, "Premium")) {
    return new Set<TradeCategory>(["Positional", "Swing", "Mid Term", "Long Term", "F&O"]);
  }
  // Starter
  return new Set<TradeCategory>(["Positional", "Swing"]);
}

/** Analyze Your Stock: monthly limit (Infinity for Founder) */
export function getAnalysisLimit(plan: PlanId): number {
  if (plan === "Founder") return Infinity;
  if (plan === "PremiumYearly") return 25;
  if (plan === "Premium") return 10;
  return 0; // Starter — no access
}

/** PDF Library: number of accessible PDFs (Infinity for full access) */
export function getPdfLimit(plan: PlanId): number {
  if (planAtLeast(plan, "PremiumYearly")) return Infinity;
  if (plan === "Premium") return 10;
  return 0; // Starter
}

/** Can the plan download PDFs? */
export function canDownloadPdf(plan: PlanId): boolean {
  return planAtLeast(plan, "PremiumYearly");
}

/** Video Academy: number of accessible videos */
export function getVideoLimit(plan: PlanId): number {
  if (planAtLeast(plan, "PremiumYearly")) return Infinity;
  if (plan === "Premium") return 5;
  return 0; // Starter
}

/** Can the plan access Portfolio Tracker? */
export function canAccessPortfolio(plan: PlanId): boolean {
  return planAtLeast(plan, "Premium");
}

/** Can the plan access Analyze Your Stock? */
export function canAccessAnalyze(plan: PlanId): boolean {
  return planAtLeast(plan, "Premium");
}

/** Can the plan access PDF Library? */
export function canAccessPdfLibrary(plan: PlanId): boolean {
  return planAtLeast(plan, "Premium");
}

/** Can the plan access Video Academy? */
export function canAccessVideoAcademy(plan: PlanId): boolean {
  return planAtLeast(plan, "Premium");
}

/** Wealth Creator — Founder only */
export function canAccessWealthCreator(plan: PlanId): boolean {
  return plan === "Founder";
}

// ─── Analyse usage tracking (localStorage) ────────────────────────────────────
function usageKey(userId: string): string {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `em.analyze.${userId}.${month}`;
}

export function getAnalyzeUsed(userId: string): number {
  try {
    const raw = localStorage.getItem(usageKey(userId));
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function recordAnalyzeUsage(userId: string): void {
  try {
    const key = usageKey(userId);
    const current = getAnalyzeUsed(userId);
    localStorage.setItem(key, String(current + 1));
  } catch {
    // ignore
  }
}

// ─── Upgrade CTA text helpers ──────────────────────────────────────────────────
export function upgradeText(requiredPlan: PlanId): {
  title: string;
  description: string;
  planLabel: string;
  planPrice: string;
} {
  const meta = getPlanMeta(requiredPlan);
  const texts: Record<PlanId, { title: string; description: string }> = {
    Starter: {
      title: "Starter Plan Required",
      description: "Upgrade to Starter to unlock this feature.",
    },
    Premium: {
      title: "Premium Plan Required",
      description: "Upgrade to Premium to unlock this feature.",
    },
    PremiumYearly: {
      title: "Premium Yearly Plan Required",
      description: "Upgrade to Premium Yearly to unlock this feature.",
    },
    Founder: {
      title: "Founder Lifetime Access Required",
      description:
        "This is an exclusive Founder feature. Upgrade to Lifetime to unlock permanently.",
    },
  };
  return {
    ...texts[requiredPlan],
    planLabel: meta.label,
    planPrice: meta.price,
  };
}
