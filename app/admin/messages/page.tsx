"use client";

import { useEffect, useState } from "react";
import {
    getContactMessages, markMessageRead, deleteContactMessage, ContactMessage,
} from "@/lib/firestore";
import { MdDelete, MdMarkEmailRead, MdMarkEmailUnread, MdMail, MdMailOutline, MdRefresh } from "react-icons/md";

function formatDate(ts: any): string {
    if (!ts) return "—";
    try {
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString("en-AU", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    } catch { return "—"; }
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<ContactMessage | null>(null);
    const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

    async function load() {
        setLoading(true);
        try {
            const data = await getContactMessages();
            setMessages(
                data.sort((a, b) => {
                    const ta = (a.createdAt as any)?.toMillis?.() ?? new Date(a.createdAt as any).getTime() ?? 0;
                    const tb = (b.createdAt as any)?.toMillis?.() ?? new Date(b.createdAt as any).getTime() ?? 0;
                    return tb - ta;
                })
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleSelect(msg: ContactMessage) {
        setSelected(msg);
        if (!msg.read && msg.id) {
            await markMessageRead(msg.id, true);
            setMessages((prev) =>
                prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
            );
        }
    }

    async function handleToggleRead(msg: ContactMessage) {
        if (!msg.id) return;
        const newRead = !msg.read;
        await markMessageRead(msg.id, newRead);
        setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, read: newRead } : m))
        );
        if (selected?.id === msg.id) setSelected({ ...msg, read: newRead });
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this message? This cannot be undone.")) return;
        await deleteContactMessage(id);
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selected?.id === id) setSelected(null);
    }

    const filtered = messages.filter((m) => {
        if (filter === "unread") return !m.read;
        if (filter === "read") return m.read;
        return true;
    });

    const unreadCount = messages.filter((m) => !m.read).length;

    return (
        <div className="max-w-6xl space-y-4">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <MdMail size={20} className="text-green-700" />
                        Contact Messages
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 ml-1">
                                {unreadCount} new
                            </span>
                        )}
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {messages.length} total · {unreadCount} unread
                    </p>
                </div>
                <button className="btn-secondary flex items-center gap-1.5 text-xs py-1.5" onClick={load} disabled={loading}>
                    <MdRefresh size={14} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 border-b border-gray-200">
                {(["all", "unread", "read"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                            filter === f
                                ? "border-green-700 text-green-700"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {f === "all" ? `All (${messages.length})` : f === "unread" ? `Unread (${unreadCount})` : `Read (${messages.length - unreadCount})`}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="admin-card text-sm text-gray-500 text-center py-12">Loading messages…</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {/* Message list */}
                    <div className="lg:col-span-2 admin-card p-0 overflow-hidden">
                        {filtered.length === 0 ? (
                            <div className="text-sm text-gray-400 text-center py-12">
                                {filter === "unread" ? "No unread messages." : "No messages yet."}
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {filtered.map((msg) => (
                                    <li
                                        key={msg.id}
                                        onClick={() => handleSelect(msg)}
                                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                            selected?.id === msg.id ? "bg-green-50" : ""
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="mt-0.5 shrink-0">
                                                {msg.read
                                                    ? <MdMailOutline size={16} className="text-gray-400" />
                                                    : <MdMail size={16} className="text-green-700" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-sm truncate ${msg.read ? "text-gray-700" : "font-semibold text-gray-900"}`}>
                                                        {msg.name || "(No name)"}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                                                        {formatDate(msg.createdAt).split(",")[0]}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{msg.subject || "(No subject)"}</p>
                                                <p className="text-xs text-gray-400 truncate mt-0.5">{msg.message}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Message detail */}
                    <div className="lg:col-span-3">
                        {selected ? (
                            <div className="admin-card space-y-4">
                                {/* Detail header */}
                                <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
                                    <div>
                                        <h2 className="font-semibold text-gray-900">{selected.subject || "(No subject)"}</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            From <strong>{selected.name}</strong> · <a href={`mailto:${selected.email}`} className="text-green-700 hover:underline">{selected.email}</a>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(selected.createdAt)}</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => handleToggleRead(selected)}
                                            title={selected.read ? "Mark as unread" : "Mark as read"}
                                            className="btn-secondary py-1 px-2 text-xs flex items-center gap-1"
                                        >
                                            {selected.read
                                                ? <><MdMarkEmailUnread size={13} /> Unread</>
                                                : <><MdMarkEmailRead size={13} /> Read</>}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selected.id!)}
                                            className="btn-danger py-1 px-2 text-xs flex items-center gap-1"
                                        >
                                            <MdDelete size={13} /> Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Message body */}
                                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 px-4 py-4 border border-gray-100">
                                    {selected.message}
                                </div>

                                {/* Reply link */}
                                <a
                                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "")}`}
                                    className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2"
                                >
                                    <MdMail size={15} /> Reply via Email
                                </a>
                            </div>
                        ) : (
                            <div className="admin-card text-sm text-gray-400 text-center py-16">
                                <MdMailOutline size={36} className="mx-auto mb-3 text-gray-300" />
                                Select a message to read it.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
