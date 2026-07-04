import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Lock, Download, BookOpen, AlertTriangle, Loader2 } from "lucide-react";
import { api, getToken } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { initiateReportPayment } from "@/lib/razorpay";

export const Route = createFileRoute("/app/research-hub")({ component: ResearchHubPage });

const TABS = [
  "Chart Studies",
  "Research Reports",
  "IPO Research",
  "Sector Research",
  "Premium Research 🔒"
];

const DISCLAIMER = (
  <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center text-xs text-amber-300 max-w-2xl mx-auto space-y-1">
    <p className="font-extrabold flex items-center justify-center gap-1.5 uppercase tracking-wider text-[10px] text-amber-400">
      <AlertTriangle className="h-4 w-4" /> Educational Content Only
    </p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
      <div>No Buy Rec</div>
      <div>No Sell Rec</div>
      <div>No Target Price</div>
      <div>No Investment Advice</div>
    </div>
  </div>
);

function ResearchHubPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Chart Studies");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [premiumReports, setPremiumReports] = useState<any[]>([]);

  // Fetch data depending on tab
  useEffect(() => {
    setLoading(true);
    let endpoint = "";
    if (activeTab === "Chart Studies") endpoint = "/api/research/chart-studies";
    else if (activeTab === "Research Reports") endpoint = "/api/research/reports";
    else if (activeTab === "IPO Research") endpoint = "/api/research/ipos";
    else if (activeTab === "Sector Research") endpoint = "/api/research/sectors";
    else if (activeTab.startsWith("Premium")) endpoint = "/api/research/premium";

    api.get<{ ok: boolean; data: any[] }>(endpoint)
      .then((res) => {
        if (activeTab.startsWith("Premium")) {
          setPremiumReports(res.data);
        } else {
          setData(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [activeTab]);

  // Apply copy protection for free tabs
  useEffect(() => {
    if (activeTab.startsWith("Premium")) return;

    const preventDefault = (e: Event) => e.preventDefault();
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "c") || (e.ctrlKey && e.key === "p") || (e.ctrlKey && e.key === "u")) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("copy", preventDefault);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("keydown", handleKey);
    };
  }, [activeTab]);

  const handleUnlock = async (reportId: number) => {
    if (!user) {
      alert("Please log in to unlock premium reports.");
      return;
    }

    await initiateReportPayment(
      reportId,
      { name: user.name, phone: user.phone, email: user.email },
      (result) => {
        if (result.success) {
          // Re-fetch premium reports to update state
          api.get<{ ok: boolean; data: any[] }>("/api/research/premium")
            .then((res) => setPremiumReports(res.data))
            .catch((err) => console.error(err));
        } else {
          alert(result.error || "Payment failed");
        }
      }
    );
  };

  const getDownloadUrl = (reportId: number) => {
    const base = import.meta.env.VITE_API_BASE as string || "https://equitymitra-prime-production.up.railway.app";
    return `${base}/api/research/premium/${reportId}/download?token=${getToken() || ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 fade-up">
      {/* Tabs */}
      <div className="mb-6 flex border-b border-white/10 overflow-x-auto scrollbar-none gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition ${
              activeTab === tab
                ? "border-[var(--gold)] text-[var(--gold)] font-bold"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Free Content Disclaimer */}
      {!activeTab.startsWith("Premium") && DISCLAIMER}

      {/* Main Content Area */}
      <div className={!activeTab.startsWith("Premium") ? "select-none" : ""}>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
          </div>
        ) : (
          <>
            {/* Tab 1: Chart Studies */}
            {activeTab === "Chart Studies" && (
              <div>
                <div className="text-center max-w-xl mx-auto mb-8">
                  <h1 className="text-2xl font-black text-white">Chart Studies</h1>
                  <p className="text-xs text-white/50 mt-1">Educational analysis of market structure, institutional footprints, volume behaviour and price action.</p>
                </div>
                {data.length === 0 ? (
                  <p className="text-center py-10 text-xs text-white/35">No chart studies published yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-white/10 bg-card/60 overflow-hidden flex flex-col justify-between">
                        {item.cover_image && <img src={item.cover_image} alt={item.title} className="h-44 w-full object-cover border-b border-white/5" />}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                            <p className="text-[11px] text-white/40 mt-1">{item.publish_date}</p>
                            <p className="text-xs text-white/60 line-clamp-3 mt-2">{item.summary}</p>
                          </div>
                          {item.content_url && (
                            <a
                              href={item.content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-[var(--gold)]/80 hover:text-[var(--gold)] font-bold mt-2"
                            >
                              Read More →
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Research Reports */}
            {activeTab === "Research Reports" && (
              <div>
                <div className="text-center max-w-xl mx-auto mb-8">
                  <h1 className="text-2xl font-black text-white">Research Reports</h1>
                  <p className="text-xs text-white/50 mt-1">Educational company research and market reports.</p>
                </div>
                {data.length === 0 ? (
                  <p className="text-center py-10 text-xs text-white/35">No research reports published yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-white/10 bg-card/60 overflow-hidden flex flex-col justify-between">
                        {item.cover_image && <img src={item.cover_image} alt={item.title} className="h-44 w-full object-cover border-b border-white/5" />}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="inline-flex px-2 py-0.5 rounded bg-[var(--gold)]/10 text-[var(--gold)] text-[9px] font-black uppercase tracking-wider">{item.category}</span>
                            <h3 className="text-sm font-bold text-white leading-snug mt-2">{item.title}</h3>
                            <p className="text-[11px] text-white/40">{item.company} · {item.publish_date}</p>
                          </div>
                          {item.read_url && (
                            <a
                              href={item.read_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-black gold-gradient rounded-lg py-2 hover:opacity-90 transition mt-2"
                            >
                              Read Online
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: IPO Research */}
            {activeTab === "IPO Research" && (
              <div>
                <div className="text-center max-w-xl mx-auto mb-8">
                  <h1 className="text-2xl font-black text-white">IPO Research</h1>
                  <p className="text-xs text-white/50 mt-1">Dedicated IPO analysis and educational reviews.</p>
                </div>
                {data.length === 0 ? (
                  <p className="text-center py-10 text-xs text-white/35">No IPO research published yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-white/10 bg-card/60 p-4 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold text-white">{item.ipo_name}</h3>
                            <span className="inline-flex px-2 py-0.5 rounded bg-white/5 text-white/60 text-[9px] font-black uppercase">{item.industry}</span>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] bg-black/25 p-2 rounded-lg text-white/65">
                            <div>
                              <p className="text-[9px] text-white/40 uppercase">Issue Size</p>
                              <p className="font-bold text-white mt-0.5">{item.issue_size || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-white/40 uppercase">Open Date</p>
                              <p className="font-bold text-white mt-0.5">{item.open_date || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-white/40 uppercase">Listing Date</p>
                              <p className="font-bold text-white mt-0.5">{item.listing_date || "—"}</p>
                            </div>
                          </div>
                          <p className="text-xs text-white/60 line-clamp-3 mt-3">{item.summary}</p>
                        </div>
                        {item.read_url && (
                          <a
                            href={item.read_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-black gold-gradient rounded-lg py-2 hover:opacity-90 transition mt-2"
                          >
                            Read More
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Sector Research */}
            {activeTab === "Sector Research" && (
              <div>
                <div className="text-center max-w-xl mx-auto mb-8">
                  <h1 className="text-2xl font-black text-white">Sector Research</h1>
                  <p className="text-xs text-white/50 mt-1">Industry-wise educational research.</p>
                </div>
                {data.length === 0 ? (
                  <p className="text-center py-10 text-xs text-white/35">No sector research published yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-white/10 bg-card/60 overflow-hidden flex flex-col justify-between">
                        {item.sector_image && <img src={item.sector_image} alt={item.sector_name} className="h-44 w-full object-cover border-b border-white/5" />}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h3 className="text-sm font-bold text-white leading-snug">{item.sector_name}</h3>
                            <p className="text-xs text-white/60 line-clamp-3 mt-2">{item.summary}</p>
                          </div>
                          {item.read_url && (
                            <a
                              href={item.read_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-black gold-gradient rounded-lg py-2 hover:opacity-90 transition mt-2"
                            >
                              Read More
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Premium Research */}
            {activeTab.startsWith("Premium") && (
              <div>
                <div className="text-center max-w-xl mx-auto mb-8">
                  <h1 className="text-2xl font-black text-white">Premium Research</h1>
                  <p className="text-xs text-white/50 mt-1">Premium educational research and actionable insights. Priced per report.</p>
                </div>
                {premiumReports.length === 0 ? (
                  <p className="text-center py-10 text-xs text-white/35">No premium research published yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {premiumReports.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-white/10 bg-card/60 overflow-hidden flex flex-col justify-between">
                        <div className="relative">
                          {item.cover_image && <img src={item.cover_image} alt={item.title} className="h-44 w-full object-cover border-b border-white/5" />}
                          {!item.isUnlocked && (
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-[var(--gold)] font-black flex items-center gap-1">
                              <Lock className="h-3 w-3" /> Locked
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">{item.company}</span>
                            <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                            <p className="text-[10px] text-white/40">{item.publish_date} · {item.estimated_read_time || "10 min read"}</p>
                            <p className="text-xs text-white/60 line-clamp-3">{item.summary}</p>
                          </div>

                          <div className="pt-2">
                            {item.isUnlocked ? (
                              <a
                                href={getDownloadUrl(item.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-black gold-gradient rounded-lg py-2 hover:opacity-90 transition"
                              >
                                <Download className="h-3.5 w-3.5" /> Download Watermarked PDF
                              </a>
                            ) : (
                              <button
                                onClick={() => handleUnlock(item.id)}
                                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-black gold-gradient rounded-lg py-2 hover:opacity-90 transition"
                              >
                                Unlock Report – ₹{item.price}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
