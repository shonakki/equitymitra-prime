import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";
export const Route = createFileRoute("/admin/announcements")({ component: AdminAnnouncements });
interface AnnRow { id: number; title: string; content: string; type: string; status: string; created_at: string; }
function AdminAnnouncements() {
  const statusBadge = (s: string) => { const c = s === "published" ? "text-emerald-400 bg-emerald-500/10" : "text-yellow-400 bg-yellow-500/10"; return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${c}`}>{s}</span>; };
  const typeBadge = (t: string) => { const c: Record<string, string> = { info: "text-blue-400", success: "text-emerald-400", warning: "text-yellow-400", error: "text-red-400" }; return <span className={`text-xs font-semibold ${c[t] || "text-white/50"}`}>{t}</span>; };
  return (
    <AdminCrudPage<AnnRow>
      title="Announcements"
      description="Manage platform announcements visible to users."
      apiBase="/api/admin/announcements"
      searchPlaceholder="Search announcements…"
      statusOptions={["draft", "published", "archived"]}
      columns={[
        { key: "title",      label: "Title" },
        { key: "type",       label: "Type",   render: (r) => typeBadge(r.type) },
        { key: "status",     label: "Status", render: (r) => statusBadge(r.status) },
        { key: "created_at", label: "Date",   render: (r) => new Date(r.created_at).toLocaleDateString("en-IN") },
      ]}
      defaultForm={{ type: "info", status: "draft" } as Partial<AnnRow>}
      formFields={[
        { key: "title",   label: "Title",   placeholder: "Announcement title" },
        { key: "content", label: "Content", type: "textarea", placeholder: "Full announcement text…" },
        { key: "type",    label: "Type",    type: "select", options: ["info", "success", "warning", "error"] },
        { key: "status",  label: "Status",  type: "select", options: ["draft", "published", "archived"] },
      ]}
    />
  );
}
