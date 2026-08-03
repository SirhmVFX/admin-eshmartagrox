'use client';

import { useState, useEffect } from 'react';
import { getUsers, getOrders, deleteUser, User, Order } from '@/lib/firestore';
import { formatPrice } from '@/lib/products';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<User | null>(null);

    useEffect(() => {
        Promise.all([getUsers(), getOrders()])
            .then(([u, o]) => { setUsers(u); setOrders(o); })
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this customer? This only removes their profile — their Firebase Auth account and orders are unaffected.')) return;
        try {
            await deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
            if (selected?.id === id) setSelected(null);
        } catch {
            alert('Failed to delete customer');
        }
    };

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const userOrders = (uid: string) => orders.filter(o => o.customerEmail === users.find(u => u.id === uid)?.email);

    const totalSpend = (uid: string) => userOrders(uid).reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

    if (loading) return <div className="admin-card text-sm text-gray-500">Loading customers…</div>;

    return (
        <div className="max-w-6xl space-y-4">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Customers</h1>
                    <p className="text-xs text-gray-500 mt-0.5">{users.length} registered customers</p>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="admin-card text-center py-4">
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Customers</p>
                </div>
                <div className="admin-card text-center py-4">
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Orders</p>
                </div>
                <div className="admin-card text-center py-4">
                    <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0))}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Total Revenue</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Customer list */}
                <div className="lg:col-span-3 admin-card p-0 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                        <input
                            type="text"
                            placeholder="Search by name or email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="admin-input py-2 text-sm"
                        />
                    </div>
                    {filtered.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">No customers found.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr><th>Customer</th><th>Orders</th><th>Spent</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {filtered.map(u => {
                                    const uOrders = userOrders(u.id!);
                                    const isSelected = selected?.id === u.id;
                                    return (
                                        <tr
                                            key={u.id}
                                            className={`cursor-pointer ${isSelected ? 'bg-green-50' : ''}`}
                                            onClick={() => setSelected(isSelected ? null : u)}
                                        >
                                            <td>
                                                <p className="font-medium text-gray-800 text-sm">{u.name || '(No name)'}</p>
                                                <p className="text-xs text-gray-400">{u.email}</p>
                                            </td>
                                            <td className="text-center text-sm">{uOrders.length}</td>
                                            <td className="text-sm font-medium">{formatPrice(totalSpend(u.id!))}</td>
                                            <td>
                                                <button
                                                    className="btn-danger py-1 px-2 text-xs"
                                                    onClick={e => { e.stopPropagation(); handleDelete(u.id!); }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Customer detail panel */}
                <div className="lg:col-span-2">
                    {selected ? (
                        <div className="admin-card space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="font-semibold text-gray-900">{selected.name || '(No name)'}</h2>
                                    <p className="text-xs text-gray-500">{selected.email}</p>
                                </div>
                                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
                            </div>

                            <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Phone</span>
                                    <span className="font-medium">{selected.phone || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Address</span>
                                    <span className="font-medium text-right max-w-[60%]">{selected.address || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Joined</span>
                                    <span className="font-medium">
                                        {selected.createdAt
                                            ? new Date((selected.createdAt as any).toMillis?.() ?? selected.createdAt).toLocaleDateString()
                                            : '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total Spent</span>
                                    <span className="font-bold text-green-700">{formatPrice(totalSpend(selected.id!))}</span>
                                </div>
                            </div>

                            {/* Order history */}
                            <div className="border-t border-gray-100 pt-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Order History ({userOrders(selected.id!).length})</p>
                                {userOrders(selected.id!).length === 0 ? (
                                    <p className="text-xs text-gray-400">No orders yet.</p>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {userOrders(selected.id!).map(o => (
                                            <div key={o.id} className="flex justify-between items-center text-xs border border-gray-100 px-3 py-2">
                                                <div>
                                                    <p className="font-medium">#{o.id?.slice(-6)}</p>
                                                    <p className="text-gray-400">
                                                        {o.createdAt
                                                            ? typeof o.createdAt === 'string'
                                                                ? new Date(o.createdAt).toLocaleDateString()
                                                                : new Date((o.createdAt as any).toMillis()).toLocaleDateString()
                                                            : '—'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">{formatPrice(o.totalAmount)}</p>
                                                    <span className={`badge text-[10px] ${o.status === 'delivered' ? 'badge-green' :
                                                            o.status === 'cancelled' ? 'badge-red' : 'badge-blue'
                                                        }`}>{o.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="admin-card text-sm text-gray-400 text-center py-12">
                            Click a customer to view their details and order history.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
