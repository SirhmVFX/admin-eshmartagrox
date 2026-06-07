'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getOrder, updateOrder, Order } from '@/lib/firestore';
import { formatPrice } from '@/lib/products';

interface OrderDetailPageProps {
    params: {
        id: string;
    };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
    const { user, adminUser } = useAuth();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (user && adminUser && params.id) {
            loadOrder();
        } else {
            setLoading(false);
        }
    }, [user, adminUser, params.id]);

    async function loadOrder() {
        try {
            const data = await getOrder(params.id);
            setOrder(data);
        } catch (e) {
            console.error('Failed to load order:', e);
        } finally {
            setLoading(false);
        }
    }

    const [status, setStatus] = useState<Order['status']>('pending');
    const [paymentStatus, setPaymentStatus] = useState<Order['paymentStatus']>('unpaid');

    useEffect(() => {
        if (order) {
            setStatus(order.status);
            setPaymentStatus(order.paymentStatus);
        }
    }, [order]);

    async function updateOrderHandler() {
        if (!order) return;
        setUpdating(true);
        try {
            await updateOrder(order.id!, { status, paymentStatus });
            setOrder({ ...order, status, paymentStatus });
            setUpdating(false);
        } catch (e) {
            alert('Failed to update order');
            setUpdating(false);
        }
    }

    const statusLabels: Record<Order['status'], string> = {
        pending: 'Pending',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
    };

    const paymentLabels: Record<Order['paymentStatus'], string> = {
        unpaid: 'Unpaid',
        paid: 'Paid',
        refunded: 'Refunded',
    };

    if (!user || !adminUser) {
        return <div>Please log in as an admin</div>;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!order) {
        return <div>Order not found</div>;
    }

    return (
        <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Order #{order.id?.slice(-6)}</h1>
                    <p style={{ color: '#666' }}>Order details and management</p>
                </div>
                <button
                    onClick={() => router.push('/admin/orders')}
                    style={{ padding: '10px 20px', background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                >
                    ← Back to Orders
                </button>
            </div>

            {/* Order Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                <div style={{ background: '#f5f5f5', padding: 20 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', marginBottom: 16 }}>Order Information</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13 }}>Date:</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13 }}>Order ID:</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>#{order.id?.slice(-12)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13 }}>Total:</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: '#0a0a0a' }}>{formatPrice(order.totalAmount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13 }}>Payment Method:</span>
                        <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>{order.paymentMethod}</span>
                    </div>
                </div>

                <div style={{ background: '#f5f5f5', padding: 20 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', marginBottom: 16 }}>Customer Information</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13 }}>Name:</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{order.customerName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13 }}>Email:</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{order.customerEmail}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13 }}>Phone:</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{order.customerPhone}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13 }}>Address:</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{order.customerAddress}</span>
                    </div>
                </div>
            </div>

            {/* Status Updates */}
            <div style={{ background: '#f5f5f5', padding: 24, marginBottom: 32 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', marginBottom: 16 }}>Update Order Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                        <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Order Status</label>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value as Order['status'])}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                        >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Payment Status</label>
                        <select
                            value={paymentStatus}
                            onChange={e => setPaymentStatus(e.target.value as Order['paymentStatus'])}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', fontSize: 14 }}
                        >
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={updateOrderHandler}
                    disabled={updating}
                    style={{ marginTop: 16, padding: '10px 24px', background: '#0a0a0a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                >
                    {updating ? 'Updating...' : 'Update Status'}
                </button>
            </div>

            {/* Order Items */}
            <div style={{ background: '#fff', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 100px', gap: 16, padding: '16px', borderBottom: '1px solid #e0e0e0', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: '#666' }}>
                    <div>Product</div>
                    <div>Size</div>
                    <div>Color</div>
                    <div>Qty</div>
                    <div>Price</div>
                    <div>Total</div>
                </div>

                {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 100px', gap: 16, padding: '20px 16px', borderBottom: '1px solid #e0e0e0', alignItems: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{item.productName}</div>
                        <div style={{ fontSize: 13 }}>{item.size}</div>
                        <div style={{ fontSize: 13 }}>{item.color}</div>
                        <div style={{ fontSize: 13 }}>{item.quantity}</div>
                        <div style={{ fontSize: 13 }}>{formatPrice(item.productPrice)}</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{formatPrice(item.subtotal)}</div>
                    </div>
                ))}

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 16px', background: '#f9f9f9' }}>
                    <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
                        <span>Subtotal:</span>
                        <span style={{ fontWeight: 600 }}>{formatPrice(order.totalAmount)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
