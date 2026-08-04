"use client";

import { useEffect, useState } from "react";
import {
    getComplianceHeroContent, saveComplianceHeroContent, ComplianceHeroContent,
    getComplianceCertifications, createComplianceCertification, updateComplianceCertification,
    deleteComplianceCertification, ComplianceCertification,
    getComplianceDestinations, createComplianceDestination, updateComplianceDestination,
    deleteComplianceDestination, ComplianceDestination,
    getExportFAQs, createExportFAQ, updateExportFAQ, deleteExportFAQ, ExportFAQ,
} from "@/lib/firestore";
import { MdAdd, MdEdit, MdDelete, MdClose, MdSave } from "react-icons/md";

const DEFAULT_HERO: ComplianceHeroContent = {
    eyebrow: "Trust & Transparency",
    heading: "Compliance & certifications.",
    subtitle: "Every shipment from ESHMARTAGROX is backed by verified organic certifications, food-safety audits, and destination-ready documentation.",
    accrHeading: "Our accreditations",
    accrSubtitle: "We maintain active certifications with internationally recognised bodies. Copies are available under NDA for serious buyers.",
    docsHeading: "Documents per destination",
    docsSubtitle: "We prepare region-specific export dossiers so your customs broker and quarantine office receive every paper they need — pre-cleared, pre-validated, and digitally archived.",
    faqHeading: "Frequently asked questions",
    faqSubtitle: "Quick answers to common compliance and certification questions from buyers and customs brokers.",
    dueDiligenceHeading: "Need certified copies or an audit visit?",
    dueDiligenceBody: "We share redacted certificates under NDA and welcome buyer-led factory audits with prior notice. Our compliance team responds within one business day.",
    cta1Label: "Request compliance pack",
    cta2Label: "Email compliance desk",
};

const emptyCert: Omit<ComplianceCertification, "id"> = { title: "", body: "", badge: "", order: 0, active: true };
const emptyDest: Omit<ComplianceDestination, "id"> = { region: "", docs: [""], order: 0, active: true };
const emptyFaq: Omit<ExportFAQ, "id"> = { question: "", answer: "", order: 0, active: true };

type ActiveTab = "hero" | "certs" | "docs" | "faqs";

