import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Clock, Lock, Sparkles, X, Tv, Crown, Check } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { DisclaimerBanner } from "@/components/app/DisclaimerBanner";
import { useAuth, usePlan } from "@/lib/auth";
import { getPlanMeta, type PlanId } from "@/lib/subscription";
import { UpgradeModal } from "@/components/app/UpgradeModal";

export const Route = createFileRoute("/app/founder")({
  component: FounderAcademyPage,
});

type Lesson = {
  moduleNumber: number;
  title: string;
  duration: string;
  lessons: number;
  status: "Released" | "Coming Soon";
};

const MODULES: Lesson[] = [
  { moduleNumber: 1, title: "Institutional Footprints", duration: "2h 45m", lessons: 10, status: "Released" },
  { moduleNumber: 2, title: "Advanced Wealth Creation", duration: "2h 15m", lessons: 8, status: "Released" },
  { moduleNumber: 3, title: "Portfolio Construction", duration: "3h 10m", lessons: 12, status: "Released" },
  { moduleNumber: 4, title: "Market Cycle Research", duration: "1h 50m", lessons: 6, status: "Released" },
  { moduleNumber: 5, title: "Advanced Position Sizing", duration: "2h 00m", lessons: 7, status: "Released" },
  { moduleNumber: 6, title: "Portfolio Hedging", duration: "2h 30m", lessons: 9, status: "Released" },
  { moduleNumber: 7, title: "Capital Allocation", duration: "1h 45m", lessons: 5, status: "Released" },
  { moduleNumber: 8, title: "Founder Research Archive", duration: "Weekly Updates", lessons: 0, status: "Coming Soon" },
];

const BENEFITS = [
  "All Present Courses Included",
  "All Future Courses Included",
  "All Present PDF Libraries",
  "All Future PDF Libraries",
  "Wealth Creator Research Reports",
  "Unlimited Research Access",
  "Swing, Positional, Mid-Term & Long-Term Ideas",
  "Founder-Only Content",
  "Live Sessions & Workshops",
  "Priority Support",
  "Founder Badge",
  "Early Access Features",
  "Lifetime Membership",
];

const STATS = [
  { value: "Lifetime", label: "Access" },
  { value: "All Future", label: "Courses" },
  { value: "Unlimited", label: "Reports" },
  { value: "Founder", label: "Community" },
];

