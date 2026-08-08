"use client";

import { useEffect, useState } from "react";
import {
    getNutritionists, createNutritionist, updateNutritionist, deleteNutritionist,
    Nutritionist, NutritionistTier,
} from "@/lib/firestore";
import ImageUpload from "@/components/ImageUpload";
import { MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";

const DEFAULT_TIERS: NutritionistTier[] = [
    { icon: "📞", title: "Basic · 15 min", subtitle: "Phone call", price: 4500 },
    { icon: "💬", title: "Standard · 30 min", subtitle: "WhatsApp", price: 8500 },
    { icon: "🎥", title: "Premium · 60 min", subtitle: "Video call", price: 15000 },
];

const emptyNutritionist: Omit<Nutritionist, "id"> = {
    name: "", designation: "", photo: "", active: true, order: 0,
    tiers: DEFAULT_TIERS.map(t => ({ ...t })),
};

export default function ConsultationsPage() {
    const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Nutritionist | null>(null);
    const [form, setForm] = useState<Omit<Nutritionist, "id">>(emptyNutritionist);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function load() {
        setLoading(true);
        try { setNutritionists(await getNutritionists()); } finally { setLoading(false); }
    }
    useEffect(() => { load(); }, []);

    function openNew() {
        setEditing(null);
        setForm({ ...emptyNutritionist, tiers: DEFAULT_TIERS.map(t => ({ ...t })) });
        setError(""); setShowModal(true);
    }
    function openEdit(n: Nutritionist) {
        setEditing(n);
        setForm({
            name: n.name, designation: n.designation, photo: n.photo,
            active: n.active, order: n.order ?? 0,
            tiers: n.tiers?.length ? n.tiers.map(t => ({ ...t })) : DEFAULT_TIERS.map(t => ({ ...t })),
        });
        setError(""); setShowModal(true);
    }

    async function handleSave() {
        if (!form.name.trim()) { setError("Name is required."); return; }
        if (!form.designation.trim()) { setError("Designation is required."); return; }
        if (form.tiers.some(t => !t.title.trim())) { setError("All tier titles are required."); return; }
        setSaving(true); setError("");
        try {
            if (editing?.id) await updateNutritionist(editing.id, form);
            else await createNutritionist(form);
            setShowModal(false); await load();
        } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this nutritionist?")) return;
        await deleteNutritionist(id); await load();
    }

    async function toggleActive(n: Nutritionist) {
        if (!n.id) return;
        await updateNutritionist(n.id, { active: !n.active }); await load();
    }

    function updateTier(i: number, patch: Partial<NutritionistTier>) {
        const tiers = [...form.tiers];
        tiers[i] = { ...tiers[i], ...patch };
        setForm({ ...form, tiers });
    }
    function addTier() {
        setForm({ ...form, tiers: [...form.tiers, { icon: "📋", title: "", subtitle: "", price: 0 }] });
    }
    function removeTier(i: number) {
        setForm({ ...form, tiers: form.tiers.filter((_, j) => j !== i) });
    }

    return (
        <div className="max-w-5xl space-y-5">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Nutritionists</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Add up to 3 nutritionists. Each has their own name, photo, and pricing tiers. They appear as a slideshow on the homepage consultation section.
                    </p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={openNew}>
                    <MdAdd size={16} /> Add Nutritionist
                </button>
            </div>

            {loading ? (
                <div className="admin-card text-sm text-gray-500">Loading…</div>
            ) : nutritionists.length === 0 ? (
                <div className="admin-card text-center py-14 space-y-3">
                    <p className="text-4xl">👩‍⚕️</p>
                    <p className="text-gray-600 font-medium">No nutritionists yet</p>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto">
                        Add nutritionists here. Each one will appear as a slide on the homepage with their photo, name, designation and their own pricing tiers.
                    </p>
                    <button className="btn-primary mt-2" onClick={openNew}>Add first nutritionist</button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {nutritionists.map(n => (
                        <div key={n.id} className="admin-card space-y-4">
                            {/* Photo + name */}
                            <div className="flex items-start gap-3">
                                <div className="w-16 h-16 bg-gray-100 overflow-hidden shrink-0">
                                    {n.photo
                                        ? <img src={n.photo} alt={n.name} className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                                        : <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">👤</div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{n.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{n.designation}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Order: {n.order}</p>
                                </div>
                            </div>

                            {/* Tiers */}
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pricing Tiers</p>
                                {(n.tiers ?? []).map((t, i) => (
                                    <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 px-3 py-2 text-sm">
                                        <span className="flex items-center gap-2">
                                            <span>{t.icon}</span>
                                            <span className="font-medium text-gray-800">{t.title}</span>
                                            <span className="text-gray-400 text-xs">· {t.subtitle}</span>
                                        </span>
                                        <span className="font-bold text-green-700 text-xs">₦{t.price.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                                <button onClick={() => toggleActive(n)}>
                                    <span className={`badge ${n.active ? "badge-green" : "badge-gray"}`}>{n.active ? "Active" : "Hidden"}</span>
                                </button>
                                <button className="btn-secondary py-1 px-2 text-xs ml-auto" onClick={() => openEdit(n)}><MdEdit size={13} /></button>
                                <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(n.id!)}><MdDelete size={13} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── MODAL ─────────────────────────────────────────────────── */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box" style={{ maxWidth: 580 }}>
                        <div className="modal-header">
                            <h2 className="text-base font-semibold">{editing ? "Edit Nutritionist" : "Add Nutritionist"}</h2>
                            <button onClick={() => setShowModal(false)}><MdClose size={20} /></button>
                        </div>
                        <div className="p-5 space-y-5 overflow-y-auto" style={{ maxHeight: "80vh" }}>
                            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}

                            {/* Basic info */}
                            <div className="space-y-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 pb-2">Nutritionist Info</p>
                                <div>
                                    <label className="admin-label">Full Name *</label>
                                    <input className="admin-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dr. Amaka Okafor" />
                                </div>
                                <div>
                                    <label className="admin-label">Designation *</label>
                                    <input className="admin-input" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Registered Dietitian, RD" />
                                </div>
                                <ImageUpload
                                    label="Profile Photo"
                                    value={form.photo}
                                    onChange={url => setForm({ ...form, photo: url })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="admin-label">Display Order</label>
                                        <input type="number" min="0" className="admin-input" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
                                    </div>
                                    <div className="flex items-end pb-1">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                                            Active (show in carousel)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Per-nutritionist pricing tiers */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pricing Tiers</p>
                                    <button type="button" onClick={addTier} className="text-xs text-green-700 font-semibold hover:underline flex items-center gap-1">
                                        <MdAdd size={14} /> Add tier
                                    </button>
                                </div>
                                {form.tiers.map((tier, i) => (
                                    <div key={i} className="border border-gray-200 p-3 space-y-3 bg-gray-50 relative">
                                        <button
                                            type="button"
                                            onClick={() => removeTier(i)}
                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                        ><MdClose size={14} /></button>
                                        <div className="grid grid-cols-5 gap-2">
                                            <div>
                                                <label className="admin-label">Icon</label>
                                                <input className="admin-input text-xl text-center px-1" value={tier.icon} onChange={e => updateTier(i, { icon: e.target.value })} maxLength={4} />
                                            </div>
                                            <div className="col-span-4">
                                                <label className="admin-label">Title *</label>
                                                <input className="admin-input" value={tier.title} onChange={e => updateTier(i, { title: e.target.value })} placeholder="e.g. Basic · 15 min" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="admin-label">Subtitle</label>
                                                <input className="admin-input" value={tier.subtitle} onChange={e => updateTier(i, { subtitle: e.target.value })} placeholder="e.g. Phone call" />
                                            </div>
                                            <div>
                                                <label className="admin-label">Price (₦)</label>
                                                <input type="number" min="0" className="admin-input" value={tier.price} onChange={e => updateTier(i, { price: Number(e.target.value) })} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {form.tiers.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-3">No tiers yet. Click "Add tier" above.</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2 border-t border-gray-100">
                                <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving…" : editing ? "Update Nutritionist" : "Add Nutritionist"}
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
