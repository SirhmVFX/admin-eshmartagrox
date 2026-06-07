"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, BlogPost } from "@/lib/firestore";
import ImageUpload from "@/components/ImageUpload";
import WysiwygEditor from "@/components/WysiwygEditor";
import { MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";

const empty: Omit<BlogPost, "id"> = { title: "", slug: "", excerpt: "", content: "", coverImage: "", author: "", publishedAt: null, active: true, order: 0, tags: [] };

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<BlogPost | null>(null);
    const [form, setForm] = useState<Omit<BlogPost, "id">>(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function load() { setLoading(true); setPosts(await getBlogPosts()); setLoading(false); }
    useEffect(() => { load(); }, []);

    function openNew() { setEditing(null); setForm(empty); setError(""); setShowModal(true); }
    function openEdit(p: BlogPost) { setEditing(p); setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, coverImage: p.coverImage, author: p.author, publishedAt: p.publishedAt, active: p.active, order: p.order, tags: p.tags }); setError(""); setShowModal(true); }

    async function handleSave() {
        if (!form.title) { setError("Title is required."); return; }
        setSaving(true); setError("");
        try { if (editing?.id) await updateBlogPost(editing.id, form); else await createBlogPost(form); setShowModal(false); await load(); }
        catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string) { if (!confirm("Delete this post?")) return; await deleteBlogPost(id); await load(); }
    async function toggleActive(p: BlogPost) { if (!p.id) return; await updateBlogPost(p.id, { active: !p.active }); await load(); }

    return (
        <div className="max-w-5xl space-y-4">
            <div className="section-header"><div><h1 className="text-lg font-semibold text-gray-900">Blog</h1><p className="text-xs text-gray-500 mt-0.5">Blog posts</p></div><button className="btn-primary flex items-center gap-2" onClick={openNew}><MdAdd size={16} /> New Post</button></div>
            {loading ? <div className="admin-card text-sm text-gray-500">Loading…</div> : posts.length === 0 ? <div className="admin-card text-sm text-gray-500 text-center py-8">No posts yet.</div> : (
                <div className="admin-card p-0 overflow-hidden overflow-x-auto"><table className="admin-table"><thead><tr><th>Cover</th><th>Title</th><th>Author</th><th>Slug</th><th>Published</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead><tbody>
                    {posts.map((p) => (<tr key={p.id}><td>{p.coverImage && <Image src={p.coverImage} alt="" width={64} height={40} className="w-16 h-10 object-cover" />}</td><td className="font-medium text-gray-800 max-w-xs truncate">{p.title}</td><td className="text-gray-500 text-xs">{p.author}</td><td className="text-gray-500 text-xs">{p.slug}</td><td className="text-gray-500 text-xs whitespace-nowrap">{p.publishedAt || "–"}</td><td>{p.order}</td><td><button onClick={() => toggleActive(p)}><span className={`badge ${p.active ? "badge-green" : "badge-gray"}`}>{p.active ? "Active" : "Hidden"}</span></button></td><td><div className="flex gap-2"><button className="btn-secondary py-1 px-2" onClick={() => openEdit(p)}><MdEdit size={14} /></button><button className="btn-danger py-1 px-2" onClick={() => handleDelete(p.id!)}><MdDelete size={14} /></button></div></td></tr>))}
                </tbody></table></div>
            )}
            {showModal && (
                <div className="modal-overlay"><div className="modal-box" style={{ maxWidth: 720 }}><div className="modal-header"><h2 className="text-base font-semibold">{editing ? "Edit Post" : "New Post"}</h2><button onClick={() => setShowModal(false)}><MdClose size={20} /></button></div>
                    <div className="p-5 space-y-4">
                        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}
                        <div><label className="admin-label">Title</label><input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-4"><div><label className="admin-label">Slug (URL)</label><input className="admin-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.replace(/\s+/g, "-").toLowerCase() })} /></div><div><label className="admin-label">Author</label><input className="admin-input" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div></div>
                        <div><label className="admin-label">Published At</label><input type="date" className="admin-input" value={form.publishedAt || ""} onChange={(e) => setForm({ ...form, publishedAt: e.target.value || null })} /></div>
                        <ImageUpload value={form.coverImage} onChange={(url) => setForm({ ...form, coverImage: url })} label="Cover Image" />
                        <div><label className="admin-label">Excerpt</label><textarea className="admin-input" rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
                        <div><label className="admin-label">Content (WYSIWYG)</label><WysiwygEditor content={form.content} onChange={(html) => setForm({ ...form, content: html })} placeholder="Write the full post…" /></div>
                        <div className="grid grid-cols-2 gap-4"><div><label className="admin-label">Order</label><input type="number" className="admin-input" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div><div><label className="admin-label">Status</label><select className="admin-input" value={form.active ? "active" : "hidden"} onChange={(e) => setForm({ ...form, active: e.target.value === "active" })}><option value="active">Active</option><option value="hidden">Hidden</option></select></div></div>
                        <div className="flex gap-3 pt-2"><button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Post"}</button><button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button></div>
                    </div></div></div>
            )}
        </div>
    );
}
