"use client";

import { useEffect, useState } from "react";
import {
    getStaffMembers, createStaffMember, updateStaffMember, deleteStaffMember,
    StaffMember, DEFAULT_PERMISSIONS, ROLE_DEFAULTS,
} from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import {
    MdAdd, MdEdit, MdDelete, MdClose, MdPeople, MdShield,
    MdCheckBox, MdCheckBoxOutlineBlank,
} from "react-icons/md";

const ROLES: StaffMember["role"][] = ["super_admin", "admin", "editor", "viewer"];

const ROLE_LABELS: Record<StaffMember["role"], string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    editor: "Editor",
    viewer: "Viewer",
};

const ROLE_DESCRIPTIONS: Record<StaffMember["role"], string> = {
    super_admin: "Full access to all sections including settings and staff management.",
    admin: "Full access except settings. Can manage all content and orders.",
    editor: "Can manage blog, content sections, testimonials, team, and FAQs.",
    viewer: "Read-only access to products, orders, blog, content, and messages.",
};

const PERMISSION_LABELS: Record<keyof StaffMember["permissions"], string> = {
    products: "Products",
    orders: "Orders",
    blog: "Blog",
    content: "Content (Hero, Produce, Quality, CTA, Portfolio, Services)",
    navigation: "Navigation",
    testimonials: "Testimonials",
    team: "Team Members",
    faqs: "FAQs",
    settings: "Site Settings",
    messages: "Contact Messages",
    coupons: "Coupons",
    users: "Customers",
};

const ROLE_BADGE: Record<StaffMember["role"], string> = {
    super_admin: "badge-red",
    admin: "badge-blue",
    editor: "badge-green",
    viewer: "badge-gray",
};

const emptyForm = {
    name: "",
    email: "",
    role: "editor" as StaffMember["role"],
    isActive: true,
    permissions: { ...DEFAULT_PERMISSIONS },
    invitedAt: "",
    lastLogin: "",
};

