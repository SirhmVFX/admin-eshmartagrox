'use client';

import { useState, useEffect } from 'react';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, Testimonial } from '@/lib/firestore';
import ImageUpload from '@/components/ImageUpload';

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Testimonial | null>(null);
    const [image, setImage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        text: '',
        rating: 5,
        isVisible: true,
    });

    async function loadTestimonials() {
        try {
            const data = await getTestimonials();
            setTestimonials(data);
        } catch (e) {
            console.error('Failed to load testimonials:', e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadTestimonials(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data: Omit<Testimonial, 'id'> = {
                name: formData.name,
                location: formData.location,
                text: formData.text,
                rating: formData.rating,
                isVisible: formData.isVisible,
                imgSrc: image,
            };
            if (editing) await updateTestimonial(editing.id!, data);
            else await createTestimonial(data);
            setShowModal(false);
            setEditing(null);
            setFormData({ name: '', location: '', text: '', rating: 5, isVisible: true });
            setImage('');
            loadTestimonials();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleEdit = (t: Testimonial) => {
        setEditing(t);
        setFormData({ name: t.name, location: t.location, text: t.text, rating: t.rating, isVisible: t.isVisible });
        setImage(t.imgSrc || '');
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this testimonial?')) return;
        try {
            await deleteTestimonial(id);
            setTestimonials(testimonials.filter(t => t.id !== id));
        } catch {
            alert('Failed to delete');
        }
    };

    return (
        <div className="max-w-5xl space-y-4">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Testimonials</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Manage customer testimonials shown on the site</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditing(null); setFormData({ name: '', location: '', text: '', rating: 5, isVisible: true }); setImage(''); setShowModal(true); }}>
                    + Add Testimonial
                </button>
            </div>

            {loading ? (
                <div className="admin-card text-sm text-gray-500">Loading…</div>
            ) : testimonials.length === 0 ? (
                <div className="admin-card text-sm text-gray-500 text-center py-8">No testimonials yet. Add the first one.</div>
            ) : (
                <div className="admin-card p-0 overflow-hidden">
                    <table className="admin-table">
                        <thead>
                            <tr><th>Name</th><th>Location</th><th>Review</th><th>Rating</th><th>Visible</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {testimonials.map((t) => (
                                <tr key={t.id}>
                                    <td className="font-medium text-gray-800">{t.name}</td>
                                    <td className="text-gray-500 text-xs">{t.location}</td>
                                    <td className="text-gray-500 text-xs max-w-xs truncate">{t.text}</td>
                                    <td>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</td>
                                    <td><span className={`badge ${t.isVisible ? 'badge-green' : 'badge-gray'}`}>{t.isVisible ? 'Visible' : 'Hidden'}</span></td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn-secondary py-1 px-2 text-xs" onClick={() => handleEdit(t)}>Edit</button>
                                            <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(t.id!)}>Delete</button>
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
                    <div className="modal-box">
                        <div className="modal-header">
                            <h2 className="text-base font-semibold">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
                            <button onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="admin-label">Name *</label>
                                <input required className="admin-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="admin-label">Location</label>
                                <input className="admin-input" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Lagos, Nigeria" />
                            </div>
                            <div>
                                <label className="admin-label">Review *</label>
                                <textarea required className="admin-input" rows={4} value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })} placeholder="Customer review…" />
                            </div>
                            <div>
                                <label className="admin-label">Rating</label>
                                <select className="admin-input" value={formData.rating} onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}>
                                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                                </select>
                            </div>
                            <ImageUpload value={image} onChange={setImage} label="Customer Photo (optional)" />
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={formData.isVisible} onChange={e => setFormData({ ...formData, isVisible: e.target.checked })} />
                                Visible on site
                            </label>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Add'} Testimonial</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
