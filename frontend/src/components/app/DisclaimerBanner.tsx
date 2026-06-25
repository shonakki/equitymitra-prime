import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface DisclaimerBannerProps {
  variant?: "compact" | "full";
  /** Storage key — each page can have its own dismiss state */
  storageKey?: string;
}

/**
 * Dismissible disclaimer banner for pages with financial content.
 * Dismiss state is stored per-key in sessionStorage (re-shows on new session).
 */
export function DisclaimerBanner({ variant = "compact", storageKey = "em.disclaimer.global" }: DisclaimerBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(storageKey) === "1";
  });

  if (dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem(storageKey, "1");
    setDismissed(true);
  };

  if (variant === "compact") {
    return (
      <div className="mx-4 sm:mx-6 mb-4 mt-2 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300/80">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="flex-1 leading-relaxed">
          <strong className="text-amber-300">Educational Content Only.</strong>{" "}
          EquityMitra is an investor awareness platform. This is not SEBI-registered investment advice.{" "}
          <Link to="/legal/disclaimer" className="underline hover:text-amber-200">Read full disclaimer</Link>.
        </p>
        <button onClick={dismiss} className="text-amber-400/50 hover:text-amber-300 shrink-0">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="mx-4 sm:mx-6 mb-6 mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Important Disclaimer</p>
        </div>
        <button onClick={dismiss} className="text-amber-400/50 hover:text-amber-300 shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-amber-300/70 leading-relaxed">
        All research, analysis, and content on EquityMitra is for <strong className="text-amber-200">educational purposes only</strong>. EquityMitra is currently seeking SEBI registration. Nothing here constitutes personalized investment advice. Past performance does not guarantee future results. Investing in securities involves risk including loss of principal.
      </p>
      <Link to="/legal/disclaimer" className="inline-flex text-[11px] text-amber-300/60 hover:text-amber-300 underline">
        Read full disclaimer →
      </Link>
    </div>
  );
}
