import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

interface UserRow { id: number; phone: string; email: string; name: string; plan: string; is_admin: number; created_at: string; }

function AdminUsers() {
  const statusBadge = (plan: string) => {
    const colors: Record<string, string> = { Founder: "text-amber-400 bg-amber-500/10", Premium: "text-[var(--gold)] bg-[var(--gold)]/10", PremiumYearly: "text-blue-400 bg-blue-500/10", Starter: "text-white/60 bg-white/5", BeginnerProgram: "text-purple-400 bg-purple-500/10" };
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[plan] || "text-white/60 bg-white/5"}`}>{plan}</span>;
  };

  return (
    <AdminCrudPage<UserRow>
      title="Users"
      description="Manage all registered users and their plan assignments."
      apiBase="/api/admin/users"
      searchPlaceholder="Search by phone, email, or name…"
      statusOptions={["Starter", "Premium", "PremiumYearly", "BeginnerProgram", "Founder"]}
      columns={[
        { key: "id",         label: "ID",       className: "w-12 text-white/30" },
        { key: "phone",      label: "Phone",    render: (r) => r.phone || "—" },
        { key: "email",      label: "Email",    render: (r) => r.email || "—" },
        { key: "name",       label: "Name" },
        { key: "plan",       label: "Plan",     render: (r) => statusBadge(r.plan) },
        { key: "is_admin",   label: "Admin",    render: (r) => r.is_admin ? <span className="text-[var(--gold)] font-bold text-xs">Admin</span> : <span className="text-white/30 text-xs">—</span> },
        { key: "created_at", label: "Joined",   render: (r) => new Date(r.created_at).toLocaleDateString("en-IN") },
      ]}
      defaultForm={{ name: "Member", plan: "Starter", is_admin: 0 } as Partial<UserRow>}
      formFields={[
        { key: "name",     label: "Name",     placeholder: "Display name" },
        { key: "plan",     label: "Plan",     type: "select", options: ["Starter", "Premium", "PremiumYearly", "BeginnerProgram", "Founder"] },
        { key: "is_admin", label: "Is Admin (0 or 1)", type: "number", placeholder: "0" },
      ]}
    />
  );
}
