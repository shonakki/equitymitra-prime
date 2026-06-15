import { createFileRoute } from "@tanstack/react-router";
import { Check, FileText, CreditCard, Calendar, Shield } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { useAuth, usePlan } from "@/lib/auth";
import { getPlanMeta, PLANS, getMonthsSinceJoined, type PlanId } from "@/lib/subscription";

export const Route = createFileRoute("/app/subscription")({
  component: SubscriptionPage,
});

const PLAN_BENEFITS: Record<PlanId, string[]> = {
  Starter: [
    "Daily Research Ideas",
    "Watchlist Access",
    "Markets Dashboard",
    "Positional & Swing Trades",
    "Basic Telegram Access",
  ],
  Premium: [
    "Everything in Starter",
    "Mid Term, Long Term, & F&O Trades",
    "Portfolio Tracker",
    "Monthly Releasing Video Academy",
    "Monthly Releasing PDF Library (View Only)",
    "Analyze Your Stock: 10/month",
    "Premium Telegram Access",
  ],
  PremiumYearly: [
    "Everything in Premium",
    "Immediate Access to all released Videos",
    "Immediate Access to all released PDFs",
    "PDF Downloads Enabled",
    "Analyze Your Stock: 25/month",
    "Premium Reports",
  ],
  BeginnerProgram: [
    "Full Curriculum of Beginner Academy",
    "Watch all Beginner lessons",
    "Study at your own pace",
    "Lifetime Access to Beginner Academy",
  ],
  Founder: [
    "Everything in Premium Yearly",
    "Exclusive Founder Academy",
    "Wealth Creator reports & trades",
    "All stock picks",
    "Live sessions",
    "Lifetime Access",
  ],
};

const UPGRADE_FEATURES: Record<PlanId, string[]> = {
  Starter: [
    "Daily Research Ideas",
    "Watchlist Access",
    "Markets Dashboard",
    "Positional & Swing Trades",
  ],
  Premium: [
    "Everything in Starter",
    "Technicals, Fundamentals, & F&O",
    "Portfolio Tracker",
    "Monthly release video & PDF access",
  ],
  PremiumYearly: [
    "Everything in Premium",
    "Immediate access to all released content",
    "PDF downloads enabled",
    "Save ₹2,189 vs. Monthly",
  ],
  BeginnerProgram: [
    "Full Beginner Academy course",
    "Investor awareness lessons",
    "Study at your own pace",
    "Lifetime lesson access",
  ],
  Founder: [
    "Lifetime Premium Access",
    "Exclusive Founder Academy",
    "Wealth Creator reports & trades",
    "All stock picks & private AMA archive",
  ],
};

