"use client";

import { useEffect, useMemo, useState } from "react";
import {
    getExportCommodities, createExportCommodity, updateExportCommodity,
    deleteExportCommodity, ExportCommodity,
    EXPORT_CATEGORIES, EXPORT_CERTIFICATIONS, EXPORT_MARKETS, EXPORT_PACKAGING,
    ExportCategory, ExportCertification, ExportMarket, ExportPackaging,
} from "@/lib/firestore";
import ImageUpload from "@/components/ImageUpload";
import WysiwygEditor from "@/components/WysiwygEditor";
import { MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";

const empty: Omit<ExportCommodity, "id"> = {
    name: "", spec: "", priceMin: 0, priceMax: 0, moq: "",
    catalogType: "raw",
    category: "Nuts",
    certification: "Organic",
    markets: ["Europe"],
    packaging: ["25 kg"],
    image: "",
    galleryImages: ["", ""],
    description: "",
    detailsHtml: "",
    relatedIds: [],
    active: true, order: 0,
};

type TypeFilter = "all" | "raw" | "processed";

function toggleInList<T extends string>(list: T[] | undefined, value: T): T[] {
    const current = list ?? [];
    return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

export default function ExportCommoditiesPage() {
    const [items, setItems] = useState<ExportCommodity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<ExportCommodity | null>(null);
    const [form, setForm] = useState<Omit<ExportCommodity, "id">>(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [filterType, setFilterType] = useState<TypeFilter>("all");
    const [filterCategory, setFilterCategory] = useState<ExportCategory | "all">("all");
    const [filterCertification, setFilterCertification] = useState<ExportCertification | "all">("all");
    const [filterMarket, setFilterMarket] = useState<ExportMarket | "all">("all");
    const [filterPackaging, setFilterPackaging] = useState<ExportPackaging | "all">("all");

    async function load() {
        setLoading(true);
        try { setItems(await getExportCommodities()); } finally { setLoading(false); }
    }
    useEffect(() => { load(); }, []);

    function openNew() { setEditing(null); setForm(empty); setError(""); setShowModal(true); }
    function openEdit(c: ExportCommodity) {
        setEditing(c);
        setForm({
            name: c.name ?? "",
            spec: c.spec ?? "",
            priceMin: Number(c.priceMin) || 0,
            priceMax: Number(c.priceMax) || 0,
            moq: c.moq ?? "",
            catalogType: c.catalogType === "processed" ? "processed" : "raw",
            category: c.category ?? "Nuts",
            certification: c.certification ?? "Organic",
            markets: c.markets?.length ? c.markets : ["Europe"],
            packaging: c.packaging?.length ? c.packaging : ["25 kg"],
            image: c.image ?? "",
            galleryImages: c.galleryImages?.length ? [...c.galleryImages.filter(Boolean), ""].slice(0, 4) : ["", ""],
            description: c.description ?? "",
            detailsHtml: c.detailsHtml ?? "",
            relatedIds: c.relatedIds ?? [],
            active: c.active !== false,
            order: c.order ?? 0,
        });
        setError("");
        setShowModal(true);
    }

    async function handleSave() {
        if (!form.name.trim()) { setError("Name is required."); return; }
        if (form.priceMin < 0) { setError("Min price cannot be negative."); return; }
        if (!form.category) { setError("Category is required."); return; }
        if (!form.certification) { setError("Certification is required."); return; }
        if (!form.markets?.length) { setError("Select at least one market."); return; }
        if (!form.packaging?.length) { setError("Select at least one packaging option."); return; }
        setSaving(true); setError("");
        try {
            const payload: Omit<ExportCommodity, "id"> = {
                name: form.name.trim(),
                spec: form.spec ?? "",
                priceMin: Number(form.priceMin) || 0,
                priceMax: Number(form.priceMax) || 0,
                moq: form.moq ?? "",
                catalogType: form.catalogType,
                category: form.category,
                certification: form.certification,
                markets: form.markets ?? [],
                packaging: form.packaging ?? [],
                image: form.image ?? "",
                galleryImages: (form.galleryImages ?? []).filter(Boolean),
                description: form.description ?? "",
                detailsHtml: form.detailsHtml ?? "",
                relatedIds: form.relatedIds ?? [],
                active: form.active !== false,
                order: Number(form.order) || 0,
            };
            if (editing?.id) await updateExportCommodity(editing.id, payload);
            else await createExportCommodity(payload);
            setShowModal(false);
            setEditing(null);
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to save commodity.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this commodity?")) return;
        await deleteExportCommodity(id); await load();
    }

    async function toggleActive(c: ExportCommodity) {
        if (!c.id) return;
        await updateExportCommodity(c.id, { active: !c.active }); await load();
    }

    const filtered = useMemo(() => items.filter((c) => {
        if (filterType !== "all" && c.catalogType !== filterType) return false;
        if (filterCategory !== "all" && c.category !== filterCategory) return false;
        if (filterCertification !== "all" && c.certification !== filterCertification) return false;
        if (filterMarket !== "all" && !(c.markets ?? []).includes(filterMarket)) return false;
        if (filterPackaging !== "all" && !(c.packaging ?? []).includes(filterPackaging)) return false;
        return true;
    }), [items, filterType, filterCategory, filterCertification, filterMarket, filterPackaging]);

    const rawCount = items.filter(c => c.catalogType === "raw").length;
    const processedCount = items.filter(c => c.catalogType === "processed").length;

    return (
        <div className="w-full space-y-4">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Export Commodities</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Manage Raw and Processed commodities shown on the homepage and International Export page
                    </p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={openNew}>
                    <MdAdd size={16} /> New Commodity
                </button>
            </div>

            {/* Product type tabs */}
            <div className="flex gap-1 border-b border-gray-200">
                {([["all", `All (${items.length})`], ["raw", `Raw (${rawCount})`], ["processed", `Processed (${processedCount})`]] as const).map(([f, label]) => (
                    <button
                        key={f}
                        onClick={() => setFilterType(f)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize transition-colors ${filterType === f ? "border-green-700 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Detail filters */}
            <div className="admin-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                    <label className="admin-label">Category</label>
                    <select className="admin-input" value={filterCategory} onChange={e => setFilterCategory(e.target.value as ExportCategory | "all")}>
                        <option value="all">All</option>
                        {EXPORT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="admin-label">Certification</label>
                    <select className="admin-input" value={filterCertification} onChange={e => setFilterCertification(e.target.value as ExportCertification | "all")}>
                        <option value="all">All</option>
                        {EXPORT_CERTIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="admin-label">Market</label>
                    <select className="admin-input" value={filterMarket} onChange={e => setFilterMarket(e.target.value as ExportMarket | "all")}>
                        <option value="all">All</option>
                        {EXPORT_MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div>
                    <label className="admin-label">Packaging</label>
                    <select className="admin-input" value={filterPackaging} onChange={e => setFilterPackaging(e.target.value as ExportPackaging | "all")}>
                        <option value="all">All</option>
                        {EXPORT_PACKAGING.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="admin-card text-sm text-gray-500">Loading…</div>
            ) : filtered.length === 0 ? (
                <div className="admin-card text-center py-12 text-gray-400">
                    No commodities match these filters.
                </div>
            ) : (
                <div className="admin-card p-0 overflow-x-auto">
                    <table className="admin-table" style={{ minWidth: 1100 }}>
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Image</th>
                                <th>Commodity</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Cert</th>
                                <th>Markets</th>
                                <th>Packaging</th>
                                <th>Price Range (USD/MT)</th>
                                <th>Status</th>
                                <th className="sticky right-0 z-10 bg-slate-50 whitespace-nowrap shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.15)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.id}>
                                    <td className="font-mono text-xs text-gray-400">{c.order}</td>
                                    <td>
                                        {c.image ? (
                                            <img src={c.image} alt="" className="w-10 h-10 object-cover rounded" />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs">—</div>
                                        )}
                                    </td>
                                    <td className="font-medium text-gray-900 max-w-[160px]">
                                        <div className="truncate">{c.name}</div>
                                        <div className="text-xs text-gray-400 truncate">{c.spec}</div>
                                    </td>
                                    <td>
                                        <span className={`badge text-[10px] ${c.catalogType === "raw" ? "badge-green" : "badge-blue"}`}>
                                            {c.catalogType}
                                        </span>
                                    </td>
                                    <td className="text-sm text-gray-600">{c.category ?? "—"}</td>
                                    <td className="text-sm text-gray-600">{c.certification ?? "—"}</td>
                                    <td className="text-xs text-gray-500 max-w-[120px]">{(c.markets ?? []).join(", ") || "—"}</td>
                                    <td className="text-xs text-gray-500 max-w-[100px]">{(c.packaging ?? []).join(", ") || "—"}</td>
                                    <td className="text-sm font-semibold text-green-700 whitespace-nowrap">
                                        ${(c.priceMin ?? 0).toLocaleString()} – ${(c.priceMax ?? 0).toLocaleString()}
                                    </td>
                                    <td>
                                        <button onClick={() => toggleActive(c)}>
                                            <span className={`badge ${c.active ? "badge-green" : "badge-gray"}`}>
                                                {c.active ? "Active" : "Hidden"}
                                            </span>
                                        </button>
                                    </td>
                                    <td className="sticky right-0 z-10 bg-white whitespace-nowrap shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.15)]">
                                        <div className="flex gap-2">
                                            <button type="button" className="btn-secondary py-1 px-2 text-xs inline-flex items-center gap-1" onClick={() => openEdit(c)}>
                                                <MdEdit size={14} /> Edit
                                            </button>
                                            <button type="button" className="btn-danger py-1 px-2 text-xs inline-flex items-center gap-1" onClick={() => handleDelete(c.id!)}>
                                                <MdDelete size={14} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: 720 }}>
                        <div className="modal-header">
                            <h2 className="text-base font-semibold">{editing ? "Edit Commodity" : "New Commodity"}</h2>
                            <button onClick={() => setShowModal(false)}><MdClose size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "75vh" }}>
                            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Product Type *</label>
                                    <select
                                        className="admin-input"
                                        value={form.catalogType}
                                        onChange={e => setForm({ ...form, catalogType: e.target.value as "raw" | "processed" })}
                                    >
                                        <option value="raw">Raw</option>
                                        <option value="processed">Processed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="admin-label">Display Order</label>
                                    <input type="number" className="admin-input" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
                                </div>
                            </div>

                            <div>
                                <label className="admin-label">Commodity Name *</label>
                                <input className="admin-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sesame seeds (white)" />
                            </div>

                            <div>
                                <label className="admin-label">Grade / Spec</label>
                                <input className="admin-input" value={form.spec} onChange={e => setForm({ ...form, spec: e.target.value })} placeholder="e.g. 99% purity, FFA <2%" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Category *</label>
                                    <select
                                        className="admin-input"
                                        value={form.category ?? ""}
                                        onChange={e => setForm({ ...form, category: e.target.value as ExportCategory })}
                                    >
                                        <option value="" disabled>Select category…</option>
                                        {EXPORT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="admin-label">Certification *</label>
                                    <select
                                        className="admin-input"
                                        value={form.certification ?? ""}
                                        onChange={e => setForm({ ...form, certification: e.target.value as ExportCertification })}
                                    >
                                        <option value="" disabled>Select certification…</option>
                                        {EXPORT_CERTIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="admin-label">Market * <span className="font-normal text-gray-400">(select all that apply)</span></label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {EXPORT_MARKETS.map(m => {
                                        const checked = (form.markets ?? []).includes(m);
                                        return (
                                            <label key={m} className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border cursor-pointer ${checked ? "bg-green-50 border-green-600 text-green-800" : "border-gray-200 text-gray-600"}`}>
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={checked}
                                                    onChange={() => setForm({ ...form, markets: toggleInList(form.markets, m) })}
                                                />
                                                {m}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="admin-label">Packaging * <span className="font-normal text-gray-400">(select all that apply)</span></label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {EXPORT_PACKAGING.map(p => {
                                        const checked = (form.packaging ?? []).includes(p);
                                        return (
                                            <label key={p} className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border cursor-pointer ${checked ? "bg-green-50 border-green-600 text-green-800" : "border-gray-200 text-gray-600"}`}>
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={checked}
                                                    onChange={() => setForm({ ...form, packaging: toggleInList(form.packaging, p) })}
                                                />
                                                {p}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Min Price (USD/MT) *</label>
                                    <input type="number" className="admin-input" value={form.priceMin} onChange={e => setForm({ ...form, priceMin: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="admin-label">Max Price (USD/MT) *</label>
                                    <input type="number" className="admin-input" value={form.priceMax} onChange={e => setForm({ ...form, priceMax: Number(e.target.value) })} />
                                </div>
                            </div>

                            <div>
                                <label className="admin-label">MOQ</label>
                                <input className="admin-input" value={form.moq} onChange={e => setForm({ ...form, moq: e.target.value })} placeholder="e.g. 25 MT" />
                            </div>

                            <ImageUpload
                                value={form.image ?? ""}
                                onChange={url => setForm({ ...form, image: url })}
                                label="Main Product Image"
                            />

                            <div>
                                <label className="admin-label">Gallery images</label>
                                <div className="grid grid-cols-2 gap-3 mt-1">
                                    {(form.galleryImages ?? ["", ""]).map((url, i) => (
                                        <ImageUpload
                                            key={i}
                                            value={url}
                                            onChange={next => {
                                                const gallery = [...(form.galleryImages ?? ["", ""])];
                                                gallery[i] = next;
                                                setForm({ ...form, galleryImages: gallery });
                                            }}
                                            label={`Gallery ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="admin-label">Short description</label>
                                <textarea className="admin-input" rows={2} value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>

                            <div>
                                <label className="admin-label">Full product details (WYSIWYG)</label>
                                <WysiwygEditor
                                    key={editing?.id ?? "new"}
                                    content={form.detailsHtml ?? ""}
                                    onChange={html => setForm({ ...form, detailsHtml: html })}
                                    placeholder="Write the full commodity details…"
                                />
                            </div>

                            <div>
                                <label className="admin-label">Related commodities</label>
                                <div className="flex flex-wrap gap-2 mt-1 max-h-36 overflow-y-auto">
                                    {items.filter(c => c.id && c.id !== editing?.id).map(c => {
                                        const checked = (form.relatedIds ?? []).includes(c.id!);
                                        return (
                                            <label key={c.id} className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer ${checked ? "bg-green-50 border-green-600 text-green-800" : "border-gray-200 text-gray-600"}`}>
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={checked}
                                                    onChange={() => setForm({
                                                        ...form,
                                                        relatedIds: checked
                                                            ? (form.relatedIds ?? []).filter(id => id !== c.id)
                                                            : [...(form.relatedIds ?? []), c.id!],
                                                    })}
                                                />
                                                {c.name}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                                Active (visible on export pages)
                            </label>

                            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}

                            <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
                                <button type="button" className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving…" : editing ? "Update" : "Create"}
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
