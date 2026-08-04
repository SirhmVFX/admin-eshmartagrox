"use client";

import { useEffect, useState } from "react";
import {
    getSubscriptionPackages, createSubscriptionPackage,
    updateSubscriptionPackage, deleteSubscriptionPackage,
    SubscriptionPackage,
} from "@/lib/firestore";
import { MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";

const empty: Omit<SubscriptionPackage, "id"> = {
    name: "", tag: "", tagColor: "green", description: "",
    price: 0, period: "/ week", items: [""], active: true, order: 0,
};

export default function PackagesPage() {
    const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<SubscriptionPackage | null>(null);
    const [form, setForm] = useState<Omit<SubscriptionPackage, "id">>(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function load() {
        setLoading(true);
        try { setPackages(await getSubscriptionPackages()); } finally { setLoading(false); }
    }
    useEffect(() => { load(); }, []);

    function openNew() { setEditing(null); setForm(empty); setError(""); setShowModal(true); }
    function openEdit(p: SubscriptionPackage) {
        setEditing(p);
        setForm({ name: p.name, tag: p.tag, tagColor: p.tagColor, description: p.description ?? "",
            price: p.price, period: p.period, items: [...p.items], active: p.active, order: p.order ?? 0 });
        setError(""); setShowModal(true);
    }

    async function handleSave() {
        if (!form.name.trim()) { setError("Name is required."); return; }
        if (form.price <= 0) { setError("Price must be greater than 0."); return; }
        setSaving(true); setError("");
        try {
            const payload = { ...form, items: form.items.filter(i => i.trim()) };
            if (editing?.id) await updateSubscriptionPackage(editing.id, payload);
            else await createSubscriptionPackage(payload);
            setShowModal(false); await load();
        } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this package?")) return;
        await deleteSubscriptionPackage(id); await load();
    }

    async function toggleActive(p: SubscriptionPackage) {
        if (!p.id) return;
        await updateSubscriptionPackage(p.id, { active: !p.active }); await load();
    }

    const addItem = () => setForm(f => ({ ...f, items: [...f.items, ""] }));
    const updateItem = (i: number, v: string) => setForm(f => ({ ...f, items: f.items.map((x, j) => j === i ? v : x) }));
    const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }));

    return (
        <div className="max-w-5xl space-y-4">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Subscription Packages</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Manage the grocery subscription packages shown on the homepage and shop</p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={openNew}><MdAdd size={16} /> New Package</button>
            </div>

            {loading ? <div className="admin-card text-sm text-gray-500">Loading…</div> : packages.length === 0 ? (
                <div className="admin-card text-center py-12 space-y-3">
                    <p className="text-gray-500">No packages yet. The site uses built-in defaults until you add packages here.</p>
                    <button className="btn-primary" onClick={openNew}>Create first package</button>
                </div>
            ) : (
                <div className="admin-card p-0 overflow-hidden overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr><th>Order</th><th>Name</th><th>Tag</th><th>Price</th><th>Period</th><th>Items</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {packages.map(p => (
                                <tr key={p.id}>
                                    <td className="font-mono text-xs text-gray-400">{p.order}</td>
                                    <td className="font-semibold text-gray-900">{p.name}</td>
                                    <td>
                                        <span className={`badge text-[10px] px-2 py-0.5 ${p.tagColor === "orange" ? "bg-orange-100 text-orange-700" : "badge-green"}`}>
                                            {p.tag}
                                        </span>
                                    </td>
                                    <td className="font-semibold text-green-700">₦{p.price.toLocaleString()}</td>
                                    <td className="text-gray-500 text-sm">{p.period}</td>
                                    <td className="text-gray-500 text-xs">{p.items.length} items</td>
                                    <td>
                                        <button onClick={() => toggleActive(p)}>
                                            <span className={`badge ${p.active ? "badge-green" : "badge-gray"}`}>{p.active ? "Active" : "Hidden"}</span>
                                        </button>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(p)}><MdEdit size={13} /></button>
                                            <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(p.id!)}><MdDelete size={13} /></button>
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
                    <div className="modal-box" style={{ maxWidth: 560 }}>
                        <div className="modal-header">
                            <h2 className="text-base font-semibold">{editing ? "Edit Package" : "New Package"}</h2>
                            <button onClick={() => setShowModal(false)}><MdClose size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "75vh" }}>
                            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}
                            <div>
                                <label className="admin-label">Package Name *</label>
                                <input className="admin-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Senior Wellness" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Tag Label</label>
                                    <input className="admin-input" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} placeholder="e.g. Most loved" />
                                </div>
                                <div>
                                    <label className="admin-label">Tag Colour</label>
                                    <select className="admin-input" value={form.tagColor} onChange={e => setForm({ ...form, tagColor: e.target.value as "green" | "orange" })}>
                                        <option value="green">Green</option>
                                        <option value="orange">Orange</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="admin-label">Short Description</label>
                                <textarea className="admin-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Shown below the package name" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="admin-label">Price (₦) *</label>
                                    <input type="number" className="admin-input" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="admin-label">Period</label>
                                    <input className="admin-input" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="/ week" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Display Order</label>
                                    <input type="number" className="admin-input" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="admin-label">Checklist Items</label>
                                <div className="space-y-2">
                                    {form.items.map((item, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input className="admin-input flex-1" value={item} onChange={e => updateItem(i, e.target.value)} placeholder={`Item ${i + 1}`} />
                                            <button onClick={() => removeItem(i)} className="btn-danger py-1 px-2 text-xs shrink-0"><MdClose size={13} /></button>
                                        </div>
                                    ))}
                                    <button className="btn-secondary text-xs py-1.5 px-3" onClick={addItem}>+ Add Item</button>
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                                Active (visible on site)
                            </label>
                            <div className="flex gap-3 pt-2">
                                <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editing ? "Update" : "Create"}</button>
                                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
