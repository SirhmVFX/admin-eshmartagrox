"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getPortfolioItems, createPortfolioItem, updatePortfolioItem, deletePortfolioItem, PortfolioItem } from "@/lib/firestore";
import ImageUpload from "@/components/ImageUpload";
import { MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";

const empty: Omit<PortfolioItem, "id"> = { title: "", description: "", image: "", link: "", order: 0, active: true };

export default function PortfolioPage() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<PortfolioItem | null>(null);
    const [form, setForm] = useState<Omit<PortfolioItem, "id">>(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function load() { setLoading(true); setItems(await getPortfolioItems()); setLoading(false); }
    useEffect(() => { load(); }, []);

    function openNew() { setEditing(null); setForm(empty); setError(""); setShowModal(true); }
    function openEdit(i: PortfolioItem) { setEditing(i); setForm({ title: i.title, description: i.description, image: i.image, link: i.link, order: i.order, active: i.active }); setError(""); setShowModal(true); }

    async function handleSave() {
        if (!form.title) { setError("Title is required."); return; }
        setSaving(true); setError("");
        try { if (editing?.id) await updatePortfolioItem(editing.id, form); else await createPortfolioItem(form); setShowModal(false); await load(); }
        catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string) { if (!confirm("Delete this item?")) return; await deletePortfolioItem(id); await load(); }
    async function toggleActive(i: PortfolioItem) { if (!i.id) return; await updatePortfolioItem(i.id, { active: !i.active }); await load(); }

    return (
        <div className="max-w-4xl space-y-4">
            <div className="section-header"><div><h1 className="text-lg font-semibold text-gray-900">Portfolio</h1><p className="text-xs text-gray-500 mt-0.5">Portfolio showcase items</p></div><button className="btn-primary flex items-center gap-2" onClick={openNew}><MdAdd size={16} /> New Item</button></div>
            {loading ? <div className="admin-card text-sm text-gray-500">Loading…</div> : items.length === 0 ? <div className="admin-card text-sm text-gray-500 text-center py-8">No items yet.</div> : (
                <div className="admin-card p-0 overflow-hidden"><table className="admin-table"><thead><tr><th>Preview</th><th>Title</th><th>Description</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead><tbody>
                    {items.map((i) => (<tr key={i.id}><td>{i.image && <Image src={i.image} alt="" width={64} height={40} className="w-16 h-10 object-cover" />}</td><td className="font-medium text-gray-800 max-w-xs truncate">{i.title}</td><td className="text-gray-500 text-xs max-w-[200px] truncate">{i.description}</td><td>{i.order}</td><td><button onClick={() => toggleActive(i)}><span className={`badge ${i.active ? "badge-green" : "badge-gray"}`}>{i.active ? "Active" : "Hidden"}</span></button></td><td><div className="flex gap-2"><button className="btn-secondary py-1 px-2" onClick={() => openEdit(i)}><MdEdit size={14} /></button><button className="btn-danger py-1 px-2" onClick={() => handleDelete(i.id!)}><MdDelete size={14} /></button></div></td></tr>))}
                </tbody></table></div>
            )}
            {showModal && (
                <div className="modal-overlay"><div className="modal-box"><div className="modal-header"><h2 className="text-base font-semibold">{editing ? "Edit Item" : "New Item"}</h2><button onClick={() => setShowModal(false)}><MdClose size={20} /></button></div>
                    <div className="p-5 space-y-4">
                        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}
                        <div><label className="admin-label">Title</label><input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                        <div><label className="admin-label">Description</label><textarea className="admin-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                        <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} label="Image" />
                        <div className="grid grid-cols-2 gap-4"><div><label className="admin-label">Order</label><input type="number" className="admin-input" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div><div><label className="admin-label">Status</label><select className="admin-input" value={form.active ? "active" : "hidden"} onChange={(e) => setForm({ ...form, active: e.target.value === "active" })}><option value="active">Active</option><option value="hidden">Hidden</option></select></div></div>
                        <div className="flex gap-3 pt-2"><button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Item"}</button><button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button></div>
                    </div></div></div>
            )}
        </div>
    );
}
