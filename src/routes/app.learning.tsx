import { createFileRoute } from "@tanstack/react-router";
import { Play, Clock, Lock } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { MiniChart } from "@/components/site/MiniChart";

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
};

const COURSES: Course[] = [
  { title: "Beginner Course", duration: "3h 20m", level: "Beginner", lessons: 14, pattern: "candles", trend: "up" },
  { title: "Price Action", duration: "5h 10m", level: "Intermediate", lessons: 22, pattern: "structure", trend: "up" },
  { title: "ATE Model", duration: "2h 40m", level: "Intermediate", lessons: 11, pattern: "ate", trend: "up", premium: true },
  { title: "Risk Management", duration: "1h 50m", level: "Beginner", lessons: 9, pattern: "volume", trend: "down" },
  { title: "Trading Psychology", duration: "2h 05m", level: "Intermediate", lessons: 10, pattern: "psychology", trend: "up" },
  { title: "Live Sessions", duration: "Weekly", level: "Advanced", lessons: 0, pattern: "screen", trend: "up", premium: true },
  { title: "Advanced Strategies", duration: "6h 30m", level: "Advanced", lessons: 18, pattern: "ate", trend: "down", premium: true },
  { title: "Market Structure", duration: "3h 15m", level: "Intermediate", lessons: 12, pattern: "structure", trend: "up" },
  { title: "Volume Analysis", duration: "4h 45m", level: "Advanced", lessons: 16, pattern: "volume", trend: "up", premium: true },
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

function Thumb({ pattern, trend, title, level }: { pattern: Pattern; trend: "up" | "down"; title: string; level: string }) {
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
      <div className="absolute inset-0 grid place-items-center">
        <div className="h-12 w-12 rounded-full gold-gradient grid place-items-center text-black shadow-lg">
          <Play className="h-5 w-5 ml-0.5 fill-current" />
        </div>
      </div>
      <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wider text-white/85 bg-black/55 backdrop-blur px-2 py-0.5 rounded">
        {level}
      </span>
    </div>
  );
}

function LearningPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <PageHeader
        eyebrow="Learning"
        title="Video Academy"
        description="Structured courses from absolute basics to ATE price-volume framework. New lessons added every week."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COURSES.map((c) => (
          <article
            key={c.title + c.level + c.duration}
            className="group rounded-xl border border-white/10 bg-card/60 p-3 hover:border-[var(--gold)]/30 hover:-translate-y-0.5 transition"
          >
            <Thumb pattern={c.pattern} trend={c.trend} title={c.title} level={c.level} />
            <div className="px-1 pt-3 pb-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-white">{c.title}</h3>
                {c.premium && (
                  <span className="inline-flex items-center gap-1 rounded-full gold-gradient text-black text-[10px] font-bold px-2 py-0.5">
                    <Lock className="h-3 w-3" /> Prime
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/45">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.duration}</span>
                {c.lessons > 0 && <span>{c.lessons} lessons</span>}
              </div>
              <button className="mt-3 w-full rounded-md gold-gradient text-black text-xs font-semibold py-2 hover:opacity-90 transition">
                Watch Now
              </button>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 text-[11px] text-white/35">
        Video player placeholder — connect Bunny.net, Vimeo or Mux for streaming and progress tracking.
      </p>
    </div>
  );
}
