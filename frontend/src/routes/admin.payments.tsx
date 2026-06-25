import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/admin/payments")({ component: AdminPayments });

interface PaymentRow { id: number; plan: string; amount: number; currency: string; status: string; created_at: string; phone?: string; email?: string; razorpay_payment_id?: string; }

function AdminPayments() {
  const statusBadge = (s: string) => {
    const c = s === "paid" ? "text-emerald-400 bg-emerald-500/10" : s === "failed" ? "text-red-400 bg-red-500/10" : "text-yellow-400 bg-yellow-500/10";
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${c}`}>{s}</span>;
  };
  return (
    <AdminCrudPage<PaymentRow>
      title="Payments"
      description="View all payment transactions. Read-only."
      apiBase="/api/admin/payments"
      searchPlaceholder="Search by plan or status…"
      statusOptions={["created", "paid", "failed", "refunded"]}
      readOnly
      columns={[
        { key: "id",         label: "ID",       className: "w-12 text-white/30" },
        { key: "phone",      label: "User",     render: (r) => r.phone || r.email || "—" },
        { key: "plan",       label: "Plan" },
        { key: "amount",     label: "Amount",   render: (r) => `₹${(r.amount / 100).toLocaleString("en-IN")}` },
        { key: "status",     label: "Status",   render: (r) => statusBadge(r.status) },
        { key: "razorpay_payment_id", label: "Razorpay ID", render: (r) => <span className="text-[10px] text-white/30 font-mono">{r.razorpay_payment_id || "—"}</span> },
        { key: "created_at", label: "Date",     render: (r) => new Date(r.created_at).toLocaleDateString("en-IN") },
      ]}
      defaultForm={{} as Partial<PaymentRow>}
      formFields={[]}
    />
  );
}
