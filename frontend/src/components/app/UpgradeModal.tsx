import { X, Lock, Crown, ArrowUpRight, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth, usePlan } from "@/lib/auth";
import type { PlanId } from "@/lib/subscription";
import { PLANS, getPlanMeta } from "@/lib/subscription";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPlan: PlanId;
  featureName: string;
}

const getEligiblePlans = (required: PlanId): PlanId[] => {
  if (required === "BeginnerProgram") {
    return ["BeginnerProgram", "Founder"];
  }
  if (required === "Premium") {
    return ["Premium", "PremiumYearly", "Founder"];
  }
  if (required === "PremiumYearly") {
    return ["PremiumYearly", "Founder"];
  }
  if (required === "Founder") {
    return ["Founder"];
  }
  return ["Premium", "PremiumYearly", "Founder"];
};

export function UpgradeModal({ isOpen, onClose, requiredPlan, featureName }: UpgradeModalProps) {
  const currentPlan = usePlan();
  const { setPlan } = useAuth();

  const eligibleIds = getEligiblePlans(requiredPlan).filter((id) => id !== currentPlan);
  const eligiblePlans = PLANS.filter((p) => eligibleIds.includes(p.id));

  const handleUpgrade = (planId: PlanId) => {
    setPlan(planId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full bg-slate-950 border border-white/10 text-white rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="text-center sm:text-center pb-4 border-b border-white/5">
          <div className="mx-auto h-12 w-12 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/30 grid place-items-center mb-3">
            {requiredPlan === "Founder" ? (
              <Crown className="h-6 w-6 text-amber-400" />
            ) : (
              <Lock className="h-6 w-6 text-[var(--gold)]" />
            )}
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight">
            Unlock Premium Feature
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs mt-1 leading-relaxed">
            {featureName} is locked under your current plan. Choose an option below to upgrade instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {eligiblePlans.length === 0 ? (
            <p className="text-center text-xs text-white/50 py-4">
              No higher plans available. Please contact support.
            </p>
          ) : (
            eligiblePlans.map((plan) => {
              const isSpecial = plan.id === "BeginnerProgram";
              const isFounder = plan.id === "Founder";
              const accentColor = isFounder
                ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                : isSpecial
                ? "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50"
                : "border-[var(--gold)]/30 bg-[var(--gold)]/5 hover:border-[var(--gold)]/50";
              const btnClass = isFounder
                ? "bg-amber-500 text-black hover:bg-amber-400 font-extrabold"
                : isSpecial
                ? "bg-purple-600 text-white hover:bg-purple-500 font-extrabold"
                : "gold-gradient text-black font-extrabold";

              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-4 transition duration-200 flex flex-col justify-between gap-3 ${accentColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/90">
                        {plan.badge}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5">{plan.label}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-white">{plan.price}</span>
                      <span className="text-[9px] text-white/40 block -mt-1">{plan.period}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-white/50 leading-normal">
                    {plan.id === "BeginnerProgram"
                      ? "Get full lifetime access to the Beginner Academy curriculum and tutorials."
                      : plan.id === "Premium"
                      ? "Unlock monthly releasing videos/PDFs, trades, Portfolio Tracker, and more."
                      : plan.id === "PremiumYearly"
                      ? "Unlock immediate access to all released videos & PDFs, downloads, and Premium reports."
                      : "Lifetime access to all features, Wealth Creator, stock picks, and AMA sessions."}
                  </p>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    className={`w-full py-2 rounded-lg text-xs tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1 ${btnClass}`}
                  >
                    Upgrade Now <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
          <span>Instant activation</span>
          <span>Cancel anytime</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
