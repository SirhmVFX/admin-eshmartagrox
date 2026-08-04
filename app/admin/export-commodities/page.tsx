"use client";

import { useEffect, useState } from "react";
import {
    getExportCommodities, createExportCommodity, updateExportCommodity,
    deleteExportCommodity, ExportCommodity,
} from "@/lib/firestore";
import ImageUpload from "@/components/ImageUpload";
import { MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";

const empty: Omit<ExportCommodity, "id"> = {
    name: "", spec: "", priceMin: 0, priceMax: 0, moq: "",
    catalogType: "raw", image: "", active: true, order: 0,
};

export default function ExportCommoditiesPage() {
    const [items, setItems] = useState<ExportCommodity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<ExportCommodity | null>(null);
    const [form, setForm] = useState<Omit<ExportCommodity, "id">>(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [filterType, setFilterType] = useState<"all" | "raw" | "processed">("all");

    async function load() {
        setLoading(true);
        try { setItems(await getExportCommodities()); } finally { setLoading(false); }
    }
    useEffect(() => { load(); }, []);

    function openNew() { setEditing(null); setForm(empty); setError(""); setShowModal(true); }
    function openEdit(c: ExportCommodity) {
        setEditing(c);
        setForm({
            name: c.name, spec: c.spec, priceMin: c.priceMin, priceMax: c.priceMax,
            moq: c.moq, catalogType: c.catalogType ?? "raw", image: c.image ?? "",
            active: c.active, order: c.order ?? 0,
        });
        setError(""); setShowModal(true);
    }

    async function handleSave() {
        if (!form.name.trim()) { setError("Name is required."); return; }
        if (form.priceMin <= 0) { setError("Min price must be greater than 0."); return; }
        setSaving(true); setError("");
        try {
            if (editing?.id) await updateExportCommodity(editing.id, form);
            else await createExportCommodity(form);
            setShowModal(false); await load();
        } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this commodity?")) return;
        await deleteExportCommodity(id); await load();
    }

    async function toggleActive(c: ExportCommodity) {
        if (!c.id) return;
        await updateExportCommodity(c.id, { active: !c.active }); await load();
    }

    const filtered = filterType === "all" ? items : items.filter(c => c.catalogType === filterType);
    const rawCount = items.filter(c => c.catalogType === "raw").length;
    const processedCount = items.filter(c => c.catalogType === "processed").length;

    return (
        <div className="max-w-5xl space-y-4">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Export Commodities</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Manage Raw and Processed commodities shown on the homepage and International Export page
                    </p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={openNew}>
                    <MdAdd size={16} /> New Commodity
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 border-b border-gray-200">
                {([["all", `All (${items.length})`], ["raw", `Raw (${rawCount})`], ["processed", `Processed (${processedCount})`]] as const).map(([f, label]) => (
                    <button
                        key={f}
                        onClick={() => setFilterType(f)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize transition-colors ${filterType === f ? "border-green-700 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="admin-card text-sm text-gray-500">Loading…</div>
            ) : filtered.length === 0 ? (
                <div className="admin-card text-center py-12 text-gray-400">
                    No commodities yet. Add your first one.
                </div>
            ) : (
                <div className="admin-card p-0 overflow-hidden overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Image</th>
                                <th>Commodity</th>
                                <th>Type</th>
                                <th>Spec</th>
                                <th>Price Range (USD/MT)</th>
                                <th>MOQ</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.id}>
                                    <td className="font-mono text-xs text-gray-400">{c.order}</td>
                                    <td>
                                        {c.image ? (
                                            <img src={c.image} alt="" className="w-10 h-10 object-cover rounded" />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs">—</div>
                                        )}
                                    </td>
                                    <td className="font-medium text-gray-900 max-w-[180px] truncate">{c.name}</td>
                                    <td>
                                        <span className={`badge text-[10px] ${c.catalogType === "raw" ? "badge-green" : "badge-blue"}`}>
                                            {c.catalogType}
                                        </span>
                                    </td>
                                    <td className="text-gray-500 text-sm max-w-[160px] truncate">{c.spec}</td>
                                    <td className="text-sm font-semibold text-green-700 whitespace-nowrap">
                                        ${c.priceMin.toLocaleString()} – ${c.priceMax.toLocaleString()} / MT
                                    </td>
                                    <td className="text-sm text-gray-600 whitespace-nowrap">{c.moq}</td>
                                    <td>
                                        <button onClick={() => toggleActive(c)}>
                                            <span className={`badge ${c.active ? "badge-green" : "badge-gray"}`}>
                                                {c.active ? "Active" : "Hidden"}
                                            </span>
                                        </button>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(c)}>
                                                <MdEdit size={13} />
                                            </button>
                                            <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(c.id!)}>
                                                <MdDelete size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: 560 }}>
                        <div className="modal-header">
                            <h2 className="text-base font-semibold">{editing ? "Edit Commodity" : "New Commodity"}</h2>
                            <button onClick={() => setShowModal(false)}><MdClose size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "75vh" }}>
                            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Catalog Type *</label>
                                    <select
                                        className="admin-input"
                                        value={form.catalogType}
                                        onChange={e => setForm({ ...form, catalogType: e.target.value as "raw" | "processed" })}
                                    >
                                        <option value="raw">Raw</option>
                                        <option value="processed">Processed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="admin-label">Display Order</label>
                                    <input type="number" className="admin-input" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
                                </div>
                            </div>

                            <div>
                                <label className="admin-label">Commodity Name *</label>
                                <input className="admin-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sesame seeds (white)" />
                            </div>

                            <div>
                                <label className="admin-label">Grade / Spec</label>
                                <input className="admin-input" value={form.spec} onChange={e => setForm({ ...form, spec: e.target.value })} placeholder="e.g. 99% purity, FFA <2%" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Min Price (USD/MT) *</label>
                                    <input type="number" className="admin-input" value={form.priceMin} onChange={e => setForm({ ...form, priceMin: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="admin-label">Max Price (USD/MT) *</label>
                                    <input type="number" className="admin-input" value={form.priceMax} onChange={e => setForm({ ...form, priceMax: Number(e.target.value) })} />
                                </div>
                            </div>

                            <div>
                                <label className="admin-label">MOQ</label>
                                <input className="admin-input" value={form.moq} onChange={e => setForm({ ...form, moq: e.target.value })} placeholder="e.g. 25 MT" />
                            </div>

                            <ImageUpload
                                value={form.image ?? ""}
                                onChange={url => setForm({ ...form, image: url })}
                                label="Product Image (shown in catalog table)"
                            />

                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                                Active (visible on export pages)
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving…" : editing ? "Update" : "Create"}
                                </button>
                                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
