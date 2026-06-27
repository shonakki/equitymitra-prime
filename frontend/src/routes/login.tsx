import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Phone, Mail, ShieldCheck, ArrowRight, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { error?: string } => {
    return {
      error: search.error ? String(search.error) : undefined,
    };
  },
  component: LoginPage,
});

type Step = "method" | "phone" | "email" | "otp";
type Method = "phone" | "email";

const RESEND_COOLDOWN = 30; // seconds

function LoginPage() {
  const [method, setMethod]     = useState<Method>("phone");
  const [step, setStep]         = useState<Step>("phone");
  const [phone, setPhone]       = useState("");
  const [email, setEmail]       = useState("");
  const [otp, setOtp]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { loginWithToken } = useAuth();
  const navigate           = useNavigate();
  const { error: searchError } = Route.useSearch();

  useEffect(() => {
    if (searchError) {
      setError(searchError);
    }
  }, [searchError]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [countdown]);

  const startCountdown = () => setCountdown(RESEND_COOLDOWN);

  const identifier = method === "phone" ? phone : email;

  // ─── Send OTP ──────────────────────────────────────────────────────────────
  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (method === "phone") {
      if (!/^[6-9]\d{9}$/.test(phone)) {
        setError("Enter a valid 10-digit mobile number");
        return;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Enter a valid email address");
        return;
      }
    }

    setLoading(true);
    try {
      await api.post("/api/auth/send-otp", method === "phone" ? { phone } : { email });
      setStep("otp");
      startCountdown();
      setSuccess(`OTP sent to ${method === "phone" ? `+91 ${phone}` : email}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP ────────────────────────────────────────────────────────────
  const resendOtp = async () => {
    if (countdown > 0) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post("/api/auth/send-otp", method === "phone" ? { phone } : { email });
      startCountdown();
      setSuccess("New OTP sent!");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Verify OTP ────────────────────────────────────────────────────────────
  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{ ok: boolean; token: string; user: { id: number; phone: string | null; email: string | null; name: string; plan: string; isAdmin: boolean } }>(
        "/api/auth/verify-otp",
        {
          ...(method === "phone" ? { phone } : { email }),
          otp,
          deviceInfo: navigator.userAgent,
        },
      );

      loginWithToken(res.token, {
        id:      res.user.id,
        phone:   res.user.phone,
        email:   res.user.email,
        name:    res.user.name,
        plan:    res.user.plan as Parameters<typeof loginWithToken>[1]["plan"],
        isAdmin: res.user.isAdmin,
      });

      navigate({ to: "/app/market" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Google login is not configured yet.");
      return;
    }
    const params = new URLSearchParams({
      client_id:     clientId,
      redirect_uri:  `${window.location.origin}/login/google-callback`,
      response_type: "token id_token",
      scope:         "openid email profile",
      nonce:         Math.random().toString(36).slice(2),
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
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
            Invest With <br />
            <span className="gold-text">Logic, Not Emotion.</span>
          </h2>
          <p className="mt-5 text-sm text-white/55 max-w-md leading-relaxed">
            Daily research, premium learning videos, investor awareness programs, and PDF notes — all in one professional platform.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/75">
            {[
              "Video learning library + downloadable PDFs",
              "Beginner to Confident Investor programs",
              "Live market data & analysis tools",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative space-y-2">
          <p className="text-[11px] text-white/35">
            EquityMitra provides educational content and investor awareness only.
          </p>
          <p className="text-[11px] text-white/35">
            By logging in you agree to our{" "}
            <Link to="/legal/terms" className="text-[var(--gold)]/60 hover:text-[var(--gold)]">Terms</Link>
            {" & "}
            <Link to="/legal/disclaimer" className="text-[var(--gold)]/60 hover:text-[var(--gold)]">Disclaimer</Link>.
          </p>
        </div>
      </aside>

      {/* Right form panel */}
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden inline-block font-bold tracking-widest text-white text-sm mb-8">
            EQUITY<span className="gold-text">MITRA</span>
          </Link>

          <h1 className="text-2xl font-bold text-white">
            {step === "otp" ? "Verify your identity" : "Sign in to continue"}
          </h1>
          <p className="mt-1 text-sm text-white/55">
            {step === "otp"
              ? `Code sent to ${method === "phone" ? `+91 ${phone}` : email}.`
              : "Enter your mobile number or email to get a login code."}
          </p>

          {/* Method toggle */}
          {step !== "otp" && (
            <div className="mt-6 flex rounded-lg border border-white/10 bg-card/60 p-1 gap-1">
              <button
                onClick={() => { setMethod("phone"); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition ${method === "phone" ? "gold-gradient text-black" : "text-white/60 hover:text-white"}`}
              >
                <Phone className="h-3.5 w-3.5" /> Mobile OTP
              </button>
              <button
                onClick={() => { setMethod("email"); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition ${method === "email" ? "gold-gradient text-black" : "text-white/60 hover:text-white"}`}
              >
                <Mail className="h-3.5 w-3.5" /> Email OTP
              </button>
            </div>
          )}

          {/* Phone form */}
          {step !== "otp" && method === "phone" && (
            <form onSubmit={sendOtp} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-white/50">Mobile number</span>
                <div className="mt-2 flex items-center rounded-lg border border-white/10 bg-card/60 focus-within:border-[var(--gold)]/60 transition">
                  <span className="pl-3.5 pr-2 text-sm text-white/70 border-r border-white/10 py-3">
                    <Phone className="h-4 w-4 inline -mt-0.5 mr-1.5 text-[var(--gold)]" />+91
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
              {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
              <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg gold-gradient text-black font-semibold py-3 text-sm hover:opacity-90 disabled:opacity-60 transition">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Send OTP
              </button>
            </form>
          )}

          {/* Email form */}
          {step !== "otp" && method === "email" && (
            <form onSubmit={sendOtp} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-white/50">Email address</span>
                <div className="mt-2 flex items-center rounded-lg border border-white/10 bg-card/60 focus-within:border-[var(--gold)]/60 transition">
                  <span className="pl-3.5 pr-2 text-sm text-white/70 border-r border-white/10 py-3">
                    <Mail className="h-4 w-4 inline -mt-0.5 mr-1.5 text-[var(--gold)]" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 bg-transparent px-3 py-3 text-white outline-none"
                    autoFocus
                  />
                </div>
              </label>
              {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
              <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg gold-gradient text-black font-semibold py-3 text-sm hover:opacity-90 disabled:opacity-60 transition">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Send OTP
              </button>
            </form>
          )}

          {/* OTP form */}
          {step === "otp" && (
            <form onSubmit={verifyOtp} className="mt-8 space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-white/50">Verification code</span>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-card/60 px-4 py-3 text-center text-2xl tracking-[0.6em] text-white outline-none focus:border-[var(--gold)]/60 transition"
                  autoFocus
                />
              </label>

              {success && <p className="text-xs text-emerald-400">{success}</p>}
              {error   && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}

              <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg gold-gradient text-black font-semibold py-3 text-sm hover:opacity-90 disabled:opacity-60 transition">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Verify & Continue
              </button>

              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={() => { setStep("phone"); setOtp(""); setError(""); }} className="text-white/55 hover:text-[var(--gold)]">
                  ← Change {method === "phone" ? "number" : "email"}
                </button>
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={countdown > 0 || loading}
                  className="flex items-center gap-1 text-white/55 hover:text-[var(--gold)] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <RefreshCw className="h-3 w-3" />
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-white/30">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 py-3 text-sm font-medium text-white/80 transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-8 text-center text-xs text-white/40 leading-relaxed">
            By continuing you agree to EquityMitra's{" "}
            <Link to="/legal/terms" className="hover:text-[var(--gold)]">Terms</Link>,{" "}
            <Link to="/legal/privacy" className="hover:text-[var(--gold)]">Privacy Policy</Link>, and{" "}
            <Link to="/legal/disclaimer" className="hover:text-[var(--gold)]">Disclaimer</Link>.
          </p>
          <p className="mt-4 text-center text-xs text-white/40">
            <Link to="/" className="hover:text-[var(--gold)]">← Back to homepage</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
