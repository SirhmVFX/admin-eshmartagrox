"use client";

import { useEffect, useState } from "react";
import { getCTA, saveCTA } from "@/lib/firestore";
import ImageUpload from "@/components/ImageUpload";

export default function CTAPage() {
    const [cta, setCta] = useState<any>(null);
    const [form, setForm] = useState({ title: "", description: "", contactImage: "", secondaryTitle: "", secondaryDescription: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        getCTA().then((c) => { if (c) { const { id, ...rest } = c; setForm(rest); setCta(c); } setLoading(false); });
    }, []);

    async function handleSave() {
        setSaving(true); setError(""); setSaved(false);
        try { await saveCTA(form); setSaved(true); setTimeout(() => setSaved(false), 3000); }
        catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
        finally { setSaving(false); }
    }

    if (loading) return <div className="admin-card text-sm text-gray-500">Loading CTA…</div>;

    return (
        <div className="max-w-3xl space-y-4">
            <div className="section-header"><div><h1 className="text-lg font-semibold text-gray-900">Call to Action</h1><p className="text-xs text-gray-500 mt-0.5">Bottom section with contact information</p></div><button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save CTA"}</button></div>

            {saved && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">CTA saved successfully.</div>}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

            <div className="admin-card space-y-4">
                <div><label className="admin-label">Title</label><input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Start Your Export Inquiry" /></div>
                <div><label className="admin-label">Description</label><textarea className="admin-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Contact our export experts." /></div>
                <ImageUpload value={form.contactImage} onChange={(url) => setForm({ ...form, contactImage: url })} label="Contact Image" />
                <div><label className="admin-label">Secondary Title</label><input className="admin-input" value={form.secondaryTitle} onChange={(e) => setForm({ ...form, secondaryTitle: e.target.value })} placeholder="From soil to shelf" /></div>
                <div><label className="admin-label">Secondary Description</label><textarea className="admin-input" rows={3} value={form.secondaryDescription} onChange={(e) => setForm({ ...form, secondaryDescription: e.target.value })} placeholder="Brief description" /></div>
            </div>
        </div>
    );
}
