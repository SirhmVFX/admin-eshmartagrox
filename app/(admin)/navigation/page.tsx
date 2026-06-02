"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useContent } from "@/lib/hooks/useContent";
import { useAuth } from "@/lib/hooks/useAuth";
import type { NavLink } from "@/lib/types";

function newNav(): NavLink {
  return {
    id: `nav-${Date.now()}`,
    label: "New Link",
    href: "/",
    order: 99,
    isVisible: true,
  };
}

export default function NavigationPage() {
  const { content, loading, saving, message, saveSection } = useContent();
  const { can } = useAuth();
  const [links, setLinks] = useState<NavLink[]>([]);

  useEffect(() => {
    if (content) setLinks([...content.navigation].sort((a, b) => a.order - b.order));
  }, [content]);

  const update = (id: string, patch: Partial<NavLink>) =>
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <>
      <AdminHeader
        title="Navigation"
        description="Manage header menu links, order, and visibility."
        actions={
          can("navigation:write") && (
            <Button variant="secondary" onClick={() => setLinks((p) => [...p, newNav()])}>
              <Plus className="h-4 w-4" /> Add link
            </Button>
          )
        }
      />
      <Card>
        <div className="space-y-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="grid gap-3 rounded-lg border border-green-50 p-4 md:grid-cols-12 md:items-center"
            >
              <GripVertical className="hidden h-5 w-5 text-gray-300 md:col-span-1 md:block" />
              <input
                className="md:col-span-2"
                value={link.label}
                onChange={(e) => update(link.id, { label: e.target.value })}
                placeholder="Label"
              />
              <input
                className="md:col-span-3"
                value={link.href}
                onChange={(e) => update(link.id, { href: e.target.value })}
                placeholder="/path"
              />
              <input
                type="number"
                className="md:col-span-1"
                value={link.order}
                onChange={(e) => update(link.id, { order: Number(e.target.value) })}
              />
              <label className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  checked={link.isVisible}
                  onChange={(e) => update(link.id, { isVisible: e.target.checked })}
                />
                Visible
              </label>
              {can("navigation:write") && (
                <Button
                  variant="ghost"
                  className="md:col-span-1"
                  onClick={() => setLinks((p) => p.filter((l) => l.id !== link.id))}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
      <SaveBar
        saving={saving}
        message={message}
        canSave={can("navigation:write")}
        onSave={() => saveSection("navigation", links)}
      />
    </>
  );
}
