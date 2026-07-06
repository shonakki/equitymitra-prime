/**
 * Reusable admin CRUD page used by Users, Payments, Trades, Videos, PDFs, Announcements.
 */
import { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight,
  CheckSquare, X, Check
} from "lucide-react";
import { api, ApiError } from "@/lib/api";

export type ColumnDef<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

interface AdminCrudPageProps<T extends { id: number }> {
  title: string;
  description?: string;
  apiBase: string;        // e.g. /api/admin/trades
  columns: ColumnDef<T>[];
  defaultForm: Partial<T>;
  formFields: Array<{
    key: keyof T;
    label: string;
    type?: "text" | "textarea" | "select" | "number";
    options?: string[];
    placeholder?: string;
  }>;
  searchPlaceholder?: string;
  statusOptions?: string[];
  readOnly?: boolean;
  libraryFilterValue?: string;
  libraryFilterOptions?: string[];
  libraryFilterLabel?: string;
  onLibraryFilterChange?: (value: string) => void;
}

export function AdminCrudPage<T extends { id: number; status?: string }>({
  title,
  description,
  apiBase,
  columns,
  defaultForm,
  formFields,
  searchPlaceholder = "Search…",
  statusOptions,
  readOnly = false,
  libraryFilterValue,
  libraryFilterOptions,
  libraryFilterLabel,
  onLibraryFilterChange,
}: AdminCrudPageProps<T>) {
  const [rows, setRows]       = useState<T[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  // Modal state
  const [modalOpen, setModalOpen]     = useState(false);
  const [editRow, setEditRow]         = useState<T | null>(null);
  const [formData, setFormData]       = useState<Partial<T>>(defaultForm);
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState("");

  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(libraryFilterValue ? { library: libraryFilterValue } : {}),
      });
      const res = await api.get<{ ok: boolean; data: T[]; total: number }>(`${apiBase}?${params}`);
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [apiBase, page, search, status, libraryFilterValue]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditRow(null); setFormData(defaultForm); setFormError(""); setModalOpen(true); };
  const openEdit   = (row: T) => { setEditRow(row); setFormData(row); setFormError(""); setModalOpen(true); };

  const saveRow = async () => {
    setSaving(true);
    setFormError("");
    try {
      if (editRow) {
        await api.patch(`${apiBase}/${editRow.id}`, formData);
      } else {
        await api.post(`${apiBase}`, formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (id: number) => {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    try {
      await api.delete(`${apiBase}/${id}`);
      fetchData();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Delete failed");
    }
  };

  const bulkAction = async (action: string) => {
    if (!selected.length) return;
    if (action === "delete" && !confirm(`Delete ${selected.length} records?`)) return;
    try {
      await api.post(`${apiBase}/bulk`, { action, ids: selected });
      setSelected([]);
      fetchData();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Bulk action failed");
    }
  };

  const toggleSelect = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">{title}</h1>
          {description && <p className="text-sm text-white/40 mt-0.5">{description}</p>}
        </div>
        {!readOnly && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg gold-gradient text-black text-xs font-bold px-4 py-2.5 hover:opacity-90 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Add New
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-card/60 px-3 py-2 focus-within:border-[var(--gold)]/40 transition">
          <Search className="h-3.5 w-3.5 text-white/40" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="bg-transparent text-xs text-white outline-none w-48"
          />
        </div>
        {statusOptions && (
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-lg border border-white/10 bg-card/60 text-xs text-white px-3 py-2 outline-none focus:border-[var(--gold)]/40"
          >
            <option value="">All statuses</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {libraryFilterOptions && (
          <select
            value={libraryFilterValue || ""}
            onChange={(e) => onLibraryFilterChange?.(e.target.value)}
            className="rounded-lg border border-white/10 bg-card/60 text-xs text-white px-3 py-2 outline-none focus:border-[var(--gold)]/40"
          >
            <option value="">{libraryFilterLabel || "All libraries"}</option>
            {libraryFilterOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        )}
        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto text-xs">
            <span className="text-white/50">{selected.length} selected</span>
            <button onClick={() => bulkAction("published")} className="rounded px-2.5 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition"><Check className="h-3.5 w-3.5 inline mr-1"/>Publish</button>
            <button onClick={() => bulkAction("draft")}     className="rounded px-2.5 py-1.5 bg-white/10 text-white/60 hover:bg-white/15 transition">Draft</button>
            <button onClick={() => bulkAction("archived")}  className="rounded px-2.5 py-1.5 bg-white/10 text-white/60 hover:bg-white/15 transition">Archive</button>
            <button onClick={() => bulkAction("delete")}    className="rounded px-2.5 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"><Trash2 className="h-3.5 w-3.5 inline mr-1"/>Delete</button>
          </div>
        )}
      </div>

      {/* Table */}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="rounded-xl border border-white/10 bg-card/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                {!readOnly && (
                  <th className="py-3 pl-4 pr-2 w-8">
                    <input
                      type="checkbox"
                      onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])}
                      checked={selected.length === rows.length && rows.length > 0}
                      className="accent-[var(--gold)]"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th key={String(col.key)} className={`py-3 px-4 text-left text-[10px] uppercase tracking-wider text-white/40 font-bold ${col.className || ""}`}>
                    {col.label}
                  </th>
                ))}
                {!readOnly && <th className="py-3 px-4 text-right text-[10px] uppercase tracking-wider text-white/40 font-bold">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length + (readOnly ? 0 : 2)} className="py-10 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--gold)] mx-auto" />
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={columns.length + (readOnly ? 0 : 2)} className="py-10 text-center text-sm text-white/30">No records found.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/3 transition group">
                  {!readOnly && (
                    <td className="py-3 pl-4 pr-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="accent-[var(--gold)]"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={String(col.key)} className={`py-3 px-4 text-white/80 ${col.className || ""}`}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[String(col.key)] ?? "—")}
                    </td>
                  ))}
                  {!readOnly && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => openEdit(row)} className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => deleteRow(row.id)} className="p-1.5 rounded hover:bg-red-500/10 text-white/50 hover:text-red-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-black/10">
          <p className="text-xs text-white/40">Showing {rows.length} of {total} records</p>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded border border-white/10 text-white/50 hover:text-white disabled:opacity-30 transition"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <span className="text-xs text-white/60 px-2">Page {page} / {totalPages || 1}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded border border-white/10 text-white/50 hover:text-white disabled:opacity-30 transition"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-card border border-white/15 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editRow ? "Edit Record" : "Add New"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-3">
              {formFields.map((field) => (
                <div key={String(field.key)}>
                  <label className="block text-xs text-white/50 mb-1 uppercase tracking-wider">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={String(formData[field.key] ?? "")}
                      onChange={(e) => setFormData((d) => ({ ...d, [field.key]: e.target.value }))}
                      rows={3}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-white outline-none focus:border-[var(--gold)]/50 transition resize-none"
                    />
                  ) : field.type === "select" && field.options ? (
                    <select
                      value={String(formData[field.key] ?? "")}
                      onChange={(e) => setFormData((d) => ({ ...d, [field.key]: e.target.value }))}
                      className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-white outline-none focus:border-[var(--gold)]/50 transition"
                    >
                      {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={String(formData[field.key] ?? "")}
                      onChange={(e) => setFormData((d) => ({ ...d, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-white outline-none focus:border-[var(--gold)]/50 transition"
                    />
                  )}
                </div>
              ))}
            </div>

            {formError && <p className="text-red-400 text-xs">{formError}</p>}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-white/60 hover:bg-white/5 transition">Cancel</button>
              <button onClick={saveRow} disabled={saving} className="flex-1 py-2.5 rounded-lg gold-gradient text-black text-sm font-bold hover:opacity-90 disabled:opacity-60 transition flex items-center justify-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editRow ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
