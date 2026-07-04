import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/admin/premium-research")({ component: AdminPremiumResearch });

interface Row { 
  id: number; 
  title: string; 
  company: string; 
  summary: string; 
  preview_text: string;
  estimated_read_time: string;
  cover_image: string; 
  pdf_url: string; 
  price: number; 
  publish_date: string; 
  display_order: number;
  is_featured: number;
  status: string; 
  created_at: string; 
}

function AdminPremiumResearch() {
  const statusBadge = (s: string) => { const c = s === "published" ? "text-emerald-400 bg-emerald-500/10" : "text-yellow-400 bg-yellow-500/10"; return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${c}`}>{s}</span>; };
  
  return (
    <AdminCrudPage<Row>
      title="Premium Research"
      description="Manage paid premium educational research reports."
      apiBase="/api/admin/premium-research"
      searchPlaceholder="Search premium reports…"
      statusOptions={["draft", "published", "archived"]}
      columns={[
        { key: "title",        label: "Title" },
        { key: "company",      label: "Company" },
        { key: "price",        label: "Price (₹)", render: (r) => `₹${r.price}` },
        { key: "display_order",label: "Order" },
        { key: "is_featured",  label: "Featured?", render: (r) => r.is_featured === 1 ? "Yes" : "No" },
        { key: "status",       label: "Status", render: (r) => statusBadge(r.status) },
      ]}
      defaultForm={{ price: 99, display_order: 0, is_featured: 0, status: "draft" } as Partial<Row>}
      formFields={[
        { key: "title",               label: "Report Title",       placeholder: "Report Title" },
        { key: "company",             label: "Company",             placeholder: "E.g., Reliance Industries" },
        { key: "summary",             label: "Full Summary",        type: "textarea", placeholder: "Detailed summary…" },
        { key: "preview_text",        label: "Preview Text",        type: "textarea", placeholder: "Locked state preview text (what free users see)…" },
        { key: "estimated_read_time", label: "Est. Read Time",      placeholder: "E.g., 5 mins read" },
        { key: "cover_image",         label: "Cover Image URL",     placeholder: "https://..." },
        { key: "pdf_url",             label: "PDF Document URL",    placeholder: "https://...pdf" },
        { key: "price",               label: "Price (INR - in Rupees)", type: "number", placeholder: "99" },
        { key: "display_order",       label: "Display Order",       type: "number", placeholder: "0" },
        { key: "is_featured",         label: "Featured? (1 for Yes, 0 for No)", type: "number", placeholder: "0" },
        { key: "publish_date",        label: "Publish Date",        placeholder: "YYYY-MM-DD" },
        { key: "status",              label: "Status",              type: "select", options: ["draft", "published", "archived"] },
      ]}
    />
  );
}
