import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/admin/chart-studies")({ component: AdminChartStudies });

interface Row { id: number; title: string; summary: string; cover_image: string; content_url: string; publish_date: string; status: string; created_at: string; }

function AdminChartStudies() {
  const statusBadge = (s: string) => { const c = s === "published" ? "text-emerald-400 bg-emerald-500/10" : "text-yellow-400 bg-yellow-500/10"; return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${c}`}>{s}</span>; };
  
  return (
    <AdminCrudPage<Row>
      title="Chart Studies"
      description="Manage educational chart studies for the Research Hub."
      apiBase="/api/admin/chart-studies"
      searchPlaceholder="Search chart studies…"
      statusOptions={["draft", "published", "archived"]}
      columns={[
        { key: "title",        label: "Title" },
        { key: "publish_date", label: "Publish Date" },
        { key: "status",       label: "Status", render: (r) => statusBadge(r.status) },
        { key: "created_at",   label: "Created",   render: (r) => new Date(r.created_at).toLocaleDateString("en-IN") },
      ]}
      defaultForm={{ status: "draft" } as Partial<Row>}
      formFields={[
        { key: "title",        label: "Title",       placeholder: "Study Title" },
        { key: "summary",      label: "Summary",     type: "textarea", placeholder: "Short description…" },
        { key: "cover_image",  label: "Cover Image URL", placeholder: "https://..." },
        { key: "content_url",  label: "Read More URL", placeholder: "Link to full article/pdf" },
        { key: "publish_date", label: "Publish Date", placeholder: "YYYY-MM-DD" },
        { key: "status",       label: "Status",      type: "select", options: ["draft", "published", "archived"] },
      ]}
    />
  );
}
