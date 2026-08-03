"use client";

import { useEffect, useState } from "react";
import {
    getCurrencyRates, createCurrencyRate, updateCurrencyRate,
    deleteCurrencyRate, CurrencyRate,
} from "@/lib/firestore";
import { MdAdd, MdEdit, MdDelete, MdClose, MdCurrencyExchange } from "react-icons/md";

const PRESETS: Omit<CurrencyRate, "id">[] = [
    { code: "USD", symbol: "$", name: "US Dollar", rateFromNGN: 0.00065, active: true },
    { code: "GBP", symbol: "£", name: "British Pound", rateFromNGN: 0.00052, active: true },
    { code: "EUR", symbol: "€", name: "Euro", rateFromNGN: 0.00060, active: true },
    { code: "CAD", symbol: "CA$", name: "Canadian Dollar", rateFromNGN: 0.00088, active: true },
    { code: "AUD", symbol: "A$", name: "Australian Dollar", rateFromNGN: 0.00099, active: true },
    { code: "GHS", symbol: "₵", name: "Ghanaian Cedi", rateFromNGN: 0.0075, active: true },
    { code: "KES", symbol: "KSh", name: "Kenyan Shilling", rateFromNGN: 0.083, active: true },
    { code: "ZAR", symbol: "R", name: "South African Rand", rateFromNGN: 0.012, active: true },
];

const empty: Omit<CurrencyRate, "id"> = {
    code: "", symbol: "", name: "", rateFromNGN: 0, active: true,
};

