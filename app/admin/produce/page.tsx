"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getProduceCards, createProduceCard, updateProduceCard, deleteProduceCard, ProduceCard } from "@/lib/firestore";
import ImageUpload from "@/components/ImageUpload";
import { MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";

const empty: Omit<ProduceCard, "id"> = { number: "", title: "", description: "", image: "", ctaLabel: "Learn More", ctaHref: "/shop", order: 0, active: true };

export default function ProducePage() {
    const [cards, setCards] = useState<ProduceCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<ProduceCard | null>(null);
    const [form, setForm] = useState<Omit<ProduceCard, "id">>(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function load() { setLoading(true); setCards(await getProduceCards()); setLoading(false); }
    useEffect(() => { load(); }, []);

    function openNew() { setEditing(null); setForm(empty); setError(""); setShowModal(true); }
    function openEdit(c: ProduceCard) { setEditing(c); setForm({ number: c.number, title: c.title, description: c.description, image: c.image, ctaLabel: c.ctaLabel, ctaHref: c.ctaHref, order: c.order, active: c.active }); setError(""); setShowModal(true); }

    async function handleSave() {
        if (!form.title) { setError("Title is required."); return; }
        setSaving(true); setError("");
        try { if (editing?.id) await updateProduceCard(editing.id, form); else await createProduceCard(form); setShowModal(false); await load(); }
        catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string) { if (!confirm("Delete this card?")) return; await deleteProduceCard(id); await load(); }
    async function toggleActive(c: ProduceCard) { if (!c.id) return; await updateProduceCard(c.id, { active: !c.active }); await load(); }

    return (
        <div className="max-w-4xl space-y-4">
            <div className="section-header"><div><h1 className="text-lg font-semibold text-gray-900">Produce Cards</h1><p className="text-xs text-gray-500 mt-0.5">First feature section (3 cards)</p></div><button className="btn-primary flex items-center gap-2" onClick={openNew}><MdAdd size={16} /> New Card</button></div>
            {loading ? <div className="admin-card text-sm text-gray-500">Loading…</div> : cards.length === 0 ? <div className="admin-card text-sm text-gray-500 text-center py-8">No cards yet.</div> : (
                <div className="admin-card p-0 overflow-hidden"><table className="admin-table"><thead><tr><th>Preview</th><th>Number</th><th>Title</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead><tbody>
                    {cards.map((c) => (<tr key={c.id}><td>{c.image && <Image src={c.image} alt="" width={64} height={40} className="w-16 h-10 object-cover" />}</td><td className="text-gray-500 font-mono">{c.number}</td><td className="font-medium text-gray-800 max-w-xs truncate">{c.title}</td><td>{c.order}</td><td><button onClick={() => toggleActive(c)}><span className={`badge ${c.active ? "badge-green" : "badge-gray"}`}>{c.active ? "Active" : "Inactive"}</span></button></td><td><div className="flex gap-2"><button className="btn-secondary py-1 px-2" onClick={() => openEdit(c)}><MdEdit size={14} /></button><button className="btn-danger py-1 px-2" onClick={() => handleDelete(c.id!)}><MdDelete size={14} /></button></div></td></tr>))}
                </tbody></table></div>
            )}
            {showModal && (
                <div className="modal-overlay"><div className="modal-box"><div className="modal-header"><h2 className="text-base font-semibold">{editing ? "Edit Card" : "New Card"}</h2><button onClick={() => setShowModal(false)}><MdClose size={20} /></button></div>
                    <div className="p-5 space-y-4">
                        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}
                        <div className="grid grid-cols-2 gap-4"><div><label className="admin-label">Number (e.g. 01)</label><input className="admin-input" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></div><div><label className="admin-label">Order</label><input type="number" className="admin-input" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div></div>
                        <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} label="Image" />
                        <div><label className="admin-label">Title</label><input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Premium Okra" /></div>
                        <div><label className="admin-label">Description</label><textarea className="admin-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this produce." /></div>
                        <div className="grid grid-cols-2 gap-4"><div><label className="admin-label">CTA Label</label><input className="admin-input" value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} /></div><div><label className="admin-label">CTA href</label><input className="admin-input" value={form.ctaHref} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} /></div></div>
                        <div><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label></div>
                        <div className="flex gap-3 pt-2"><button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Card"}</button><button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button></div>
                    </div></div></div>
            )}
        </div>
    );
}
