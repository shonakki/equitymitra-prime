import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/admin/sector-research")({ component: AdminSectorResearch });

interface Row { id: number; sector_name: string; sector_image: string; summary: string; read_url: string; publish_date: string; status: string; created_at: string; }

function AdminSectorResearch() {
  const statusBadge = (s: string) => { const c = s === "published" ? "text-emerald-400 bg-emerald-500/10" : "text-yellow-400 bg-yellow-500/10"; return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${c}`}>{s}</span>; };
  
  return (
    <AdminCrudPage<Row>
      title="Sector Research"
      description="Manage free industry-wise research reports."
      apiBase="/api/admin/sector-research"
      searchPlaceholder="Search sectors…"
      statusOptions={["draft", "published", "archived"]}
      columns={[
        { key: "sector_name",  label: "Sector Name" },
        { key: "publish_date", label: "Publish Date" },
        { key: "status",       label: "Status", render: (r) => statusBadge(r.status) },
        { key: "created_at",   label: "Created",   render: (r) => new Date(r.created_at).toLocaleDateString("en-IN") },
      ]}
      defaultForm={{ status: "draft" } as Partial<Row>}
      formFields={[
        { key: "sector_name",  label: "Sector Name", placeholder: "E.g., Banking" },
        { key: "sector_image", label: "Sector Image URL", placeholder: "https://..." },
        { key: "summary",      label: "Summary",     type: "textarea", placeholder: "Short description…" },
        { key: "read_url",     label: "Read Online URL", placeholder: "https://..." },
        { key: "publish_date", label: "Publish Date",placeholder: "YYYY-MM-DD" },
        { key: "status",       label: "Status",      type: "select", options: ["draft", "published", "archived"] },
      ]}
    />
  );
}
