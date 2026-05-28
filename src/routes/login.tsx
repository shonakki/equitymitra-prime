import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 600);
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(phone);
      navigate({ to: "/app/market" });
    }, 500);
  };

  return (
    <main className="min-h-screen bg-background text-foreground grid lg:grid-cols-2">
      {/* Left brand panel */}
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-black via-[#1a140a] to-black border-r border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <Link to="/" className="relative font-bold tracking-widest text-white text-sm">
          EQUITY<span className="gold-text">MITRA</span>
        </Link>
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold)]">Members Area</p>
          <h2 className="mt-3 text-4xl font-black leading-tight text-white">
            Trade With <br />
            <span className="gold-text">Logic, Not Emotion.</span>
          </h2>
          <p className="mt-5 text-sm text-white/55 max-w-md leading-relaxed">
            Daily analysis, premium trade categories, video courses and PDF notes — all in one
            professional members Login.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/75">
            {[
              "Intraday, Swing, Positional & Wealth Creator trades",
              "ATE, Breakout, Pullback setups with chart upload",
              "Video learning library + downloadable PDFs",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-[11px] text-white/35">EquityMitra by Khichi Brothers</p>
      </aside>

      {/* Right form panel */}
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="lg:hidden inline-block font-bold tracking-widest text-white text-sm mb-8"
          >
            EQUITY<span className="gold-text">MITRA</span>
          </Link>

          <h1 className="text-2xl font-bold text-white">
            {step === "phone" ? "Sign in to continue" : "Verify your number"}
          </h1>
          <p className="mt-1 text-sm text-white/55">
            {step === "phone"
              ? "We'll text you a 6-digit verification code."
              : `Code sent to +91 ${phone}. Enter any 6 digits to continue.`}
          </p>

          {step === "phone" ? (
            <form onSubmit={sendOtp} className="mt-8 space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-white/50">Mobile number</span>
                <div className="mt-2 flex items-center rounded-lg border border-white/10 bg-card/60 focus-within:border-[var(--gold)]/60 transition">
                  <span className="pl-3.5 pr-2 text-sm text-white/70 border-r border-white/10 py-3">
                    <Phone className="h-4 w-4 inline -mt-0.5 mr-1.5 text-[var(--gold)]" />
                    +91
                  </span>
                  <input
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="98765 43210"
                    className="flex-1 bg-transparent px-3 py-3 text-white outline-none tracking-wider"
                    autoFocus
                  />
                </div>
              </label>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg gold-gradient text-black font-semibold py-3 text-sm hover:opacity-90 disabled:opacity-60 transition"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Send OTP
              </button>

              <p className="text-[11px] text-white/40 leading-relaxed">
                By continuing you agree to EquityMitra's terms. This is a demo OTP flow — real SMS
                delivery requires connecting an SMS provider later.
              </p>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="mt-8 space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-white/50">Verification code</span>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-card/60 px-4 py-3 text-center text-2xl tracking-[0.6em] text-white outline-none focus:border-[var(--gold)]/60"
                  autoFocus
                />
              </label>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg gold-gradient text-black font-semibold py-3 text-sm hover:opacity-90 disabled:opacity-60 transition"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Verify & Continue
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                }}
                className="w-full text-xs text-white/55 hover:text-[var(--gold)]"
              >
                Change number
              </button>
            </form>
          )}

          <p className="mt-10 text-center text-xs text-white/40">
            <Link to="/" className="hover:text-[var(--gold)]">
              ← Back to homepage
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