function SubscriptionPage() {
  const currentPlan = usePlan();
  const { user, setPlan, setMemberSince } = useAuth();
  
  const activeMeta = getPlanMeta(currentPlan);
  const activeBenefits = PLAN_BENEFITS[currentPlan];

  // Calculate simulated months
  const months = getMonthsSinceJoined(user?.memberSince);

  // Exclude current plan from upgrades
  const upgradeOptions = PLANS.filter((p) => p.id !== currentPlan);

  const handleUpgrade = (id: PlanId) => {
    setPlan(id);
  };

  const handleSimulateMonths = (m: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - m);
    setMemberSince(d.toISOString());
  };

  const paymentHistory = [
    { id: 1, plan: `${activeMeta.label} Plan`, date: new Date(user?.memberSince ?? Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), amount: activeMeta.price, status: "Successful" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 fade-up">
      <PageHeader
        title="My Subscription"
        description="Manage your active plans, simulate membership periods, and explore upgrades."
      />

      {/* Developer Testing Console */}
      <div className="mb-6 p-4 rounded-xl border border-dashed border-purple-500/40 bg-purple-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-400 shrink-0 animate-pulse" />
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">Developer Testing Controls</p>
            <p className="text-[10px] text-white/55">Simulate membership duration to test video/PDF release schedules. Current: {months} {months === 1 ? "month" : "months"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSimulateMonths(0)}
            className={`px-3 py-1 rounded text-[10px] font-bold border transition ${months === 0 ? "bg-purple-600 text-white border-transparent" : "border-white/10 text-white/60 hover:text-white"}`}
          >
            Just Joined (Month 0)
          </button>
          <button
            onClick={() => handleSimulateMonths(1)}
            className={`px-3 py-1 rounded text-[10px] font-bold border transition ${months === 1 ? "bg-purple-600 text-white border-transparent" : "border-white/10 text-white/60 hover:text-white"}`}
          >
            1 Month Ago (Month 1)
          </button>
          <button
            onClick={() => handleSimulateMonths(3)}
            className={`px-3 py-1 rounded text-[10px] font-bold border transition ${months === 3 ? "bg-purple-600 text-white border-transparent" : "border-white/10 text-white/60 hover:text-white"}`}
          >
            3 Months Ago (Month 3)
          </button>
          <button
            onClick={() => handleSimulateMonths(6)}
            className={`px-3 py-1 rounded text-[10px] font-bold border transition ${months === 6 ? "bg-purple-600 text-white border-transparent" : "border-white/10 text-white/60 hover:text-white"}`}
          >
            6 Months Ago (Month 6)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-4">
        {/* Left Column: Active Plan & Payment History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Plan Card */}
          <div className="rounded-xl border border-white/10 bg-card/60 p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--gold)] font-bold">
                  ACTIVE PLAN
                </p>
                <h2 className="text-3xl font-extrabold text-white mt-1">
                  {activeMeta.label} <span className="text-sm font-normal text-white/50 ml-1">Plan</span>
                </h2>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-white/45">Status</span>
                <span className="text-sm font-medium text-emerald-400">Active</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-white/45">Active Price</span>
                <span className="text-sm font-bold text-[var(--gold)]">{activeMeta.price} {activeMeta.period}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-white/45">Billing Cycle Start</span>
                <span className="text-sm font-medium text-white">
                  {new Date(user?.memberSince ?? Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] mb-4">
                Included Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-[var(--gold)]/10 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-[var(--gold)] font-bold" />
                    </div>
                    <span className="text-xs text-white/85">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment History Card */}
          <div className="rounded-xl border border-white/10 bg-card/60 p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <FileText className="h-4 w-4 text-[var(--gold)]" />
              <h3 className="text-sm font-semibold text-white">Payment History</h3>
            </div>

            <div className="space-y-3">
              {paymentHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">{item.plan}</p>
                    <p className="text-[10px] text-white/45">{item.date}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs font-bold text-white">{item.amount}</p>
                    <p className="text-[10px] font-semibold text-emerald-400">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Upgrade Options */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-white/90 mb-3 px-1">Plan Control Desk</h3>
          
          {upgradeOptions.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-card/60 p-6 text-center text-xs text-white/50">
              You are currently on the highest plan (Founder Lifetime).
            </div>
          ) : (
            upgradeOptions.map((opt, idx) => {
              const isSpecial = opt.id === "BeginnerProgram";
              const isFounder = opt.id === "Founder";
              const features = UPGRADE_FEATURES[opt.id];

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-card/60 overflow-hidden hover:border-[var(--gold)]/30 transition-all duration-300 flex flex-col"
                >
                  {/* Badge Banner */}
                  <div className={`text-black text-[10px] font-extrabold uppercase tracking-widest text-center py-1.5 ${isFounder ? "bg-amber-500" : isSpecial ? "bg-purple-500 text-white" : "gold-gradient"}`}>
                    {opt.badge}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-white">{opt.label}</h4>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black gold-text">{opt.price}</span>
                        <span className="text-[10px] text-white/40 font-medium">{opt.period}</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-white/5 flex-1">
                      {features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-[var(--gold)]/80 mt-0.5 shrink-0" />
                          <span className="text-xs text-white/70">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3">
                      {isFounder ? (
                        <button
                          onClick={() => handleUpgrade(opt.id)}
                          className="w-full py-2.5 rounded-lg bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer text-center"
                        >
                          Switch to {opt.label}
                        </button>
                      ) : isSpecial ? (
                        <button
                          onClick={() => handleUpgrade(opt.id)}
                          className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                        >
                          Switch to {opt.label}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpgrade(opt.id)}
                          className="w-full py-2.5 rounded-lg border border-[var(--gold)]/40 hover:bg-[var(--gold)]/10 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                        >
                          Switch to {opt.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
