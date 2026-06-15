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

const PLAN_FEATURES: Record<PlanId, string[]> = {
  Starter: [],
  Premium: [
    "Advanced Learning Videos (2 released monthly)",
    "Premium Research Ideas (IPO & Positional setups)",
    "Portfolio Tracker Access",
    "10 analyses/month",
    "2 new PDFs monthly (View Only)",
    "Priority Support",
  ],
  PremiumYearly: [
    "Immediate access to all released videos & PDFs",
    "PDF Downloads Enabled",
    "Wealth Creator Reports",
    "6–7 trade setups for various market conditions",
    "Regular Income Setups",
    "25 analyses/month",
    "Priority Support",
  ],
  BeginnerProgram: [
    "Complete Beginner Course",
    "10+ Modules & 30+ Videos",
    "Beginner To Confident Investor Journey",
    "Investor Awareness Program",
    "Practical Learning",
    "Lifetime Access",
  ],
  Founder: [
    "All Current & Future Courses",
    "All Present & Future PDFs",
    "Live Sessions & Workshops",
    "Founder Badge & Priority Support",
    "Unlimited Wealth Creator Reports",
    "All Research Categories & Lifetime Access",
  ],
};

export function UpgradeModal({ isOpen, onClose, requiredPlan, featureName }: UpgradeModalProps) {
  const currentPlan = usePlan();
  const { setPlan } = useAuth();

  const currentMeta = getPlanMeta(currentPlan);
  const requiredMeta = getPlanMeta(requiredPlan);

  const eligibleIds = getEligiblePlans(requiredPlan).filter((id) => id !== currentPlan);
  const eligiblePlans = PLANS.filter((p) => eligibleIds.includes(p.id));

  const handleUpgrade = (planId: PlanId) => {
    setPlan(planId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full bg-slate-950 border border-white/10 text-white rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="text-center sm:text-center pb-4 border-b border-white/5">
          <div className="mx-auto h-12 w-12 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/30 grid place-items-center mb-3">
            {requiredPlan === "Founder" ? (
              <Crown className="h-6 w-6 text-amber-400" />
            ) : (
              <Lock className="h-6 w-6 text-[var(--gold)]" />
            )}
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight">
            Unlock Premium Access
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs mt-1 leading-relaxed">
            {featureName} requires the <span className="text-[var(--gold)] font-bold">{requiredMeta.label}</span> tier.
          </DialogDescription>
        </DialogHeader>

        {/* Current Plan vs Required Plan Display */}
        <div className="mt-4 grid grid-cols-2 gap-3 p-3 rounded-xl border border-white/5 bg-black/40 text-xs">
          <div>
            <span className="text-[10px] text-white/40 block uppercase tracking-wider">Your Plan</span>
            <span className="font-extrabold text-white mt-1 inline-block">{currentMeta.label}</span>
          </div>
          <div className="text-right border-l border-white/5 pl-3">
            <span className="text-[10px] text-white/40 block uppercase tracking-wider">Required Plan</span>
            <span className="font-extrabold text-[var(--gold)] mt-1 inline-block">{requiredMeta.label}</span>
          </div>
        </div>

        {/* Upgrade Cards */}
        <div className="py-4 space-y-4">
          <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Available Upgrade Options</p>
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
                  className={`rounded-xl border p-5 transition duration-200 flex flex-col gap-4 ${accentColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/90">
                        {plan.badge}
                      </span>
                      <h3 className="text-sm font-extrabold text-white mt-2">{plan.label}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-white">{plan.price}</span>
                      <span className="text-[9px] text-white/40 block -mt-1">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features Unlocked After Upgrade */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <p className="text-[9px] font-bold text-white/60 uppercase tracking-wide">Features Unlocked After Upgrade:</p>
                    <ul className="grid gap-1.5 sm:grid-cols-2">
                      {PLAN_FEATURES[plan.id]?.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-1.5 text-[10px] text-white/70">
                          <Check className="h-3.5 w-3.5 text-[var(--gold)] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    className={`w-full py-2.5 rounded-lg text-xs tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1.5 ${btnClass}`}
                  >
                    Upgrade to {plan.label} <ArrowUpRight className="h-4 w-4" />
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
