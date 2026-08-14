"use client";

import { useEffect, useState } from "react";
import {
    getHealthMetrics, createHealthMetric, updateHealthMetric, deleteHealthMetric,
    getHealthCalculatorPage, saveHealthCalculatorPage,
    HealthMetric, HealthCalculatorPage, DEFAULT_HEALTH_PAGE, DEFAULT_HEALTH_METRICS,
} from "@/lib/firestore";
import { MdAdd, MdEdit, MdDelete, MdClose, MdSave } from "react-icons/md";

const emptyMetric: Omit<HealthMetric, "id"> = {
    key: "",
    label: "",
    unit: "",
    icon: "",
    placeholder: "",
    helpText: "",
    kind: "number",
    scored: true,
    greenMin: 0,
    greenMax: 0,
    yellowMin: 0,
    yellowMax: 0,
    order: 0,
    active: true,
};

export default function HealthCalculatorAdminPage() {
    const [page, setPage] = useState<HealthCalculatorPage>(DEFAULT_HEALTH_PAGE);
    const [pageSaving, setPageSaving] = useState(false);
    const [pageSaved, setPageSaved] = useState(false);

    const [metrics, setMetrics] = useState<HealthMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<HealthMetric | null>(null);
    const [form, setForm] = useState<Omit<HealthMetric, "id">>(emptyMetric);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [seeding, setSeeding] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const [p, m] = await Promise.all([getHealthCalculatorPage(), getHealthMetrics()]);
            setPage(p);
            setMetrics(m.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, []);

    async function handleSavePage() {
        setPageSaving(true);
        try {
            await saveHealthCalculatorPage(page);
            setPageSaved(true);
            setTimeout(() => setPageSaved(false), 2500);
        } finally {
            setPageSaving(false);
        }
    }

    function openNew() {
        setEditing(null);
        setForm({ ...emptyMetric, order: metrics.length + 1 });
        setError("");
        setShowModal(true);
    }
    function openEdit(m: HealthMetric) {
        setEditing(m);
        setForm({
            key: m.key, label: m.label, unit: m.unit, icon: m.icon,
            placeholder: m.placeholder ?? "", helpText: m.helpText ?? "",
            kind: m.kind ?? "number", scored: m.scored,
            greenMin: m.greenMin, greenMax: m.greenMax,
            yellowMin: m.yellowMin, yellowMax: m.yellowMax,
            order: m.order ?? 0, active: m.active,
        });
        setError("");
        setShowModal(true);
    }

    async function handleSave() {
        if (!form.key.trim() || !form.label.trim()) {
            setError("Key and label are required.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            if (editing?.id) await updateHealthMetric(editing.id, form);
            else await createHealthMetric(form);
            setShowModal(false);
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this metric?")) return;
        await deleteHealthMetric(id);
        await load();
    }

    async function toggleActive(m: HealthMetric) {
        if (!m.id) return;
        await updateHealthMetric(m.id, { active: !m.active });
        await load();
    }

    async function seedDefaults() {
        if (!confirm("Add any missing default metrics (age, height, weight, BMI, sleep, BP, glucose, etc.)? Existing metrics are kept.")) return;
        setSeeding(true);
        try {
            const existingKeys = new Set(metrics.map(m => m.key));
            for (const m of DEFAULT_HEALTH_METRICS) {
                if (!existingKeys.has(m.key)) await createHealthMetric(m);
            }
            await load();
        } finally {
            setSeeding(false);
        }
    }

    const setP = (k: keyof HealthCalculatorPage, v: string | number) =>
        setPage(p => ({ ...p, [k]: v }));

    return (
        <div className="max-w-5xl space-y-6">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Health Calculator</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Metrics, traffic-light thresholds and page copy shown on /health-calculator
                    </p>
                </div>
            </div>

            <div className="admin-card space-y-4">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Page Copy</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="admin-label">Page Title</label>
                        <input className="admin-input" value={page.pageTitle} onChange={e => setP("pageTitle", e.target.value)} />
                    </div>
                    <div>
                        <label className="admin-label">Page Subtitle</label>
                        <input className="admin-input" value={page.pageSubtitle} onChange={e => setP("pageSubtitle", e.target.value)} />
                    </div>
                </div>
                <div>
                    <label className="admin-label">Disclaimer</label>
                    <textarea className="admin-input" rows={2} value={page.disclaimer} onChange={e => setP("disclaimer", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="admin-label">Green label</label>
                        <input className="admin-input" value={page.goodLabel} onChange={e => setP("goodLabel", e.target.value)} />
                    </div>
                    <div>
                        <label className="admin-label">Yellow label</label>
                        <input className="admin-input" value={page.fairLabel} onChange={e => setP("fairLabel", e.target.value)} />
                    </div>
                    <div>
                        <label className="admin-label">Red label</label>
                        <input className="admin-input" value={page.badLabel} onChange={e => setP("badLabel", e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="admin-label">Green min average (0–2)</label>
                        <input type="number" step="0.1" className="admin-input" value={page.goodMinScore} onChange={e => setP("goodMinScore", Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="admin-label">Yellow min average (0–2)</label>
                        <input type="number" step="0.1" className="admin-input" value={page.fairMinScore} onChange={e => setP("fairMinScore", Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="admin-label">CTA label</label>
                        <input className="admin-input" value={page.ctaLabel ?? ""} onChange={e => setP("ctaLabel", e.target.value)} />
                    </div>
                    <div>
                        <label className="admin-label">CTA link</label>
                        <input className="admin-input" value={page.ctaHref ?? ""} onChange={e => setP("ctaHref", e.target.value)} />
                    </div>
                </div>
                <button className="btn-primary flex items-center gap-2 py-2 px-4 text-sm" onClick={handleSavePage} disabled={pageSaving}>
                    <MdSave size={15} /> {pageSaved ? "Saved!" : pageSaving ? "Saving…" : "Save Page Copy"}
                </button>
            </div>

            <div className="admin-card space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Health Metrics</p>
                        <p className="text-xs text-gray-400 mt-0.5">Each metric has green / yellow / red ranges. Values outside yellow are red.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary py-1.5 px-3 text-xs" onClick={seedDefaults} disabled={seeding}>
                            {seeding ? "Seeding…" : "Load defaults"}
                        </button>
                        <button className="btn-primary flex items-center gap-1.5 py-1.5 px-3 text-xs" onClick={openNew}>
                            <MdAdd size={14} /> Add Metric
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p className="text-sm text-gray-400">Loading…</p>
                ) : metrics.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">
                        No metrics yet. Click “Load defaults” to add height, weight, sleep, BP, glucose and more.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Metric</th>
                                    <th>Type</th>
                                    <th>Green</th>
                                    <th>Yellow</th>
                                    <th>Scored</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.map(m => (
                                    <tr key={m.id ?? m.key}>
                                        <td className="font-mono text-xs text-gray-400">{m.order}</td>
                                        <td>
                                            <div className="font-medium text-gray-900">{m.icon} {m.label}</div>
                                            <div className="text-xs text-gray-400">{m.key} · {m.unit}</div>
                                        </td>
                                        <td className="text-xs text-gray-500">{m.kind === "derived_bmi" ? "BMI (auto)" : "Number"}</td>
                                        <td className="text-xs text-green-700">{m.scored ? `${m.greenMin}–${m.greenMax}` : "—"}</td>
                                        <td className="text-xs text-amber-600">{m.scored ? `${m.yellowMin}–${m.yellowMax}` : "—"}</td>
                                        <td>{m.scored ? "Yes" : "No"}</td>
                                        <td>
                                            <button onClick={() => toggleActive(m)}>
                                                <span className={`badge ${m.active ? "badge-green" : "badge-gray"}`}>
                                                    {m.active ? "Active" : "Hidden"}
                                                </span>
                                            </button>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(m)}><MdEdit size={13} /></button>
                                                <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(m.id!)}><MdDelete size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: 560 }}>
                        <div className="modal-header">
                            <h2 className="text-base font-semibold">{editing ? "Edit Metric" : "New Metric"}</h2>
                            <button onClick={() => setShowModal(false)}><MdClose size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "75vh" }}>
                            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Key * (no spaces)</label>
                                    <input className="admin-input" value={form.key} onChange={e => setForm({ ...form, key: e.target.value.replace(/\s+/g, "_").toLowerCase() })} placeholder="e.g. sleep" />
                                </div>
                                <div>
                                    <label className="admin-label">Label *</label>
                                    <input className="admin-input" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
                                </div>
                                <div>
                                    <label className="admin-label">Unit</label>
                                    <input className="admin-input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="cm, kg, mmHg…" />
                                </div>
                                <div>
                                    <label className="admin-label">Icon (emoji)</label>
                                    <input className="admin-input" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
                                </div>
                                <div>
                                    <label className="admin-label">Placeholder</label>
                                    <input className="admin-input" value={form.placeholder ?? ""} onChange={e => setForm({ ...form, placeholder: e.target.value })} />
                                </div>
                                <div>
                                    <label className="admin-label">Type</label>
                                    <select className="admin-input" value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value as HealthMetric["kind"] })}>
                                        <option value="number">Number input</option>
                                        <option value="derived_bmi">Derived BMI (from height + weight)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="admin-label">Help text</label>
                                <input className="admin-input" value={form.helpText ?? ""} onChange={e => setForm({ ...form, helpText: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Green min</label>
                                    <input type="number" step="0.1" className="admin-input" value={form.greenMin} onChange={e => setForm({ ...form, greenMin: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="admin-label">Green max</label>
                                    <input type="number" step="0.1" className="admin-input" value={form.greenMax} onChange={e => setForm({ ...form, greenMax: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="admin-label">Yellow min</label>
                                    <input type="number" step="0.1" className="admin-input" value={form.yellowMin} onChange={e => setForm({ ...form, yellowMin: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="admin-label">Yellow max</label>
                                    <input type="number" step="0.1" className="admin-input" value={form.yellowMax} onChange={e => setForm({ ...form, yellowMax: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="admin-label">Display order</label>
                                    <input type="number" className="admin-input" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.scored} onChange={e => setForm({ ...form, scored: e.target.checked })} />
                                Include in traffic-light score
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                                Active
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
