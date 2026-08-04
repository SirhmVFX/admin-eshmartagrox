"use client";

import { useEffect, useState } from "react";
import {
    getConsultationTiers, createConsultationTier,
    updateConsultationTier, deleteConsultationTier, ConsultationTier,
} from "@/lib/firestore";
import { MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";

const empty: Omit<ConsultationTier, "id"> = {
    icon: "📞", title: "", subtitle: "", price: 0, active: true, order: 0,
};

export default function ConsultationsPage() {
    const [tiers, setTiers] = useState<ConsultationTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<ConsultationTier | null>(null);
    const [form, setForm] = useState<Omit<ConsultationTier, "id">>(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function load() {
        setLoading(true);
        try { setTiers(await getConsultationTiers()); } finally { setLoading(false); }
    }
    useEffect(() => { load(); }, []);

    function openNew() { setEditing(null); setForm(empty); setError(""); setShowModal(true); }
    function openEdit(t: ConsultationTier) {
        setEditing(t);
        setForm({ icon: t.icon, title: t.title, subtitle: t.subtitle, price: t.price, active: t.active, order: t.order ?? 0 });
        setError(""); setShowModal(true);
    }

    async function handleSave() {
        if (!form.title.trim()) { setError("Title is required."); return; }
        if (form.price <= 0) { setError("Price must be greater than 0."); return; }
        setSaving(true); setError("");
        try {
            if (editing?.id) await updateConsultationTier(editing.id, form);
            else await createConsultationTier(form);
            setShowModal(false); await load();
        } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this tier?")) return;
        await deleteConsultationTier(id); await load();
    }

    async function toggleActive(t: ConsultationTier) {
        if (!t.id) return;
        await updateConsultationTier(t.id, { active: !t.active }); await load();
    }

    return (
        <div className="max-w-3xl space-y-4">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Nutrition Consultation Tiers</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Manage the pricing tiers shown in the Nutrition Consultations section</p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={openNew}><MdAdd size={16} /> Add Tier</button>
            </div>

            {loading ? <div className="admin-card text-sm text-gray-500">Loading…</div> : tiers.length === 0 ? (
                <div className="admin-card text-center py-12 space-y-3">
                    <p className="text-gray-500">No tiers yet. The site uses built-in defaults until you add tiers here.</p>
                    <button className="btn-primary" onClick={openNew}>Add first tier</button>
                </div>
            ) : (
                <div className="admin-card p-0 overflow-hidden">
                    <table className="admin-table">
                        <thead>
                            <tr><th>Order</th><th>Icon</th><th>Title</th><th>Subtitle</th><th>Price</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {tiers.map(t => (
                                <tr key={t.id}>
                                    <td className="font-mono text-xs text-gray-400">{t.order}</td>
                                    <td className="text-xl">{t.icon}</td>
                                    <td className="font-semibold text-gray-900">{t.title}</td>
                                    <td className="text-gray-500 text-sm">{t.subtitle}</td>
                                    <td className="font-semibold text-green-700">₦{t.price.toLocaleString()}</td>
                                    <td>
                                        <button onClick={() => toggleActive(t)}>
                                            <span className={`badge ${t.active ? "badge-green" : "badge-gray"}`}>{t.active ? "Active" : "Hidden"}</span>
                                        </button>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(t)}><MdEdit size={13} /></button>
                                            <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(t.id!)}><MdDelete size={13} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                            <h2 className="text-base font-semibold">{editing ? "Edit Tier" : "Add Tier"}</h2>
                            <button onClick={() => setShowModal(false)}><MdClose size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="admin-label">Icon (emoji)</label>
                                    <input className="admin-input text-2xl text-center" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} maxLength={4} />
                                </div>
                                <div className="col-span-3">
                                    <label className="admin-label">Title *</label>
                                    <input className="admin-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Basic · 15 min" />
                                </div>
                            </div>
                            <div>
                                <label className="admin-label">Subtitle</label>
                                <input className="admin-input" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="e.g. Phone call" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Price (₦) *</label>
                                    <input type="number" min="0" className="admin-input" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="admin-label">Display Order</label>
                                    <input type="number" min="0" className="admin-input" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                                Active (visible on site)
                            </label>
                            <div className="flex gap-3 pt-2">
                                <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editing ? "Update" : "Add Tier"}</button>
                                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
