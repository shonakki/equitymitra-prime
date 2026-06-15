import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { FileText, Download, Upload, FolderOpen, Search, Bookmark, BookmarkCheck, ArrowDownAZ, Clock, TrendingUp, Lock, X, Eye } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { useAuth, usePlan } from "@/lib/auth";
import { getPlanMeta, getMonthsSinceJoined, canDownloadPdf, type PlanId } from "@/lib/subscription";
import { UpgradeModal } from "@/components/app/UpgradeModal";

export const Route = createFileRoute("/app/notes")({
  component: NotesPage,
});

const CATS = [
  "All", "Beginner Notes", "ATE Notes", "Volume Notes",
  "Trading Psychology", "Setup PDFs", "Strategy PDFs", "Market Notes",
] as const;

type Note = {
  id: string;
  title: string;
  cat: typeof CATS[number];
  size: string;
  pages: number;
  added: string; // ISO
  downloads: number;
  status: "Released" | "Coming Soon";
};

const NOTES: Note[] = [
  { id: "n1", title: "Trading Foundations — Getting Started", cat: "Beginner Notes", size: "1.8 MB", pages: 24, added: "2026-05-18", downloads: 412, status: "Released" },
  { id: "n2", title: "Candlestick Cheatsheet", cat: "Beginner Notes", size: "640 KB", pages: 8, added: "2026-05-14", downloads: 1284, status: "Released" },
  { id: "n3", title: "ATE Model — Complete Framework", cat: "ATE Notes", size: "3.2 MB", pages: 42, added: "2026-05-20", downloads: 982, status: "Released" },
  { id: "n4", title: "ATE Entry Triggers (with examples)", cat: "ATE Notes", size: "2.1 MB", pages: 28, added: "2026-05-09", downloads: 654, status: "Released" },
  { id: "n5", title: "Volume Analysis — Practitioner Guide", cat: "Volume Notes", size: "2.7 MB", pages: 36, added: "2026-05-12", downloads: 547, status: "Released" },
  { id: "n6", title: "Psychology of Drawdowns", cat: "Trading Psychology", size: "920 KB", pages: 14, added: "2026-05-21", downloads: 233, status: "Released" },
  { id: "n7", title: "Breakout Setup Playbook", cat: "Setup PDFs", size: "1.4 MB", pages: 20, added: "2026-05-19", downloads: 798, status: "Released" },
  { id: "n8", title: "Pullback Setup Playbook", cat: "Setup PDFs", size: "1.6 MB", pages: 22, added: "2026-05-10", downloads: 612, status: "Released" },
  { id: "n9", title: "Swing Trading Strategy", cat: "Strategy PDFs", size: "2.4 MB", pages: 32, added: "2026-05-15", downloads: 489, status: "Coming Soon" },
  { id: "n10", title: "Weekly Market Notes — Issue #18", cat: "Market Notes", size: "1.1 MB", pages: 16, added: "2026-05-22", downloads: 174, status: "Coming Soon" },
];

type Sort = "Recent" | "Downloads" | "A–Z";
const SORTS: Sort[] = ["Recent", "Downloads", "A–Z"];

