'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrders, updateOrder, deleteOrder, Order, getOrderStats } from '@/lib/firestore';
import { formatPrice } from '@/lib/products';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });
    const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');

    async function loadOrders() {
        try {
            const data = await getOrders();
            setOrders(data);
        } catch (e) {
            console.error('Failed to load orders:', e);
        } finally {
            setLoading(false);
        }
    }

    async function loadStats() {
        try {
            const s = await getOrderStats();
            setStats(s);
        } catch (e) {
            console.error('Failed to load stats:', e);
        }
    }

    useEffect(() => { loadOrders(); loadStats(); }, []);

    async function updateOrderStatus(id: string, newStatus: Order['status']) {
        try {
            await updateOrder(id, { status: newStatus });
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch (e) {
            alert('Failed to update order status');
        }
    }

    async function deleteOrderHandler(id: string) {
        if (!confirm('Are you sure you want to delete this order?')) return;
        try {
            await deleteOrder(id);
            setOrders(orders.filter(o => o.id !== id));
        } catch (e) {
            alert('Failed to delete order');
        }
    }

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending': return '#ff9800';
            case 'processing': return '#2196f3';
            case 'shipped': return '#9c27b0';
            case 'delivered': return '#4caf50';
            case 'cancelled': return '#f44336';
            default: return '#888';
        }
    };

    if (loading) {
        return <div style={{ padding: 40 }}>Loading orders...</div>;
    }

    const statusLabels: Record<Order['status'], string> = {
        pending: 'Pending',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
    };

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Orders</h1>
                    <p style={{ color: '#666' }}>Manage customer orders</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>{stats.total}</div>
                    <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase' }}>Total Orders</div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 32 }}>
                {[
                    { label: 'Total', value: stats.total, color: '#0a0a0a' },
                    { label: 'Pending', value: stats.pending, color: '#ff9800' },
                    { label: 'Processing', value: stats.processing, color: '#2196f3' },
                    { label: 'Shipped', value: stats.shipped, color: '#9c27b0' },
                    { label: 'Delivered', value: stats.delivered, color: '#4caf50' },
                    { label: 'Cancelled', value: stats.cancelled, color: '#f44336' },
                ].map((stat, i) => (
                    <div key={i} style={{ background: '#f5f5f5', padding: 16, borderRadius: 0, textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '8px 16px',
                            background: filter === f ? '#0a0a0a' : '#f5f5f5',
                            color: filter === f ? '#fff' : '#0a0a0a',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: filter === f ? 700 : 600,
                        }}
                    >
                        {f === 'all' ? 'All Orders' : statusLabels[f]}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div style={{ background: '#fff', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px', gap: 16, padding: '16px', borderBottom: '1px solid #e0e0e0', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: '#666' }}>
                    <div>Order Details</div>
                    <div>Customer</div>
                    <div>Total</div>
                    <div>Status</div>
                    <div>Payment</div>
                    <div>Action</div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>No orders found</div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px', gap: 16, padding: '20px 16px', borderBottom: '1px solid #e0e0e0', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                                    <Link href={`/admin/orders/${order.id}`} style={{ textDecoration: 'none', color: '#0a0a0a' }}>
                                        #{order.id?.slice(-6)}
                                    </Link>
                                </div>
                                <div style={{ fontSize: 11, color: '#666' }}>
                                    {order.items.length} items • {order.items.reduce((sum, i) => sum + i.quantity, 0)} units
                                </div>
                                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                                    {order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{order.customerName}</div>
                                <div style={{ fontSize: 11, color: '#666' }}>{order.customerEmail}</div>
                                <div style={{ fontSize: 11, color: '#666' }}>{order.customerPhone}</div>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 900 }}>{formatPrice(order.totalAmount)}</div>
                            <div>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 10px',
                                    background: getStatusColor(order.status),
                                    color: '#fff',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    borderRadius: 0,
                                }}>
                                    {statusLabels[order.status]}
                                </span>
                            </div>
                            <div>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 10px',
                                    background: order.paymentStatus === 'paid' ? '#4caf50' : '#ff9800',
                                    color: '#fff',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    borderRadius: 0,
                                }}>
                                    {order.paymentStatus.toUpperCase()}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <Link href={`/admin/orders/${order.id}`}>
                                    <button style={{ padding: '8px 12px', background: '#f0f0f0', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>View</button>
                                </Link>
                                <button
                                    onClick={() => deleteOrderHandler(order.id!)}
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
