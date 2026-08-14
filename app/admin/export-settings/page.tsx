"use client";

import { useEffect, useState } from "react";
import {
    getExportHeroContent, saveExportHeroContent, ExportHeroContent,
    getExportDestinations, createExportDestination, updateExportDestination,
    deleteExportDestination, ExportDestination,
} from "@/lib/firestore";
import { MdAdd, MdEdit, MdDelete, MdClose, MdSave } from "react-icons/md";

const DEFAULT_HERO: ExportHeroContent = {
    eyebrow: "Global Export",
    headingLine1: "Raw & processed organic",
    headingLine2: "commodities —",
    headingAccent: "Nigeria to the world.",
    subtitle: "We source, process and ship certified organic Nigerian commodities to buyers across Europe, USA and Asia — bulk volumes, full traceability, export-grade packaging.",
    cta1Label: "View Commodities",
    cta2Label: "Request a Quote",
    catalogFootnote: "Prices are indicative FOB Lagos / Apapa in USD and subject to market conditions, lot size and destination. CIF, CFR and DDP terms available on request.",
    quoteCta1Label: "Send Quote Request",
    quoteCta2Label: "Talk to export desk",
    hidePrices: false,
    showDetailPrices: true,
};

const emptyDest: Omit<ExportDestination, "id"> = {
    flag: "", region: "", ports: "", note: "", order: 0, active: true,
};