function NotesPage() {
  const plan = usePlan();
  const { user } = useAuth();

  // Upgrade Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRequired, setModalRequired] = useState<PlanId>("Premium");
  const [modalFeature, setModalFeature] = useState("");

  // Viewer State
  const [viewingNote, setViewingNote] = useState<Note | null>(null);

  // Filter / Sort States
  const [active, setActive] = useState<typeof CATS[number]>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("Recent");
  const [favsOnly, setFavsOnly] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [uploaded, setUploaded] = useState<{ name: string; size: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Membership release system limits
  const months = getMonthsSinceJoined(user?.memberSince);
  const premiumLimit = 2 + months * 2; // Premium users get 2 + 2/month

  // Pre-process notes to count released indices
  let releasedCounter = 0;
  const processedNotes = useMemo(() => {
    return NOTES.map((n) => {
      let relIndex = -1;
      if (n.status === "Released") {
        relIndex = releasedCounter++;
      }
      return {
        ...n,
        relIndex,
      };
    });
  }, []);

  const isPremium = plan === "Premium";
  const isPremiumYearlyOrFounder = plan === "PremiumYearly" || plan === "Founder";
  const canDownload = canDownloadPdf(plan);

  const onFiles = (files?: FileList | null) => {
    if (!files) return;
    const added = Array.from(files).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
    }));
    setUploaded((prev) => [...added, ...prev]);
  };

  const toggleFav = (id: string) =>
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const visible = useMemo(() => {
    let list = processedNotes.filter((n) => active === "All" || n.cat === active);
    if (favsOnly) list = list.filter((n) => favs.has(n.id));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.cat.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      if (sort === "Recent") return b.added.localeCompare(a.added);
      if (sort === "Downloads") return b.downloads - a.downloads;
      return a.title.localeCompare(b.title);
    });
    return list;
  }, [processedNotes, active, favsOnly, favs, query, sort]);

  const recent = useMemo(() => {
    return [...processedNotes]
      .filter((n) => n.status === "Released")
      .sort((a, b) => b.added.localeCompare(a.added))
      .slice(0, 3);
  }, [processedNotes]);

  const popular = useMemo(() => {
    return [...processedNotes]
      .filter((n) => n.status === "Released")
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 3);
  }, [processedNotes]);

  const handleNoteClick = (n: typeof processedNotes[0]) => {
    if (n.status === "Coming Soon") return;

    let locked = false;
    let reqPlan: PlanId = "Premium";

    if (isPremiumYearlyOrFounder) {
      locked = false;
    } else if (isPremium) {
      if (n.relIndex >= premiumLimit) {
        locked = true;
        reqPlan = "PremiumYearly";
      }
    } else {
      locked = true;
      reqPlan = n.relIndex < 10 ? "Premium" : "PremiumYearly";
    }

    if (locked) {
      setModalRequired(reqPlan);
      setModalFeature(`PDF Guide: ${n.title}`);
      setModalOpen(true);
    } else {
      setViewingNote(n);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <PageHeader
        eyebrow="Library"
        title="PDF Notes & Playbooks"
        description="Search, filter and bookmark every research PDF, playbook and weekly note."
      />

      {/* Plan info banner */}
      {isPremium && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 px-4 py-3">
          <p className="text-sm text-white/70">
            <span className="font-bold text-white">View-only:</span> Your subscription unlocks{" "}
            <span className="font-bold text-white">{premiumLimit}</span> PDFs this month. Upgrade to Premium Yearly for full library + downloads.
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
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-sm text-white/70">
            Access to PDF Library is locked on the {plan === "Starter" ? "Starter" : "Beginner Program"} plan. 
            Upgrade to <span className="font-bold text-white">Premium</span> to unlock documents.
          </p>
          <a
            href="/app/subscription"
            className="shrink-0 ml-4 inline-flex items-center gap-1 rounded-md gold-gradient text-black text-[11px] font-bold px-3 py-1.5 hover:opacity-90 transition"
          >
            Upgrade Options
          </a>
        </div>
      )}

      {/* Upload area (admin placeholder) */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
        className="rounded-xl border border-dashed border-[var(--gold)]/40 bg-[var(--gold)]/5 p-6 text-center hover:bg-[var(--gold)]/10 transition cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-6 w-6 text-[var(--gold)] mx-auto" />
        <p className="mt-2 text-sm text-white font-semibold">Drop PDFs here or click to upload</p>
        <p className="text-[11px] text-white/45 mt-0.5">
          Admin panel placeholder — connect storage to persist uploads.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {uploaded.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/10 bg-card/60 p-4">
          <p className="text-[11px] uppercase tracking-wider text-[var(--gold)] mb-2">Recently uploaded (session)</p>
          <ul className="space-y-1.5">
            {uploaded.map((u, i) => (
              <li key={i} className="text-xs text-white/75 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-[var(--gold)]" />
                <span className="truncate">{u.name}</span>
                <span className="text-white/40 ml-auto">{u.size}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recently added + Most downloaded quick rows */}
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <QuickRow icon={Clock} title="Recently Added" items={recent} onFav={toggleFav} favs={favs} onClickNote={handleNoteClick} />
        <QuickRow icon={TrendingUp} title="Most Downloaded" items={popular} onFav={toggleFav} favs={favs} onClickNote={handleNoteClick} />
      </div>

      {/* Search + sort + favourites */}
      <div className="mt-6 flex flex-col lg:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-md border border-white/10 bg-card/60 px-3 py-2 focus-within:border-[var(--gold)]/50">
          <Search className="h-4 w-4 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes by title or category…"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-white/10 bg-card/60 p-1 flex items-center gap-1">
            {SORTS.map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1 ${sort === s ? "gold-gradient text-black" : "text-white/60 hover:text-white"}`}
              >
                {s === "A–Z" && <ArrowDownAZ className="h-3 w-3" />}
                {s === "Recent" && <Clock className="h-3 w-3" />}
                {s === "Downloads" && <TrendingUp className="h-3 w-3" />}
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => setFavsOnly((v) => !v)}
            className={`rounded-md px-3 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1.5 border ${favsOnly ? "gold-gradient text-black border-transparent" : "border-white/10 text-white/70 hover:text-white hover:bg-white/5"}`}
          >
            <Bookmark className="h-3 w-3" /> Bookmarks {favs.size > 0 && `(${favs.size})`}
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="mt-4 rounded-xl border border-white/10 bg-card/60 p-2 flex items-center gap-1 overflow-x-auto">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${
              active === c
                ? "gold-gradient text-black"
                : "text-white/65 hover:text-white hover:bg-white/5"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Notes grid */}
      <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-white/45">
            <FolderOpen className="h-6 w-6 text-white/30 mx-auto mb-2" />
            No notes match your filters.
          </div>
        ) : (
          visible.map((n) => {
            const fav = favs.has(n.id);
            const isComingSoon = n.status === "Coming Soon";
            let locked = false;
            let reqPlanLabel = "";
            let reqPlanId: PlanId = "Premium";

            if (isComingSoon) {
              locked = false;
            } else if (isPremiumYearlyOrFounder) {
              locked = false;
            } else if (isPremium) {
              if (n.relIndex >= premiumLimit) {
                locked = true;
                reqPlanLabel = "Premium Yearly";
                reqPlanId = "PremiumYearly";
              }
            } else {
              locked = true;
              reqPlanId = n.relIndex < 10 ? "Premium" : "PremiumYearly";
              reqPlanLabel = reqPlanId === "Premium" ? "Premium" : "Premium Yearly";
            }

            return (
              <article
                key={n.id}
                onClick={() => handleNoteClick(n)}
                className={`relative rounded-xl border bg-card/60 p-4 flex flex-col justify-between transition cursor-pointer ${
                  isComingSoon
                    ? "border-white/5 opacity-50 cursor-not-allowed"
                    : locked
                    ? "border-white/10 hover:border-white/20"
                    : "border-white/10 hover:border-[var(--gold)]/30"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-lg bg-red-500/10 border border-red-500/30 grid place-items-center text-red-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFav(n.id);
                      }}
                      title={fav ? "Remove bookmark" : "Bookmark"}
                      className={`p-1.5 rounded-md transition ${fav ? "text-[var(--gold)]" : "text-white/35 hover:text-white"}`}
                    >
                      {fav ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </button>
                  </div>

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

                  <h3 className="mt-3 text-sm font-semibold text-white">{n.title}</h3>
                  <p className="mt-1 text-[11px] text-white/45">{n.cat} · {n.pages} pages · {n.size}</p>

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
                </div>

                {!locked && !isComingSoon && (
                  <div className="mt-4 pt-2">
                    {canDownload ? (
                      <button className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-white/15 text-white text-xs font-semibold py-2 hover:bg-white/5 transition">
                        <Download className="h-3.5 w-3.5" /> Download PDF
                      </button>
                    ) : (
                      <button className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-white/10 text-white/50 text-xs font-semibold py-2">
                        <Eye className="h-3.5 w-3.5" /> View Only
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Dynamic simulated PDF reader modal */}
      {viewingNote && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md grid place-items-center p-4">
          <div className="relative max-w-2xl w-full h-[85vh] bg-slate-900 border border-[var(--gold)]/20 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <header className="px-6 py-4 bg-slate-950/80 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white truncate max-w-[400px]">{viewingNote.title}</h3>
                <p className="text-[10px] text-white/40">{viewingNote.cat} · {viewingNote.pages} pages</p>
              </div>
              <div className="flex items-center gap-2">
                {canDownload && (
                  <button className="inline-flex items-center gap-1 bg-[var(--gold)] text-black text-xs font-bold px-3 py-1.5 rounded-md hover:opacity-90">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                )}
                <button
                  onClick={() => setViewingNote(null)}
                  className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* View Area with Watermark */}
            <div className="flex-1 relative overflow-y-auto p-8 bg-slate-950/50 flex flex-col gap-6 items-center">
              {/* Diagonal Watermark */}
              <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.04]">
                <div className="text-4xl md:text-6xl font-black tracking-widest uppercase text-white rotate-[-30deg] text-center leading-none">
                  {user?.phone ? `+91 ${user.phone}` : "EQUITYMITRA MEMBER"}<br />
                  CONFIDENTIAL RESEARCH<br />
                  DO NOT DISTRIBUTE
                </div>
              </div>

              {/* Simulated Pages */}
              {Array.from({ length: Math.min(3, viewingNote.pages) }).map((_, idx) => (
                <div key={idx} className="relative z-10 w-full max-w-lg aspect-[1/1.4] bg-slate-900/90 border border-white/5 rounded-lg p-6 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex justify-between items-center text-[8px] text-white/30 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">
                      <span>EquityMitra Prime Research</span>
                      <span>Page {idx + 1} of {viewingNote.pages}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-2/3 bg-white/15 rounded" />
                      <div className="h-2 w-full bg-white/5 rounded" />
                      <div className="h-2 w-full bg-white/5 rounded" />
                      <div className="h-2 w-5/6 bg-white/5 rounded" />
                      <div className="h-24 w-full bg-white/5 border border-white/10 rounded-md my-4 grid place-items-center">
                        <span className="text-[10px] text-white/25">Technical setup chart illustration</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded" />
                      <div className="h-2 w-4/5 bg-white/5 rounded" />
                    </div>
                  </div>
                  <div className="text-[8px] text-white/20 text-center uppercase tracking-wider">
                    Secured Viewer for {user?.phone ? `+91 ${user.phone}` : "Member"}
                  </div>
                </div>
              ))}
              
              {viewingNote.pages > 3 && (
                <div className="py-4 text-center text-xs text-white/40 italic">
                  And {viewingNote.pages - 3} more pages...
                </div>
              )}
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

function QuickRow({
  icon: Icon, title, items, onFav, favs, onClickNote,
}: {
  icon: any; title: string; items: any[]; onFav: (id: string) => void; favs: Set<string>; onClickNote: (n: any) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-card/60 p-4">
      <p className="text-[10px] uppercase tracking-wider text-[var(--gold)] font-semibold mb-3 inline-flex items-center gap-1.5">
        <Icon className="h-3 w-3" /> {title}
      </p>
      <ul className="space-y-2">
        {items.map((n) => {
          const fav = favs.has(n.id);
          return (
            <li key={n.id} onClick={() => onClickNote(n)} className="flex items-center gap-2 text-xs cursor-pointer group">
              <FileText className="h-3.5 w-3.5 text-red-400 shrink-0" />
              <span className="text-white/85 truncate flex-1 group-hover:text-[var(--gold)] transition-colors">{n.title}</span>
              <span className="text-white/40 text-[10px] shrink-0">{n.size}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFav(n.id);
                }}
                className={`shrink-0 ${fav ? "text-[var(--gold)]" : "text-white/30 hover:text-white"}`}
              >
                {fav ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
