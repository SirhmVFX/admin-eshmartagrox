"use client";

import { useEffect, useState } from "react";
import {
    getCoupons, createCoupon, updateCoupon, deleteCoupon, Coupon,
} from "@/lib/firestore";
import { MdAdd, MdEdit, MdDelete, MdClose, MdContentCopy, MdLocalOffer } from "react-icons/md";

const empty: Omit<Coupon, "id"> = {
    code: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 0,
    maxUses: 0,
    usedCount: 0,
    validFrom: new Date().toISOString().slice(0, 10),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    active: true,
};

function couponStatus(c: Coupon): { label: string; cls: string } {
    if (!c.active) return { label: "Inactive", cls: "badge-gray" };
    const now = new Date();
    const from = new Date(c.validFrom);
    const until = new Date(c.validUntil);
    if (now < from) return { label: "Scheduled", cls: "badge-blue" };
    if (now > until) return { label: "Expired", cls: "badge-red" };
    if (c.maxUses > 0 && c.usedCount >= c.maxUses) return { label: "Used Up", cls: "badge-red" };
    return { label: "Active", cls: "badge-green" };
}

function formatDiscount(c: Coupon): string {
    return c.discountType === "percentage"
        ? `${c.discountValue}% off`
        : `₦${c.discountValue.toLocaleString()} off`;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const [form, setForm] = useState<Omit<Coupon, "id">>(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        try {
            const data = await getCoupons();
            setCoupons(data.sort((a, b) => {
                // sort: active first, then by validUntil desc
                const aActive = couponStatus(a).label === "Active" ? 0 : 1;
                const bActive = couponStatus(b).label === "Active" ? 0 : 1;
                if (aActive !== bActive) return aActive - bActive;
                return new Date(b.validUntil).getTime() - new Date(a.validUntil).getTime();
            }));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    function openNew() {
        setEditing(null);
        setForm({ ...empty, validFrom: new Date().toISOString().slice(0, 10) });
        setError("");
        setShowModal(true);
    }

    function openEdit(c: Coupon) {
        setEditing(c);
        setForm({
            code: c.code,
            discountType: c.discountType,
            discountValue: c.discountValue,
            minOrderAmount: c.minOrderAmount ?? 0,
            maxUses: c.maxUses ?? 0,
            usedCount: c.usedCount ?? 0,
            validFrom: c.validFrom,
            validUntil: c.validUntil,
            active: c.active,
        });
        setError("");
        setShowModal(true);
    }

    async function handleSave() {
        if (!form.code.trim()) { setError("Coupon code is required."); return; }
        if (form.discountValue <= 0) { setError("Discount value must be greater than 0."); return; }
        if (form.discountType === "percentage" && form.discountValue > 100) {
            setError("Percentage discount cannot exceed 100%."); return;
        }
        if (new Date(form.validUntil) < new Date(form.validFrom)) {
            setError("Expiry date must be after the start date."); return;
        }

        setSaving(true);
        setError("");
        try {
            const payload = { ...form, code: form.code.toUpperCase().trim() };
            if (editing?.id) {
                await updateCoupon(editing.id, payload);
            } else {
                // Check code uniqueness
                const existing = coupons.find(
                    (c) => c.code.toUpperCase() === payload.code && c.id !== editing?.id
                );
                if (existing) { setError("A coupon with this code already exists."); setSaving(false); return; }
                await createCoupon(payload);
            }
            setShowModal(false);
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to save coupon.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this coupon? This cannot be undone.")) return;
        await deleteCoupon(id);
        await load();
    }

    async function toggleActive(c: Coupon) {
        if (!c.id) return;
        await updateCoupon(c.id, { active: !c.active });
        await load();
    }

    function copyCode(code: string) {
        navigator.clipboard.writeText(code).catch(() => { });
        setCopied(code);
        setTimeout(() => setCopied(null), 1500);
    }

    const daysRemaining = (until: string) => {
        const diff = new Date(until).getTime() - Date.now();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 0) return "Expired";
        if (days === 0) return "Expires today";
        return `${days}d left`;
    };

    return (
        <div className="max-w-5xl space-y-4">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <MdLocalOffer size={20} className="text-green-700" /> Coupon Codes
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Create and manage discount codes for customers
                    </p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={openNew}>
                    <MdAdd size={16} /> New Coupon
                </button>
            </div>

            {/* Summary pills */}
            {!loading && coupons.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {(["Active", "Scheduled", "Expired", "Used Up", "Inactive"] as const).map((label) => {
                        const count = coupons.filter((c) => couponStatus(c).label === label).length;
                        if (!count) return null;
                        const colors: Record<string, string> = {
                            Active: "bg-green-50 text-green-700",
                            Scheduled: "bg-blue-50 text-blue-700",
                            Expired: "bg-red-50 text-red-600",
                            "Used Up": "bg-red-50 text-red-600",
                            Inactive: "bg-gray-100 text-gray-500",
                        };
                        return (
                            <span key={label} className={`text-xs font-semibold px-3 py-1 ${colors[label]}`}>
                                {count} {label}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="admin-card text-sm text-gray-500">Loading coupons…</div>
            ) : coupons.length === 0 ? (
                <div className="admin-card text-center py-16">
                    <MdLocalOffer size={36} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No coupons yet.</p>
                    <button className="btn-primary" onClick={openNew}>Create your first coupon</button>
                </div>
            ) : (
                <div className="admin-card p-0 overflow-hidden overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Min Order</th>
                                <th>Uses</th>
                                <th>Valid From</th>
                                <th>Expires</th>
                                <th>Time Left</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((c) => {
                                const { label, cls } = couponStatus(c);
                                return (
                                    <tr key={c.id}>
                                        {/* Code */}
                                        <td>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono font-bold text-gray-900 text-sm tracking-wider">
                                                    {c.code}
                                                </span>
                                                <button
                                                    onClick={() => copyCode(c.code)}
                                                    title="Copy code"
                                                    className="text-gray-400 hover:text-green-700 transition-colors"
                                                >
                                                    <MdContentCopy size={13} />
                                                </button>
                                                {copied === c.code && (
                                                    <span className="text-[10px] text-green-600 font-semibold">Copied!</span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Discount */}
                                        <td>
                                            <span className="font-semibold text-green-700 text-sm">
                                                {formatDiscount(c)}
                                            </span>
                                        </td>
                                        {/* Min order */}
                                        <td className="text-sm text-gray-600">
                                            {c.minOrderAmount > 0
                                                ? `₦${c.minOrderAmount.toLocaleString()}`
                                                : <span className="text-gray-400">None</span>}
                                        </td>
                                        {/* Uses */}
                                        <td className="text-sm text-gray-600">
                                            {c.usedCount}
                                            {c.maxUses > 0
                                                ? <span className="text-gray-400"> / {c.maxUses}</span>
                                                : <span className="text-gray-400"> / ∞</span>}
                                        </td>
                                        {/* Valid from */}
                                        <td className="text-xs text-gray-500 whitespace-nowrap">{c.validFrom}</td>
                                        {/* Expires */}
                                        <td className="text-xs text-gray-500 whitespace-nowrap">{c.validUntil}</td>
                                        {/* Time left */}
                                        <td>
                                            <span className={`text-xs font-medium ${new Date(c.validUntil) < new Date() ? "text-red-500" : "text-gray-600"}`}>
                                                {daysRemaining(c.validUntil)}
                                            </span>
                                        </td>
                                        {/* Status */}
                                        <td>
                                            <button onClick={() => toggleActive(c)} title="Toggle active">
                                                <span className={`badge ${cls}`}>{label}</span>
                                            </button>
                                        </td>
                                        {/* Actions */}
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn-secondary py-1 px-2 text-xs flex items-center gap-1"
                                                    onClick={() => openEdit(c)}
                                                >
                                                    <MdEdit size={12} /> Edit
                                                </button>
                                                <button
                                                    className="btn-danger py-1 px-2 text-xs flex items-center gap-1"
                                                    onClick={() => handleDelete(c.id!)}
                                                >
                                                    <MdDelete size={12} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: 560 }}>
                        <div className="modal-header">
                            <h2 className="text-base font-semibold">
                                {editing ? "Edit Coupon" : "New Coupon"}
                            </h2>
                            <button onClick={() => setShowModal(false)}><MdClose size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>
                            )}

                            {/* Code */}
                            <div>
                                <label className="admin-label">Coupon Code *</label>
                                <input
                                    className="admin-input font-mono uppercase"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. SUMMER20"
                                />
                                <p className="text-xs text-gray-400 mt-1">Customers enter this at checkout. Auto-uppercased.</p>
                            </div>

                            {/* Discount */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Discount Type *</label>
                                    <select
                                        className="admin-input"
                                        value={form.discountType}
                                        onChange={(e) => setForm({ ...form, discountType: e.target.value as Coupon["discountType"] })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₦)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="admin-label">
                                        {form.discountType === "percentage" ? "Discount %" : "Discount ₦"} *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={form.discountType === "percentage" ? 100 : undefined}
                                        className="admin-input"
                                        value={form.discountValue}
                                        onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {/* Restrictions */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Minimum Order Amount (₦)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="admin-input"
                                        value={form.minOrderAmount}
                                        onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                                        placeholder="0 = no minimum"
                                    />
                                </div>
                                <div>
                                    <label className="admin-label">Max Uses</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="admin-input"
                                        value={form.maxUses}
                                        onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
                                        placeholder="0 = unlimited"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">0 = unlimited uses</p>
                                </div>
                            </div>

                            {/* Validity */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Valid From *</label>
                                    <input
                                        type="date"
                                        className="admin-input"
                                        value={form.validFrom}
                                        onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="admin-label">Expires On *</label>
                                    <input
                                        type="date"
                                        className="admin-input"
                                        value={form.validUntil}
                                        onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            {form.code && (
                                <div className="bg-green-50 border border-green-200 px-4 py-3 text-sm">
                                    <span className="font-mono font-bold text-green-800">{form.code || "CODE"}</span>
                                    {" — "}
                                    <span className="text-green-700">{formatDiscount(form as Coupon)}</span>
                                    {form.minOrderAmount > 0 && (
                                        <span className="text-green-600"> on orders over ₦{form.minOrderAmount.toLocaleString()}</span>
                                    )}
                                    {". Valid "}
                                    <span className="font-medium">{form.validFrom}</span>
                                    {" → "}
                                    <span className="font-medium">{form.validUntil}</span>
                                    {form.maxUses > 0 && <span className="text-green-600"> · {form.maxUses} max uses</span>}
                                </div>
                            )}

                            {/* Active toggle */}
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.active}
                                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                                />
                                Active (customers can use this coupon)
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving…" : editing ? "Update Coupon" : "Create Coupon"}
                                </button>
                                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
