"use client";

import { useEffect, useState } from "react";
import { getHomepageHeroContent, saveHomepageHeroContent, HomepageHeroContent } from "@/lib/firestore";
import ImageUpload from "@/components/ImageUpload";
import { MdSave, MdAdd, MdClose } from "react-icons/md";

const DEFAULT: HomepageHeroContent = {
    deliveryText: "Now delivering across Lagos & Abuja",
    line1: "Eat better.", line2: "Live longer.", line3: "Stay healthier.",
    subtitle: "Healthy Nigerian foods and curated grocery packages designed for seniors, families, busy professionals, and students — guided by real nutrition science.",
    cta1Label: "Shop healthy packages", cta1Href: "/shop",
    cta2Label: "🧮 Try the nutrition calculator", cta2Href: "/calculator",
    healthPills: ["💧 Diabetes", "💚 Blood Pressure", "📈 Cholesterol", "✨ Healthy Aging"],
    floatingCard1Title: "AI meal plan", floatingCard1Sub: "Built around your health",
    floatingCard2Title: "Heart-healthy ✓", floatingCard2Sub: "Low-sodium, high-fibre",
    heroImage: "",
    assessmentHeading: "Take the ESHMARTAGROX assessment and get a personalised food plan.",
    assessmentCta1Label: "Start assessment", assessmentCta2Label: "Browse packages instead",
};