export default function ExportComplianceSettingsPage() {
    const [tab, setTab] = useState<ActiveTab>("hero");
    const [hero, setHero] = useState<ComplianceHeroContent>(DEFAULT_HERO);
    const [heroSaving, setHeroSaving] = useState(false);
    const [heroSaved, setHeroSaved] = useState(false);

    const [certs, setCerts] = useState<ComplianceCertification[]>([]);
    const [showCertModal, setShowCertModal] = useState(false);
    const [editingCert, setEditingCert] = useState<ComplianceCertification | null>(null);
    const [certForm, setCertForm] = useState<Omit<ComplianceCertification, "id">>(emptyCert);
    const [certSaving, setCertSaving] = useState(false);

    const [dests, setDests] = useState<ComplianceDestination[]>([]);
    const [showDestModal, setShowDestModal] = useState(false);
    const [editingDest, setEditingDest] = useState<ComplianceDestination | null>(null);
    const [destForm, setDestForm] = useState<Omit<ComplianceDestination, "id">>(emptyDest);
    const [destSaving, setDestSaving] = useState(false);

    const [faqs, setFaqs] = useState<ExportFAQ[]>([]);
    const [showFaqModal, setShowFaqModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState<ExportFAQ | null>(null);
    const [faqForm, setFaqForm] = useState<Omit<ExportFAQ, "id">>(emptyFaq);
    const [faqSaving, setFaqSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    async function loadAll() {
        setLoading(true);
        const [h, c, d, f] = await Promise.all([
            getComplianceHeroContent(),
            getComplianceCertifications(),
            getComplianceDestinations(),
            getExportFAQs(),
        ]);
        if (h) setHero(h);
        setCerts(c.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        setDests(d.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        setFaqs(f.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        setLoading(false);
    }
    useEffect(() => { loadAll(); }, []);

    const setH = (k: keyof ComplianceHeroContent, v: string) => setHero(h => ({ ...h, [k]: v }));

    async function handleSaveHero() {
        setHeroSaving(true);
        try { await saveComplianceHeroContent(hero); setHeroSaved(true); setTimeout(() => setHeroSaved(false), 2500); }
        finally { setHeroSaving(false); }
    }

    // ── Certs ──
    function openNewCert() { setEditingCert(null); setCertForm(emptyCert); setShowCertModal(true); }
    function openEditCert(c: ComplianceCertification) { setEditingCert(c); setCertForm({ title: c.title, body: c.body, badge: c.badge, order: c.order ?? 0, active: c.active }); setShowCertModal(true); }
    async function handleSaveCert() {
        setCertSaving(true);
        try { if (editingCert?.id) await updateComplianceCertification(editingCert.id, certForm); else await createComplianceCertification(certForm); setShowCertModal(false); await loadAll(); }
        finally { setCertSaving(false); }
    }
    async function handleDeleteCert(id: string) { if (!confirm("Delete?")) return; await deleteComplianceCertification(id); await loadAll(); }

    // ── Docs ──
    function openNewDest() { setEditingDest(null); setDestForm(emptyDest); setShowDestModal(true); }
    function openEditDest(d: ComplianceDestination) { setEditingDest(d); setDestForm({ region: d.region, docs: [...d.docs], order: d.order ?? 0, active: d.active }); setShowDestModal(true); }
    async function handleSaveDest() {
        setDestSaving(true);
        try {
            const payload = { ...destForm, docs: destForm.docs.filter(d => d.trim()) };
            if (editingDest?.id) await updateComplianceDestination(editingDest.id, payload); else await createComplianceDestination(payload);
            setShowDestModal(false); await loadAll();
        } finally { setDestSaving(false); }
    }
    async function handleDeleteDest(id: string) { if (!confirm("Delete?")) return; await deleteComplianceDestination(id); await loadAll(); }
    const addDoc = () => setDestForm(f => ({ ...f, docs: [...f.docs, ""] }));
    const updateDoc = (i: number, v: string) => setDestForm(f => ({ ...f, docs: f.docs.map((x, j) => j === i ? v : x) }));
    const removeDoc = (i: number) => setDestForm(f => ({ ...f, docs: f.docs.filter((_, j) => j !== i) }));

    // ── FAQs ──
    function openNewFaq() { setEditingFaq(null); setFaqForm(emptyFaq); setShowFaqModal(true); }
    function openEditFaq(f: ExportFAQ) { setEditingFaq(f); setFaqForm({ question: f.question, answer: f.answer, order: f.order ?? 0, active: f.active }); setShowFaqModal(true); }
    async function handleSaveFaq() {
        setFaqSaving(true);
        try { if (editingFaq?.id) await updateExportFAQ(editingFaq.id, faqForm); else await createExportFAQ(faqForm); setShowFaqModal(false); await loadAll(); }
        finally { setFaqSaving(false); }
    }
    async function handleDeleteFaq(id: string) { if (!confirm("Delete?")) return; await deleteExportFAQ(id); await loadAll(); }

    const TABS: { id: ActiveTab; label: string; count?: number }[] = [
        { id: "hero", label: "Hero & Headings" },
        { id: "certs", label: "Certifications", count: certs.length },
        { id: "docs", label: "Documents per Dest.", count: dests.length },
        { id: "faqs", label: "Export FAQs", count: faqs.length },
    ];

    return (
        <div className="max-w-5xl space-y-4">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Export Compliance Settings</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Manage all content on the /export-compliance page</p>
                </div>
            </div>

            {/* Tab nav */}
            <div className="flex flex-wrap gap-1 border-b border-gray-200">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? "border-green-700 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                        {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
                    </button>
                ))}
            </div>

            {loading && <div className="admin-card text-sm text-gray-400">Loading…</div>}

            {/* ── HERO TAB ── */}
            {!loading && tab === "hero" && (
                <div className="admin-card space-y-4">
                    <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Hero & Section Headings</p>
                    {([
                        ["eyebrow", "Hero Eyebrow"], ["heading", "Hero Heading"], ["subtitle", "Hero Subtitle"],
                        ["accrHeading", "Accreditations Section Heading"], ["accrSubtitle", "Accreditations Subtitle"],
                        ["docsHeading", "Documents Section Heading"], ["docsSubtitle", "Documents Subtitle"],
                        ["faqHeading", "FAQ Section Heading"], ["faqSubtitle", "FAQ Subtitle"],
                        ["dueDiligenceHeading", "Due Diligence Heading"], ["dueDiligenceBody", "Due Diligence Body"],
                        ["cta1Label", "CTA 1 Label (dark button)"], ["cta2Label", "CTA 2 Label (light button)"],
                    ] as [keyof ComplianceHeroContent, string][]).map(([k, label]) => (
                        <div key={k}>
                            <label className="admin-label">{label}</label>
                            {k === "subtitle" || k === "accrSubtitle" || k === "docsSubtitle" || k === "dueDiligenceBody"
                                ? <textarea className="admin-input" rows={2} value={hero[k] as string} onChange={e => setH(k, e.target.value)} />
                                : <input className="admin-input" value={hero[k] as string} onChange={e => setH(k, e.target.value)} />
                            }
                        </div>
                    ))}
                    <button className="btn-primary flex items-center gap-2 py-2 px-4 text-sm" onClick={handleSaveHero} disabled={heroSaving}>
                        <MdSave size={15} /> {heroSaved ? "Saved!" : heroSaving ? "Saving…" : "Save All Headings"}
                    </button>
                </div>
            )}

            {/* ── CERTIFICATIONS TAB ── */}
            {!loading && tab === "certs" && (
                <div className="space-y-4">
                    <div className="flex justify-end"><button className="btn-primary flex items-center gap-2" onClick={openNewCert}><MdAdd size={16} /> Add Certification</button></div>
                    {certs.length === 0 ? <div className="admin-card text-sm text-gray-400 text-center py-8">No certifications yet. Site uses built-in defaults.</div> : (
                        <div className="admin-card p-0 overflow-hidden overflow-x-auto">
                            <table className="admin-table">
                                <thead><tr><th>Order</th><th>Title</th><th>Badge</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {certs.map(c => (
                                        <tr key={c.id}>
                                            <td className="font-mono text-xs text-gray-400">{c.order}</td>
                                            <td className="font-semibold text-gray-900 max-w-xs truncate">{c.title}</td>
                                            <td><span className="badge badge-green text-[10px]">{c.badge}</span></td>
                                            <td><button onClick={() => updateComplianceCertification(c.id!, { active: !c.active }).then(loadAll)}><span className={`badge ${c.active ? "badge-green" : "badge-gray"}`}>{c.active ? "Active" : "Hidden"}</span></button></td>
                                            <td><div className="flex gap-2"><button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEditCert(c)}><MdEdit size={13} /></button><button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDeleteCert(c.id!)}><MdDelete size={13} /></button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── DOCS PER DEST TAB ── */}
            {!loading && tab === "docs" && (
                <div className="space-y-4">
                    <div className="flex justify-end"><button className="btn-primary flex items-center gap-2" onClick={openNewDest}><MdAdd size={16} /> Add Destination</button></div>
                    {dests.length === 0 ? <div className="admin-card text-sm text-gray-400 text-center py-8">No destination doc lists yet. Site uses built-in defaults.</div> : (
                        <div className="space-y-3">
                            {dests.map(d => (
                                <div key={d.id} className="admin-card space-y-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="font-bold text-[#14532d] text-sm">{d.region}</p>
                                        <div className="flex gap-2">
                                            <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEditDest(d)}><MdEdit size={13} /></button>
                                            <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDeleteDest(d.id!)}><MdDelete size={13} /></button>
                                        </div>
                                    </div>
                                    <ul className="space-y-1">{d.docs.map((doc, i) => <li key={i} className="text-xs text-gray-600 flex items-start gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0 mt-1.5" />{doc}</li>)}</ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── FAQS TAB ── */}
            {!loading && tab === "faqs" && (
                <div className="space-y-4">
                    <div className="flex justify-end"><button className="btn-primary flex items-center gap-2" onClick={openNewFaq}><MdAdd size={16} /> Add FAQ</button></div>
                    {faqs.length === 0 ? <div className="admin-card text-sm text-gray-400 text-center py-8">No export FAQs yet. Site uses built-in defaults.</div> : (
                        <div className="admin-card p-0 overflow-hidden">
                            <table className="admin-table">
                                <thead><tr><th>Order</th><th>Question</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {faqs.map(f => (
                                        <tr key={f.id}>
                                            <td className="font-mono text-xs text-gray-400">{f.order}</td>
                                            <td className="text-sm text-gray-800 max-w-md truncate">{f.question}</td>
                                            <td><button onClick={() => updateExportFAQ(f.id!, { active: !f.active }).then(loadAll)}><span className={`badge ${f.active ? "badge-green" : "badge-gray"}`}>{f.active ? "Active" : "Hidden"}</span></button></td>
                                            <td><div className="flex gap-2"><button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEditFaq(f)}><MdEdit size={13} /></button><button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDeleteFaq(f.id!)}><MdDelete size={13} /></button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Cert Modal ── */}
            {showCertModal && (
                <div className="modal-overlay"><div className="modal-box" style={{ maxWidth: 560 }}>
                    <div className="modal-header"><h2 className="text-base font-semibold">{editingCert ? "Edit Certification" : "New Certification"}</h2><button onClick={() => setShowCertModal(false)}><MdClose size={20} /></button></div>
                    <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "70vh" }}>
                        <div><label className="admin-label">Title *</label><input className="admin-input" value={certForm.title} onChange={e => setCertForm({ ...certForm, title: e.target.value })} placeholder="e.g. Organic Certification" /></div>
                        <div><label className="admin-label">Body</label><textarea className="admin-input" rows={4} value={certForm.body} onChange={e => setCertForm({ ...certForm, body: e.target.value })} /></div>
                        <div><label className="admin-label">Badge Text</label><input className="admin-input" value={certForm.badge} onChange={e => setCertForm({ ...certForm, badge: e.target.value })} placeholder="e.g. EU · USA · ASIA" /></div>
                        <div><label className="admin-label">Display Order</label><input type="number" className="admin-input" value={certForm.order} onChange={e => setCertForm({ ...certForm, order: Number(e.target.value) })} /></div>
                        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={certForm.active} onChange={e => setCertForm({ ...certForm, active: e.target.checked })} /> Active</label>
                        <div className="flex gap-3 pt-2"><button className="btn-primary flex-1" onClick={handleSaveCert} disabled={certSaving}>{certSaving ? "Saving…" : editingCert ? "Update" : "Add"}</button><button className="btn-secondary" onClick={() => setShowCertModal(false)}>Cancel</button></div>
                    </div>
                </div></div>
            )}

            {/* ── Dest Docs Modal ── */}
            {showDestModal && (
                <div className="modal-overlay"><div className="modal-box" style={{ maxWidth: 520 }}>
                    <div className="modal-header"><h2 className="text-base font-semibold">{editingDest ? "Edit Destination Docs" : "Add Destination Docs"}</h2><button onClick={() => setShowDestModal(false)}><MdClose size={20} /></button></div>
                    <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "70vh" }}>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="admin-label">Region *</label><input className="admin-input" value={destForm.region} onChange={e => setDestForm({ ...destForm, region: e.target.value })} placeholder="e.g. Europe" /></div>
                            <div><label className="admin-label">Order</label><input type="number" className="admin-input" value={destForm.order} onChange={e => setDestForm({ ...destForm, order: Number(e.target.value) })} /></div>
                        </div>
                        <div>
                            <label className="admin-label">Required Documents</label>
                            <div className="space-y-2">
                                {destForm.docs.map((d, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input className="admin-input flex-1" value={d} onChange={e => updateDoc(i, e.target.value)} placeholder={`Document ${i + 1}`} />
                                        <button onClick={() => removeDoc(i)} className="btn-danger py-1 px-2 text-xs"><MdClose size={13} /></button>
                                    </div>
                                ))}
                                <button className="btn-secondary text-xs py-1.5 px-3" onClick={addDoc}>+ Add Document</button>
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={destForm.active} onChange={e => setDestForm({ ...destForm, active: e.target.checked })} /> Active</label>
                        <div className="flex gap-3 pt-2"><button className="btn-primary flex-1" onClick={handleSaveDest} disabled={destSaving}>{destSaving ? "Saving…" : editingDest ? "Update" : "Add"}</button><button className="btn-secondary" onClick={() => setShowDestModal(false)}>Cancel</button></div>
                    </div>
                </div></div>
            )}

            {/* ── FAQ Modal ── */}
            {showFaqModal && (
                <div className="modal-overlay"><div className="modal-box" style={{ maxWidth: 520 }}>
                    <div className="modal-header"><h2 className="text-base font-semibold">{editingFaq ? "Edit FAQ" : "New FAQ"}</h2><button onClick={() => setShowFaqModal(false)}><MdClose size={20} /></button></div>
                    <div className="p-5 space-y-4">
                        <div><label className="admin-label">Question *</label><input className="admin-input" value={faqForm.question} onChange={e => setFaqForm({ ...faqForm, question: e.target.value })} /></div>
                        <div><label className="admin-label">Answer *</label><textarea className="admin-input" rows={4} value={faqForm.answer} onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })} /></div>
                        <div><label className="admin-label">Order</label><input type="number" className="admin-input" value={faqForm.order} onChange={e => setFaqForm({ ...faqForm, order: Number(e.target.value) })} /></div>
                        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={faqForm.active} onChange={e => setFaqForm({ ...faqForm, active: e.target.checked })} /> Active</label>
                        <div className="flex gap-3 pt-2"><button className="btn-primary flex-1" onClick={handleSaveFaq} disabled={faqSaving}>{faqSaving ? "Saving…" : editingFaq ? "Update" : "Add"}</button><button className="btn-secondary" onClick={() => setShowFaqModal(false)}>Cancel</button></div>
                    </div>
                </div></div>
            )}
        </div>
    );
}
