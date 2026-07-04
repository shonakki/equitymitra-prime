/**
 * EquityMitra Subscription Access Control
 *
 * Single source of truth for plan capabilities.
 * All gates read from this file.
 */

export type PlanId = "Starter" | "Premium" | "PremiumYearly" | "BeginnerProgram" | "Founder";

export interface PlanMeta {
  id: PlanId;
  label: string;
  price: string;
  period: string;
  badge: string;
  color: string;
}

export const PLANS: PlanMeta[] = [
  { id: "Starter",         label: "Starter",                       price: "₹199",   period: "/ Month",    badge: "STARTER",       color: "#60a5fa" },
  { id: "Premium",         label: "Premium",                       price: "₹599",   period: "/ Month",    badge: "MOST POPULAR",  color: "#d4af37" },
  { id: "PremiumYearly",   label: "Premium Yearly",                price: "₹4,999", period: "/ Year",     badge: "BEST VALUE",    color: "#d4af37" },
  { id: "BeginnerProgram", label: "Beginner Program",              price: "₹9,999", period: "/ One Time", badge: "SPECIALIZED",   color: "#a855f7" },
  { id: "Founder",         label: "Founder Program",              price: "₹21,000",period: "/ One Time", badge: "ONE TIME",      color: "#facc15" },
];

export function getPlanMeta(id: PlanId): PlanMeta {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

// ─── Plan tier hierarchy ───────────────────────────────────────────────────────
const PLAN_ORDER: PlanId[] = ["Starter", "Premium", "PremiumYearly", "BeginnerProgram", "Founder"];

export function planAtLeast(current: PlanId, required: PlanId): boolean {
  return PLAN_ORDER.indexOf(current) >= PLAN_ORDER.indexOf(required);
}

// ─── Helper to calculate months since joined ──────────────────────────────────
export function getMonthsSinceJoined(memberSince: string | undefined): number {
  if (!memberSince) return 0;
  try {
    const start = new Date(memberSince);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    return Math.max(0, years * 12 + months);
  } catch {
    return 0;
  }
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
  if (plan === "Premium" || plan === "PremiumYearly") {
    return new Set<TradeCategory>(["Positional", "Swing", "Mid Term", "Long Term", "F&O"]);
  }
  // Starter and BeginnerProgram
  return new Set<TradeCategory>(["Positional", "Swing"]);
}

/** Analyze Your Stock: monthly limit (Infinity for Founder) */
export function getAnalysisLimit(plan: PlanId): number {
  if (plan === "Founder") return Infinity;
  if (plan === "PremiumYearly") return 25;
  if (plan === "Premium") return 10;
  return 0; // Starter / BeginnerProgram — no access
}

/** Can the plan download PDFs? Only Premium Yearly and Founder */
export function canDownloadPdf(plan: PlanId): boolean {
  return plan === "PremiumYearly" || plan === "Founder";
}

/** Can the plan access Portfolio Tracker? */
export function canAccessPortfolio(plan: PlanId): boolean {
  return plan === "Premium" || plan === "PremiumYearly" || plan === "Founder";
}

/** Can the plan access Analyze Your Stock? */
export function canAccessAnalyze(plan: PlanId): boolean {
  return plan === "Premium" || plan === "PremiumYearly" || plan === "Founder";
}

/** Can the plan access PDF Library? */
export function canAccessPdfLibrary(plan: PlanId): boolean {
  return plan === "Premium" || plan === "PremiumYearly" || plan === "Founder";
}

/** Can the plan access Video Academy? */
export function canAccessVideoAcademy(plan: PlanId): boolean {
  return plan === "Premium" || plan === "PremiumYearly" || plan === "Founder";
}

/** Can the plan access Beginner Academy? */
export function canAccessBeginnerAcademy(plan: PlanId): boolean {
  return plan === "BeginnerProgram" || plan === "Founder";
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
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(usageKey(userId));
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function recordAnalyzeUsage(userId: string): void {
  if (typeof window === "undefined") return;
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
      title: "Premium Yearly Required",
      description: "Upgrade to Premium Yearly to unlock this feature.",
    },
    BeginnerProgram: {
      title: "Beginner Program Required",
      description: "Get the Beginner Program to unlock this lesson.",
    },
    Founder: {
      title: "Founder Lifetime Required",
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
