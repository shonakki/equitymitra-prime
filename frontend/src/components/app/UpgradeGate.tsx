import { Link } from "@tanstack/react-router";
import { Lock, Crown, ArrowUpRight } from "lucide-react";
import type { PlanId } from "@/lib/subscription";
import { upgradeText, getPlanMeta } from "@/lib/subscription";

type Variant = "page" | "inline" | "overlay";

interface UpgradeGateProps {
  requiredPlan: PlanId;
  feature?: string;
  variant?: Variant;
  /** Override description text */
  description?: string;
}

function PlanBadge({ plan }: { plan: PlanId }) {
  const meta = getPlanMeta(plan);
  const isFounder = plan === "Founder";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
        isFounder
          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
          : "bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30"
      }`}
    >
      <Crown className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

/** Full-page upgrade gate — replaces entire page content */
function PageGate({ requiredPlan, feature, description }: UpgradeGateProps) {
  const { title, description: defaultDesc, planLabel, planPrice } = upgradeText(requiredPlan);
  const isFounder = requiredPlan === "Founder";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center flex flex-col items-center gap-6">
      <div
        className={`h-20 w-20 rounded-2xl grid place-items-center ${
          isFounder
            ? "bg-amber-500/10 border border-amber-500/20"
            : "bg-[var(--gold)]/10 border border-[var(--gold)]/20"
        }`}
      >
        {isFounder ? (
          <Crown className="h-9 w-9 text-amber-400" />
        ) : (
          <Lock className="h-9 w-9 text-[var(--gold)]" />
        )}
      </div>

      <div className="space-y-2">
        <PlanBadge plan={requiredPlan} />
        <h2 className="text-2xl font-bold text-white mt-3">{feature ?? title}</h2>
        <p className="text-sm text-white/55 leading-relaxed max-w-md mx-auto">
          {description ?? defaultDesc}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-card/60 px-8 py-5 text-center space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-white/40">Unlock with</p>
        <p className="text-3xl font-black text-white">
          {planPrice}
          {requiredPlan !== "Founder" && (
            <span className="text-sm font-normal text-white/40 ml-1">/mo</span>
          )}
        </p>
        <p className="text-xs text-white/55">{planLabel} Plan</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/app/subscription"
          className="inline-flex items-center gap-2 rounded-xl gold-gradient text-black font-bold text-sm px-6 py-3 hover:opacity-90 transition"
        >
          Upgrade to {planLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          to="/app/subscription"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 text-white text-sm font-semibold px-6 py-3 hover:bg-white/5 transition"
        >
          View all plans
        </Link>
      </div>

      <p className="text-xs text-white/30">
        30-day money-back guarantee · Cancel anytime
      </p>
    </div>
  );
}

/** Inline lock card — replaces a card/section */
function InlineGate({ requiredPlan, feature, description }: UpgradeGateProps) {
  const { description: defaultDesc } = upgradeText(requiredPlan);
  const meta = getPlanMeta(requiredPlan);
  const isFounder = requiredPlan === "Founder";

  return (
    <div
      className={`rounded-xl border p-6 text-center flex flex-col items-center gap-4 ${
        isFounder
          ? "border-amber-500/20 bg-amber-500/5"
          : "border-[var(--gold)]/20 bg-[var(--gold)]/5"
      }`}
    >
      <div
        className={`h-12 w-12 rounded-xl grid place-items-center ${
          isFounder
            ? "bg-amber-500/10 text-amber-400"
            : "bg-[var(--gold)]/10 text-[var(--gold)]"
        }`}
      >
        {isFounder ? <Crown className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
      </div>
      <div>
        <PlanBadge plan={requiredPlan} />
        {feature && <p className="text-sm font-semibold text-white mt-2">{feature}</p>}
        <p className="text-xs text-white/50 mt-1 max-w-xs mx-auto">
          {description ?? defaultDesc}
        </p>
      </div>
      <Link
        to="/app/subscription"
        className="inline-flex items-center gap-1.5 rounded-lg gold-gradient text-black text-xs font-bold px-4 py-2 hover:opacity-90 transition"
      >
        Upgrade — {meta.price}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

/** Overlay on top of blurred content */
function OverlayGate({ requiredPlan, feature, description }: UpgradeGateProps) {
  const { description: defaultDesc } = upgradeText(requiredPlan);
  const meta = getPlanMeta(requiredPlan);
  const isFounder = requiredPlan === "Founder";

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-black/70 backdrop-blur-sm text-center p-4">
      <div
        className={`h-10 w-10 rounded-xl grid place-items-center ${
          isFounder ? "bg-amber-500/20 text-amber-400" : "bg-[var(--gold)]/20 text-[var(--gold)]"
        }`}
      >
        {isFounder ? <Crown className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
      </div>
      <div>
        <PlanBadge plan={requiredPlan} />
        {feature && (
          <p className="text-sm font-semibold text-white mt-2">{feature}</p>
        )}
        <p className="text-[11px] text-white/50 mt-1 max-w-[200px] mx-auto">
          {description ?? defaultDesc}
        </p>
      </div>
      <Link
        to="/app/subscription"
        className="inline-flex items-center gap-1.5 rounded-lg gold-gradient text-black text-[11px] font-bold px-3 py-1.5 hover:opacity-90 transition"
      >
        Upgrade — {meta.price}
      </Link>
    </div>
  );
}

/**
 * UpgradeGate — renders the correct lock UI variant.
 *
 * - `page` (default): full-page replacement
 * - `inline`: card-level lock block
 * - `overlay`: absolute overlay over blurred content
 */
export function UpgradeGate({
  requiredPlan,
  feature,
  variant = "page",
  description,
}: UpgradeGateProps) {
  if (variant === "inline") {
    return (
      <InlineGate
        requiredPlan={requiredPlan}
        feature={feature}
        description={description}
      />
    );
  }
  if (variant === "overlay") {
    return (
      <OverlayGate
        requiredPlan={requiredPlan}
        feature={feature}
        description={description}
      />
    );
  }
  return (
    <PageGate
      requiredPlan={requiredPlan}
      feature={feature}
      description={description}
    />
  );
}
