import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/admin/research-reports")({ component: AdminResearchReports });

interface Row { id: number; title: string; company: string; category: string; cover_image: string; read_url: string; publish_date: string; status: string; created_at: string; }

function AdminResearchReports() {
  const statusBadge = (s: string) => { const c = s === "published" ? "text-emerald-400 bg-emerald-500/10" : "text-yellow-400 bg-yellow-500/10"; return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${c}`}>{s}</span>; };
  
  return (
    <AdminCrudPage<Row>
      title="Research Reports"
      description="Manage free educational research reports."
      apiBase="/api/admin/research-reports"
      searchPlaceholder="Search reports…"
      statusOptions={["draft", "published", "archived"]}
      columns={[
        { key: "title",        label: "Title" },
        { key: "company",      label: "Company" },
        { key: "publish_date", label: "Publish Date" },
        { key: "status",       label: "Status", render: (r) => statusBadge(r.status) },
        { key: "created_at",   label: "Created",   render: (r) => new Date(r.created_at).toLocaleDateString("en-IN") },
      ]}
      defaultForm={{ status: "draft" } as Partial<Row>}
      formFields={[
        { key: "title",        label: "Report Title",placeholder: "Report Title" },
        { key: "company",      label: "Company",     placeholder: "E.g., Reliance Industries" },
        { key: "category",     label: "Category",    placeholder: "E.g., Large Cap" },
        { key: "cover_image",  label: "Cover Image URL", placeholder: "https://..." },
        { key: "read_url",     label: "Read Online URL (PDF)", placeholder: "https://...pdf" },
        { key: "publish_date", label: "Publish Date", placeholder: "YYYY-MM-DD" },
        { key: "status",       label: "Status",      type: "select", options: ["draft", "published", "archived"] },
      ]}
    />
  );
}
