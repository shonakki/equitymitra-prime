import { createFileRoute } from "@tanstack/react-router";
import { AdminCrudPage } from "@/components/admin/AdminCrudPage";

export const Route = createFileRoute("/admin/trades")({ component: AdminTrades });

interface TradeRow { id: number; symbol: string; exchange: string; category: string; side: string; entry: string; target1: string; target2: string; stop_loss: string; risk_level: string; potential: string; notes: string; status: string; created_at: string; setup: string; }

function AdminTrades() {
  const statusBadge = (s: string) => {
    const c = s === "published" ? "text-emerald-400 bg-emerald-500/10" : s === "archived" ? "text-white/30 bg-white/5" : "text-yellow-400 bg-yellow-500/10";
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${c}`}>{s}</span>;
  };
  return (
    <AdminCrudPage<TradeRow>
      title="Trades CMS"
      description="Manage trade setups. These are NOT visible to the public until SEBI registration."
      apiBase="/api/admin/trades"
      searchPlaceholder="Search by symbol or category…"
      statusOptions={["draft", "published", "archived"]}
      columns={[
        { key: "symbol",    label: "Symbol" },
        { key: "category",  label: "Category" },
        { key: "side",      label: "Side",     render: (r) => <span className={r.side === "Bullish" ? "text-emerald-400" : "text-red-400"}>{r.side}</span> },
        { key: "entry",     label: "Entry" },
        { key: "target1",   label: "Target 1" },
        { key: "stop_loss", label: "SL" },
        { key: "risk_level",label: "Risk" },
        { key: "status",    label: "Status",   render: (r) => statusBadge(r.status) },
        { key: "created_at",label: "Date",     render: (r) => new Date(r.created_at).toLocaleDateString("en-IN") },
      ]}
      defaultForm={{ symbol: "", exchange: "NSE", category: "Positional", side: "Bullish", status: "draft" } as Partial<TradeRow>}
      formFields={[
        { key: "symbol",    label: "Symbol",    placeholder: "e.g. RELIANCE" },
        { key: "exchange",  label: "Exchange",  type: "select", options: ["NSE", "BSE", "MCX"] },
        { key: "category",  label: "Category",  type: "select", options: ["Positional", "Swing", "Mid Term", "Long Term", "F&O", "Wealth Creator"] },
        { key: "side",      label: "Side",      type: "select", options: ["Bullish", "Bearish"] },
        { key: "entry",     label: "Entry Price" },
        { key: "target1",   label: "Target 1" },
        { key: "target2",   label: "Target 2" },
        { key: "stop_loss", label: "Stop Loss" },
        { key: "risk_level",label: "Risk Level", type: "select", options: ["Low", "Medium", "High"] },
        { key: "potential", label: "Potential %" },
        { key: "notes",     label: "Notes",     type: "textarea" },
        { key: "status",    label: "Status",    type: "select", options: ["draft", "published", "archived"] },
      ]}
    />
  );
}
