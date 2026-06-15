import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Clock, Lock, Sparkles, X, Tv } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { MiniChart } from "@/components/site/MiniChart";
import { useAuth, usePlan } from "@/lib/auth";
import { getPlanMeta, getMonthsSinceJoined, type PlanId } from "@/lib/subscription";
import { UpgradeModal } from "@/components/app/UpgradeModal";

export const Route = createFileRoute("/app/learning")({
  component: LearningPage,
});

type Pattern = "candles" | "ate" | "volume" | "structure" | "psychology" | "screen";
type Course = {
  title: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  lessons: number;
  pattern: Pattern;
  trend: "up" | "down";
  premium?: boolean;
  status: "Released" | "Coming Soon";
};

const COURSES: Course[] = [
  { title: "Beginner Course", duration: "3h 20m", level: "Beginner", lessons: 14, pattern: "candles", trend: "up", status: "Released" },
  { title: "Price Action", duration: "5h 10m", level: "Intermediate", lessons: 22, pattern: "structure", trend: "up", status: "Released" },
  { title: "ATE Model", duration: "2h 40m", level: "Intermediate", lessons: 11, pattern: "ate", trend: "up", premium: true, status: "Released" },
  { title: "Risk Management", duration: "1h 50m", level: "Beginner", lessons: 9, pattern: "volume", trend: "down", status: "Released" },
  { title: "Trading Psychology", duration: "2h 05m", level: "Intermediate", lessons: 10, pattern: "psychology", trend: "up", status: "Released" },
  { title: "Live Sessions", duration: "Weekly", level: "Advanced", lessons: 0, pattern: "screen", trend: "up", premium: true, status: "Released" },
  { title: "Advanced Strategies", duration: "6h 30m", level: "Advanced", lessons: 18, pattern: "ate", trend: "down", premium: true, status: "Released" },
  { title: "Market Structure", duration: "3h 15m", level: "Intermediate", lessons: 12, pattern: "structure", trend: "up", status: "Coming Soon" },
  { title: "Volume Analysis", duration: "4h 45m", level: "Advanced", lessons: 16, pattern: "volume", trend: "up", premium: true, status: "Coming Soon" },
];

function PsychologyThumb() {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full">
      <rect width="200" height="100" fill="#0a1224" />
      <path d="M0 80 Q 50 20, 100 60 T 200 30" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.9" />
      <path d="M0 60 Q 50 90, 100 40 T 200 70" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.7" />
      <circle cx="100" cy="50" r="22" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="3 3" />
      <text x="100" y="55" textAnchor="middle" fontSize="11" fontWeight="700" fill="#d4af37" fontFamily="ui-sans-serif">
        FEAR ↔ GREED
      </text>
    </svg>
  );
}

function ScreenThumb() {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full">
      <rect width="200" height="100" fill="#0a1224" />
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={10 + i * 32} y={20 + (i % 2) * 8} width="24" height={50 - (i % 3) * 10} fill={i % 2 ? "#22c55e" : "#ef4444"} opacity="0.85" rx="1" />
      ))}
      <text x="100" y="92" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.55)" fontFamily="ui-monospace">LIVE • 15m</text>
    </svg>
  );
}

