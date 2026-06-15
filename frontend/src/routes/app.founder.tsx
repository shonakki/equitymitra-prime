import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Clock, Lock, Sparkles, X, Tv, Crown } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { usePlan } from "@/lib/auth";
import { UpgradeGate } from "@/components/app/UpgradeGate";

export const Route = createFileRoute("/app/founder")({
  component: FounderAcademyPage,
});

type Lesson = {
  title: string;
  duration: string;
  lessons: number;
  level: "Advanced";
  status: "Released" | "Coming Soon";
};

const LESSONS: Lesson[] = [
  { title: "Institutional Order Flow & Liquidity Pools", duration: "2h 45m", lessons: 10, level: "Advanced", status: "Released" },
  { title: "Micro-Cap & SME Lifecycle Analysis", duration: "2h 15m", lessons: 8, level: "Advanced", status: "Released" },
  { title: "Advanced Portfolio Construction & Hedging", duration: "3h 10m", lessons: 12, level: "Advanced", status: "Released" },
  { title: "Algorithmic Modeling & Execution Dynamics", duration: "1h 50m", lessons: 6, level: "Advanced", status: "Coming Soon" },
];

function FounderAcademyPage() {
  const plan = usePlan();
  
  // Video Playing State
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const isFounder = plan === "Founder";

  if (!isFounder) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <PageHeader
          eyebrow="Founder Only"
          title="Founder Academy"
          description="Exclusive advanced lectures and sessions reserved for Founder members."
        />
        <UpgradeGate
          requiredPlan="Founder"
          feature="Founder Academy"
          description="Access elite, institution-grade advanced trading strategy masterclasses and private AMA session recordings. Available only for Founder Lifetime members."
        />
      </div>
    );
  }

  const handleLessonClick = (l: Lesson) => {
    if (l.status === "Coming Soon") return;
    setPlayingVideo(l.title);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 relative">
      <PageHeader
        eyebrow="Founder Lifetime"
        title="Founder Academy Masterclass"
        description="Private advanced strategies, algorithmic models, and AMA recordings for Founder members."
      />

      <div className="mb-5 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <p className="text-sm text-white/70">
          <span className="font-bold text-amber-400">Founder Access:</span> Welcome to the private Founder Academy. All released masterclasses are unlocked.
        </p>
        <span className="text-xs bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded font-black uppercase tracking-wider border border-amber-500/30">
          LIFETIME ACCESS
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {LESSONS.map((l, index) => {
          const isComingSoon = l.status === "Coming Soon";

          return (
            <article
              key={l.title}
              onClick={() => handleLessonClick(l)}
              className={`group relative rounded-xl border bg-card/60 p-5 transition flex flex-col justify-between cursor-pointer ${
                isComingSoon
                  ? "border-white/5 opacity-50 cursor-not-allowed"
                  : "border-white/10 hover:border-amber-500/30 hover:-translate-y-0.5"
              }`}
            >
              <div>
                <div className="relative h-44 w-full rounded-lg overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center">
                  <Crown className="h-12 w-12 text-amber-400 opacity-40 group-hover:scale-110 transition duration-300 animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {!isComingSoon && (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="h-12 w-12 rounded-full bg-amber-500 text-black grid place-items-center shadow-lg">
                        <Play className="h-5 w-5 ml-0.5 fill-current" />
                      </div>
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 text-[9px] uppercase tracking-wider text-white/85 bg-black/65 px-2 py-0.5 rounded">
                    Masterclass {index + 1}
                  </span>
                </div>

                {/* Status Badges */}
                {isComingSoon && (
                  <div className="absolute inset-0 rounded-xl bg-black/65 flex flex-col items-center justify-center gap-2 z-10 pointer-events-none">
                    <span className="inline-flex items-center gap-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/35 text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">
                      Coming Soon
                    </span>
                  </div>
                )}

                <div className="pt-4">
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{l.title}</h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-white/45">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {l.duration}</span>
                    <span>{l.lessons} advanced lectures</span>
                  </div>
                </div>
              </div>

              {!isComingSoon && (
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
                <h3 className="text-xl font-extrabold text-white">Founder Academy: {playingVideo}</h3>
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
    </div>
  );
}
