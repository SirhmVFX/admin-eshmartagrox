"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { FormField, FormGrid } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/lib/hooks/useAuth";
import type { PublicAdmin, Role } from "@/lib/types";

export default function AdminsPage() {
  const { can, user } = useAuth();
  const [admins, setAdmins] = useState<PublicAdmin[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    isActive: true,
  });

  const load = async () => {
    const [aRes, rRes] = await Promise.all([fetch("/api/admins"), fetch("/api/roles")]);
    if (aRes.ok) {
      const d = await aRes.json();
      setAdmins(d.admins ?? []);
    }
    if (rRes.ok) {
      const d = await rRes.json();
      setRoles(d.roles ?? []);
      if (d.roles?.[0]) setForm((f) => ({ ...f, roleId: f.roleId || d.roles[0].id }));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createAdmin = async () => {
    setMessage(null);
    const res = await fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Failed" });
      return;
    }
    setMessage({ type: "success", text: "Admin created" });
    setShowForm(false);
    setForm({ name: "", email: "", password: "", roleId: roles[0]?.id ?? "", isActive: true });
    load();
  };

  const toggleActive = async (admin: PublicAdmin) => {
    await fetch(`/api/admins/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !admin.isActive }),
    });
    load();
  };

  const deleteAdmin = async (id: string) => {
    if (!confirm("Delete this admin?")) return;
    const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) setMessage({ type: "error", text: data.error ?? "Failed" });
    else load();
  };

  if (!can("admins:read")) {
    return <p className="text-gray-500">You do not have permission to view admins.</p>;
  }

  return (
    <>
      <AdminHeader
        title="Admin Users"
        description="Create admins and assign roles."
        actions={
          can("admins:write") && (
            <Button variant="secondary" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4" /> Add admin
            </Button>
          )
        }
      />
      {message && (
        <div className="mb-4">
          <Alert type={message.type === "success" ? "success" : "error"}>{message.text}</Alert>
        </div>
      )}
      {showForm && can("admins:write") && (
        <Card title="New admin" className="mb-6">
          <FormGrid>
            <FormField label="Name">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </FormField>
            <FormField label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>
            <FormField label="Password">
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </FormField>
            <FormField label="Role">
              <select
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </FormField>
          </FormGrid>
          <Button onClick={createAdmin} className="mt-4">
            Create admin
          </Button>
        </Card>
      )}
      <Card title="All admins">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-green-50">
                <td className="py-3">{a.name}</td>
                <td>{a.email}</td>
                <td>{roles.find((r) => r.id === a.roleId)?.name ?? a.roleId}</td>
                <td>{a.isActive ? "Active" : "Inactive"}</td>
                <td className="space-x-2">
                  {can("admins:write") && a.id !== user?.id && (
                    <>
                      <Button variant="ghost" onClick={() => toggleActive(a)}>
                        {a.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="danger" onClick={() => deleteAdmin(a.id)}>
                        Delete
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
