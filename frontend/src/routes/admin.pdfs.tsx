import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";
export const Route = createFileRoute("/admin/pdfs")({ component: AdminPdfs });
interface PdfRow { id: number; title: string; description: string; url: string; category: string; required_plan: string; release_month: number; sort_order: number; library: string; status: string; created_at: string; }
function AdminPdfs() {
  const [library, setLibrary] = useState("");
  const statusBadge = (s: string) => { const c = s === "published" ? "text-emerald-400 bg-emerald-500/10" : s === "archived" ? "text-white/30 bg-white/5" : "text-yellow-400 bg-yellow-500/10"; return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${c}`}>{s}</span>; };
  return (
    <AdminCrudPage<PdfRow>
      title="PDFs / Notes CMS"
      description="Manage beginner and founder notes libraries."
      apiBase="/api/admin/pdfs"
      searchPlaceholder="Search by title or category…"
      statusOptions={["draft", "published", "archived"]}
      libraryFilterValue={library}
      libraryFilterOptions={["beginner-notes", "founder-notes"]}
      libraryFilterLabel="All note libraries"
      onLibraryFilterChange={setLibrary}
      columns={[
        { key: "title",         label: "Title" },
        { key: "category",      label: "Category" },
        { key: "library",       label: "Library", render: (r) => <span className="text-[var(--gold)] text-xs">{r.library === "founder-notes" ? "Founder Notes" : "Beginner Notes"}</span> },
        { key: "required_plan", label: "Min Plan", render: (r) => <span className="text-[var(--gold)] text-xs">{r.required_plan}</span> },
        { key: "release_month", label: "Release Month", render: (r) => r.release_month ? String(r.release_month) : "—" },
        { key: "status",        label: "Status", render: (r) => statusBadge(r.status) },
        { key: "created_at",    label: "Added",  render: (r) => new Date(r.created_at).toLocaleDateString("en-IN") },
      ]}
      defaultForm={{ required_plan: "Premium", library: "beginner-notes", status: "draft" } as Partial<PdfRow>}
      formFields={[
        { key: "title",         label: "Title",           placeholder: "PDF title" },
        { key: "description",   label: "Description",     type: "textarea" },
        { key: "url",           label: "PDF URL",         placeholder: "Direct download link" },
        { key: "category",      label: "Category",        type: "select", options: ["Market Overview", "Technical Analysis", "Fundamental Analysis", "IPO Notes", "Strategy", "F&O"] },
        { key: "library",       label: "Library",         type: "select", options: ["beginner-notes", "founder-notes"] },
        { key: "required_plan", label: "Minimum Plan",    type: "select", options: ["Premium", "PremiumYearly", "Founder"] },
        { key: "release_month", label: "Release Month (YYYYMM)", type: "number" },
        { key: "sort_order",    label: "Sort Order",      type: "number" },
        { key: "status",        label: "Status",          type: "select", options: ["draft", "published", "archived"] },
      ]}
    />
  );
}
