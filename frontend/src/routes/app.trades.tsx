import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Bell, CheckCircle, Loader2, BookOpen, TrendingUp, Shield, Clock } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { DisclaimerBanner } from "@/components/app/DisclaimerBanner";

export const Route = createFileRoute("/app/trades")({
  component: TradesPage,
});

function TradesPage() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Enter a valid email address");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await api.post<{ ok: boolean; message: string }>("/api/notify/subscribe", {
        email,
        feature: "trades",
      });
      setMessage(res.message);
      setStatus("success");
      setEmail("");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Failed to subscribe. Try again.");
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 fade-up">
      <DisclaimerBanner variant="compact" storageKey="em.disclaimer.trades" />

      {/* Coming Soon Badge */}
      <div className="flex justify-center mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-400">
          <Clock className="h-3.5 w-3.5" />
          Coming Soon — SEBI Registration Pending
        </span>
      </div>

      {/* Main Content */}
      <div className="text-center space-y-6 mb-12">
        {/* Icon */}
        <div className="mx-auto h-24 w-24 rounded-3xl bg-gradient-to-br from-[var(--gold)]/20 to-[var(--gold)]/5 border border-[var(--gold)]/20 flex items-center justify-center">
          <TrendingUp className="h-12 w-12 text-[var(--gold)]" />
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Trade Recommendations
            <br />
            <span className="gold-text">Launching Soon</span>
          </h1>
          <div className="mt-6 mx-auto max-w-2xl rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-left space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-300 mb-1">Important Notice</p>
                <p className="text-sm text-white/70 leading-relaxed">
                  Trade Recommendations will be available after completion of our <strong className="text-white/90">SEBI Registration process</strong>.
                </p>
                <p className="text-sm text-white/60 mt-3 leading-relaxed">
                  Currently EquityMitra provides only <strong className="text-white/80">educational content</strong>, market research, investor awareness programs, and learning resources.
                </p>
                <p className="text-sm text-white/60 mt-3 leading-relaxed">
                  Trade Recommendations will be launched soon after all regulatory requirements are met.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What's Coming */}
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {[
          {
            icon: TrendingUp,
            title: "Research-Led Setups",
            desc: "Every trade idea backed by technical & fundamental analysis with entry, targets, and stop-loss.",
          },
          {
            icon: Shield,
            title: "Risk Management",
            desc: "Strict position sizing guidelines, risk-reward ratios, and capital protection frameworks.",
          },
          {
            icon: BookOpen,
            title: "Educational Context",
            desc: "Each setup explained with chart patterns, market context, and learning notes.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-white/10 bg-card/60 p-5 text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center mb-3">
              <item.icon className="h-6 w-6 text-[var(--gold)]" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">{item.title}</h3>
            <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Notify Form */}
      <div className="rounded-2xl border border-[var(--gold)]/20 bg-gradient-to-b from-[var(--gold)]/5 to-transparent p-8 text-center">
        <Bell className="mx-auto h-8 w-8 text-[var(--gold)] mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Get Notified at Launch</h2>
        <p className="text-sm text-white/55 mb-6">
          Be the first to access Trade Recommendations when we go live.
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle className="h-5 w-5" />
            {message}
          </div>
        ) : (
          <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 rounded-lg border border-white/10 bg-card/60 px-4 py-3 text-sm text-white outline-none focus:border-[var(--gold)]/60 transition"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-lg gold-gradient text-black font-bold text-sm px-5 py-3 hover:opacity-90 disabled:opacity-60 transition whitespace-nowrap"
            >
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
              Notify Me
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-xs text-red-400">{message}</p>
        )}

        <p className="mt-6 text-[10px] text-white/25 leading-relaxed max-w-sm mx-auto">
          EquityMitra is committed to full SEBI compliance. All investment research will be conducted by registered investment advisors only.
        </p>
      </div>
    </div>
  );
}