export default function HomepageSettingsPage() {
    const [form, setForm] = useState<HomepageHeroContent>(DEFAULT);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newPill, setNewPill] = useState("");

    useEffect(() => {
        getHomepageHeroContent()
            .then(h => { if (h) setForm(h); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const set = (k: keyof HomepageHeroContent, v: string) =>
        setForm(f => ({ ...f, [k]: v }));

    async function handleSave() {
        setSaving(true);
        try {
            await saveHomepageHeroContent(form);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } finally { setSaving(false); }
    }

    function addPill() {
        if (!newPill.trim()) return;
        setForm(f => ({ ...f, healthPills: [...f.healthPills, newPill.trim()] }));
        setNewPill("");
    }
    function removePill(i: number) {
        setForm(f => ({ ...f, healthPills: f.healthPills.filter((_, j) => j !== i) }));
    }

    if (loading) return <div className="admin-card text-sm text-gray-500">Loading…</div>;

    return (
        <div className="max-w-3xl space-y-6">
            <div className="section-header">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Homepage Settings</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Edit every text, image, and label on the homepage hero and assessment CTA
                    </p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={handleSave} disabled={saving}>
                    <MdSave size={15} /> {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
                </button>
            </div>

            {/* ── Delivery Banner ── */}
            <div className="admin-card space-y-3">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-2">Delivery Banner</p>
                <div>
                    <label className="admin-label">Banner Text</label>
                    <input className="admin-input" value={form.deliveryText} onChange={e => set("deliveryText", e.target.value)} placeholder="Now delivering across Lagos & Abuja" />
                </div>
            </div>

            {/* ── Hero Headline ── */}
            <div className="admin-card space-y-3">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-2">Hero Headline (3 lines)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="admin-label">Line 1 (black)</label>
                        <input className="admin-input" value={form.line1} onChange={e => set("line1", e.target.value)} placeholder="Eat better." />
                    </div>
                    <div>
                        <label className="admin-label">Line 2 (green)</label>
                        <input className="admin-input" value={form.line2} onChange={e => set("line2", e.target.value)} placeholder="Live longer." />
                    </div>
                    <div>
                        <label className="admin-label">Line 3 (orange)</label>
                        <input className="admin-input" value={form.line3} onChange={e => set("line3", e.target.value)} placeholder="Stay healthier." />
                    </div>
                </div>
                <div>
                    <label className="admin-label">Subtitle</label>
                    <textarea className="admin-input" rows={2} value={form.subtitle} onChange={e => set("subtitle", e.target.value)} />
                </div>
            </div>

            {/* ── CTA Buttons ── */}
            <div className="admin-card space-y-3">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-2">CTA Buttons</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="admin-label">Button 1 Label (green)</label>
                        <input className="admin-input" value={form.cta1Label} onChange={e => set("cta1Label", e.target.value)} />
                    </div>
                    <div>
                        <label className="admin-label">Button 1 Link</label>
                        <input className="admin-input" value={form.cta1Href} onChange={e => set("cta1Href", e.target.value)} />
                    </div>
                    <div>
                        <label className="admin-label">Button 2 Label (outline)</label>
                        <input className="admin-input" value={form.cta2Label} onChange={e => set("cta2Label", e.target.value)} />
                    </div>
                    <div>
                        <label className="admin-label">Button 2 Link</label>
                        <input className="admin-input" value={form.cta2Href} onChange={e => set("cta2Href", e.target.value)} />
                    </div>
                </div>
            </div>

            {/* ── Health Pills ── */}
            <div className="admin-card space-y-3">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-2">Health Condition Pills</p>
                <div className="flex flex-wrap gap-2">
                    {form.healthPills.map((pill, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-700">
                            {pill}
                            <button onClick={() => removePill(i)} className="text-gray-400 hover:text-red-500 ml-1"><MdClose size={12} /></button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        className="admin-input flex-1"
                        value={newPill}
                        onChange={e => setNewPill(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addPill()}
                        placeholder="e.g. 💧 Diabetes"
                    />
                    <button className="btn-secondary flex items-center gap-1 px-3" onClick={addPill}>
                        <MdAdd size={14} /> Add
                    </button>
                </div>
            </div>

            {/* ── Hero Image ── */}
            <div className="admin-card space-y-3">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-2">Hero Image</p>
                <ImageUpload
                    value={form.heroImage}
                    onChange={url => setForm(f => ({ ...f, heroImage: url }))}
                    label="Hero Photo (right side of homepage)"
                />
                <p className="text-xs text-gray-400">Leave blank to use the default asset image.</p>
            </div>

            {/* ── Floating Cards ── */}
            <div className="admin-card space-y-4">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-2">Floating Cards on Hero Image</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="admin-label">Card 1 Title (top-right)</label>
                        <input className="admin-input" value={form.floatingCard1Title} onChange={e => set("floatingCard1Title", e.target.value)} />
                    </div>
                    <div>
                        <label className="admin-label">Card 1 Subtitle</label>
                        <input className="admin-input" value={form.floatingCard1Sub} onChange={e => set("floatingCard1Sub", e.target.value)} />
                    </div>
                    <div>
                        <label className="admin-label">Card 2 Title (bottom-left)</label>
                        <input className="admin-input" value={form.floatingCard2Title} onChange={e => set("floatingCard2Title", e.target.value)} />
                    </div>
                    <div>
                        <label className="admin-label">Card 2 Subtitle</label>
                        <input className="admin-input" value={form.floatingCard2Sub} onChange={e => set("floatingCard2Sub", e.target.value)} />
                    </div>
                </div>
            </div>

            {/* ── Consultation Image ── */}
            <div className="admin-card space-y-3">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-2">Nutrition Consultations Section</p>
                <p className="text-xs text-gray-400">The photo shown on the left side of the &quot;Talk to a Nigerian nutritionist&quot; section.</p>
                <ImageUpload
                    value={form.consultationImage ?? ""}
                    onChange={url => setForm(f => ({ ...f, consultationImage: url }))}
                    label="Nutritionist Photo"
                />
                <p className="text-xs text-gray-400">Leave blank to use the default image.</p>
            </div>

            {/* ── Assessment CTA ── */}
            <div className="admin-card space-y-3">
                <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-2">Assessment CTA (orange banner)</p>                <div>
                    <label className="admin-label">Heading</label>
                    <textarea className="admin-input" rows={2} value={form.assessmentHeading} onChange={e => set("assessmentHeading", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="admin-label">Button 1 Label (dark)</label>
                        <input className="admin-input" value={form.assessmentCta1Label} onChange={e => set("assessmentCta1Label", e.target.value)} />
                    </div>
                    <div>
                        <label className="admin-label">Button 2 Label (light)</label>
                        <input className="admin-input" value={form.assessmentCta2Label} onChange={e => set("assessmentCta2Label", e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pb-4">
                <button className="btn-primary flex items-center gap-2 px-6" onClick={handleSave} disabled={saving}>
                    <MdSave size={15} /> {saved ? "Saved!" : saving ? "Saving…" : "Save All Changes"}
                </button>
            </div>
        </div>
    );
}
