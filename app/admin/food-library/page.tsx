"use client";

import { useEffect, useState } from "react";
import {
    getFoodLibraryCategories, createFoodLibraryCategory,
    updateFoodLibraryCategory, deleteFoodLibraryCategory,
    FoodLibraryCategory,
} from "@/lib/firestore";
import { MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";

const empty: Omit<FoodLibraryCategory, "id"> = {
    category: "", items: [""], note: "", order: 0, active: true,
};

export default function FoodLibraryPage() {
    const [cats, setCats] = useState<FoodLibraryCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<FoodLibraryCategory | null>(null);
    const [form, setForm] = useState<Omit<FoodLibraryCategory, "id">>(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function load() {
        setLoading(true);
        try { setCats(await getFoodLibraryCategories()); } finally { setLoading(false); }
    }
    useEffect(() => { load(); }, []);

    function openNew() { setEditing(null); setForm(empty); setError(""); setShowModal(true); }
    function openEdit(c: FoodLibraryCategory) {
        setEditing(c);
        setForm({ category: c.category, items: [...c.items], note: c.note, order: c.order ?? 0, active: c.active });
        setError(""); setShowModal(true);
    }

    async function handleSave() {
        if (!form.category.trim()) { setError("Category name is required."); return; }
        setSaving(true); setError("");
        try {
            const payload = { ...form, items: form.items.filter(i => i.trim()) };
            if (editing?.id) await updateFoodLibraryCategory(editing.id, payload);
            else await createFoodLibraryCategory(payload);
            setShowModal(false); await load();
        } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this category?")) return;
        await deleteFoodLibraryCategory(id); await load();
    }

    async function toggleActive(c: FoodLibraryCategory) {
        if (!c.id) return;
        await updateFoodLibraryCategory(c.id, { active: !c.active }); await load();
    }

    const addItem = () => setForm(f => ({ ...f, items: [...f.items, ""] }));
    const updateItem = (i: number, v: string) =>
        setForm(f => ({ ...f, items: f.items.map((x, j) => j === i ? v : x) }));
    const removeItem = (i: number) =>
        setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }));

    return (
        <div className="max-w-4xl space-y-4">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Nigerian Food Library</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Manage the food categories and items shown in the Food Library section on the homepage
                    </p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={openNew}>
                    <MdAdd size={16} /> Add Category
                </button>
            </div>

            {loading ? (
                <div className="admin-card text-sm text-gray-500">Loading…</div>
            ) : cats.length === 0 ? (
                <div className="admin-card text-center py-12 space-y-3">
                    <p className="text-gray-500">No categories yet. The site uses built-in defaults until you add categories here.</p>
                    <button className="btn-primary" onClick={openNew}>Add first category</button>
                </div>
            ) : (
                <div className="admin-card p-0 overflow-hidden overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Category</th>
                                <th>Items</th>
                                <th>Note</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cats.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(c => (
                                <tr key={c.id}>
                                    <td className="font-mono text-xs text-gray-400">{c.order}</td>
                                    <td className="font-semibold text-gray-900">{c.category}</td>
                                    <td className="text-gray-500 text-xs max-w-xs truncate">
                                        {c.items.slice(0, 4).join(", ")}
                                        {c.items.length > 4 && ` +${c.items.length - 4} more`}
                                    </td>
                                    <td className="text-gray-400 text-xs">{c.note}</td>
                                    <td>
                                        <button onClick={() => toggleActive(c)}>
                                            <span className={`badge ${c.active ? "badge-green" : "badge-gray"}`}>
                                                {c.active ? "Active" : "Hidden"}
                                            </span>
                                        </button>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(c)}>
                                                <MdEdit size={13} />
                                            </button>
                                            <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(c.id!)}>
                                                <MdDelete size={13} />
                                            </button>
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
                    <div className="modal-box" style={{ maxWidth: 520 }}>
                        <div className="modal-header">
                            <h2 className="text-base font-semibold">
                                {editing ? "Edit Category" : "Add Category"}
                            </h2>
                            <button onClick={() => setShowModal(false)}><MdClose size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "75vh" }}>
                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Category Name *</label>
                                    <input
                                        className="admin-input"
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        placeholder="e.g. Grains"
                                    />
                                </div>
                                <div>
                                    <label className="admin-label">Display Order</label>
                                    <input
                                        type="number" min="0"
                                        className="admin-input"
                                        value={form.order}
                                        onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="admin-label">Footer Note</label>
                                <input
                                    className="admin-input"
                                    value={form.note}
                                    onChange={e => setForm({ ...form, note: e.target.value })}
                                    placeholder="e.g. 5 foods · updated weekly"
                                />
                            </div>
                            <div>
                                <label className="admin-label">Food Items</label>
                                <div className="space-y-2">
                                    {form.items.map((item, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                className="admin-input flex-1"
                                                value={item}
                                                onChange={e => updateItem(i, e.target.value)}
                                                placeholder={`Item ${i + 1}`}
                                            />
                                            <button
                                                onClick={() => removeItem(i)}
                                                className="btn-danger py-1 px-2 text-xs shrink-0"
                                            >
                                                <MdClose size={13} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        className="btn-secondary text-xs py-1.5 px-3"
                                        onClick={addItem}
                                    >
                                        + Add Item
                                    </button>
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.active}
                                    onChange={e => setForm({ ...form, active: e.target.checked })}
                                />
                                Active (visible on homepage)
                            </label>
                            <div className="flex gap-3 pt-2">
                                <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving…" : editing ? "Update" : "Add Category"}
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
