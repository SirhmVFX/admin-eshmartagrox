"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getQualityBlocks, createQualityBlock, updateQualityBlock, deleteQualityBlock, QualityBlock } from "@/lib/firestore";
import { getCTA, saveCTA } from "@/lib/firestore";
import ImageUpload from "@/components/ImageUpload";
import { MdEdit, MdClose } from "react-icons/md";

export default function QualityPage() {
    const [blocks, setBlocks] = useState<QualityBlock[]>([]);
    const [cta, setCta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showBlocksModal, setShowBlocksModal] = useState(false);
    const [showCTAModal, setShowCTAModal] = useState(false);
    const [editingBlock, setEditingBlock] = useState<QualityBlock | null>(null);
    const [blockForm, setBlockForm] = useState({ title: "", description: "", order: 0, active: true });
    const [ctaForm, setCtaForm] = useState({ title: "", description: "", contactImage: "", secondaryTitle: "", secondaryDescription: "" });
    const [savingBlock, setSavingBlock] = useState(false);
    const [savingCTA, setSavingCTA] = useState(false);
    const [error, setError] = useState("");

    async function load() {
        setLoading(true);
        const [b, c] = await Promise.all([getQualityBlocks(), getCTA()]);
        setBlocks(b);
        setCta(c);
        if (c) setCtaForm(c);
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    async function handleSaveBlock() {
        if (!blockForm.title) { setError("Title is required."); return; }
        setSavingBlock(true); setError("");
        try {
            if (editingBlock?.id) await updateQualityBlock(editingBlock.id, blockForm);
            else await createQualityBlock(blockForm);
            setShowBlocksModal(false);
            await load();
        } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSavingBlock(false); }
    }

    async function handleSaveCTA() {
        setSavingCTA(true); setError("");
        try { await saveCTA(ctaForm); setShowCTAModal(false); await load(); }
        catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSavingCTA(false); }
    }

    function openEditBlock(b: QualityBlock) {
        setEditingBlock(b);
        setBlockForm({ title: b.title, description: b.description, order: b.order, active: b.active });
        setError(""); setShowBlocksModal(true);
    }
    function openNewBlock() { setEditingBlock(null); setBlockForm({ title: "", description: "", order: 0, active: true }); setError(""); setShowBlocksModal(true); }
    function handleDeleteBlock(id: string) { if (!confirm("Delete this block?")) return; deleteQualityBlock(id).then(load); }
    async function toggleActiveBlock(b: QualityBlock) { if (!b.id) return; await updateQualityBlock(b.id, { active: !b.active }); await load(); }

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Blocks Section */}
            <div className="admin-card">
                <div className="flex justify-between items-center mb-4"><h1 className="text-lg font-semibold text-gray-900">Quality Blocks</h1><button className="btn-primary py-2 px-4 text-sm" onClick={openNewBlock}>+ Add Block</button></div>
                {loading ? <p className="text-sm text-gray-500">Loading…</p> : blocks.length === 0 ? <p className="text-sm text-gray-500">No blocks yet.</p> : (
                    <table className="admin-table">
                        <thead><tr><th>Title</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {blocks.map((b) => (<tr key={b.id}><td className="font-medium text-gray-800">{b.title}</td><td>{b.order}</td><td><button onClick={() => toggleActiveBlock(b)}><span className={`badge ${b.active ? "badge-green" : "badge-gray"}`}>{b.active ? "Active" : "Inactive"}</span></button></td><td><div className="flex gap-2"><button className="btn-secondary py-1 px-2" onClick={() => openEditBlock(b)}><MdEdit size={14} /></button><button className="btn-danger py-1 px-2" onClick={() => handleDeleteBlock(b.id!)}><MdEdit size={14} /> Delete</button></div></td></tr>))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* CTA Section */}
            <div className="admin-card">
                <div className="flex justify-between items-center mb-4"><h1 className="text-lg font-semibold text-gray-900">Call to Action</h1><button className="btn-primary py-2 px-4 text-sm" onClick={() => setShowCTAModal(true)}>Edit CTA</button></div>
                {cta ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><p className="text-xs text-gray-500 mb-1">Title</p><p>{cta.title}</p></div>
                        <div><p className="text-xs text-gray-500 mb-1">Description</p><p className="line-clamp-2">{cta.description}</p></div>
                        <div><p className="text-xs text-gray-500 mb-1">Contact Image</p><p className="truncate">{cta.contactImage}</p></div>
                        <div><p className="text-xs text-gray-500 mb-1">Secondary Title</p><p>{cta.secondaryTitle}</p></div>
                    </div>
                ) : <p className="text-sm text-gray-500">No CTA configured.</p>}
            </div>

            {/* Block Modal */}
            {showBlocksModal && (
                <div className="modal-overlay"><div className="modal-box"><div className="modal-header"><h2 className="text-base font-semibold">{editingBlock ? "Edit Block" : "New Block"}</h2><button onClick={() => setShowBlocksModal(false)}><MdClose size={20} /></button></div>
                    <div className="p-5 space-y-4">
                        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}
                        <div className="grid grid-cols-2 gap-4"><div><label className="admin-label">Title</label><input className="admin-input" value={blockForm.title} onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })} /></div><div><label className="admin-label">Order</label><input type="number" className="admin-input" value={blockForm.order} onChange={(e) => setBlockForm({ ...blockForm, order: parseInt(e.target.value) || 0 })} /></div></div>
                        <div><label className="admin-label">Description</label><textarea className="admin-input" rows={4} value={blockForm.description} onChange={(e) => setBlockForm({ ...blockForm, description: e.target.value })} /></div>
                        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={blockForm.active} onChange={(e) => setBlockForm({ ...blockForm, active: e.target.checked })} /> Active</label>
                        <div className="flex gap-3 pt-2"><button className="btn-primary flex-1" onClick={handleSaveBlock} disabled={savingBlock}>{savingBlock ? "Saving…" : "Save Block"}</button><button className="btn-secondary" onClick={() => setShowBlocksModal(false)}>Cancel</button></div>
                    </div></div></div>
            )}

            {/* CTA Modal */}
            {showCTAModal && (
                <div className="modal-overlay"><div className="modal-box"><div className="modal-header"><h2 className="text-base font-semibold">Edit Call to Action</h2><button onClick={() => setShowCTAModal(false)}><MdClose size={20} /></button></div>
                    <div className="p-5 space-y-4">
                        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}
                        <div><label className="admin-label">Title</label><input className="admin-input" value={ctaForm.title} onChange={(e) => setCtaForm({ ...ctaForm, title: e.target.value })} /></div>
                        <div><label className="admin-label">Description</label><textarea className="admin-input" rows={3} value={ctaForm.description} onChange={(e) => setCtaForm({ ...ctaForm, description: e.target.value })} /></div>
                        <ImageUpload value={ctaForm.contactImage} onChange={(url) => setCtaForm({ ...ctaForm, contactImage: url })} label="Contact Image" />
                        <div><label className="admin-label">Secondary Title</label><input className="admin-input" value={ctaForm.secondaryTitle} onChange={(e) => setCtaForm({ ...ctaForm, secondaryTitle: e.target.value })} /></div>
                        <div><label className="admin-label">Secondary Description</label><textarea className="admin-input" rows={3} value={ctaForm.secondaryDescription} onChange={(e) => setCtaForm({ ...ctaForm, secondaryDescription: e.target.value })} /></div>
                        <div className="flex gap-3 pt-2"><button className="btn-primary flex-1" onClick={handleSaveCTA} disabled={savingCTA}>{savingCTA ? "Saving…" : "Save CTA"}</button><button className="btn-secondary" onClick={() => setShowCTAModal(false)}>Cancel</button></div>
                    </div></div></div>
            )}
        </div>
    );
}
