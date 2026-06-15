import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Clock, Lock, Sparkles, X, Tv, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { useAuth, usePlan } from "@/lib/auth";
import { getPlanMeta, canAccessBeginnerAcademy, type PlanId } from "@/lib/subscription";
import { UpgradeModal } from "@/components/app/UpgradeModal";

export const Route = createFileRoute("/app/beginner")({
  component: BeginnerAcademyPage,
});

type Lesson = {
  title: string;
  duration: string;
  lessons: number;
  level: "Beginner";
  status: "Released" | "Coming Soon";
};

const LESSONS: Lesson[] = [
  { title: "Introduction to Stock Markets", duration: "1h 15m", lessons: 5, level: "Beginner", status: "Released" },
  { title: "Understanding Shares & Exchanges", duration: "1h 30m", lessons: 6, level: "Beginner", status: "Released" },
  { title: "Basics of Technical Analysis", duration: "2h 10m", lessons: 8, level: "Beginner", status: "Released" },
  { title: "Basics of Fundamental Analysis", duration: "2h 45m", lessons: 9, level: "Beginner", status: "Released" },
  { title: "Risk Management & Capital Preservation", duration: "1h 20m", lessons: 4, level: "Beginner", status: "Released" },
  { title: "Choosing Your First Broker", duration: "45m", lessons: 3, level: "Beginner", status: "Released" },
  { title: "Developing Trading Discipline", duration: "1h 05m", lessons: 5, level: "Beginner", status: "Coming Soon" },
  { title: "Portfolio Diversification Strategies", duration: "1h 50m", lessons: 7, level: "Beginner", status: "Coming Soon" },
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
      setModalFeature(`Beginner Program: ${l.title}`);
      setModalOpen(true);
    } else {
      setPlayingVideo(l.title);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 relative">
      <PageHeader
        eyebrow="Specialized Program"
        title="Beginner Stock Market & Investor Awareness Academy"
        description="Curriculum for the ₹9,999 Beginner Program. From zero to market practitioner. Study at your own pace."
      />

      {/* Access Status Banner */}
      {hasAccess ? (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <p className="text-sm text-white/70">
            <span className="font-bold text-emerald-400">Access Granted:</span> You have unlocked the Beginner Stock Market Program! All released lessons are available to watch below.
          </p>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded font-black uppercase tracking-wider border border-emerald-500/30">
            UNLOCKED
          </span>
        </div>
      ) : (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 px-4 py-3">
          <p className="text-sm text-white/70">
            The curriculum is visible below. Purchase the <span className="font-bold text-[var(--gold)]">₹9,999 Beginner Program</span> to unlock the lessons and start learning.
          </p>
          <button
            onClick={() => {
              setModalFeature("Beginner Stock Market Program");
              setModalOpen(true);
            }}
            className="shrink-0 ml-4 inline-flex items-center gap-1 rounded-md gold-gradient text-black text-[11px] font-bold px-3 py-1.5 hover:opacity-90 transition"
          >
            Unlock Now
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LESSONS.map((l, index) => {
          const isComingSoon = l.status === "Coming Soon";
          const locked = !hasAccess && !isComingSoon;

          return (
            <article
              key={l.title}
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
                  <span className="absolute bottom-2 left-2 text-[9px] uppercase tracking-wider text-white/85 bg-black/65 px-2 py-0.5 rounded">
                    Lesson {index + 1}
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
                  <h3 className="text-sm font-bold text-white group-hover:text-[var(--gold)] transition-colors">{l.title}</h3>
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
                <h3 className="text-xl font-extrabold text-white">Beginner Academy: {playingVideo}</h3>
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
