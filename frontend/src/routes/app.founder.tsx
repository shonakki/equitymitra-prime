import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Play, Clock, Lock, Sparkles, X, Tv, Crown, Check, Search, FileText, Download, Bookmark, BookmarkCheck, Eye, FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { DisclaimerBanner } from "@/components/app/DisclaimerBanner";
import { useAuth, usePlan } from "@/lib/auth";
import { getPlanMeta, canDownloadPdf, type PlanId } from "@/lib/subscription";
import { UpgradeModal } from "@/components/app/UpgradeModal";
import { api } from "@/lib/api";

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

function FounderAcademyPage() {
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

  const isFounder = plan === "Founder";
  const canDownload = canDownloadPdf(plan);

  useEffect(() => {
    setLoadingLibrary(true);
    const endpoint = activeTab === "Video Library" ? "/api/academy/founder/videos" : "/api/academy/founder/notes";
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
    return rank[plan] >= rank[requiredPlan];
  };

  const handleLessonClick = (l: Lesson) => {
    if (l.status === "Coming Soon") return;

    if (!isFounder) {
      setModalFeature(`Founder Academy: Module ${l.moduleNumber} – ${l.title}`);
      setModalOpen(true);
    } else {
      setPlayingVideo(`Founder Masterclass: ${l.title}`);
    }
  };

  const handleVideoClick = (item: AcademyVideo) => {
    if (!canOpenItem(item.required_plan)) {
      setModalFeature(`Founder Video: ${item.title}`);
      setModalOpen(true);
      return;
    }
    setPlayingVideo(item.title);
  };

  const handleNoteClick = (item: AcademyNote) => {
    if (!canOpenItem(item.required_plan)) {
      setModalFeature(`Founder Note: ${item.title}`);
      setModalOpen(true);
      return;
    }
    setViewingNote(item);
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

      <section className="space-y-4 rounded-2xl border border-white/10 bg-card/50 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2 text-[11px] font-black uppercase tracking-widest border-b-2 transition ${
                activeTab === tab ? "border-amber-400 text-amber-400" : "border-transparent text-white/50 hover:text-white"
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
                <h3 className="text-sm font-bold text-white">Founder Video Library</h3>
                <p className="text-xs text-white/45">Access founder-level videos and masterclasses.</p>
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
              <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" /></div>
            ) : filteredVideos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">No founder videos match your filters.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredVideos.map((item) => {
                  const locked = !canOpenItem(item.required_plan);
                  return (
                    <article key={item.id} onClick={() => handleVideoClick(item)} className={`group relative rounded-xl border bg-card/60 p-3 transition flex flex-col justify-between cursor-pointer ${locked ? "border-white/10 hover:border-white/20" : "border-white/10 hover:border-amber-500/35 hover:-translate-y-0.5"}`}>
                      <div>
                        <div className="relative h-32 w-full rounded-lg overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center">
                          <Crown className="h-10 w-10 text-amber-400 opacity-40 group-hover:scale-110 transition duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          {!locked && (
                            <div className="absolute inset-0 grid place-items-center">
                              <div className="h-10 w-10 rounded-full bg-amber-500 text-black grid place-items-center shadow-lg">
                                <Play className="h-4.5 w-4.5 ml-0.5 fill-current" />
                              </div>
                            </div>
                          )}
                          <span className="absolute bottom-2 left-2 text-[9px] uppercase tracking-wider text-white/85 bg-black/65 px-2.5 py-0.5 rounded">{item.category}</span>
                        </div>

                        {locked && (
                          <div className="absolute inset-0 rounded-xl bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5 z-10">
                            <div className="h-9 w-9 rounded-full border border-amber-500/40 bg-amber-500/10 grid place-items-center">
                              <Lock className="h-3.5 w-3.5 text-amber-400" />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-wider text-amber-400">{item.required_plan}</p>
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
                          <button className="w-full rounded-md bg-amber-500 text-black text-xs font-semibold py-1.5 hover:opacity-90 transition">Watch Lesson</button>
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
                <h3 className="text-sm font-bold text-white">Founder Notes Library</h3>
                <p className="text-xs text-white/45">Review founder-exclusive PDFs and research notes.</p>
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
              <div className="flex justify-center py-10"><div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" /></div>
            ) : filteredNotes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">No founder notes are available right now.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredNotes.map((item) => {
                  const locked = !canOpenItem(item.required_plan);
                  const fav = bookmarks.has(item.id);
                  return (
                    <article key={item.id} onClick={() => handleNoteClick(item)} className={`relative rounded-xl border bg-card/60 p-4 flex flex-col justify-between transition cursor-pointer ${locked ? "border-white/10 hover:border-white/20" : "border-white/10 hover:border-amber-500/35"}`}>
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
                            className={`p-1.5 rounded-md transition ${fav ? "text-amber-400" : "text-white/35 hover:text-white"}`}
                          >
                            {fav ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                          </button>
                        </div>

                        {locked && (
                          <div className="absolute inset-0 rounded-xl bg-black/55 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10">
                            <div className="h-10 w-10 rounded-full border border-amber-500/40 bg-amber-500/10 grid place-items-center">
                              <Lock className="h-4 w-4 text-amber-400" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/80">{item.required_plan}</p>
                            <span className="text-[9px] text-amber-400 underline font-semibold mt-0.5">Click to unlock</span>
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

      {viewingNote && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md grid place-items-center p-4">
          <div className="relative max-w-2xl w-full h-[85vh] bg-slate-900 border border-amber-500/20 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <header className="px-6 py-4 bg-slate-950/80 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white truncate max-w-[400px]">{viewingNote.title}</h3>
                <p className="text-[10px] text-white/40">{viewingNote.category}</p>
              </div>
              <div className="flex items-center gap-2">
                {canDownload && (
                  <a href={viewingNote.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 bg-amber-500 text-black text-xs font-bold px-3 py-1.5 rounded-md hover:opacity-90">
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
                  FOUNDER NOTES<br />PRIVATE STUDY MATERIAL
                </div>
              </div>
              <div className="relative z-10 w-full max-w-lg aspect-[1/1.4] bg-slate-900/90 border border-white/5 rounded-lg p-6 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex justify-between items-center text-[8px] text-white/30 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">
                    <span>EquityMitra Founder Academy</span>
                    <span>Study Notes</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-2/3 bg-white/15 rounded" />
                    <div className="h-2 w-full bg-white/5 rounded" />
                    <div className="h-2 w-full bg-white/5 rounded" />
                    <div className="h-24 w-full bg-white/5 border border-white/10 rounded-md my-4 grid place-items-center">
                      <span className="text-[10px] text-white/25">Founder study material preview</span>
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