export default function ExportSettingsPage() {
    const [hero, setHero] = useState<ExportHeroContent>(DEFAULT_HERO);
    const [heroSaving, setHeroSaving] = useState(false);
    const [heroSaved, setHeroSaved] = useState(false);

    const [destinations, setDestinations] = useState<ExportDestination[]>([]);
    const [destLoading, setDestLoading] = useState(true);
    const [showDestModal, setShowDestModal] = useState(false);
    const [editingDest, setEditingDest] = useState<ExportDestination | null>(null);
    const [destForm, setDestForm] = useState<Omit<ExportDestination, "id">>(emptyDest);
    const [destSaving, setDestSaving] = useState(false);
    const [destError, setDestError] = useState("");

    async function loadAll() {
        setDestLoading(true);
        const [h, dests] = await Promise.all([
            getExportHeroContent(),
            getExportDestinations(),
        ]);
        if (h) setHero(h);
        setDestinations(dests.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        setDestLoading(false);
    }
    useEffect(() => { loadAll(); }, []);

    async function handleSaveHero() {
        setHeroSaving(true);
        try { await saveExportHeroContent(hero); setHeroSaved(true); setTimeout(() => setHeroSaved(false), 2500); }
        finally { setHeroSaving(false); }
    }

    function openNewDest() { setEditingDest(null); setDestForm(emptyDest); setDestError(""); setShowDestModal(true); }
    function openEditDest(d: ExportDestination) {
        setEditingDest(d);
        setDestForm({ flag: d.flag, region: d.region, ports: d.ports, note: d.note, order: d.order ?? 0, active: d.active });
        setDestError(""); setShowDestModal(true);
    }
    async function handleSaveDest() {
        if (!destForm.region.trim()) { setDestError("Region name is required."); return; }
        setDestSaving(true); setDestError("");
        try {
            if (editingDest?.id) await updateExportDestination(editingDest.id, destForm);
            else await createExportDestination(destForm);
            setShowDestModal(false); await loadAll();
        } catch (e) { setDestError(e instanceof Error ? e.message : "Failed."); }
        finally { setDestSaving(false); }
    }
    async function handleDeleteDest(id: string) {
        if (!confirm("Delete this destination?")) return;
        await deleteExportDestination(id); await loadAll();
    }
    async function toggleDestActive(d: ExportDestination) {
        if (!d.id) return;
        await updateExportDestination(d.id, { active: !d.active }); await loadAll();
    }

    const setH = (k: keyof ExportHeroContent, v: string) => setHero(h => ({ ...h, [k]: v }));

    return (
        <div className="max-w-4xl space-y-6">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">International Export Settings</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Hero text and destination cards shown on the /export page and homepage</p>
                </div>
            </div>

            {/* ── Hero Content ── */}
            <div className="admin-card space-y-4">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Hero Section Text</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="admin-label">Eyebrow (small label)</label><input className="admin-input" value={hero.eyebrow} onChange={e => setH("eyebrow", e.target.value)} placeholder="e.g. Global Export" /></div>
                    <div><label className="admin-label">Heading Line 1</label><input className="admin-input" value={hero.headingLine1} onChange={e => setH("headingLine1", e.target.value)} /></div>
                    <div><label className="admin-label">Heading Line 2</label><input className="admin-input" value={hero.headingLine2} onChange={e => setH("headingLine2", e.target.value)} /></div>
                    <div><label className="admin-label">Heading Accent (green)</label><input className="admin-input" value={hero.headingAccent} onChange={e => setH("headingAccent", e.target.value)} /></div>
                </div>
                <div><label className="admin-label">Subtitle</label><textarea className="admin-input" rows={2} value={hero.subtitle} onChange={e => setH("subtitle", e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="admin-label">CTA 1 Label</label><input className="admin-input" value={hero.cta1Label} onChange={e => setH("cta1Label", e.target.value)} /></div>
                    <div><label className="admin-label">CTA 2 Label</label><input className="admin-input" value={hero.cta2Label} onChange={e => setH("cta2Label", e.target.value)} /></div>
                    <div><label className="admin-label">Quote CTA 1 Label</label><input className="admin-input" value={hero.quoteCta1Label} onChange={e => setH("quoteCta1Label", e.target.value)} /></div>
                    <div><label className="admin-label">Quote CTA 2 Label</label><input className="admin-input" value={hero.quoteCta2Label} onChange={e => setH("quoteCta2Label", e.target.value)} /></div>
                </div>
                <div><label className="admin-label">Catalog Footnote</label><textarea className="admin-input" rows={2} value={hero.catalogFootnote} onChange={e => setH("catalogFootnote", e.target.value)} /></div>
                <div className="space-y-2 border border-gray-100 rounded-lg p-3">
                    <p className="text-xs font-semibold uppercase text-gray-500">Indicative prices</p>
                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={!!hero.hidePrices}
                            onChange={e => setHero(h => ({ ...h, hidePrices: e.target.checked }))}
                        />
                        <span>
                            Hide indicative prices on the catalog listing
                            <span className="block text-xs text-gray-400 font-normal">Homepage (local) and International Export page — all products view</span>
                        </span>
                    </label>
                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={hero.showDetailPrices !== false}
                            onChange={e => setHero(h => ({ ...h, showDetailPrices: e.target.checked }))}
                        />
                        <span>
                            Show indicative prices on the single commodity page
                            <span className="block text-xs text-gray-400 font-normal">When a buyer opens one export product</span>
                        </span>
                    </label>
                </div>
                <button className="btn-primary flex items-center gap-2 py-2 px-4 text-sm" onClick={handleSaveHero} disabled={heroSaving}>
                    <MdSave size={15} /> {heroSaved ? "Saved!" : heroSaving ? "Saving…" : "Save Hero Content"}
                </button>
            </div>

            {/* ── Destination Cards ── */}
            <div className="admin-card space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Destination Cards</p>
                        <p className="text-xs text-gray-400 mt-0.5">The 3 region cards shown above the commodity table (flag, region, ports, note)</p>
                    </div>
                    <button className="btn-primary flex items-center gap-1.5 py-1.5 px-3 text-xs" onClick={openNewDest}><MdAdd size={14} /> Add</button>
                </div>
                {destLoading ? <p className="text-sm text-gray-400">Loading…</p> : destinations.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No destinations yet. Site uses built-in defaults.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {destinations.map(d => (
                            <div key={d.id} className="flex items-center gap-4 py-3">
                                <span className="text-2xl w-8 shrink-0">{d.flag}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900">{d.region}</p>
                                    <p className="text-xs text-gray-500">{d.ports}</p>
                                    <p className="text-xs text-gray-400">{d.note}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => toggleDestActive(d)}>
                                        <span className={`badge ${d.active ? "badge-green" : "badge-gray"}`}>{d.active ? "Active" : "Hidden"}</span>
                                    </button>
                                    <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEditDest(d)}><MdEdit size={13} /></button>
                                    <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDeleteDest(d.id!)}><MdDelete size={13} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Destination modal */}
            {showDestModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                            <h2 className="text-base font-semibold">{editingDest ? "Edit Destination" : "Add Destination"}</h2>
                            <button onClick={() => setShowDestModal(false)}><MdClose size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {destError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{destError}</p>}
                            <div className="grid grid-cols-4 gap-4">
                                <div><label className="admin-label">Flag (emoji)</label><input className="admin-input text-2xl text-center" value={destForm.flag} onChange={e => setDestForm({ ...destForm, flag: e.target.value })} maxLength={4} /></div>
                                <div className="col-span-3"><label className="admin-label">Region *</label><input className="admin-input" value={destForm.region} onChange={e => setDestForm({ ...destForm, region: e.target.value })} placeholder="e.g. Europe" /></div>
                            </div>
                            <div><label className="admin-label">Ports</label><input className="admin-input" value={destForm.ports} onChange={e => setDestForm({ ...destForm, ports: e.target.value })} placeholder="e.g. Rotterdam · Hamburg · Antwerp" /></div>
                            <div><label className="admin-label">Note</label><input className="admin-input" value={destForm.note} onChange={e => setDestForm({ ...destForm, note: e.target.value })} placeholder="e.g. EU-compliant documentation & phytosanitary certs." /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="admin-label">Order</label><input type="number" className="admin-input" value={destForm.order} onChange={e => setDestForm({ ...destForm, order: Number(e.target.value) })} /></div>
                            </div>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={destForm.active} onChange={e => setDestForm({ ...destForm, active: e.target.checked })} /> Active
                            </label>
                            <div className="flex gap-3 pt-2">
                                <button className="btn-primary flex-1" onClick={handleSaveDest} disabled={destSaving}>{destSaving ? "Saving…" : editingDest ? "Update" : "Add"}</button>
                                <button className="btn-secondary" onClick={() => setShowDestModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
