"use client";

import { useEffect, useState } from "react";
import {
  getAboutPageContent, saveAboutPageContent,
  type AboutPageContent, type AboutStat, type AboutValue, type AboutService,
} from "@/lib/firestore";
import ImageUpload from "@/components/ImageUpload";

export default function AboutPageAdmin() {
  const [form, setForm] = useState<AboutPageContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getAboutPageContent().then(setForm).catch(() => setForm(null));
  }, []);

  function set<K extends keyof AboutPageContent>(key: K, value: AboutPageContent[K]) {
    setForm(prev => prev ? { ...prev, [key]: value } : prev);
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      await saveAboutPageContent(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save."); }
    finally { setSaving(false); }
  }

  if (!form) return <div className="admin-card text-sm text-gray-500">Loading…</div>;

  const labelCls = "admin-label";
  const inputCls = "admin-input";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="section-header">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">About Page</h1>
          <p className="text-xs text-gray-500 mt-0.5">Edit every section of the About Us page</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {saved && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">Saved successfully.</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      {/* ── Hero ── */}
      <div className="admin-card space-y-4">
        <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Hero Section</p>
        <div><label className={labelCls}>Eyebrow Label (e.g. "Our Story")</label><input className={inputCls} value={form.heroLabel} onChange={e => set("heroLabel", e.target.value)} /></div>
        <div><label className={labelCls}>Page Heading</label><input className={inputCls} value={form.heroHeading} onChange={e => set("heroHeading", e.target.value)} /></div>
        <div><label className={labelCls}>Sub-text</label><textarea className={inputCls} rows={2} value={form.heroSubtext} onChange={e => set("heroSubtext", e.target.value)} /></div>
        <ImageUpload value={form.heroBgImage ?? ""} onChange={url => set("heroBgImage", url)} label="Hero Background Image (optional)" />
      </div>

      {/* ── Who We Are ── */}
      <div className="admin-card space-y-4">
        <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Who We Are</p>
        <div><label className={labelCls}>Section Heading</label><input className={inputCls} value={form.whoHeading} onChange={e => set("whoHeading", e.target.value)} /></div>
        <div><label className={labelCls}>Paragraph 1</label><textarea className={inputCls} rows={3} value={form.whoParagraph1} onChange={e => set("whoParagraph1", e.target.value)} /></div>
        <div><label className={labelCls}>Paragraph 2</label><textarea className={inputCls} rows={3} value={form.whoParagraph2} onChange={e => set("whoParagraph2", e.target.value)} /></div>
        <div><label className={labelCls}>Paragraph 3</label><textarea className={inputCls} rows={3} value={form.whoParagraph3} onChange={e => set("whoParagraph3", e.target.value)} /></div>
      </div>

      {/* ── Stats ── */}
      <div className="admin-card space-y-4">
        <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Stats / Highlights (4 tiles)</p>
        {form.stats.map((stat, i) => (
          <div key={i} className="grid grid-cols-3 gap-3 items-end border border-gray-100 p-3 rounded-lg">
            <div><label className={labelCls}>Value</label><input className={inputCls} value={stat.value} onChange={e => { const s = [...form.stats]; s[i] = { ...s[i], value: e.target.value }; set("stats", s); }} placeholder="500+" /></div>
            <div><label className={labelCls}>Label</label><input className={inputCls} value={stat.label} onChange={e => { const s = [...form.stats]; s[i] = { ...s[i], label: e.target.value }; set("stats", s); }} placeholder="Happy Customers" /></div>
            <div><label className={labelCls}>Colour (Tailwind)</label><input className={inputCls} value={stat.color} onChange={e => { const s = [...form.stats]; s[i] = { ...s[i], color: e.target.value }; set("stats", s); }} placeholder="bg-green-900 text-white" /></div>
          </div>
        ))}
        <button className="btn-secondary text-xs" onClick={() => set("stats", [...form.stats, { value: "", label: "", color: "bg-gray-100 text-gray-900" }])}>+ Add Stat</button>
      </div>

      {/* ── Values ── */}
      <div className="admin-card space-y-4">
        <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Our Values</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Section Heading</label><input className={inputCls} value={form.valuesHeading} onChange={e => set("valuesHeading", e.target.value)} /></div>
          <div><label className={labelCls}>Sub-text</label><input className={inputCls} value={form.valuesSubtext} onChange={e => set("valuesSubtext", e.target.value)} /></div>
        </div>
        {form.values.map((v, i) => (
          <div key={i} className="border border-gray-100 p-3 rounded-lg space-y-2">
            <div className="grid grid-cols-3 gap-3">
              <div><label className={labelCls}>Icon (emoji)</label><input className={inputCls} value={v.icon} onChange={e => { const arr = [...form.values]; arr[i] = { ...arr[i], icon: e.target.value }; set("values", arr); }} /></div>
              <div className="col-span-2"><label className={labelCls}>Title</label><input className={inputCls} value={v.title} onChange={e => { const arr = [...form.values]; arr[i] = { ...arr[i], title: e.target.value }; set("values", arr); }} /></div>
            </div>
            <div><label className={labelCls}>Description</label><textarea className={inputCls} rows={2} value={v.desc} onChange={e => { const arr = [...form.values]; arr[i] = { ...arr[i], desc: e.target.value }; set("values", arr); }} /></div>
            <button className="text-xs text-red-500 hover:text-red-700" onClick={() => set("values", form.values.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button className="btn-secondary text-xs" onClick={() => set("values", [...form.values, { icon: "✨", title: "", desc: "" }])}>+ Add Value</button>
      </div>

      {/* ── What We Do ── */}
      <div className="admin-card space-y-4">
        <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">What We Do</p>
        <div><label className={labelCls}>Section Heading</label><input className={inputCls} value={form.servicesHeading} onChange={e => set("servicesHeading", e.target.value)} /></div>
        {form.services.map((s, i) => (
          <div key={i} className="border border-gray-100 p-3 rounded-lg space-y-2">
            <div className="grid grid-cols-3 gap-3">
              <div><label className={labelCls}>Icon (emoji)</label><input className={inputCls} value={s.icon} onChange={e => { const arr = [...form.services]; arr[i] = { ...arr[i], icon: e.target.value }; set("services", arr); }} /></div>
              <div className="col-span-2"><label className={labelCls}>Title</label><input className={inputCls} value={s.title} onChange={e => { const arr = [...form.services]; arr[i] = { ...arr[i], title: e.target.value }; set("services", arr); }} /></div>
            </div>
            <div><label className={labelCls}>Description</label><textarea className={inputCls} rows={2} value={s.desc} onChange={e => { const arr = [...form.services]; arr[i] = { ...arr[i], desc: e.target.value }; set("services", arr); }} /></div>
            <div><label className={labelCls}>Link (href)</label><input className={inputCls} value={s.href} onChange={e => { const arr = [...form.services]; arr[i] = { ...arr[i], href: e.target.value }; set("services", arr); }} placeholder="/shop" /></div>
            <button className="text-xs text-red-500 hover:text-red-700" onClick={() => set("services", form.services.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button className="btn-secondary text-xs" onClick={() => set("services", [...form.services, { icon: "✨", title: "", desc: "", href: "/" }])}>+ Add Service</button>
      </div>

      {/* ── CTA ── */}
      <div className="admin-card space-y-4">
        <p className="text-xs font-semibold uppercase text-gray-500 border-b border-gray-100 pb-3">Contact CTA Section</p>
        <div><label className={labelCls}>Heading</label><input className={inputCls} value={form.ctaHeading} onChange={e => set("ctaHeading", e.target.value)} /></div>
        <div><label className={labelCls}>Sub-text</label><textarea className={inputCls} rows={2} value={form.ctaSubtext} onChange={e => set("ctaSubtext", e.target.value)} /></div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary px-8 py-3" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save All Changes"}</button>
      </div>
    </div>
  );
}
