"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, saveSiteSettings } from "@/lib/firestore";
import ImageUpload from "@/components/ImageUpload";

const defaultSettings = {
    siteName: "Eshmart Agrox",
    tagline: "Nigerian Produce. Exported with Integrity.",
    title: "Eshmart Agrox | Premium Nigerian Produce Export",
    description: "Premium grade Okra and Ugu exported from Nigeria.",
    logoUrl: "",
    faviconUrl: "/favicon.ico",
    currency: "NGN",
    currencySymbol: "₦",
    contactEmail: "exports@eshmartagrox.com",
    contactPhone: "+234 800 000 0000",
    address: "Lagos, Nigeria",
    showSearch: true,
    showCart: true,
    showUser: true,
    shopBannerImage: "",
    shopBannerTitle: "Our Shop",
};

export default function SettingsPage() {
    const [form, setForm] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getSiteSettings().then((s) => { if (s) { const { id, ...rest } = s; setForm({ ...defaultSettings, ...rest }); } setLoading(false); });
    }, []);

    function set(key: keyof typeof form, value: any) { setForm((prev) => ({ ...prev, [key]: value })); }

    async function handleSave() {
        setSaving(true); setError(""); setSaved(false);
        try { await saveSiteSettings(form); setSaved(true); setTimeout(() => setSaved(false), 3000); }
        catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSaving(false); }
    }

    if (loading) return <div className="admin-card text-sm text-gray-500">Loading settings…</div>;

    return (
        <div className="max-w-3xl space-y-6">
            <div className="section-header"><div><h1 className="text-lg font-semibold text-gray-900">Site Settings</h1><p className="text-xs text-gray-500 mt-0.5">Site name, contact info, currency, and feature toggles</p></div><button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Settings"}</button></div>

            {saved && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">Settings saved successfully.</div>}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

            <div className="admin-card space-y-4">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">General</p>
                <div><label className="admin-label">Site Name</label><input className="admin-input" value={form.siteName} onChange={(e) => set("siteName", e.target.value)} /></div>
                <div><label className="admin-label">Tagline</label><input className="admin-input" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></div>
                <div><label className="admin-label">Page Title (SEO)</label><input className="admin-input" value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
                <div><label className="admin-label">Description (SEO)</label><textarea className="admin-input" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
                <ImageUpload value={form.logoUrl} onChange={(url) => set("logoUrl", url)} label="Logo Image" />
                <div>
                    <label className="admin-label">Favicon URL</label>
                    <input className="admin-input" value={form.faviconUrl} onChange={(e) => set("faviconUrl", e.target.value)} placeholder="/favicon.ico" />
                    <p className="text-xs text-gray-400 mt-1">Path to favicon (e.g. /favicon.ico) or a full URL.</p>
                </div>
            </div>

            <div className="admin-card space-y-4">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Currency</p>
                <div className="grid grid-cols-2 gap-4"><div><label className="admin-label">Currency Code</label><input className="admin-input" value={form.currency} onChange={(e) => set("currency", e.target.value)} /></div><div><label className="admin-label">Currency Symbol</label><input className="admin-input" value={form.currencySymbol} onChange={(e) => set("currencySymbol", e.target.value)} /></div></div>
            </div>

            <div className="admin-card space-y-4">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Contact</p>
                <div><label className="admin-label">Contact Email</label><input type="email" className="admin-input" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} /></div>
                <div><label className="admin-label">Contact Phone</label><input className="admin-input" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} /></div>
                <div><label className="admin-label">Address</label><input className="admin-input" value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
            </div>

            <div className="admin-card space-y-4">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Shop Page</p>
                <ImageUpload value={form.shopBannerImage ?? ""} onChange={(url) => set("shopBannerImage", url)} label="Shop Banner Image" />
                <p className="text-xs text-gray-400 -mt-2">Banner shown at the top of the Shop page. Leave blank to use the default image.</p>
                <div>
                    <label className="admin-label">Shop Banner Title</label>
                    <input className="admin-input" value={form.shopBannerTitle ?? ""} onChange={(e) => set("shopBannerTitle", e.target.value)} placeholder="Our Shop" />
                    <p className="text-xs text-gray-400 mt-1">Heading shown over the shop banner. Defaults to "Our Shop".</p>
                </div>
            </div>

            <div className="admin-card space-y-4">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Feature Toggles</p>
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.showSearch} onChange={(e) => set("showSearch", e.target.checked)} /> Show Search</label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.showCart} onChange={(e) => set("showCart", e.target.checked)} /> Show Cart</label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.showUser} onChange={(e) => set("showUser", e.target.checked)} /> Show User Profile</label>
                </div>
            </div>

            <div className="flex justify-end">
                <button className="btn-primary px-8 py-3" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save All Settings"}</button>
            </div>
        </div>
    );
}
