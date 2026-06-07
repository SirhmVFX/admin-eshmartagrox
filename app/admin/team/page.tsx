'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTeamMembers, getVisibleTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, TeamMember } from '@/lib/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function TeamPage() {

    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<TeamMember | null>(null);



    async function loadTeam() {
        try {
            const data = await getVisibleTeamMembers();
            setTeam(data);
        } catch (e) {
            console.error('Failed to load team members:', e);
        } finally {
            setLoading(false);
        }
    }

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        bio: '',
        order: 0,
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
            const data: Omit<TeamMember, 'id'> = {
                name: formData.name,
                role: formData.role,
                bio: formData.bio,
                image: image,
                order: formData.order,
                isVisible: formData.isVisible,
            };
            if (editing) {
                await updateTeamMember(editing.id!, data);
            } else {
                await createTeamMember(data);
            }
            setShowModal(false);
            setEditing(null);
            setFormData({ name: '', role: '', bio: '', order: 0, isVisible: true });
            setImage('');
            loadTeam();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleEdit = (member: TeamMember) => {
        setEditing(member);
        setFormData({
            name: member.name,
            role: member.role,
            bio: member.bio,
            order: member.order,
            isVisible: member.isVisible,
        });
        setImage(member.image);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this team member?')) return;
        try {
            await deleteTeamMember(id);
            setTeam(team.filter(m => m.id !== id));
        } catch (e) {
            alert('Failed to delete team member');
        }
    };




    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Team</h1>
                    <p style={{ color: '#666' }}>Manage team members</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setFormData({ name: '', role: '', bio: '', order: 0, isVisible: true });
                        setImage('');
                        setShowModal(true);
                    }}
                    style={{ padding: '10px 20px', background: '#0a0a0a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                    + Add Team Member
                </button>
            </div>

            {/* Team Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                {team.map((member) => (
                    <div key={member.id} style={{ background: '#fff', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                            <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: 20 }}>
                            <h4 style={{ fontSize: 16, fontWeight: 700 }}>{member.name}</h4>
                            <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>{member.role}</p>
                            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#333' }}>{member.bio}</p>
                            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                <button
                                    onClick={() => handleEdit(member)}
                                    style={{ flex: 1, padding: '8px 12px', background: '#f0f0f0', border: 'none', cursor: 'pointer', fontSize: 12 }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(member.id!)}
                                    style={{ flex: 1, padding: '8px 12px', background: '#fff', border: '1px solid #ff4444', color: '#ff4444', cursor: 'pointer', fontSize: 12 }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#fff', padding: 32, maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>{editing ? 'Edit Team Member' : 'Add Team Member'}</h2>
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
                                <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Role *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                                    placeholder="e.g., Founder, CEO"
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Bio *</label>
                                <textarea
                                    required
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14, minHeight: 80 }}
                                    placeholder="Short bio..."
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Image URL</label>
                                <input
                                    type="text"
                                    value={image}
                                    onChange={e => setImage(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                                />
                                <label style={{ marginTop: 8, display: 'block', cursor: 'pointer', padding: '8px', border: '1px dashed #ccc', textAlign: 'center' }}>
                                    Upload Image
                                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                </label>
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
                                {editing ? 'Update Team Member' : 'Add Team Member'}
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