function Thumb({ pattern, trend, title, level, isComingSoon }: { pattern: Pattern; trend: "up" | "down"; title: string; level: string; isComingSoon?: boolean }) {
  return (
    <div className="relative h-36 w-full rounded-lg overflow-hidden border border-white/10 bg-black/60">
      {pattern === "psychology" ? (
        <PsychologyThumb />
      ) : pattern === "screen" ? (
        <ScreenThumb />
      ) : (
        <div className="absolute inset-0 opacity-95">
          <MiniChart
            trend={trend}
            seed={title.length + (pattern === "ate" ? 7 : pattern === "volume" ? 13 : pattern === "structure" ? 21 : 3)}
            height={144}
            candleCount={pattern === "ate" ? 22 : pattern === "structure" ? 32 : 26}
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      {!isComingSoon && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-12 w-12 rounded-full gold-gradient grid place-items-center text-black shadow-lg">
            <Play className="h-5 w-5 ml-0.5 fill-current" />
          </div>
        </div>
      )}
      <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wider text-white/85 bg-black/55 backdrop-blur px-2 py-0.5 rounded">
        {level}
      </span>
    </div>
  );
}

function LearningPage() {
  const plan = usePlan();
  const { user } = useAuth();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRequired, setModalRequired] = useState<PlanId>("Premium");
  const [modalFeature, setModalFeature] = useState("");

  // Video Playing State
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Membership Months
  const months = getMonthsSinceJoined(user?.memberSince);
  const premiumLimit = 2 + months * 2; // Premium users get 2 + 2/month

  // Compute released indices for courses
  let releasedCounter = 0;
  const processedCourses = COURSES.map((c) => {
    let relIndex = -1;
    if (c.status === "Released") {
      relIndex = releasedCounter++;
    }
    return {
      ...c,
      relIndex,
    };
  });

  const isPremium = plan === "Premium";
  const isPremiumYearlyOrFounder = plan === "PremiumYearly" || plan === "Founder";

  const handleCourseClick = (c: typeof processedCourses[0]) => {
    if (c.status === "Coming Soon") return;

    let locked = false;
    let reqPlan: PlanId = "Premium";

    if (isPremiumYearlyOrFounder) {
      locked = false;
    } else if (isPremium) {
      if (c.relIndex >= premiumLimit) {
        locked = true;
        reqPlan = "PremiumYearly";
      }
    } else {
      // Starter / BeginnerProgram
      locked = true;
      reqPlan = c.relIndex < 5 ? "Premium" : "PremiumYearly";
    }

    if (locked) {
      setModalRequired(reqPlan);
      setModalFeature(`Video Course: ${c.title}`);
      setModalOpen(true);
    } else {
      setPlayingVideo(c.title);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 relative">
      <PageHeader
        eyebrow="Learning"
        title="Video Academy"
        description="Structured courses from absolute basics to advanced ATE models. New lessons added every week."
      />

      {/* Plan-specific Info Banner */}
      {isPremium && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 px-4 py-3">
          <p className="text-sm text-white/70">
            Your Premium subscription unlocks <span className="font-bold text-white">{premiumLimit}</span> courses this month. 
            Next batch of 2 videos will unlock in your next billing cycle. 
            Upgrade to <span className="font-bold text-[var(--gold)]">Premium Yearly</span> for immediate access to all released videos.
          </p>
          <a
            href="/app/subscription"
            className="shrink-0 ml-4 inline-flex items-center gap-1 rounded-md gold-gradient text-black text-[11px] font-bold px-3 py-1.5 hover:opacity-90 transition"
          >
            Upgrade
          </a>
        </div>
      )}

      {(plan === "Starter" || plan === "BeginnerProgram") && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-sm text-white/70">
            Access to Video Academy is locked on the {plan === "Starter" ? "Starter" : "Beginner Program"} plan. 
            Upgrade to <span className="font-bold text-white">Premium</span> to unlock courses.
          </p>
          <a
            href="/app/subscription"
            className="shrink-0 ml-4 inline-flex items-center gap-1 rounded-md gold-gradient text-black text-[11px] font-bold px-3 py-1.5 hover:opacity-90 transition"
          >
            Upgrade Options
          </a>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {processedCourses.map((c) => {
          const isComingSoon = c.status === "Coming Soon";
          let locked = false;
          let reqPlanLabel = "";
          let reqPlanId: PlanId = "Premium";

          if (isComingSoon) {
            locked = false;
          } else if (isPremiumYearlyOrFounder) {
            locked = false;
          } else if (isPremium) {
            if (c.relIndex >= premiumLimit) {
              locked = true;
              reqPlanLabel = "Premium Yearly";
              reqPlanId = "PremiumYearly";
            }
          } else {
            // Starter or Beginner
            locked = true;
            reqPlanId = c.relIndex < 5 ? "Premium" : "PremiumYearly";
            reqPlanLabel = reqPlanId === "Premium" ? "Premium" : "Premium Yearly";
          }

          return (
            <article
              key={c.title + c.level + c.duration}
              onClick={() => handleCourseClick(c)}
              className={`group relative rounded-xl border bg-card/60 p-3 transition flex flex-col justify-between cursor-pointer ${
                isComingSoon
                  ? "border-white/5 opacity-50 cursor-not-allowed"
                  : locked
                  ? "border-white/10 hover:border-white/20"
                  : "border-white/10 hover:border-[var(--gold)]/30 hover:-translate-y-0.5"
              }`}
            >
              <div>
                <Thumb pattern={c.pattern} trend={c.trend} title={c.title} level={c.level} isComingSoon={isComingSoon} />
                
                {/* Status Badges or Lock Overlay */}
                {isComingSoon && (
                  <div className="absolute inset-0 rounded-xl bg-black/60 flex flex-col items-center justify-center gap-2 z-10 pointer-events-none">
                    <span className="inline-flex items-center gap-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/35 text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">
                      Coming Soon
                    </span>
                  </div>
                )}

                {locked && (
                  <div className="absolute inset-0 rounded-xl bg-black/55 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10">
                    <div className="h-10 w-10 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 grid place-items-center">
                      <Lock className="h-4 w-4 text-[var(--gold)]" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/80">{reqPlanLabel}</p>
                    <span className="text-[9px] text-[var(--gold)] underline font-semibold mt-0.5">
                      Click to unlock
                    </span>
                  </div>
                )}

                <div className="px-1 pt-3 pb-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white">{c.title}</h3>
                    {c.premium && !locked && !isComingSoon && (
                      <span className="inline-flex items-center gap-1 rounded-full gold-gradient text-black text-[10px] font-bold px-2 py-0.5">
                        Premium
                      </span>
                    )}
                  </div>

                  {/* Card Status & Required Plan Badge Row */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {isComingSoon ? (
                      <span className="inline-flex items-center rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                        Coming Soon
                      </span>
                    ) : locked ? (
                      <>
                        <span className="inline-flex items-center gap-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                          Locked
                        </span>
                        <span className="inline-flex items-center gap-0.5 rounded bg-white/5 text-white/50 border border-white/10 text-[9px] font-medium px-1.5 py-0.5">
                          Requires {reqPlanLabel}
                        </span>
                      </>
                    ) : (
                      <span className="inline-flex items-center rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                        Released
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center gap-3 text-[11px] text-white/45">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.duration}</span>
                    {c.lessons > 0 && <span>{c.lessons} lessons</span>}
                  </div>
                </div>
              </div>

              {!locked && !isComingSoon && (
                <div className="px-1 pt-2">
                  <button className="w-full rounded-md gold-gradient text-black text-xs font-semibold py-2 hover:opacity-90 transition">
                    Watch Now
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <p className="mt-8 text-[11px] text-white/35">
        Video player placeholder — connect Bunny.net, Vimeo or Mux for streaming and progress tracking.
      </p>

      {/* Simulated Video Player Modal */}
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
                <h3 className="text-xl font-extrabold text-white">Playing: {playingVideo}</h3>
                <p className="text-sm text-white/50 mt-1 max-w-md mx-auto">
                  [Simulated Player] Streaming high-quality institutional trading content from EquityMitra CDN...
                </p>
              </div>
              <div className="mt-4 h-1 w-64 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--gold)] to-yellow-500 animate-[pulse_1.5s_infinite]" style={{ width: "45%" }} />
              </div>
            </div>
            <div className="bg-slate-950/80 border-t border-white/5 px-6 py-4 flex items-center justify-between text-xs text-white/60">
              <span>HD Streaming • 1080p</span>
              <span>EquityMitra Academy Player</span>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        requiredPlan={modalRequired}
        featureName={modalFeature}
      />
    </div>
  );
}
