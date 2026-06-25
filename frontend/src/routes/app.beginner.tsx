import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Clock, Lock, Sparkles, X, Tv, BookOpen, Check } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { DisclaimerBanner } from "@/components/app/DisclaimerBanner";
import { useAuth, usePlan } from "@/lib/auth";
import { getPlanMeta, canAccessBeginnerAcademy, type PlanId } from "@/lib/subscription";
import { UpgradeModal } from "@/components/app/UpgradeModal";

export const Route = createFileRoute("/app/beginner")({
  component: BeginnerAcademyPage,
});

type Lesson = {
  moduleNumber: number;
  title: string;
  duration: string;
  lessons: number;
  status: "Released" | "Coming Soon";
};

const MODULES: Lesson[] = [
  { moduleNumber: 1, title: "Introduction to Stock Market", duration: "1h 15m", lessons: 5, status: "Released" },
  { moduleNumber: 2, title: "Candlesticks & Charts", duration: "1h 30m", lessons: 6, status: "Released" },
  { moduleNumber: 3, title: "Technical Analysis Basics", duration: "2h 10m", lessons: 8, status: "Released" },
  { moduleNumber: 4, title: "Fundamental Analysis Basics", duration: "2h 45m", lessons: 9, status: "Released" },
  { moduleNumber: 5, title: "Risk Management", duration: "1h 20m", lessons: 4, status: "Released" },
  { moduleNumber: 6, title: "Trading Psychology", duration: "1h 05m", lessons: 5, status: "Released" },
  { moduleNumber: 7, title: "Position Sizing", duration: "45m", lessons: 3, status: "Released" },
  { moduleNumber: 8, title: "Portfolio Building", duration: "1h 15m", lessons: 4, status: "Released" },
  { moduleNumber: 9, title: "Market Cycles & Investing", duration: "1h 40m", lessons: 6, status: "Coming Soon" },
  { moduleNumber: 10, title: "Practical Market Application", duration: "2h 00m", lessons: 8, status: "Coming Soon" },
];

const HIGHLIGHTS = [
  "10+ Structured Learning Modules",
  "30+ Detailed Video Lessons",
  "Stock Market Basics Explained Simply",
  "Candlestick Patterns & Chart Reading",
  "Technical Analysis Fundamentals",
  "Fundamental Analysis Basics",
  "Broker Setup & Order Types",
  "Risk Management & Position Sizing",
  "Real Trading Examples & Case Studies",
  "Investor Awareness & Common Mistakes",
];

const STATS = [
  { value: "10+", label: "Modules" },
  { value: "30+", label: "Videos" },
  { value: "Beginner", label: "Friendly" },
  { value: "Lifetime", label: "Access" },
];

