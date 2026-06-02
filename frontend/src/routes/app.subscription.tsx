import { createFileRoute } from "@tanstack/react-router";
import { Check, FileText, CreditCard, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/app/subscription")({
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const activePlanBenefits = [
    "Daily Intraday Setups",
    "Swing Trade Ideas",
    "Access to Basic Academy",
    "Private Telegram Group",
  ];

  const paymentHistory = [
    { id: 1, plan: "Starter (Yearly)", date: "Jun 30, 2025", amount: "₹14,999", status: "Successful" },
    { id: 2, plan: "Starter (Yearly)", date: "Jun 30, 2024", amount: "₹14,999", status: "Successful" },
    { id: 3, plan: "Starter (Yearly)", date: "Jun 30, 2023", amount: "₹14,999", status: "Successful" },
  ];

  const upgradeOptions = [
    {
      title: "Premium",
      badge: "MOST POPULAR",
      price: "₹399",
      period: "// Month",
      features: [
        "Everything in Starter",
        "Advanced Learning Videos",
        "Premium Research Ideas",
        "Trade Setups",
      ],
      isPopular: true,
      isLifetime: false,
    },
    {
      title: "Premium Yearly",
      badge: "BEST VALUE",
      price: "₹4,499",
      period: "// Year",
      features: [
        "Everything in Premium",
        "Priority Support",
        "Exclusive Content",
        "Save ₹289 vs. Monthly",
      ],
      isPopular: false,
      isLifetime: false,
    },
    {
      title: "Founder Lifetime",
      badge: "LIFETIME ACCESS",
      price: "₹21,000",
      period: "// One Time",
      features: [
        "Lifetime Premium Access",
        "Lifetime Learning Access",
        "All Research Ideas",
        "PDF Library",
      ],
      isPopular: false,
      isLifetime: true,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 fade-up">
      <PageHeader
        title="My Subscription"
        description="Manage your active plans and billing history."
      />

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
                  Starter <span className="text-sm font-normal text-white/50 ml-1">Plan</span>
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
                <span className="text-xs text-white/45">Renewal Date</span>
                <span className="text-sm font-medium text-white">June 30, 2026</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-white/45">Billing Period</span>
                <span className="text-sm font-medium text-white">Yearly</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--gold)] mb-4">
                Included Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePlanBenefits.map((benefit, idx) => (
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
          <h3 className="text-sm font-semibold text-white/90 mb-3 px-1">Upgrade Options</h3>
          
          {upgradeOptions.map((opt, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/10 bg-card/60 overflow-hidden hover:border-[var(--gold)]/30 transition-all duration-300 flex flex-col"
            >
              {/* Badge Banner */}
              <div className="gold-gradient text-black text-[10px] font-extrabold uppercase tracking-widest text-center py-1.5">
                {opt.badge}
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white">{opt.title}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black gold-text">{opt.price}</span>
                    <span className="text-[10px] text-white/40 font-medium">{opt.period}</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-white/5 flex-1">
                  {opt.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[var(--gold)]/80 mt-0.5 shrink-0" />
                      <span className="text-xs text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3">
                  {opt.isLifetime ? (
                    <button className="w-full py-2.5 rounded-lg gold-gradient text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer">
                      Upgrade Now
                    </button>
                  ) : (
                    <button className="w-full py-2.5 rounded-lg border border-[var(--gold)]/40 hover:bg-[var(--gold)]/10 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer">
                      Upgrade Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