export default function StaffPage() {
    const { adminUser } = useAuth();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<StaffMember | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function load() {
        setLoading(true);
        try {
            const data = await getStaffMembers();
            setStaff(data.sort((a, b) => {
                const order = { super_admin: 0, admin: 1, editor: 2, viewer: 3 };
                return (order[a.role] ?? 4) - (order[b.role] ?? 4);
            }));
        } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    function openNew() {
        setEditing(null);
        setForm({
            ...emptyForm,
            permissions: { ...ROLE_DEFAULTS.editor },
            invitedAt: new Date().toISOString(),
        });
        setError("");
        setShowModal(true);
    }

    function openEdit(member: StaffMember) {
        setEditing(member);
        setForm({
            name: member.name,
            email: member.email,
            role: member.role,
            isActive: member.isActive,
            permissions: { ...DEFAULT_PERMISSIONS, ...member.permissions },
            invitedAt: member.invitedAt ?? "",
            lastLogin: member.lastLogin ?? "",
        });
        setError("");
        setShowModal(true);
    }

    function handleRoleChange(role: StaffMember["role"]) {
        setForm((prev) => ({
            ...prev,
            role,
            permissions: { ...ROLE_DEFAULTS[role] },
        }));
    }

    function togglePermission(key: keyof StaffMember["permissions"]) {
        setForm((prev) => ({
            ...prev,
            permissions: { ...prev.permissions, [key]: !prev.permissions[key] },
        }));
    }

    async function handleSave() {
        if (!form.name.trim()) { setError("Name is required."); return; }
        if (!form.email.trim() || !form.email.includes("@")) { setError("Valid email is required."); return; }

        setSaving(true);
        setError("");
        try {
            const payload: Omit<StaffMember, "id"> = {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                role: form.role,
                isActive: form.isActive,
                permissions: form.permissions,
                invitedAt: form.invitedAt || new Date().toISOString(),
                lastLogin: form.lastLogin || undefined,
            };
            if (editing?.id) {
                await updateStaffMember(editing.id, payload);
            } else {
                // Check for duplicate email
                const dup = staff.find((s) => s.email.toLowerCase() === payload.email);
                if (dup) { setError("A staff member with this email already exists."); setSaving(false); return; }
                await createStaffMember(payload);
            }
            setShowModal(false);
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to save.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Remove ${name} from the team? They will lose admin access.`)) return;
        await deleteStaffMember(id);
        await load();
    }

    async function toggleActive(member: StaffMember) {
        if (!member.id) return;
        await updateStaffMember(member.id, { isActive: !member.isActive });
        await load();
    }

    return (
        <div className="max-w-5xl space-y-4">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <MdPeople size={20} className="text-green-700" /> Staff Management
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Manage who has access to the admin panel and what they can do
                    </p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={openNew}>
                    <MdAdd size={16} /> Add Staff Member
                </button>
            </div>

            {/* Role legend */}
            <div className="admin-card">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Role Overview</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {ROLES.map((role) => (
                        <div key={role} className="border border-gray-100 p-3">
                            <span className={`badge ${ROLE_BADGE[role]} mb-2 block w-fit`}>{ROLE_LABELS[role]}</span>
                            <p className="text-xs text-gray-500">{ROLE_DESCRIPTIONS[role]}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="admin-card text-sm text-gray-500">Loading staff…</div>
            ) : staff.length === 0 ? (
                <div className="admin-card text-center py-16">
                    <MdPeople size={36} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No staff members yet.</p>
                    <button className="btn-primary" onClick={openNew}>Add first staff member</button>
                </div>
            ) : (
                <div className="admin-card p-0 overflow-hidden overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Permissions</th>
                                <th>Invited</th>
                                <th>Last Login</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((member) => {
                                const permCount = Object.values(member.permissions ?? {}).filter(Boolean).length;
                                const totalPerms = Object.keys(DEFAULT_PERMISSIONS).length;
                                return (
                                    <tr key={member.id}>
                                        <td className="font-medium text-gray-800 text-sm">{member.name}</td>
                                        <td className="text-xs text-gray-500">{member.email}</td>
                                        <td>
                                            <span className={`badge ${ROLE_BADGE[member.role]}`}>
                                                {ROLE_LABELS[member.role]}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <MdShield size={13} className="text-gray-400" />
                                                <span className="text-xs text-gray-600">{permCount}/{totalPerms}</span>
                                            </div>
                                        </td>
                                        <td className="text-xs text-gray-400 whitespace-nowrap">
                                            {member.invitedAt
                                                ? new Date(member.invitedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
                                                : "—"}
                                        </td>
                                        <td className="text-xs text-gray-400 whitespace-nowrap">
                                            {member.lastLogin
                                                ? new Date(member.lastLogin).toLocaleDateString("en-AU", { day: "numeric", month: "short" })
                                                : <span className="text-gray-300">Never</span>}
                                        </td>
                                        <td>
                                            <button onClick={() => toggleActive(member)}>
                                                <span className={`badge ${member.isActive ? "badge-green" : "badge-gray"}`}>
                                                    {member.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </button>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn-secondary py-1 px-2 text-xs flex items-center gap-1"
                                                    onClick={() => openEdit(member)}
                                                >
                                                    <MdEdit size={12} /> Edit
                                                </button>
                                                <button
                                                    className="btn-danger py-1 px-2 text-xs flex items-center gap-1"
                                                    onClick={() => handleDelete(member.id!, member.name)}
                                                >
                                                    <MdDelete size={12} /> Remove
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
                    <div className="modal-box" style={{ maxWidth: 600 }}>
                        <div className="modal-header">
                            <h2 className="text-base font-semibold">
                                {editing ? "Edit Staff Member" : "Add Staff Member"}
                            </h2>
                            <button onClick={() => setShowModal(false)}><MdClose size={20} /></button>
                        </div>
                        <div className="p-5 space-y-5 overflow-y-auto" style={{ maxHeight: "75vh" }}>
                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>
                            )}

                            {/* Basic info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Full Name *</label>
                                    <input
                                        className="admin-input"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Jane Smith"
                                    />
                                </div>
                                <div>
                                    <label className="admin-label">Email Address *</label>
                                    <input
                                        type="email"
                                        className="admin-input"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="jane@example.com"
                                        disabled={!!editing}
                                    />
                                    {editing && (
                                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed after creation.</p>
                                    )}
                                </div>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="admin-label">Role *</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    {ROLES.map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => handleRoleChange(role)}
                                            className={`flex items-start gap-3 p-3 border text-left transition-colors ${
                                                form.role === role
                                                    ? "border-green-600 bg-green-50"
                                                    : "border-gray-200 hover:border-gray-400"
                                            }`}
                                        >
                                            <div className="mt-0.5">
                                                <span className={`badge ${ROLE_BADGE[role]} text-[10px]`}>{ROLE_LABELS[role]}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-snug">{ROLE_DESCRIPTIONS[role]}</p>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Selecting a role pre-fills permissions below. You can customise them further.
                                </p>
                            </div>

                            {/* Granular permissions */}
                            <div>
                                <label className="admin-label flex items-center gap-1">
                                    <MdShield size={14} className="text-gray-400" />
                                    Section Permissions
                                </label>
                                <div className="border border-gray-200 divide-y divide-gray-100 mt-1">
                                    {(Object.keys(DEFAULT_PERMISSIONS) as (keyof StaffMember["permissions"])[]).map((key) => (
                                        <label
                                            key={key}
                                            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="text-green-700 shrink-0">
                                                {form.permissions[key]
                                                    ? <MdCheckBox size={18} />
                                                    : <MdCheckBoxOutlineBlank size={18} className="text-gray-300" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={form.permissions[key]}
                                                onChange={() => togglePermission(key)}
                                            />
                                            <span className="text-sm text-gray-700">{PERMISSION_LABELS[key]}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Active */}
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                />
                                Account active (can log in to admin panel)
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving…" : editing ? "Update Staff Member" : "Add Staff Member"}
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