function BeginnerAcademyPage() {
  const plan = usePlan();
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFeature, setModalFeature] = useState("");

  // Video Playing State
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const hasAccess = canAccessBeginnerAcademy(plan);

  const handleLessonClick = (l: Lesson) => {
    if (l.status === "Coming Soon") return;

    if (!hasAccess) {
      setModalFeature(`Beginner Program: Module ${l.moduleNumber} – ${l.title}`);
      setModalOpen(true);
    } else {
      setPlayingVideo(`Module ${l.moduleNumber} – ${l.title}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 relative space-y-8">
      <DisclaimerBanner variant="compact" storageKey="em.disclaimer.beginner" />
      {/* Premium Hero Section */}
      <section className="relative rounded-3xl border border-[var(--gold)]/35 bg-gradient-to-b from-slate-950 via-card/85 to-card/60 p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--gold)]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 grid md:grid-cols-5 gap-6 md:gap-8 items-center">
          {/* Hero Content */}
          <div className="md:col-span-3 space-y-4 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Specialized Course
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Beginner Stock Market &<br />
              <span className="gold-text">Investor Awareness Program</span>
            </h1>
            <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-xl">
              A complete beginner-to-confident-investor learning path designed for people starting from absolute zero.
            </p>

            {/* Highlights Grid */}
            <ul className="grid sm:grid-cols-2 gap-2.5 pt-2">
              {HIGHLIGHTS.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-white/80">
                  <Check className="h-4 w-4 text-[var(--gold)] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Unlock CTA Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              {!hasAccess ? (
                <button
                  onClick={() => {
                    setModalFeature("Beginner Stock Market Program");
                    setModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-purple-600 text-white hover:bg-purple-500 font-extrabold text-sm uppercase tracking-wider shadow-lg transition duration-200 cursor-pointer"
                >
                  Unlock Beginner Program – ₹9,999
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Unlocked & Active
                </span>
              )}
              <span className="text-xs text-white/40">Includes Lifetime Access · 30-day Money-back Guarantee</span>
            </div>
          </div>

          {/* Stats Cards & Image Preview */}
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            {STATS.map((stat, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-center">
                <p className="text-2xl font-black gold-text">{stat.value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Preview Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[var(--gold)]" />
          Course Curriculum Preview
        </h2>
        <p className="text-xs text-white/50 -mt-2">
          Curriculum is visible to everyone. Lessons remain locked unless the Beginner Program is purchased.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((l) => {
            const isComingSoon = l.status === "Coming Soon";
            const locked = !hasAccess && !isComingSoon;

            return (
              <article
                key={l.moduleNumber}
                onClick={() => handleLessonClick(l)}
                className={`group relative rounded-xl border bg-card/60 p-4 transition flex flex-col justify-between cursor-pointer ${
                  isComingSoon
                    ? "border-white/5 opacity-50 cursor-not-allowed"
                    : locked
                    ? "border-white/10 hover:border-white/20"
                    : "border-white/10 hover:border-[var(--gold)]/30 hover:-translate-y-0.5"
                }`}
              >
                <div>
                  <div className="relative h-32 w-full rounded-lg overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-[var(--gold)] opacity-40 group-hover:scale-110 transition duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {!isComingSoon && !locked && (
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="h-10 w-10 rounded-full gold-gradient grid place-items-center text-black shadow-lg">
                          <Play className="h-4.5 w-4.5 ml-0.5 fill-current" />
                        </div>
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 text-[9px] uppercase tracking-wider text-white/85 bg-black/65 px-2.5 py-0.5 rounded">
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
                      <div className="h-9 w-9 rounded-full border border-purple-400/40 bg-purple-500/10 grid place-items-center">
                        <Lock className="h-3.5 w-3.5 text-purple-400" />
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-purple-300">Beginner Program</p>
                      <span className="text-[8px] text-white/50">Click to purchase program</span>
                    </div>
                  )}

                  <div className="pt-3">
                    <h3 className="text-sm font-bold text-white group-hover:text-[var(--gold)] transition-colors">
                      {l.title}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/45">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {l.duration}</span>
                      <span>{l.lessons} video chapters</span>
                    </div>
                  </div>
                </div>

                {!locked && !isComingSoon && (
                  <div className="pt-3">
                    <button className="w-full rounded-md gold-gradient text-black text-xs font-semibold py-1.5 hover:opacity-90 transition">
                      Start Learning
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
          <div className="relative max-w-4xl w-full aspect-video bg-slate-900 border border-[var(--gold)]/20 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl">
            <button
              onClick={() => setPlayingVideo(null)}
              className="absolute top-4 right-4 z-55 text-white/60 hover:text-white bg-black/40 p-2 rounded-full cursor-pointer hover:bg-black/60 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-center">
              <Tv className="h-16 w-16 text-[var(--gold)] animate-pulse" />
              <div>
                <h3 className="text-xl font-extrabold text-white">{playingVideo}</h3>
                <p className="text-sm text-white/50 mt-1 max-w-md mx-auto">
                  [Simulated Player] Streaming Beginner Stock Market & Investor Awareness lesson...
                </p>
              </div>
              <div className="mt-4 h-1 w-64 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--gold)] to-yellow-500 animate-[pulse_1.5s_infinite]" style={{ width: "25%" }} />
              </div>
            </div>
            <div className="bg-slate-950/80 border-t border-white/5 px-6 py-4 flex items-center justify-between text-xs text-white/60">
              <span>HD Video • 1080p</span>
              <span>Beginner Program Player</span>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        requiredPlan="BeginnerProgram"
        featureName={modalFeature}
      />
    </div>
  );
}
