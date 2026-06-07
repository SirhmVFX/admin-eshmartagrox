'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUsers, deleteUser, User } from '@/lib/firestore';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    async function loadUsers() {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (e) {
            console.error('Failed to load users:', e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadUsers(); }, []);

    async function deleteUserHandler(id: string) {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (e) {
            alert('Failed to delete user');
        }
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div style={{ padding: 40 }}>Loading users...</div>;
    }

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Customers</h1>
                    <p style={{ color: '#666' }}>Manage customer accounts</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 900 }}>{users.length}</div>
                        <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase' }}>Total Users</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div style={{ marginBottom: 24, maxWidth: 300 }}>
                <input
                    type="text"
                    placeholder="Search customers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 16px',
                        border: '1px solid #e0e0e0',
                        fontSize: 14,
                    }}
                />
            </div>

            {/* Users List */}
            <div style={{ background: '#fff', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: 16, padding: '16px', borderBottom: '1px solid #e0e0e0', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: '#666' }}>
                    <div>User</div>
                    <div>Email</div>
                    <div>Phone</div>
                    <div>Address</div>
                    <div>Action</div>
                </div>

                {filteredUsers.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>No users found</div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: 16, padding: '20px 16px', borderBottom: '1px solid #e0e0e0', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700 }}>{user.name}</div>
                                <div style={{ fontSize: 11, color: '#666' }}>
                                    {user.orders.length} orders
                                </div>
                            </div>
                            <div style={{ fontSize: 13 }}>{user.email}</div>
                            <div style={{ fontSize: 13 }}>{user.phone || 'N/A'}</div>
                            <div style={{ fontSize: 12, color: '#666' }}>{user.address || 'N/A'}</div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => deleteUserHandler(user.id!)}
                                    style={{ padding: '8px 12px', background: '#fff', border: '1px solid #ff4444', color: '#ff4444', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
