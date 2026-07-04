import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, FileText, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { useAuth, usePlan } from "@/lib/auth";
import { getPlanMeta, PLANS, type PlanId } from "@/lib/subscription";
import { initiatePayment } from "@/lib/razorpay";
import { PaymentSuccess } from "@/components/app/PaymentSuccess";
import { api, ApiError } from "@/lib/api";

export const Route = createFileRoute("/app/subscription")({
  component: SubscriptionPage,
});

const PLAN_BENEFITS: Record<PlanId, string[]> = {
  Starter: [
    "Daily Nifty & Bank Nifty Levels",
    "High Accuracy Support & Resistance Levels",
    "2 Swing/Mid-Term Ideas Weekly",
    "1 Long-Term Pick Monthly",
    "Regular Trade Setups",
    "Basic Telegram Access",
  ],
  Premium: [
    "Everything in Starter",
    "Advanced Learning Videos",
    "2 New Videos Released Monthly",
    "Premium Research Ideas",
    "IPO Setups",
    "Positional Setups",
    "Portfolio Hedging",
    "Priority Support",
    "2 New PDFs Monthly (View Only)",
  ],
  PremiumYearly: [
    "Everything in Premium",
    "Full Video Library",
    "Full PDF Library",
    "Wealth Creator Reports",
    "6–7 Trade Setups For Various Market Conditions",
    "Regular Income Setups",
    "Exclusive Content",
    "Priority Support",
  ],
  BeginnerProgram: [
    "Complete Beginner Course",
    "10+ Modules",
    "30+ Videos",
    "Beginner To Confident Investor Journey",
    "Investor Awareness Program",
    "Practical Learning",
  ],
  Founder: [
    "All Current Courses",
    "All Future Courses",
    "All Present PDFs",
    "All Future PDFs",
    "Live Sessions",
    "Founder Badge",
    "Priority Support",
    "Unlimited Wealth Creator Reports",
    "All Research Categories",
    "One-Time Enrollment",
  ],
};

type PaymentState = "idle" | "loading" | "success" | "error";

function SubscriptionPage() {
  const currentPlan  = usePlan();
  const { user, updateToken } = useAuth();
  const navigate     = useNavigate();

  const activeMeta    = getPlanMeta(currentPlan);
  const activeBenefits = PLAN_BENEFITS[currentPlan];
  const upgradeOptions = PLANS.filter((p) => p.id !== currentPlan);

  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [paymentError, setPaymentError] = useState("");
  const [activatedPlan, setActivatedPlan] = useState<PlanId | null>(null);
  const [history, setHistory] = useState<Array<{ id: number; plan: string; amount: number; status: string; created_at: string }>>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Load real payment history
  useEffect(() => {
    if (!user) return;
    api.get<{ ok: boolean; data: typeof history }>("/api/payment/history")
      .then((res) => setHistory(res.data))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [user]);

  const handleUpgrade = async (planId: PlanId) => {
    if (!user) { navigate({ to: "/login" }); return; }

    setPaymentState("loading");
    setPaymentError("");

    await initiatePayment(
      planId,
      { name: user.name, phone: user.phone, email: user.email },
      (result) => {
        if (result.success && result.token && result.plan) {
          updateToken(result.token);
          setActivatedPlan(result.plan as PlanId);
          setPaymentState("success");
        } else if (result.error === "Payment cancelled") {
          setPaymentState("idle");
        } else {
          setPaymentError(result.error || "Payment failed. Try again.");
          setPaymentState("error");
        }
      },
    );
  };

  // Format amount from paise to rupees
  const formatAmount = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

  return (
    <>
      {/* Payment Success Overlay */}
      {paymentState === "success" && activatedPlan && (
        <PaymentSuccess
          plan={activatedPlan}
          onContinue={() => { setPaymentState("idle"); setActivatedPlan(null); }}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 fade-up">
        <PageHeader
          title="My Subscription"
          description="Manage your active plans and explore upgrade paths."
        />

        {paymentState === "error" && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {paymentError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Active Plan Card */}
            <div className="rounded-xl border border-white/10 bg-card/60 p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--gold)] font-bold">ACTIVE PLAN</p>
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
                  <span className="text-xs text-white/45">Member Since</span>
                  <span className="text-sm font-medium text-white">
                    {new Date(user?.memberSince ?? Date.now()).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] mb-4">Included Benefits</h3>
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

            {/* Payment History */}
            <div className="rounded-xl border border-white/10 bg-card/60 p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <FileText className="h-4 w-4 text-[var(--gold)]" />
                <h3 className="text-sm font-semibold text-white">Payment History</h3>
              </div>

              {historyLoading ? (
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-white/40 text-center py-4">No payment history yet.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">{getPlanMeta(item.plan as PlanId).label} Plan</p>
                        <p className="text-[10px] text-white/45">{new Date(item.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xs font-bold text-white">{formatAmount(item.amount)}</p>
                        <p className={`text-[10px] font-semibold ${item.status === "paid" ? "text-emerald-400" : item.status === "failed" ? "text-red-400" : "text-yellow-400"}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Legal note */}
            <p className="text-[11px] text-white/30 leading-relaxed">
              All payments are processed securely by Razorpay. EquityMitra does not store your card details.
              For refunds, see our <a href="/legal/refund" className="text-[var(--gold)]/60 hover:text-[var(--gold)]">Refund Policy</a>.
            </p>
          </div>

          {/* Right Column: Upgrade Options */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-semibold text-white/90 mb-3 px-1 font-bold">Upgrade Options</h3>

            {upgradeOptions.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-card/60 p-6 text-center text-xs text-white/50">
                You are on the highest plan (Founder Program).
              </div>
            ) : (
              upgradeOptions.map((opt) => {
                const isSpecial  = opt.id === "BeginnerProgram";
                const isFounder  = opt.id === "Founder";
                const features   = PLAN_BENEFITS[opt.id];
                const isLoading  = paymentState === "loading";

                return (
                  <div
                    key={opt.id}
                    className="rounded-xl border border-white/10 bg-card/60 overflow-hidden hover:border-[var(--gold)]/30 transition-all duration-300 flex flex-col"
                  >
                    <div className={`text-black text-[10px] font-extrabold uppercase tracking-widest text-center py-1.5 ${isFounder ? "bg-amber-500" : isSpecial ? "bg-purple-500 text-white" : "gold-gradient"}`}>
                      {opt.badge}
                    </div>

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
                        <button
                          onClick={() => handleUpgrade(opt.id)}
                          disabled={isLoading}
                          className={`w-full py-2.5 rounded-lg font-extrabold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
                            isFounder
                              ? "bg-amber-500 text-black hover:opacity-90"
                              : isSpecial
                              ? "bg-purple-600 hover:bg-purple-500 text-white"
                              : "gold-gradient text-black hover:opacity-90"
                          } disabled:opacity-50`}
                        >
                          {isLoading
                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...</>
                            : <><ExternalLink className="h-3.5 w-3.5" /> Upgrade — {opt.price}</>
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <p className="text-[10px] text-white/25 text-center leading-relaxed px-2">
              Secure payment via Razorpay. EquityMitra provides educational content only. See our{" "}
              <a href="/legal/disclaimer" className="text-[var(--gold)]/50 hover:text-[var(--gold)]">Disclaimer</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
