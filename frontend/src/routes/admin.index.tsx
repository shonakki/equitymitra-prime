import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Users, CreditCard, TrendingUp, IndianRupee, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

interface Stats {
  totalUsers: number;
  totalPayments: number;
  totalRevenue: number;
  planBreakdown: Array<{ plan: string; cnt: number }>;
  recentPayments: Array<{ id: number; plan: string; amount: number; status: string; created_at: string; phone?: string; email?: string }>;
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-card/60 p-5 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs text-white/45 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ ok: boolean; data: Stats }>("/api/admin/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatRupees = (r: number) => `₹${r.toLocaleString("en-IN")}`;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
        <p className="text-sm text-white/45 mt-1">Real-time overview of EquityMitra platform.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/40"><Loader2 className="h-5 w-5 animate-spin" />Loading stats...</div>
      ) : error ? (
        <div className="text-red-400 text-sm">{error}</div>
      ) : stats && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users}       label="Total Users"    value={stats.totalUsers}                     color="bg-blue-500/10 text-blue-400" />
            <StatCard icon={CreditCard}  label="Total Payments" value={stats.totalPayments}                  color="bg-emerald-500/10 text-emerald-400" />
            <StatCard icon={IndianRupee} label="Total Revenue"  value={formatRupees(stats.totalRevenue)}     color="bg-[var(--gold)]/10 text-[var(--gold)]" />
            <StatCard icon={TrendingUp}  label="Active Plans"   value={stats.planBreakdown.length + " types"} color="bg-purple-500/10 text-purple-400" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Plan Breakdown */}
            <div className="rounded-xl border border-white/10 bg-card/60 p-5">
              <h2 className="text-sm font-bold text-white mb-4">Plan Distribution</h2>
              <div className="space-y-3">
                {stats.planBreakdown.map((row) => (
                  <div key={row.plan} className="flex items-center justify-between">
                    <span className="text-sm text-white/70">{row.plan}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full gold-gradient rounded-full"
                          style={{ width: `${Math.min(100, (row.cnt / Math.max(1, stats.totalUsers)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white w-6 text-right">{row.cnt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Payments */}
            <div className="rounded-xl border border-white/10 bg-card/60 p-5">
              <h2 className="text-sm font-bold text-white mb-4">Recent Payments</h2>
              <div className="space-y-2">
                {stats.recentPayments.length === 0 ? (
                  <p className="text-sm text-white/30">No payments yet.</p>
                ) : stats.recentPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">{p.phone || p.email}</p>
                      <p className="text-[10px] text-white/40">{p.plan} · {new Date(p.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[var(--gold)]">₹{(p.amount / 100).toLocaleString("en-IN")}</p>
                      <p className={`text-[10px] font-semibold ${p.status === "paid" ? "text-emerald-400" : "text-red-400"}`}>{p.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
