"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Card } from "@/components/ui/Card";
import { FormField, FormGrid } from "@/components/ui/FormField";
import { useContent } from "@/lib/hooks/useContent";
import { useAuth } from "@/lib/hooks/useAuth";
import type { SiteSettings } from "@/lib/types";

export default function SiteSettingsPage() {
  const { content, loading, saving, message, saveSection } = useContent();
  const { can } = useAuth();
  const [form, setForm] = useState<SiteSettings | null>(null);

  useEffect(() => {
    if (content) setForm({ ...content.settings });
  }, [content]);

  if (loading || !form) return <p className="text-gray-500">Loading...</p>;

  const update = (key: keyof SiteSettings, value: string | boolean) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  return (
    <>
      <AdminHeader
        title="Site Settings"
        description="Global branding, SEO metadata, and header toggles."
      />
      <Card title="Branding & SEO">
        <FormGrid>
          <FormField label="Site name">
            <input value={form.siteName} onChange={(e) => update("siteName", e.target.value)} />
          </FormField>
          <FormField label="Tagline">
            <input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} />
          </FormField>
          <FormField label="Page title (SEO)">
            <input value={form.title} onChange={(e) => update("title", e.target.value)} />
          </FormField>
          <FormField label="Meta description">
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </FormField>
        </FormGrid>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ImageUpload value={form.logoUrl} onChange={(v) => update("logoUrl", v)} label="Logo URL" />
          <FormField label="Favicon URL">
            <input value={form.faviconUrl} onChange={(e) => update("faviconUrl", e.target.value)} />
          </FormField>
        </div>
      </Card>

      <Card title="Contact & currency" className="mt-6">
        <FormGrid>
          <FormField label="Currency code">
            <input value={form.currency} onChange={(e) => update("currency", e.target.value)} />
          </FormField>
          <FormField label="Currency symbol">
            <input
              value={form.currencySymbol}
              onChange={(e) => update("currencySymbol", e.target.value)}
            />
          </FormField>
          <FormField label="Contact email">
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
            />
          </FormField>
          <FormField label="Contact phone">
            <input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} />
          </FormField>
          <FormField label="Address">
            <input value={form.address} onChange={(e) => update("address", e.target.value)} />
          </FormField>
        </FormGrid>
      </Card>

      <Card title="Header icons" className="mt-6">
        <div className="flex flex-wrap gap-6">
          {(["showSearch", "showCart", "showUser"] as const).map((key) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => update(key, e.target.checked)}
              />
              <span className="capitalize">{key.replace("show", "")}</span>
            </label>
          ))}
        </div>
      </Card>

      <SaveBar
        saving={saving}
        message={message}
        canSave={can("site:write")}
        onSave={() => form && saveSection("settings", form)}
      />
    </>
  );
}
