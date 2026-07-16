import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Play, Clock, Lock, Sparkles, X, Tv, BookOpen, Check, Search, FileText, Download, Bookmark, BookmarkCheck, Eye, FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { DisclaimerBanner } from "@/components/app/DisclaimerBanner";
import { useAuth, usePlan } from "@/lib/auth";
import { getPlanMeta, canAccessBeginnerAcademy, canDownloadPdf, type PlanId } from "@/lib/subscription";
import { UpgradeModal } from "@/components/app/UpgradeModal";
import { api } from "@/lib/api";

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
  { value: "10+", label: "Videos" },
  { value: "Beginner", label: "Friendly" },
  { value: "Complete", label: "Syllabus" },
];

type AcademyVideo = {
  id: number;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  category: string;
  required_plan: string;
  duration: string;
  status: string;
  library: string;
};

type AcademyNote = {
  id: number;
  title: string;
  description: string;
  url: string;
  category: string;
  required_plan: string;
  release_month: number;
  status: string;
  library: string;
};

const TABS = ["Video Library", "Notes Library"] as const;

type TabValue = (typeof TABS)[number];

function BeginnerAcademyPage() {
  const plan = usePlan();
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFeature, setModalFeature] = useState("");

  // Video Playing State
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("Video Library");
  const [videos, setVideos] = useState<AcademyVideo[]>([]);
  const [notes, setNotes] = useState<AcademyNote[]>([]);
  const [videoQuery, setVideoQuery] = useState("");
  const [noteQuery, setNoteQuery] = useState("");
  const [videoCategory, setVideoCategory] = useState("All");
  const [noteCategory, setNoteCategory] = useState("All");
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [viewingNote, setViewingNote] = useState<AcademyNote | null>(null);

  const hasAccess = canAccessBeginnerAcademy(plan);
  const canDownload = canDownloadPdf(plan);

  useEffect(() => {
    setLoadingLibrary(true);
    const endpoint = activeTab === "Video Library" ? "/api/academy/beginner/videos" : "/api/academy/beginner/notes";
    api.get<{ ok: boolean; data: AcademyVideo[] | AcademyNote[] }>(endpoint)
      .then((res) => {
        if (activeTab === "Video Library") {
          setVideos(res.data as AcademyVideo[]);
        } else {
          setNotes(res.data as AcademyNote[]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingLibrary(false));
  }, [activeTab]);

  const videoCategories = useMemo(() => ["All", ...Array.from(new Set(videos.map((item) => item.category).filter(Boolean)))], [videos]);
  const noteCategories = useMemo(() => ["All", ...Array.from(new Set(notes.map((item) => item.category).filter(Boolean)))], [notes]);

  const filteredVideos = useMemo(() => {
    const query = videoQuery.trim().toLowerCase();
    return videos.filter((item) => {
      const matchesCategory = videoCategory === "All" || item.category === videoCategory;
      const matchesQuery = !query || item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [videoCategory, videoQuery, videos]);

  const filteredNotes = useMemo(() => {
    const query = noteQuery.trim().toLowerCase();
    return notes.filter((item) => {
      const matchesCategory = noteCategory === "All" || item.category === noteCategory;
      const matchesQuery = !query || item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [noteCategory, noteQuery, notes]);

  const toggleBookmark = (id: number) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const canOpenItem = (requiredPlan: string) => {
    const rank: Record<string, number> = { Starter: 0, Premium: 1, PremiumYearly: 2, BeginnerProgram: 3, Founder: 4 };
    return rank[plan] >= rank[requiredPlan] || (requiredPlan === "BeginnerProgram" && hasAccess);
  };

  const handleLessonClick = (l: Lesson) => {
    if (l.status === "Coming Soon") return;

    if (!hasAccess) {
      setModalFeature(`Beginner Program: Module ${l.moduleNumber} – ${l.title}`);
      setModalOpen(true);
    } else {
      setPlayingVideo(`Module ${l.moduleNumber} – ${l.title}`);
    }
  };

  const handleVideoClick = (item: AcademyVideo) => {
    if (!canOpenItem(item.required_plan)) {
      setModalFeature(`Beginner Video: ${item.title}`);
      setModalOpen(true);
      return;
    }
    setPlayingVideo(item.title);
  };

  const handleNoteClick = (item: AcademyNote) => {
    if (!canOpenItem(item.required_plan)) {
      setModalFeature(`Beginner Note: ${item.title}`);
      setModalOpen(true);
      return;
    }
    setViewingNote(item);
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
              <span className="text-xs text-white/40">Includes Complete Syllabus & Exercises</span>
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

      <section className="space-y-4 rounded-2xl border border-white/10 bg-card/50 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2 text-[11px] font-black uppercase tracking-widest border-b-2 transition ${
                activeTab === tab ? "border-[var(--gold)] text-[var(--gold)]" : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Video Library" ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Beginner Academy Video Library</h3>
                <p className="text-xs text-white/45">Search and browse beginner-friendly lessons and modules.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-slate-950/60 px-3 py-2">
                  <Search className="h-4 w-4 text-white/35" />
                  <input
                    value={videoQuery}
                    onChange={(e) => setVideoQuery(e.target.value)}
                    placeholder="Search videos…"
                    className="bg-transparent text-xs text-white outline-none placeholder:text-white/30"
                  />
                </div>
                <select
                  value={videoCategory}
                  onChange={(e) => setVideoCategory(e.target.value)}
                  className="rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white outline-none"
                >
                  {videoCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingLibrary ? (
              <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" /></div>
            ) : filteredVideos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">No beginner videos match your filters.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredVideos.map((item) => {
                  const locked = !canOpenItem(item.required_plan);
                  return (
                    <article key={item.id} onClick={() => handleVideoClick(item)} className={`group relative rounded-xl border bg-card/60 p-3 transition flex flex-col justify-between cursor-pointer ${locked ? "border-white/10 hover:border-white/20" : "border-white/10 hover:border-[var(--gold)]/30 hover:-translate-y-0.5"}`}>
                      <div>
                        <div className="relative h-32 w-full rounded-lg overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-[var(--gold)] opacity-40 group-hover:scale-110 transition duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          {!locked && (
                            <div className="absolute inset-0 grid place-items-center">
                              <div className="h-10 w-10 rounded-full gold-gradient grid place-items-center text-black shadow-lg">
                                <Play className="h-4.5 w-4.5 ml-0.5 fill-current" />
                              </div>
                            </div>
                          )}
                          <span className="absolute bottom-2 left-2 text-[9px] uppercase tracking-wider text-white/85 bg-black/65 px-2.5 py-0.5 rounded">{item.category}</span>
                        </div>

                        {locked && (
                          <div className="absolute inset-0 rounded-xl bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5 z-10">
                            <div className="h-9 w-9 rounded-full border border-purple-400/40 bg-purple-500/10 grid place-items-center">
                              <Lock className="h-3.5 w-3.5 text-purple-400" />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-wider text-purple-300">{item.required_plan}</p>
                            <span className="text-[8px] text-white/50">Click to unlock</span>
                          </div>
                        )}

                        <div className="pt-3">
                          <h4 className="text-sm font-bold text-white">{item.title}</h4>
                          <p className="mt-1 text-[11px] text-white/45 line-clamp-2">{item.description}</p>
                          <div className="mt-2 flex items-center gap-3 text-[11px] text-white/45">
                            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {item.duration}</span>
                            <span>{item.required_plan}</span>
                          </div>
                        </div>
                      </div>

                      {!locked && (
                        <div className="pt-3">
                          <button className="w-full rounded-md gold-gradient text-black text-xs font-semibold py-1.5 hover:opacity-90 transition">Watch Lesson</button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Beginner Notes Library</h3>
                <p className="text-xs text-white/45">Browse beginner PDF notes, playbooks and study guides.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-slate-950/60 px-3 py-2">
                  <Search className="h-4 w-4 text-white/35" />
                  <input
                    value={noteQuery}
                    onChange={(e) => setNoteQuery(e.target.value)}
                    placeholder="Search notes…"
                    className="bg-transparent text-xs text-white outline-none placeholder:text-white/30"
                  />
                </div>
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value)}
                  className="rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white outline-none"
                >
                  {noteCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingLibrary ? (
              <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" /></div>
            ) : filteredNotes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">No beginner notes are available right now.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredNotes.map((item) => {
                  const locked = !canOpenItem(item.required_plan);
                  const fav = bookmarks.has(item.id);
                  return (
                    <article key={item.id} onClick={() => handleNoteClick(item)} className={`relative rounded-xl border bg-card/60 p-4 flex flex-col justify-between transition cursor-pointer ${locked ? "border-white/10 hover:border-white/20" : "border-white/10 hover:border-[var(--gold)]/30"}`}>
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="h-12 w-12 rounded-lg bg-red-500/10 border border-red-500/30 grid place-items-center text-red-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(item.id);
                            }}
                            className={`p-1.5 rounded-md transition ${fav ? "text-[var(--gold)]" : "text-white/35 hover:text-white"}`}
                          >
                            {fav ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                          </button>
                        </div>

                        {locked && (
                          <div className="absolute inset-0 rounded-xl bg-black/55 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10">
                            <div className="h-10 w-10 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 grid place-items-center">
                              <Lock className="h-4 w-4 text-[var(--gold)]" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/80">{item.required_plan}</p>
                            <span className="text-[9px] text-[var(--gold)] underline font-semibold mt-0.5">Click to unlock</span>
                          </div>
                        )}

                        <h4 className="mt-3 text-sm font-semibold text-white">{item.title}</h4>
                        <p className="mt-1 text-[11px] text-white/45">{item.category} · {item.description}</p>
                      </div>

                      <div className="mt-4 pt-2">
                        {canDownload ? (
                          <a href={item.url} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-white/15 text-white text-xs font-semibold py-2 hover:bg-white/5 transition">
                            <Download className="h-3.5 w-3.5" /> Download PDF
                          </a>
                        ) : (
                          <button className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-white/10 text-white/50 text-xs font-semibold py-2">
                            <Eye className="h-3.5 w-3.5" /> View Only
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
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

      {viewingNote && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md grid place-items-center p-4">
          <div className="relative max-w-2xl w-full h-[85vh] bg-slate-900 border border-[var(--gold)]/20 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <header className="px-6 py-4 bg-slate-950/80 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white truncate max-w-[400px]">{viewingNote.title}</h3>
                <p className="text-[10px] text-white/40">{viewingNote.category}</p>
              </div>
              <div className="flex items-center gap-2">
                {canDownload && (
                  <a href={viewingNote.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 bg-[var(--gold)] text-black text-xs font-bold px-3 py-1.5 rounded-md hover:opacity-90">
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                )}
                <button onClick={() => setViewingNote(null)} className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>
            <div className="flex-1 relative overflow-y-auto p-8 bg-slate-950/50 flex flex-col gap-6 items-center">
              <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.04]">
                <div className="text-4xl md:text-6xl font-black tracking-widest uppercase text-white rotate-[-30deg] text-center leading-none">
                  BEGINNER NOTES<br />CONFIDENTIAL STUDY MATERIAL
                </div>
              </div>
              <div className="relative z-10 w-full max-w-lg aspect-[1/1.4] bg-slate-900/90 border border-white/5 rounded-lg p-6 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex justify-between items-center text-[8px] text-white/30 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">
                    <span>EquityMitra Beginner Academy</span>
                    <span>Study Notes</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-2/3 bg-white/15 rounded" />
                    <div className="h-2 w-full bg-white/5 rounded" />
                    <div className="h-2 w-full bg-white/5 rounded" />
                    <div className="h-24 w-full bg-white/5 border border-white/10 rounded-md my-4 grid place-items-center">
                      <span className="text-[10px] text-white/25">Beginner study material preview</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded" />
                    <div className="h-2 w-4/5 bg-white/5 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
