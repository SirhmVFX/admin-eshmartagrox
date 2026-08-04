"use client";

import { useEffect, useState } from "react";
import { getExportQuotes, updateExportQuote, deleteExportQuote, ExportQuoteRequest } from "@/lib/firestore";
import { MdDelete, MdRefresh, MdPublic } from "react-icons/md";

const STATUS_OPTS: ExportQuoteRequest["status"][] = ["new", "contacted", "closed"];
const STATUS_BADGE: Record<ExportQuoteRequest["status"], string> = {
    new: "badge-blue", contacted: "badge-yellow", closed: "badge-green",
};

function fmtDate(val: any): string {
    if (!val) return "—";
    try {
        const d = typeof val === "string" ? new Date(val) : val?.toDate?.() ?? new Date(val);
        return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
    } catch { return "—"; }
}

export default function ExportQuotesPage() {
    const [quotes, setQuotes] = useState<ExportQuoteRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<ExportQuoteRequest | null>(null);
    const [filter, setFilter] = useState<"all" | ExportQuoteRequest["status"]>("all");

    async function load() {
        setLoading(true);
        try {
            const data = await getExportQuotes();
            setQuotes(data.sort((a, b) => {
                const ta = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : a.createdAt?.toMillis?.() ?? 0;
                const tb = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : b.createdAt?.toMillis?.() ?? 0;
                return tb - ta;
            }));
        } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    async function handleStatusChange(id: string, status: ExportQuoteRequest["status"]) {
        await updateExportQuote(id, { status });
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
        if (selected?.id === id) setSelected(s => s ? { ...s, status } : s);
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this quote request?")) return;
        await deleteExportQuote(id);
        setQuotes(prev => prev.filter(q => q.id !== id));
        if (selected?.id === id) setSelected(null);
    }

    const filtered = filter === "all" ? quotes : quotes.filter(q => q.status === filter);
    const newCount = quotes.filter(q => q.status === "new").length;

    return (
        <div className="max-w-6xl space-y-4">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <MdPublic size={18} className="text-green-700" />
                        Export Quote Requests
                        {newCount > 0 && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 ml-1">{newCount} new</span>
                        )}
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">Buyer inquiries from the International Export page</p>
                </div>
                <button className="btn-secondary flex items-center gap-1.5 text-xs py-1.5" onClick={load} disabled={loading}>
                    <MdRefresh size={14} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 border-b border-gray-200">
                {(["all", ...STATUS_OPTS] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize transition-colors ${filter === f ? "border-green-700 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                        {f === "all" ? `All (${quotes.length})` : `${f} (${quotes.filter(q => q.status === f).length})`}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="admin-card text-sm text-gray-500 text-center py-12">Loading…</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {/* List */}
                    <div className="lg:col-span-2 admin-card p-0 overflow-hidden">
                        {filtered.length === 0 ? (
                            <div className="text-sm text-gray-400 text-center py-12">No requests.</div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {filtered.map(q => (
                                    <li
                                        key={q.id}
                                        onClick={() => setSelected(q)}
                                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === q.id ? "bg-green-50" : ""}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{q.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{q.commodity}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{fmtDate(q.createdAt)}</p>
                                            </div>
                                            <span className={`badge shrink-0 ${STATUS_BADGE[q.status]}`}>{q.status}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Detail */}
                    <div className="lg:col-span-3">
                        {selected ? (
                            <div className="admin-card space-y-4">
                                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                                    <div>
                                        <h2 className="font-semibold text-gray-900">{selected.name}</h2>
                                        {selected.company && <p className="text-sm text-gray-500">{selected.company}</p>}
                                        <p className="text-xs text-gray-400 mt-0.5">{fmtDate(selected.createdAt)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={selected.status}
                                            onChange={e => handleStatusChange(selected.id!, e.target.value as ExportQuoteRequest["status"])}
                                            className="admin-input text-xs py-1.5"
                                        >
                                            {STATUS_OPTS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                                        </select>
                                        <button className="btn-danger py-1 px-2 text-xs" onClick={() => handleDelete(selected.id!)}>
                                            <MdDelete size={13} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {[
                                        ["Email", selected.email],
                                        ["Phone", selected.phone || "—"],
                                        ["Commodity", selected.commodity],
                                        ["Quantity", selected.quantity],
                                        ["Destination", selected.destination],
                                    ].map(([l, v]) => (
                                        <div key={l}>
                                            <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">{l}</p>
                                            <p className="text-gray-800">{v}</p>
                                        </div>
                                    ))}
                                </div>

                                {selected.message && (
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Additional Notes</p>
                                        <p className="text-sm text-gray-700 bg-gray-50 px-4 py-3 leading-relaxed">{selected.message}</p>
                                    </div>
                                )}

                                <a
                                    href={`mailto:${selected.email}?subject=Re: Export Quote - ${encodeURIComponent(selected.commodity)}`}
                                    className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2"
                                >
                                    Reply via Email
                                </a>
                            </div>
                        ) : (
                            <div className="admin-card text-sm text-gray-400 text-center py-16">
                                Select a request to view details.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
