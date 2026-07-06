import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/admin/videos")({ component: AdminVideos });
interface VideoRow { id: number; title: string; description: string; url: string; thumbnail: string; category: string; required_plan: string; duration: string; release_month: number; sort_order: number; library: string; status: string; created_at: string; }
function AdminVideos() {
  const [library, setLibrary] = useState("");
  const statusBadge = (s: string) => {
    const c = s === "published" ? "text-emerald-400 bg-emerald-500/10" : s === "archived" ? "text-white/30 bg-white/5" : "text-yellow-400 bg-yellow-500/10";
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${c}`}>{s}</span>;
  };
  return (
    <AdminCrudPage<VideoRow>
      title="Videos CMS"
      description="Manage beginner and founder video libraries."
      apiBase="/api/admin/videos"
      searchPlaceholder="Search by title or category…"
      statusOptions={["draft", "published", "archived"]}
      libraryFilterValue={library}
      libraryFilterOptions={["beginner-videos", "founder-videos"]}
      libraryFilterLabel="All video libraries"
      onLibraryFilterChange={setLibrary}
      columns={[
        { key: "title",         label: "Title" },
        { key: "category",      label: "Category" },
        { key: "library",       label: "Library", render: (r) => <span className="text-[var(--gold)] text-xs">{r.library === "founder-videos" ? "Founder Videos" : "Beginner Videos"}</span> },
        { key: "required_plan", label: "Min Plan", render: (r) => <span className="text-[var(--gold)] text-xs">{r.required_plan}</span> },
        { key: "duration",      label: "Duration" },
        { key: "release_month", label: "Release Month", render: (r) => r.release_month ? String(r.release_month) : "—" },
        { key: "status",        label: "Status",  render: (r) => statusBadge(r.status) },
        { key: "created_at",    label: "Added",   render: (r) => new Date(r.created_at).toLocaleDateString("en-IN") },
      ]}
      defaultForm={{ required_plan: "Premium", library: "beginner-videos", status: "draft" } as Partial<VideoRow>}
      formFields={[
        { key: "title",         label: "Title",           placeholder: "Video title" },
        { key: "description",   label: "Description",     type: "textarea" },
        { key: "url",           label: "Video URL",       placeholder: "YouTube or direct URL" },
        { key: "thumbnail",     label: "Thumbnail URL" },
        { key: "duration",      label: "Duration",        placeholder: "e.g. 45:00" },
        { key: "category",      label: "Category",        type: "select", options: ["Beginner", "Technical Analysis", "Fundamental Analysis", "Risk Management", "F&O", "Advanced"] },
        { key: "library",       label: "Library",         type: "select", options: ["beginner-videos", "founder-videos"] },
        { key: "required_plan", label: "Minimum Plan",    type: "select", options: ["Starter", "Premium", "PremiumYearly", "BeginnerProgram", "Founder"] },
        { key: "release_month", label: "Release Month (YYYYMM)", type: "number", placeholder: "e.g. 202506" },
        { key: "sort_order",    label: "Sort Order",      type: "number", placeholder: "0" },
        { key: "status",        label: "Status",          type: "select", options: ["draft", "published", "archived"] },
      ]}
    />
  );
}
