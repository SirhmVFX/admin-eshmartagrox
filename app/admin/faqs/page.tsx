'use client';

import { useState, useEffect } from 'react';
import { getVisibleFAQs, createFAQ, updateFAQ, deleteFAQ, FAQ } from '@/lib/firestore';

export default function FAQsPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<FAQ | null>(null);

    async function loadFAQs() {
        try {
            const data = await getVisibleFAQs();
            setFaqs(data);
        } catch (e) {
            console.error('Failed to load FAQs:', e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadFAQs(); }, []);

    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        order: 0,
        isVisible: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data: Omit<FAQ, 'id'> = {
                question: formData.question,
                answer: formData.answer,
                order: formData.order,
                isVisible: formData.isVisible,
            };
            if (editing) {
                await updateFAQ(editing.id!, data);
            } else {
                await createFAQ(data);
            }
            setShowModal(false);
            setEditing(null);
            setFormData({ question: '', answer: '', order: 0, isVisible: true });
            loadFAQs();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleEdit = (faq: FAQ) => {
        setEditing(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            order: faq.order,
            isVisible: faq.isVisible,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this FAQ?')) return;
        try {
            await deleteFAQ(id);
            setFaqs(faqs.filter(f => f.id !== id));
        } catch (e) {
            alert('Failed to delete FAQ');
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>FAQs</h1>
                    <p style={{ color: '#666' }}>Manage frequently asked questions</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setFormData({ question: '', answer: '', order: 0, isVisible: true });
                        setShowModal(true);
                    }}
                    style={{ padding: '10px 20px', background: '#0a0a0a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                    + Add FAQ
                </button>
            </div>

            {/* FAQs List */}
            <div style={{ background: '#fff', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', gap: 16, padding: '16px', borderBottom: '1px solid #e0e0e0', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: '#666' }}>
                    <div style={{ flex: 1 }}>Question</div>
                    <div style={{ flex: 1 }}>Answer</div>
                    <div style={{ width: 80 }}>Order</div>
                    <div style={{ width: 80 }}>Status</div>
                    <div style={{ width: 120 }}>Actions</div>
                </div>

                {faqs.map((faq) => (
                    <div key={faq.id} style={{ display: 'flex', gap: 16, padding: '20px 16px', borderBottom: '1px solid #e0e0e0' }}>
                        <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{faq.question}</div>
                        <div style={{ flex: 1, fontSize: 12, color: '#666' }}>{faq.answer}</div>
                        <div style={{ width: 80, fontSize: 12 }}>{faq.order}</div>
                        <div style={{ width: 80 }}>
                            <span style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                background: faq.isVisible ? '#4caf50' : '#f44336',
                                color: '#fff',
                                fontSize: 11,
                                borderRadius: 0,
                            }}>
                                {faq.isVisible ? 'Visible' : 'Hidden'}
                            </span>
                        </div>
                        <div style={{ width: 120, display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => handleEdit(faq)}
                                style={{ flex: 1, padding: '8px 12px', background: '#f0f0f0', border: 'none', cursor: 'pointer', fontSize: 12 }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(faq.id!)}
                                style={{ flex: 1, padding: '8px 12px', background: '#fff', border: '1px solid #ff4444', color: '#ff4444', cursor: 'pointer', fontSize: 12 }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#fff', padding: 32, maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>{editing ? 'Edit FAQ' : 'Add FAQ'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Question *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.question}
                                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                                    placeholder="Enter your question here..."
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Answer *</label>
                                <textarea
                                    required
                                    value={formData.answer}
                                    onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14, minHeight: 100 }}
                                    placeholder="Enter your answer here..."
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Order</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                                />
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
                                {editing ? 'Update FAQ' : 'Add FAQ'}
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
