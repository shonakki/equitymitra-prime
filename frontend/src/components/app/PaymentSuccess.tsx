import { CheckCircle, Crown, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { PlanId } from "@/lib/subscription";
import { getPlanMeta } from "@/lib/subscription";

interface PaymentSuccessProps {
  plan: PlanId;
  onContinue?: () => void;
}

export function PaymentSuccess({ plan, onContinue }: PaymentSuccessProps) {
  const meta = getPlanMeta(plan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[var(--gold)]/30 bg-gradient-to-b from-[var(--gold)]/10 via-card to-card p-8 shadow-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Success Icon */}
        <div className="mx-auto h-20 w-20 rounded-full gold-gradient flex items-center justify-center mb-6 shadow-lg shadow-[var(--gold)]/30">
          <CheckCircle className="h-10 w-10 text-black" strokeWidth={2.5} />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest gold-gradient text-black mb-4">
          <Sparkles className="h-3 w-3" /> Payment Successful
        </span>

        <h2 className="text-2xl font-black text-white mt-2">
          Welcome to <span className="gold-text">{meta.label}</span>!
        </h2>
        <p className="mt-3 text-sm text-white/60 leading-relaxed">
          Your plan has been activated. You now have immediate access to all{" "}
          <strong className="text-white/80">{meta.label}</strong> features.
        </p>

        <div className="mt-6 rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-4 flex items-center justify-between">
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider text-[var(--gold)] font-bold">Active Plan</p>
            <p className="text-lg font-black text-white mt-0.5">{meta.label}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-white/40">Amount Paid</p>
            <p className="text-xl font-black text-[var(--gold)] mt-0.5">{meta.price}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {onContinue ? (
            <button
              onClick={onContinue}
              className="w-full flex items-center justify-center gap-2 rounded-xl gold-gradient text-black font-extrabold py-3 text-sm hover:opacity-90 transition"
            >
              Continue to Dashboard <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <Link
              to="/app/market"
              className="w-full flex items-center justify-center gap-2 rounded-xl gold-gradient text-black font-extrabold py-3 text-sm hover:opacity-90 transition"
            >
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            to="/app/subscription"
            className="text-xs text-white/40 hover:text-[var(--gold)] transition"
          >
            View subscription details
          </Link>
        </div>

        <p className="mt-6 text-[10px] text-white/25 leading-relaxed">
          A confirmation will be sent to your registered contact. For any issues, contact EquityMitra support.
        </p>
      </div>
    </div>
  );
}
