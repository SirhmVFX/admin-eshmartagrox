"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/lib/hooks/useAuth";
import { PERMISSION_GROUPS, PERMISSION_LABELS } from "@/lib/permissions";
import type { Permission, Role } from "@/lib/types";

export default function RolesPage() {
  const { can } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [editing, setEditing] = useState<Role | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = async () => {
    const res = await fetch("/api/roles");
    if (res.ok) {
      const d = await res.json();
      setRoles(d.roles ?? []);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePerm = (perm: Permission) => {
    if (!editing || editing.isSystem) return;
    const has = editing.permissions.includes(perm);
    setEditing({
      ...editing,
      permissions: has
        ? editing.permissions.filter((p) => p !== perm)
        : [...editing.permissions, perm],
    });
  };

  const saveRole = async () => {
    if (!editing) return;
    setMessage(null);
    const isNew = !roles.find((r) => r.id === editing.id);
    const res = await fetch(isNew ? "/api/roles" : `/api/roles/${editing.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editing.name,
        description: editing.description,
        permissions: editing.permissions,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Failed" });
      return;
    }
    setMessage({ type: "success", text: "Role saved" });
    setEditing(null);
    load();
  };

  const newRole = () => {
    setEditing({
      id: "",
      name: "",
      description: "",
      permissions: [],
      createdAt: "",
      updatedAt: "",
    });
  };

  if (!can("roles:read")) {
    return <p className="text-gray-500">You do not have permission to view roles.</p>;
  }

  return (
    <>
      <AdminHeader
        title="Roles & Permissions"
        description="Define what each admin role can access."
        actions={
          can("roles:write") && (
            <Button variant="secondary" onClick={newRole}>
              <Plus className="h-4 w-4" /> New role
            </Button>
          )
        }
      />
      {message && (
        <div className="mb-4">
          <Alert type={message.type === "success" ? "success" : "error"}>{message.text}</Alert>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Roles">
          <ul className="space-y-2">
            {roles.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setEditing({ ...r })}
                  className="w-full rounded-lg border border-green-50 px-4 py-3 text-left hover:bg-green-50"
                >
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.permissions.length} permissions</p>
                </button>
              </li>
            ))}
          </ul>
        </Card>
        {editing && (
          <Card title={editing.id ? `Edit: ${editing.name}` : "New role"}>
            <FormField label="Name">
              <input
                value={editing.name}
                disabled={editing.isSystem}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </FormField>
            <FormField label="Description">
              <textarea
                rows={2}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </FormField>
            {editing.isSystem && (
              <p className="mb-4 text-sm text-amber-700">
                System role permissions cannot be changed.
              </p>
            )}
            <p className="mb-2 text-sm font-medium text-gray-700">Permissions</p>
            <div className="max-h-96 overflow-y-auto space-y-4">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold uppercase text-green-800">{group.label}</p>
                  <div className="mt-1 space-y-1">
                    {group.permissions.map((perm) => (
                      <label key={perm} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          disabled={editing.isSystem || !can("roles:write")}
                          checked={editing.permissions.includes(perm)}
                          onChange={() => togglePerm(perm)}
                        />
                        {PERMISSION_LABELS[perm]}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {can("roles:write") && !editing.isSystem && (
              <Button onClick={saveRole} className="mt-4">
                Save role
              </Button>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