export default function CurrencyRatesPage() {
    const [rates, setRates] = useState<CurrencyRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<CurrencyRate | null>(null);
    const [form, setForm] = useState<Omit<CurrencyRate, "id">>(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [addingPresets, setAddingPresets] = useState(false);

    async function load() {
        setLoading(true);
        try { setRates(await getCurrencyRates()); } finally { setLoading(false); }
    }
    useEffect(() => { load(); }, []);

    function openNew() { setEditing(null); setForm(empty); setError(""); setShowModal(true); }
    function openEdit(r: CurrencyRate) {
        setEditing(r);
        setForm({ code: r.code, symbol: r.symbol, name: r.name, rateFromNGN: r.rateFromNGN, active: r.active });
        setError("");
        setShowModal(true);
    }

    async function handleSave() {
        if (!form.code.trim()) { setError("Currency code is required."); return; }
        if (!form.symbol.trim()) { setError("Symbol is required."); return; }
        if (form.rateFromNGN <= 0) { setError("Rate must be greater than 0."); return; }
        setSaving(true); setError("");
        try {
            const payload = { ...form, code: form.code.toUpperCase().trim() };
            if (editing?.id) await updateCurrencyRate(editing.id, payload);
            else await createCurrencyRate(payload);
            setShowModal(false);
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed.");
        } finally { setSaving(false); }
    }

    async function handleDelete(id: string, code: string) {
        if (!confirm(`Delete ${code}? This will remove it from the currency selector.`)) return;
        await deleteCurrencyRate(id);
        await load();
    }

    async function toggleActive(r: CurrencyRate) {
        if (!r.id) return;
        await updateCurrencyRate(r.id, { active: !r.active });
        await load();
    }

    async function addPresets() {
        const existing = new Set(rates.map(r => r.code.toUpperCase()));
        const toAdd = PRESETS.filter(p => !existing.has(p.code));
        if (toAdd.length === 0) { alert("All preset currencies are already added."); return; }
        setAddingPresets(true);
        try {
            await Promise.all(toAdd.map(p => createCurrencyRate(p)));
            await load();
        } finally { setAddingPresets(false); }
    }

    // Example converted amount for display (1000 NGN)
    const sample = 1000;

    return (
        <div className="max-w-4xl space-y-4">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <MdCurrencyExchange size={20} className="text-green-700" />
                        Currency Rates
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        All prices are stored in NGN. Rates here let customers convert on the frontend.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary text-xs py-1.5 px-3" onClick={addPresets} disabled={addingPresets}>
                        {addingPresets ? "Adding…" : "+ Add Presets"}
                    </button>
                    <button className="btn-primary flex items-center gap-2" onClick={openNew}>
                        <MdAdd size={16} /> New Rate
                    </button>
                </div>
            </div>

            {/* Info card */}
            <div className="admin-card bg-blue-50 border border-blue-200 text-blue-800 text-sm space-y-1">
                <p className="font-semibold">How rates work</p>
                <p className="text-xs text-blue-700">
                    Enter the rate as: <strong>how many units of the target currency = 1 NGN</strong>.
                    For example, if $1 USD = ₦1,540 NGN, the rate for USD is <code>1 ÷ 1540 ≈ 0.000649</code>.
                    The site will multiply any NGN price by this rate to convert it.
                </p>
            </div>

            {/* NGN row (always shown) */}
            <div className="admin-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-gray-900 text-sm w-12">NGN</span>
                    <span className="text-lg font-semibold text-green-700">₦</span>
                    <span className="text-sm text-gray-700">Nigerian Naira</span>
                    <span className="badge badge-green">Base currency</span>
                </div>
                <span className="text-xs text-gray-400">Rate: 1.0 (fixed)</span>
            </div>

            {/* Rates table */}
            {loading ? (
                <div className="admin-card text-sm text-gray-500">Loading rates…</div>
            ) : rates.length === 0 ? (
                <div className="admin-card text-center py-12">
                    <MdCurrencyExchange size={36} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No currency rates yet.</p>
                    <div className="flex justify-center gap-3">
                        <button className="btn-secondary text-sm" onClick={addPresets}>Add common currencies</button>
                        <button className="btn-primary text-sm" onClick={openNew}>Add manually</button>
                    </div>
                </div>
            ) : (
                <div className="admin-card p-0 overflow-hidden overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Symbol</th>
                                <th>Currency Name</th>
                                <th>Rate (per NGN)</th>
                                <th>Example (₦{sample.toLocaleString()})</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rates.map(r => {
                                const converted = (sample * r.rateFromNGN).toFixed(2);
                                return (
                                    <tr key={r.id}>
                                        <td className="font-mono font-bold text-gray-900 text-sm">{r.code}</td>
                                        <td className="text-lg font-semibold text-green-700">{r.symbol}</td>
                                        <td className="text-sm text-gray-700">{r.name}</td>
                                        <td>
                                            <span className="font-mono text-sm text-gray-600">{r.rateFromNGN}</span>
                                        </td>
                                        <td className="text-sm font-medium text-gray-800">
                                            {r.symbol}{Number(converted).toLocaleString()}
                                        </td>
                                        <td>
                                            <button onClick={() => toggleActive(r)}>
                                                <span className={`badge ${r.active ? "badge-green" : "badge-gray"}`}>
                                                    {r.active ? "Active" : "Hidden"}
                                                </span>
                                            </button>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(r)}>
                                                    <MdEdit size={13} />
                                                </button>
                                                <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(r.id!, r.code)}>
                                                    <MdDelete size={13} />
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
                    <div className="modal-box" style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                            <h2 className="text-base font-semibold">
                                {editing ? `Edit ${editing.code}` : "New Currency Rate"}
                            </h2>
                            <button onClick={() => setShowModal(false)}><MdClose size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Currency Code *</label>
                                    <input
                                        className="admin-input font-mono uppercase"
                                        value={form.code}
                                        onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        placeholder="USD"
                                        maxLength={5}
                                        disabled={!!editing}
                                    />
                                </div>
                                <div>
                                    <label className="admin-label">Symbol *</label>
                                    <input
                                        className="admin-input"
                                        value={form.symbol}
                                        onChange={e => setForm({ ...form, symbol: e.target.value })}
                                        placeholder="$"
                                        maxLength={5}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="admin-label">Currency Name *</label>
                                <input
                                    className="admin-input"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="US Dollar"
                                />
                            </div>

                            <div>
                                <label className="admin-label">Rate from NGN *</label>
                                <input
                                    type="number"
                                    step="0.0000001"
                                    min="0.0000001"
                                    className="admin-input font-mono"
                                    value={form.rateFromNGN}
                                    onChange={e => setForm({ ...form, rateFromNGN: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.000649"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    How many <strong>{form.code || "units"}</strong> = 1 NGN.
                                    If $1 = ₦1,540 → enter <code>0.000649</code>
                                </p>
                            </div>

                            {/* Live preview */}
                            {form.rateFromNGN > 0 && form.symbol && (
                                <div className="bg-green-50 border border-green-200 px-4 py-3 text-sm">
                                    <span className="text-gray-600">₦1,000 NGN</span>
                                    {" = "}
                                    <span className="font-bold text-green-800">
                                        {form.symbol}{(1000 * form.rateFromNGN).toFixed(4)}
                                    </span>
                                    {" "}
                                    <span className="text-gray-500">{form.code || "?"}</span>
                                </div>
                            )}

                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                                Active (show in currency selector on site)
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving…" : editing ? "Update Rate" : "Add Rate"}
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
