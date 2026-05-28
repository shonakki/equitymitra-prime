import { MiniChart } from "./MiniChart";
import { Clock, TrendingUp, ArrowRight } from "lucide-react";

export function LatestAnalysis() {
  return (
    <section id="latest" className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--gold)]/25 bg-gradient-to-br from-[var(--gold)]/10 via-card to-card p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.18em] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Latest Analysis
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-white/55">
                <Clock className="h-3.5 w-3.5" /> Published today, 8:45 AM IST
              </span>
            </div>
            <a
              href="#analysis"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--gold)] hover:text-[var(--gold-soft)]"
            >
              View all daily picks <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-5 grid lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-5 rounded-xl bg-black/40 p-3 border border-white/5">
              <MiniChart trend="up" seed={9} />
            </div>

            <div className="lg:col-span-7">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">TATAMOTORS</h3>
                  <p className="text-xs text-white/55 mt-0.5">NSE • Daily timeframe</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-400 px-3 py-1 text-xs font-semibold">
                  <TrendingUp className="h-3 w-3" /> LONG
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="rounded-md bg-white/5 py-2.5">
                  <p className="text-white/50 text-[10px] uppercase tracking-wider">Entry</p>
                  <p className="mt-1 font-bold text-white text-sm">₹968</p>
                </div>
                <div className="rounded-md bg-emerald-500/10 py-2.5">
                  <p className="text-white/50 text-[10px] uppercase tracking-wider">Target</p>
                  <p className="mt-1 font-bold text-emerald-400 text-sm">₹1,025</p>
                </div>
                <div className="rounded-md bg-red-500/10 py-2.5">
                  <p className="text-white/50 text-[10px] uppercase tracking-wider">Stop</p>
                  <p className="mt-1 font-bold text-red-400 text-sm">₹948</p>
                </div>
                <div className="rounded-md bg-[var(--gold)]/10 border border-[var(--gold)]/20 py-2.5">
                  <p className="text-white/50 text-[10px] uppercase tracking-wider">R : R</p>
                  <p className="mt-1 font-bold gold-text text-sm">2.8 : 1</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-white/65 leading-relaxed">
                Inside-bar breakout on daily with strong follow-through volume. Plan to trail stop above 985
                once price prints the 990 zone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
