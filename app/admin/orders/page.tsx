'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrders, updateOrder, deleteOrder, Order, getOrderStats } from '@/lib/firestore';
import { formatPrice } from '@/lib/products';
import { MdRefresh } from 'react-icons/md';

const STATUS_FILTERS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
type Filter = typeof STATUS_FILTERS[number];

const STATUS_BADGE: Record<Order['status'], string> = {
    received: 'badge-blue',
    pending: 'badge-yellow',
    processing: 'badge-blue',
    shipped: 'badge-blue',
    out_for_delivery: 'badge-blue',
    delivered: 'badge-green',
    cancelled: 'badge-red',
};

const STATUS_LABELS: Record<Order['status'], string> = {
    received: 'Received',
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

function fmtDate(val: any): string {
    if (!val) return '—';
    try {
        if (typeof val === 'string') return new Date(val).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
        if (typeof val?.toMillis === 'function') return new Date(val.toMillis()).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { }
    return '—';
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });
    const [filter, setFilter] = useState<Filter>('all');

    async function load() {
        setLoading(true);
        try {
            const [data, s] = await Promise.all([getOrders(), getOrderStats()]);
            setOrders(data);
            setStats(s);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleStatusChange(id: string, newStatus: Order['status']) {
        try {
            await updateOrder(id, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch {
            alert('Failed to update order status.');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this order? This cannot be undone.')) return;
        try {
            await deleteOrder(id);
            setOrders(prev => prev.filter(o => o.id !== id));
        } catch {
            alert('Failed to delete order.');
        }
    }

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const STAT_CARDS = [
        { label: 'Total', value: stats.total, cls: 'text-gray-900' },
        { label: 'Pending', value: stats.pending, cls: 'text-yellow-600' },
        { label: 'Processing', value: stats.processing, cls: 'text-blue-600' },
        { label: 'Shipped', value: stats.shipped, cls: 'text-purple-600' },
        { label: 'Delivered', value: stats.delivered, cls: 'text-green-700' },
        { label: 'Cancelled', value: stats.cancelled, cls: 'text-red-600' },
    ];

    return (
        <div className="max-w-6xl space-y-4">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Orders</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Manage and track customer orders</p>
                </div>
                <button className="btn-secondary flex items-center gap-1.5 py-1.5 text-xs" onClick={load} disabled={loading}>
                    <MdRefresh size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {STAT_CARDS.map(({ label, value, cls }) => (
                    <div key={label} className="stat-card text-center py-4">
                        <p className={`text-2xl font-bold ${cls}`}>{value}</p>
                        <p className="text-xs text-gray-500 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-1 border-b border-gray-200">
                {STATUS_FILTERS.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${filter === f
                            ? 'border-green-700 text-green-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {f === 'all' ? `All (${orders.length})` : `${STATUS_LABELS[f as Order['status']]} (${orders.filter(o => o.status === f).length})`}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="admin-card text-sm text-gray-500 text-center py-12">Loading orders…</div>
            ) : filtered.length === 0 ? (
                <div className="admin-card text-sm text-gray-400 text-center py-12">
                    {filter === 'all' ? 'No orders yet.' : `No ${filter} orders.`}
                </div>
            ) : (
                <div className="admin-card p-0 overflow-hidden overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(order => (
                                <tr key={order.id}>
                                    {/* Order ID */}
                                    <td>
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="font-mono font-bold text-green-700 hover:underline text-sm"
                                        >
                                            #{order.id?.slice(-6).toUpperCase()}
                                        </Link>
                                    </td>
                                    {/* Customer */}
                                    <td>
                                        <p className="font-medium text-gray-800 text-sm">{order.customerName || '—'}</p>
                                        <p className="text-xs text-gray-400">{order.customerEmail}</p>
                                    </td>
                                    {/* Items count */}
                                    <td className="text-sm text-gray-600">
                                        {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
                                        <span className="text-gray-400 ml-1">
                                            · {order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0} units
                                        </span>
                                    </td>
                                    {/* Total */}
                                    <td className="font-bold text-gray-900 text-sm">{formatPrice(order.totalAmount)}</td>
                                    {/* Order status */}
                                    <td>
                                        <select
                                            value={order.status}
                                            onChange={e => handleStatusChange(order.id!, e.target.value as Order['status'])}
                                            className="text-xs border border-gray-200 px-2 py-1 bg-white text-gray-700 cursor-pointer focus:outline-none focus:border-green-700"
                                        >
                                            {Object.entries(STATUS_LABELS).map(([val, label]) => (
                                                <option key={val} value={val}>{label}</option>
                                            ))}
                                        </select>                                    </td>
                                    {/* Payment status */}
                                    <td>
                                        <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-green' : order.paymentStatus === 'refunded' ? 'badge-blue' : 'badge-yellow'}`}>
                                            {order.paymentStatus?.toUpperCase() ?? 'UNPAID'}
                                        </span>
                                    </td>
                                    {/* Date */}
                                    <td className="text-xs text-gray-500 whitespace-nowrap">{fmtDate(order.createdAt)}</td>
                                    {/* Actions */}
                                    <td>
                                        <div className="flex gap-2">
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <button className="btn-secondary py-1 px-2 text-xs">View</button>
                                            </Link>
                                            <button
                                                className="btn-danger py-1 px-2 text-xs"
                                                onClick={() => handleDelete(order.id!)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
                        Showing {filtered.length} of {orders.length} orders
                    </div>
                </div>
            )}
        </div>
    );
}
