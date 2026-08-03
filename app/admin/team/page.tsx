'use client';

import { useState, useEffect } from 'react';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, TeamMember } from '@/lib/firestore';
import ImageUpload from '@/components/ImageUpload';

export default function TeamPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<TeamMember | null>(null);
    const [image, setImage] = useState('');
    const [formData, setFormData] = useState({ name: '', role: '', bio: '', order: 0, isVisible: true });

    async function loadTeam() {
        try { const data = await getTeamMembers(); setTeam(data); }
        catch (e) { console.error('Failed to load team members:', e); }
        finally { setLoading(false); }
    }

    useEffect(() => { loadTeam(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data: Omit<TeamMember, 'id'> = { ...formData, image };
            if (editing) await updateTeamMember(editing.id!, data);
            else await createTeamMember(data);
            setShowModal(false);
            setEditing(null);
            setFormData({ name: '', role: '', bio: '', order: 0, isVisible: true });
            setImage('');
            loadTeam();
        } catch (e: any) { alert(e.message); }
    };

    const handleEdit = (member: TeamMember) => {
        setEditing(member);
        setFormData({ name: member.name, role: member.role, bio: member.bio, order: member.order, isVisible: member.isVisible });
        setImage(member.image);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this team member?')) return;
        try { await deleteTeamMember(id); setTeam(team.filter(m => m.id !== id)); }
        catch { alert('Failed to delete'); }
    };

    return (
        <div className="max-w-5xl space-y-4">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Team</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Manage team members shown on the site</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditing(null); setFormData({ name: '', role: '', bio: '', order: 0, isVisible: true }); setImage(''); setShowModal(true); }}>
                    + Add Team Member
                </button>
            </div>

            {loading ? (
                <div className="admin-card text-sm text-gray-500">Loading…</div>
            ) : team.length === 0 ? (
                <div className="admin-card text-sm text-gray-500 text-center py-8">No team members yet.</div>
            ) : (
                <div className="admin-card p-0 overflow-hidden">
                    <table className="admin-table">
                        <thead><tr><th>Name</th><th>Role</th><th>Order</th><th>Visible</th><th>Actions</th></tr></thead>
                        <tbody>
                            {team.map((member) => (
                                <tr key={member.id}>
                                    <td className="font-medium text-gray-800">{member.name}</td>
                                    <td className="text-gray-500 text-xs">{member.role}</td>
                                    <td>{member.order}</td>
                                    <td><span className={`badge ${member.isVisible ? 'badge-green' : 'badge-gray'}`}>{member.isVisible ? 'Visible' : 'Hidden'}</span></td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button className="btn-secondary py-1 px-2 text-xs" onClick={() => handleEdit(member)}>Edit</button>
                                            <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(member.id!)}>Delete</button>
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
                            <h2 className="text-base font-semibold">{editing ? 'Edit Team Member' : 'Add Team Member'}</h2>
                            <button onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="admin-label">Name *</label>
                                <input required className="admin-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="admin-label">Role *</label>
                                <input required className="admin-input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="e.g., Founder, CEO" />
                            </div>
                            <div>
                                <label className="admin-label">Bio *</label>
                                <textarea required className="admin-input" rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Short bio…" />
                            </div>
                            <ImageUpload value={image} onChange={setImage} label="Profile Photo" />
                            <div>
                                <label className="admin-label">Display Order</label>
                                <input type="number" className="admin-input" value={formData.order} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} />
                            </div>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={formData.isVisible} onChange={e => setFormData({ ...formData, isVisible: e.target.checked })} />
                                Visible on site
                            </label>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Add'} Team Member</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
