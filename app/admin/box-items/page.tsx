"use client";

import { useEffect, useState } from "react";
import {
    getBoxItems, createBoxItem, updateBoxItem, deleteBoxItem, BoxItem,
} from "@/lib/firestore";
import { MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";

const empty: Omit<BoxItem, "id"> = { name: "", price: 0, active: true, order: 0 };

export default function BoxItemsPage() {
    const [items, setItems] = useState<BoxItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<BoxItem | null>(null);
    const [form, setForm] = useState<Omit<BoxItem, "id">>(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function load() {
        setLoading(true);
        try { setItems(await getBoxItems()); } finally { setLoading(false); }
    }
    useEffect(() => { load(); }, []);

    function openNew() { setEditing(null); setForm(empty); setError(""); setShowModal(true); }
    function openEdit(item: BoxItem) {
        setEditing(item);
        setForm({ name: item.name, price: item.price, active: item.active, order: item.order ?? 0 });
        setError(""); setShowModal(true);
    }

    async function handleSave() {
        if (!form.name.trim()) { setError("Name is required."); return; }
        if (form.price <= 0) { setError("Price must be greater than 0."); return; }
        setSaving(true); setError("");
        try {
            if (editing?.id) await updateBoxItem(editing.id, form);
            else await createBoxItem(form);
            setShowModal(false); await load();
        } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this item?")) return;
        await deleteBoxItem(id); await load();
    }

    async function toggleActive(item: BoxItem) {
        if (!item.id) return;
        await updateBoxItem(item.id, { active: !item.active }); await load();
    }

    return (
        <div className="max-w-3xl space-y-4">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Build-Your-Own Box Items</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Manage the selectable grocery items in the custom box builder</p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={openNew}><MdAdd size={16} /> Add Item</button>
            </div>

            {loading ? <div className="admin-card text-sm text-gray-500">Loading…</div> : items.length === 0 ? (
                <div className="admin-card text-center py-12 space-y-3">
                    <p className="text-gray-500">No items yet. The site uses built-in defaults until you add items here.</p>
                    <button className="btn-primary" onClick={openNew}>Add first item</button>
                </div>
            ) : (
                <div className="admin-card p-0 overflow-hidden overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr><th>Order</th><th>Item Name</th><th>Price (₦)</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td className="font-mono text-xs text-gray-400">{item.order}</td>
                                    <td className="font-medium text-gray-900">{item.name}</td>
                                    <td className="font-semibold text-green-700">₦{item.price.toLocaleString()}</td>
                                    <td>
                                        <button onClick={() => toggleActive(item)}>
                                            <span className={`badge ${item.active ? "badge-green" : "badge-gray"}`}>{item.active ? "Active" : "Hidden"}</span>
                                        </button>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(item)}><MdEdit size={13} /></button>
                                            <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(item.id!)}><MdDelete size={13} /></button>
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
                            <h2 className="text-base font-semibold">{editing ? "Edit Item" : "Add Item"}</h2>
                            <button onClick={() => setShowModal(false)}><MdClose size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}
                            <div>
                                <label className="admin-label">Item Name *</label>
                                <input className="admin-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ofada rice (5kg)" />
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
                                Active (shown in box builder)
                            </label>
                            <div className="flex gap-3 pt-2">
                                <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editing ? "Update" : "Add Item"}</button>
                                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