function FounderAcademyPage() {
  const plan = usePlan();
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFeature, setModalFeature] = useState("");

  // Video Playing State
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const isFounder = plan === "Founder";

  const handleLessonClick = (l: Lesson) => {
    if (l.status === "Coming Soon") return;

    if (!isFounder) {
      setModalFeature(`Founder Academy: Module ${l.moduleNumber} – ${l.title}`);
      setModalOpen(true);
    } else {
      setPlayingVideo(`Founder Masterclass: ${l.title}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 relative space-y-8">
      <DisclaimerBanner variant="compact" storageKey="em.disclaimer.founder" />
      {/* Premium Hero Section */}
      <section className="relative rounded-3xl border border-amber-500/35 bg-gradient-to-b from-slate-950 via-card/85 to-card/60 p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 grid md:grid-cols-5 gap-6 md:gap-8 items-center">
          {/* Hero Content */}
          <div className="md:col-span-3 space-y-4 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Crown className="h-3.5 w-3.5 animate-pulse text-amber-400" />
              Founder Exclusive
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Founder Lifetime <span className="gold-text">Academy</span>
            </h1>
            <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-xl">
              The complete EquityMitra research, education and wealth creation ecosystem.
            </p>

            {/* Highlights Grid */}
            <ul className="grid sm:grid-cols-2 gap-2.5 pt-2">
              {BENEFITS.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-white/80">
                  <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Unlock CTA Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              {!isFounder ? (
                <button
                  onClick={() => {
                    setModalFeature("Founder Lifetime Academy Access");
                    setModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 text-black hover:bg-amber-400 font-extrabold text-sm uppercase tracking-wider shadow-lg transition duration-200 cursor-pointer"
                >
                  Upgrade to Founder Lifetime – ₹21,000
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Active Founder Member
                </span>
              )}
              <span className="text-xs text-white/40">Private Community · Priority Support · Lifetime Access</span>
            </div>
          </div>

          {/* Stats Cards & Image Preview */}
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            {STATS.map((stat, idx) => (
              <div key={idx} className="rounded-2xl border border-amber-500/20 bg-slate-900/50 p-4 text-center">
                <p className="text-xl font-black text-amber-400">{stat.value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Preview Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-400" />
          Founder Curriculum Preview
        </h2>
        <p className="text-xs text-white/50 -mt-2">
          Curriculum is locked for non-founder users. Upgrade to Founder Lifetime to stream.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {MODULES.map((l) => {
            const isComingSoon = l.status === "Coming Soon";
            const locked = !isFounder && !isComingSoon;

            return (
              <article
                key={l.moduleNumber}
                onClick={() => handleLessonClick(l)}
                className={`group relative rounded-xl border bg-card/60 p-5 transition flex flex-col justify-between cursor-pointer ${
                  isComingSoon
                    ? "border-white/5 opacity-50 cursor-not-allowed"
                    : locked
                    ? "border-white/10 hover:border-white/20"
                    : "border-white/10 hover:border-amber-500/35 hover:-translate-y-0.5"
                }`}
              >
                <div>
                  <div className="relative h-40 w-full rounded-lg overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center">
                    <Crown className="h-12 w-12 text-amber-400 opacity-40 group-hover:scale-110 transition duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {!isComingSoon && !locked && (
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="h-10 w-10 rounded-full bg-amber-500 text-black grid place-items-center shadow-lg">
                          <Play className="h-4.5 w-4.5 ml-0.5 fill-current" />
                        </div>
                      </div>
                    )}
                    <span className="absolute bottom-2.5 left-2.5 text-[9px] uppercase tracking-wider text-white/85 bg-black/65 px-2 py-0.5 rounded">
                      Module {l.moduleNumber}
                    </span>
                  </div>

                  {/* Status Badges or Lock Overlay */}
                  {isComingSoon && (
                    <div className="absolute inset-0 rounded-xl bg-black/65 flex flex-col items-center justify-center gap-2 z-10 pointer-events-none">
                      <span className="inline-flex items-center gap-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/35 text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">
                        Coming Soon
                      </span>
                    </div>
                  )}

                  {locked && (
                    <div className="absolute inset-0 rounded-xl bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5 z-10">
                      <div className="h-9 w-9 rounded-full border border-amber-500/40 bg-amber-500/10 grid place-items-center">
                        <Lock className="h-3.5 w-3.5 text-amber-400" />
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-amber-400">Founder Lifetime</p>
                      <span className="text-[8px] text-white/50">Click to purchase Founder access</span>
                    </div>
                  )}

                  <div className="pt-4">
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                      {l.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-white/45">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {l.duration}</span>
                      {l.lessons > 0 && <span>{l.lessons} advanced lectures</span>}
                    </div>
                  </div>
                </div>

                {!locked && !isComingSoon && (
                  <div className="pt-4">
                    <button className="w-full rounded-md bg-amber-500 text-black text-xs font-bold py-2 hover:opacity-90 transition">
                      Stream Masterclass
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Simulated Player */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md grid place-items-center p-4">
          <div className="relative max-w-4xl w-full aspect-video bg-slate-900 border border-amber-500/25 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl">
            <button
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 z-55 text-white/60 hover:text-white bg-black/40 p-2 rounded-full cursor-pointer hover:bg-black/60 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-center">
              <Tv className="h-16 w-16 text-amber-400 animate-pulse" />
              <div>
                <h3 className="text-xl font-extrabold text-white">{playingVideo}</h3>
                <p className="text-sm text-white/50 mt-1 max-w-md mx-auto">
                  [Private Stream] Streaming secure institutional flow training for Founder member...
                </p>
              </div>
              <div className="mt-4 h-1 w-64 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 animate-[pulse_1.5s_infinite]" style={{ width: "65%" }} />
              </div>
            </div>
            <div className="bg-slate-950/80 border-t border-white/5 px-6 py-4 flex items-center justify-between text-xs text-white/60">
              <span>HD Video • 1080p • Encrypted Stream</span>
              <span>Founder Private Player</span>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        requiredPlan="Founder"
        featureName={modalFeature}
      />
    </div>
  );
}
