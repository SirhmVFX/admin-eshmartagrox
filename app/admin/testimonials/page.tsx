'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { getTestimonials, getVisibleTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, Testimonial } from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function TestimonialsPage() {

    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Testimonial | null>(null);



    async function loadTestimonials() {
        try {
            const data = await getVisibleTestimonials();
            setTestimonials(data);
        } catch (e) {
            console.error('Failed to load testimonials:', e);
        } finally {
            setLoading(false);
        }
    }

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        text: '',
        rating: 5,
        isVisible: true,
    });

    const [image, setImage] = useState('');

    const handleImageUpload = async (file: File) => {
        if (!file) return;
        try {
            const url = await uploadToCloudinary(file);
            setImage(url);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data: Omit<Testimonial, 'id'> = {
                name: formData.name,
                location: formData.location,
                text: formData.text,
                rating: formData.rating,
                isVisible: formData.isVisible,
            };
            if (editing) {
                await updateTestimonial(editing.id!, data);
            } else {
                await createTestimonial(data);
            }
            setShowModal(false);
            setEditing(null);
            setFormData({ name: '', location: '', text: '', rating: 5, isVisible: true });
            setImage('');
            loadTestimonials();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleEdit = (testimonial: Testimonial) => {
        setEditing(testimonial);
        setFormData({
            name: testimonial.name,
            location: testimonial.location,
            text: testimonial.text,
            rating: testimonial.rating,
            isVisible: testimonial.isVisible,
        });
        setImage(''); // Reset for edit
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            await deleteTestimonial(id);
            setTestimonials(testimonials.filter(t => t.id !== id));
        } catch (e) {
            alert('Failed to delete testimonial');
        }
    };



    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Testimonials</h1>
                    <p style={{ color: '#666' }}>Manage customer testimonials</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setFormData({ name: '', location: '', text: '', rating: 5, isVisible: true });
                        setImage('');
                        setShowModal(true);
                    }}
                    style={{ padding: '10px 20px', background: '#0a0a0a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                    + Add Testimonial
                </button>
            </div>

            {/* Testimonials Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                {testimonials.map((t) => (
                    <div key={t.id} style={{ background: '#fff', border: '1px solid #e0e0e0', padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < t.rating ? '#ffc107' : '#e0e0e0'}>
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={() => handleEdit(t)}
                                    style={{ padding: '6px 12px', background: '#f0f0f0', border: 'none', cursor: 'pointer', fontSize: 12 }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(t.id!)}
                                    style={{ padding: '6px 12px', background: '#fff', border: '1px solid #ff4444', color: '#ff4444', cursor: 'pointer', fontSize: 12 }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.6, color: '#333', marginBottom: 16, fontStyle: 'italic' }}>"{t.text}"</p>
                        <div>
                            <h4 style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</h4>
                            <p style={{ fontSize: 12, color: '#666' }}>{t.location}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#fff', padding: 32, maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                                    placeholder="e.g., Lagos, Nigeria"
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Review *</label>
                                <textarea
                                    required
                                    value={formData.text}
                                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14, minHeight: 100 }}
                                    placeholder="What do they say about your product/service?"
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Rating</label>
                                <select
                                    value={formData.rating}
                                    onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                                >
                                    <option value={5}>5 Stars</option>
                                    <option value={4}>4 Stars</option>
                                    <option value={3}>3 Stars</option>
                                    <option value={2}>2 Stars</option>
                                    <option value={1}>1 Star</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isVisible}
                                    onChange={e => setFormData({ ...formData, isVisible: e.target.checked })}
                                />
                                <span style={{ fontSize: 13 }}>Visible on site</span>
                            </div>
                            <button
                                type="submit"
                                style={{ padding: '12px 24px', background: '#0a0a0a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginTop: 8 }}
                            >
                                {editing ? 'Update Testimonial' : 'Add Testimonial'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                style={{ padding: '12px 24px', background: '#f5f5f5', color: '#0a0a0a', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
