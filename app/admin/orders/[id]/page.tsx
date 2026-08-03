'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOrder, updateOrder, createOrderNotification, Order } from '@/lib/firestore';
import { formatPrice } from '@/lib/products';
import { MdNotifications } from 'react-icons/md';

interface Props { params: { id: string } }

function fmtDate(val: any): string {
    if (!val) return '—';
    if (typeof val === 'string') return new Date(val).toLocaleString();
    if (typeof val?.toMillis === 'function') return new Date(val.toMillis()).toLocaleString();
    return '—';
}

const STATUS_OPTIONS: { value: Order['status']; label: string }[] = [
    { value: 'received', label: 'Order Received' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_BADGE: Record<string, string> = {
    received: 'badge-blue',
    pending: 'badge-yellow',
    processing: 'badge-blue',
    shipped: 'badge-blue',
    out_for_delivery: 'badge-blue',
    delivered: 'badge-green',
    cancelled: 'badge-red',
};

export default function OrderDetailPage({ params }: Props) {
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [saved, setSaved] = useState(false);
    const [notifSent, setNotifSent] = useState(false);
    const [status, setStatus] = useState<Order['status']>('pending');
    const [paymentStatus, setPaymentStatus] = useState<Order['paymentStatus']>('unpaid');
    const [sendNotif, setSendNotif] = useState(true);

    useEffect(() => {
        if (!params.id) return;
        getOrder(params.id)
            .then(data => {
                if (data) {
                    setOrder(data);
                    setStatus(data.status);
                    setPaymentStatus(data.paymentStatus);
                }
            })
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, [params.id]);

    async function handleUpdate() {
        if (!order) return;
        setUpdating(true);
        try {
            await updateOrder(order.id!, { status, paymentStatus });
            setOrder(prev => prev ? { ...prev, status, paymentStatus } : prev);

            // Send notification if customer has a userId and option is checked
            if (sendNotif && order.userId) {
                await createOrderNotification(
                    { id: order.id, customerEmail: order.customerEmail, userId: order.userId },
                    status
                );
                setNotifSent(true);
                setTimeout(() => setNotifSent(false), 3000);
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            alert('Failed to update order.');
        } finally {
            setUpdating(false);
        }
    }

    if (loading) return <div className="admin-card text-sm text-gray-500">Loading order…</div>;
    if (!order) return <div className="admin-card text-sm text-red-600">Order not found.</div>;

    const currentBadge = STATUS_BADGE[order.status] ?? 'badge-gray';
    const currentLabel = STATUS_OPTIONS.find(o => o.value === order.status)?.label ?? order.status;

    return (
        <div className="max-w-4xl space-y-4">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Order #{order.id?.slice(-8).toUpperCase()}</h1>
                    <p className="text-xs text-gray-500 mt-0.5">{fmtDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`badge ${currentBadge}`}>{currentLabel}</span>
                    <button className="btn-secondary" onClick={() => router.push('/admin/orders')}>
                        ← Back to Orders
                    </button>
                </div>
            </div>

            {saved && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 flex items-center gap-2">
                    Order updated successfully.
                    {notifSent && (
                        <span className="flex items-center gap-1 text-green-600 text-xs ml-2">
                            <MdNotifications size={14} /> Notification sent to customer.
                        </span>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Order info */}
                <div className="admin-card space-y-3">
                    <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-2">Order Details</p>
                    {[
                        ['Order ID', order.id?.slice(-12).toUpperCase()],
                        ['Total', formatPrice(order.totalAmount)],
                        ['Payment Method', order.paymentMethod?.toUpperCase() || '—'],
                        ['Payment Status', order.paymentStatus?.toUpperCase() || '—'],
                        ['Date', fmtDate(order.createdAt)],
                        ...(order.paymentReference ? [['Paystack Ref', order.paymentReference]] : []),
                        ...(order.userId ? [['Customer ID', order.userId]] : []),
                        ...(order.notes ? [['Notes', order.notes]] : []),
                    ].map(([label, val]) => (
                        <div key={label} className="flex justify-between items-start gap-4 text-sm">
                            <span className="text-gray-500 shrink-0">{label}</span>
                            <span className="font-medium text-gray-900 text-right break-all">{val}</span>
                        </div>
                    ))}
                </div>

                {/* Customer info */}
                <div className="admin-card space-y-3">
                    <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-2">Customer</p>
                    {[
                        ['Name', order.customerName || '—'],
                        ['Email', order.customerEmail || '—'],
                        ['Phone', order.customerPhone || '—'],
                        ['Address', order.customerAddress || '—'],
                    ].map(([label, val]) => (
                        <div key={label} className="flex justify-between items-start gap-4 text-sm">
                            <span className="text-gray-500 shrink-0">{label}</span>
                            <span className="font-medium text-gray-900 text-right">{val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Update status */}
            <div className="admin-card space-y-4">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="admin-label">Order Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as Order['status'])} className="admin-input">
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="admin-label">Payment Status</label>
                        <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as Order['paymentStatus'])} className="admin-input">
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </div>

                {/* Notification toggle */}
                <label className={`flex items-center gap-2 text-sm cursor-pointer ${!order.userId ? "opacity-40" : ""}`}>
                    <input
                        type="checkbox"
                        checked={sendNotif}
                        onChange={e => setSendNotif(e.target.checked)}
                        disabled={!order.userId}
                    />
                    <MdNotifications size={15} className="text-gray-500" />
                    Notify customer about this status change
                    {!order.userId && <span className="text-xs text-gray-400">(guest order — no account)</span>}
                </label>

                <button onClick={handleUpdate} disabled={updating} className="btn-primary px-6 py-2">
                    {updating ? 'Updating…' : 'Update Order'}
                </button>
            </div>

            {/* Order items */}
            <div className="admin-card p-0 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                    <p className="text-xs font-semibold uppercase text-gray-500">Order Items ({order.items?.length || 0})</p>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr><th>Product</th><th>Size</th><th>Color</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
                    </thead>
                    <tbody>
                        {(order.items || []).map((item, i) => (
                            <tr key={i}>
                                <td className="font-medium text-gray-800">{item.productName}</td>
                                <td className="text-gray-500 text-sm">{item.size || '—'}</td>
                                <td className="text-gray-500 text-sm">{item.color || '—'}</td>
                                <td className="text-gray-800 text-sm">{item.quantity}</td>
                                <td className="text-gray-800 text-sm">{formatPrice(item.productPrice)}</td>
                                <td className="font-bold text-gray-900">{formatPrice(item.subtotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-end px-5 py-3 border-t border-gray-100 bg-gray-50">
                    <div className="text-sm">
                        <span className="text-gray-500 mr-4">Total</span>
                        <span className="font-bold text-lg text-gray-900">{formatPrice(order.totalAmount)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
