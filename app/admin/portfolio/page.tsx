"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
    getPortfolioItems, createPortfolioItem, updatePortfolioItem,
    deletePortfolioItem, PortfolioItem,
} from "@/lib/firestore";
import ImageUpload from "@/components/ImageUpload";
import WysiwygEditor from "@/components/WysiwygEditor";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { MdAdd, MdEdit, MdDelete, MdClose, MdAddPhotoAlternate } from "react-icons/md";

const empty: Omit<PortfolioItem, "id"> = {
    title: "",
    description: "",
    image: "",
    link: "",
    order: 0,
    active: true,
    content: "",
    galleryImages: [],
};

export default function PortfolioPage() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<PortfolioItem | null>(null);
    const [form, setForm] = useState<Omit<PortfolioItem, "id">>(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [galleryUploading, setGalleryUploading] = useState(false);

    async function load() {
        setLoading(true);
        setItems(await getPortfolioItems());
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    function openNew() {
        setEditing(null);
        setForm(empty);
        setError("");
        setShowModal(true);
    }

    function openEdit(item: PortfolioItem) {
        setEditing(item);
        setForm({
            title: item.title,
            description: item.description,
            image: item.image,
            link: item.link ?? "",
            order: item.order,
            active: item.active,
            content: item.content ?? "",
            galleryImages: item.galleryImages ?? [],
        });
        setError("");
        setShowModal(true);
    }

    async function handleSave() {
        if (!form.title) { setError("Title is required."); return; }
        setSaving(true);
        setError("");
        try {
            if (editing?.id) await updatePortfolioItem(editing.id, form);
            else await createPortfolioItem(form);
            setShowModal(false);
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this portfolio item?")) return;
        await deletePortfolioItem(id);
        await load();
    }

    async function toggleActive(item: PortfolioItem) {
        if (!item.id) return;
        await updatePortfolioItem(item.id, { active: !item.active });
        await load();
    }

    async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        setGalleryUploading(true);
        try {
            const urls = await Promise.all(files.map((f) => uploadToCloudinary(f)));
            setForm((prev) => ({
                ...prev,
                galleryImages: [...(prev.galleryImages ?? []), ...urls],
            }));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Upload failed.");
        } finally {
            setGalleryUploading(false);
            e.target.value = "";
        }
    }

    function removeGalleryImage(idx: number) {
        setForm((prev) => ({
            ...prev,
            galleryImages: (prev.galleryImages ?? []).filter((_, i) => i !== idx),
        }));
    }

    return (
        <div className="max-w-5xl space-y-4">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Portfolio</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Each item links to its own detail page with full content and gallery
                    </p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={openNew}>
                    <MdAdd size={16} /> New Item
                </button>
            </div>

            {loading ? (
                <div className="admin-card text-sm text-gray-500">Loading…</div>
            ) : items.length === 0 ? (
                <div className="admin-card text-sm text-gray-500 text-center py-8">No items yet.</div>
            ) : (
                <div className="admin-card p-0 overflow-hidden overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Preview</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Gallery</th>
                                <th>Detail Content</th>
                                <th>Order</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        {item.image && (
                                            <Image src={item.image} alt="" width={64} height={40} className="w-16 h-10 object-cover" />
                                        )}
                                    </td>
                                    <td className="font-medium text-gray-800 max-w-[160px] truncate">{item.title}</td>
                                    <td className="text-gray-500 text-xs max-w-[180px] truncate">{item.description}</td>
                                    <td className="text-xs text-gray-500 text-center">
                                        {(item.galleryImages?.length ?? 0) > 0
                                            ? <span className="badge badge-blue">{item.galleryImages!.length} img</span>
                                            : <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="text-xs text-gray-500 text-center">
                                        {item.content
                                            ? <span className="badge badge-green">Yes</span>
                                            : <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="text-center">{item.order}</td>
                                    <td>
                                        <button onClick={() => toggleActive(item)}>
                                            <span className={`badge ${item.active ? "badge-green" : "badge-gray"}`}>
                                                {item.active ? "Active" : "Hidden"}
                                            </span>
                                        </button>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(item)}>
                                                <MdEdit size={14} />
                                            </button>
                                            <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(item.id!)}>
                                                <MdDelete size={14} />
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
                    <div className="modal-box" style={{ maxWidth: 780 }}>
                        <div className="modal-header">
                            <h2 className="text-base font-semibold">
                                {editing ? "Edit Portfolio Item" : "New Portfolio Item"}
                            </h2>
                            <button onClick={() => setShowModal(false)}><MdClose size={20} /></button>
                        </div>

                        <div className="p-5 space-y-5 overflow-y-auto" style={{ maxHeight: "80vh" }}>
                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>
                            )}

                            {/* ── Basic info ── */}
                            <div className="space-y-4">
                                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-2">
                                    Basic Info
                                </p>
                                <div>
                                    <label className="admin-label">Title *</label>
                                    <input
                                        className="admin-input"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="e.g. Premium Okra Export"
                                    />
                                </div>
                                <div>
                                    <label className="admin-label">Short Description</label>
                                    <textarea
                                        className="admin-input"
                                        rows={2}
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Brief excerpt shown on the portfolio listing page"
                                    />
                                </div>
                                <ImageUpload
                                    value={form.image}
                                    onChange={(url) => setForm({ ...form, image: url })}
                                    label="Cover Image (shown on listing)"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="admin-label">External Link (optional)</label>
                                        <input
                                            className="admin-input"
                                            value={form.link ?? ""}
                                            onChange={(e) => setForm({ ...form, link: e.target.value })}
                                            placeholder="https://…"
                                        />
                                    </div>
                                    <div>
                                        <label className="admin-label">Display Order</label>
                                        <input
                                            type="number"
                                            className="admin-input"
                                            value={form.order}
                                            onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.active}
                                        onChange={(e) => setForm({ ...form, active: e.target.checked })}
                                    />
                                    Active (visible on site)
                                </label>
                            </div>

                            {/* ── Detail page content (WYSIWYG) ── */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-2">
                                    Detail Page Content
                                </p>
                                <p className="text-xs text-gray-400">
                                    Full content shown when a visitor clicks into this portfolio item.
                                    Supports headings, lists, links, and inline images.
                                </p>
                                <WysiwygEditor
                                    content={form.content ?? ""}
                                    onChange={(html) => setForm({ ...form, content: html })}
                                    placeholder="Write the full case study, project details, or story here…"
                                />
                            </div>

                            {/* ── Gallery images ── */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-2">
                                    Gallery Images
                                </p>
                                <p className="text-xs text-gray-400">
                                    Extra images shown in the gallery section of the detail page. Select multiple at once.
                                </p>

                                {/* Upload button */}
                                <label className={`flex items-center gap-2 btn-secondary text-sm py-2 px-4 cursor-pointer w-fit ${galleryUploading ? "opacity-60 pointer-events-none" : ""}`}>
                                    <MdAddPhotoAlternate size={16} />
                                    {galleryUploading ? "Uploading…" : "Add Gallery Images"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleGalleryUpload}
                                    />
                                </label>

                                {/* Gallery grid */}
                                {(form.galleryImages ?? []).length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {(form.galleryImages ?? []).map((url, idx) => (
                                            <div key={idx} className="relative group aspect-square overflow-hidden border border-gray-200">
                                                <Image src={url} alt="" fill className="object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove"
                                                >
                                                    <MdClose size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving…" : editing ? "Update Item" : "Create Item"}
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
