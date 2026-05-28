import { SectionHeader } from "./SectionHeader";
import { Check, Sparkles, Crown } from "lucide-react";

type Plan = {
  name: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  founder?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "₹199",
    period: "/ month",
    features: [
      "Daily research ideas",
      "Daily Nifty levels",
      "Weekly stock picks",
      "Telegram access",
      "Daily market overview",
    ],
    cta: "Join Starter",
  },
  {
    name: "Premium",
    price: "₹399",
    period: "/ month",
    features: [
      "Everything in Starter",
      "Advanced learning videos",
      "Premium research ideas",
      "Trade setups",
      "Notes PDF access",
      "Live sessions",
    ],
    cta: "Go Premium",
  },
  {
    name: "Premium Yearly",
    price: "₹4,499",
    period: "/ year",
    badge: "Most Popular",
    highlight: true,
    features: [
      "Everything in Premium",
      "Save vs monthly",
      "Priority support",
      "Exclusive content",
    ],
    cta: "Choose Yearly",
  },
  {
    name: "Founder Lifetime",
    price: "₹21,000",
    period: "one-time",
    badge: "First 1000 Members Only",
    founder: true,
    features: [
      "Lifetime premium access",
      "All present courses",
      "All future courses included",
      "Notes library",
      "Telegram community",
      "Weekly live sessions",
      "Priority support",
      "Founder badge",
      "Early access features",
    ],
    cta: "Claim Founder Seat",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Premium Plans"
          title="Simple, transparent pricing"
          description="No hidden fees. Cancel anytime. All prices in INR."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((p) => {
            const isFounder = p.founder;
            return (
              <div
                key={p.name}
                className={`relative rounded-2xl p-7 border transition flex flex-col ${
                  isFounder
                    ? "border-[var(--gold)]/70 bg-gradient-to-b from-[var(--gold)]/15 via-[var(--gold)]/5 to-card glow-gold"
                    : p.highlight
                      ? "border-[var(--gold)]/50 bg-gradient-to-b from-[var(--gold)]/10 to-card"
                      : "border-white/10 bg-card hover:border-white/20"
                }`}
                style={
                  isFounder
                    ? { boxShadow: "0 0 60px -10px rgba(212,175,55,0.35)" }
                    : undefined
                }
              >
                {p.badge && (
                  <span
                    className={`absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      isFounder || p.highlight
                        ? "gold-gradient text-black"
                        : "bg-white/10 text-white border border-white/15"
                    }`}
                  >
                    {isFounder ? <Crown className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                    {p.badge}
                  </span>
                )}
                <h3 className="mt-2 text-xl font-bold text-white flex items-center gap-2">
                  {p.name}
                  {isFounder && <Crown className="h-4 w-4 text-[var(--gold)]" />}
                </h3>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{p.price}</span>
                  <span className="text-white/50 text-sm">{p.period}</span>
                </div>
                <ul className="mt-6 space-y-2.5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                      <Check className="h-4 w-4 text-[var(--gold)] mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`mt-7 w-full rounded-md px-5 py-2.5 text-sm font-bold transition ${
                    isFounder || p.highlight
                      ? "gold-gradient text-black hover:opacity-90"
                      : "border border-white/15 text-white hover:bg-white/5"
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
