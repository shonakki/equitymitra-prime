import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/admin/ipo-research")({ component: AdminIpoResearch });

interface Row { id: number; ipo_name: string; industry: string; issue_size: string; open_date: string; listing_date: string; summary: string; read_url: string; publish_date: string; status: string; created_at: string; }

function AdminIpoResearch() {
  const statusBadge = (s: string) => { const c = s === "published" ? "text-emerald-400 bg-emerald-500/10" : "text-yellow-400 bg-yellow-500/10"; return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${c}`}>{s}</span>; };
  
  return (
    <AdminCrudPage<Row>
      title="IPO Research"
      description="Manage free IPO analysis reports."
      apiBase="/api/admin/ipo-research"
      searchPlaceholder="Search IPOs…"
      statusOptions={["draft", "published", "archived"]}
      columns={[
        { key: "ipo_name",     label: "IPO Name" },
        { key: "industry",     label: "Industry" },
        { key: "open_date",    label: "Open Date" },
        { key: "status",       label: "Status", render: (r) => statusBadge(r.status) },
        { key: "created_at",   label: "Created",   render: (r) => new Date(r.created_at).toLocaleDateString("en-IN") },
      ]}
      defaultForm={{ status: "draft" } as Partial<Row>}
      formFields={[
        { key: "ipo_name",     label: "IPO Name",    placeholder: "E.g., XYZ Tech IPO" },
        { key: "industry",     label: "Industry",    placeholder: "E.g., Software Services" },
        { key: "issue_size",   label: "Issue Size",  placeholder: "E.g., ₹500 Cr" },
        { key: "open_date",    label: "Open Date",   placeholder: "YYYY-MM-DD" },
        { key: "listing_date", label: "Listing Date",placeholder: "YYYY-MM-DD" },
        { key: "summary",      label: "Summary",     type: "textarea", placeholder: "Short description…" },
        { key: "read_url",     label: "Read Online URL", placeholder: "https://..." },
        { key: "publish_date", label: "Publish Date",placeholder: "YYYY-MM-DD" },
        { key: "status",       label: "Status",      type: "select", options: ["draft", "published", "archived"] },
      ]}
    />
  );
}
