"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Card } from "@/components/ui/Card";
import { FormField, FormGrid } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useContent } from "@/lib/hooks/useContent";
import { useAuth } from "@/lib/hooks/useAuth";
import type { HeroContent, HeroSlide, HomeFeatures, HomeQuality, CallToActionContent } from "@/lib/types";

function newSlide(order: number): HeroSlide {
  return {
    id: `slide-${order}-${Date.now()}`,
    image: "/placeholder.svg",
    headline: "New Slide Headline",
    subheadline: "Add a compelling subheadline for this slide.",
    ctaLabel: "Learn More",
    ctaHref: "/shop",
    ctaSecondaryLabel: "",
    ctaSecondaryHref: "",
  };
}

export default function HomePage() {
  const { content, loading, saving, message, saveSection } = useContent();
  const { can } = useAuth();
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [features, setFeatures] = useState<HomeFeatures | null>(null);
  const [quality, setQuality] = useState<HomeQuality | null>(null);
  const [cta, setCta] = useState<CallToActionContent | null>(null);
  const [tab, setTab] = useState<"hero" | "features" | "quality" | "cta">("hero");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (content) {
      const h = { ...content.hero };
      // Ensure slides array exists
      if (!h.slides || h.slides.length === 0) {
        h.slides = [
          {
            id: "slide-1",
            image: h.image || "",
            headline: h.headline || "",
            subheadline: h.subheadline || "",
            ctaLabel: h.ctaLabel || "Learn More",
            ctaHref: h.ctaHref || "/shop",
            ctaSecondaryLabel: "",
            ctaSecondaryHref: "",
          },
        ];
      }
      setHero(h);
      setFeatures(JSON.parse(JSON.stringify(content.homeFeatures)));
      setQuality(JSON.parse(JSON.stringify(content.homeQuality)));
      setCta({ ...content.callToAction });
    }
  }, [content]);

  const saveCurrent = async () => {
    if (tab === "hero" && hero) {
      // Keep legacy fields in sync with first slide
      const first = hero.slides?.[0];
      const updated: HeroContent = {
        ...hero,
        image: first?.image ?? hero.image,
        headline: first?.headline ?? hero.headline,
        subheadline: first?.subheadline ?? hero.subheadline,
        ctaLabel: first?.ctaLabel ?? hero.ctaLabel,
        ctaHref: first?.ctaHref ?? hero.ctaHref,
      };
      await saveSection("hero", updated);
    }
    if (tab === "features" && features) await saveSection("homeFeatures", features);
    if (tab === "quality" && quality) await saveSection("homeQuality", quality);
    if (tab === "cta" && cta) await saveSection("callToAction", cta);
  };

  if (loading || !hero || !features || !quality || !cta) {
    return <p className="text-gray-500">Loading...</p>;
  }

  const slides = hero.slides ?? [];

  const updateSlide = (idx: number, patch: Partial<HeroSlide>) => {
    const updated = [...slides];
    updated[idx] = { ...updated[idx], ...patch };
    setHero({ ...hero, slides: updated });
  };

  const addSlide = () => {
    if (slides.length >= 5) return;
    const updated = [...slides, newSlide(slides.length + 1)];
    setHero({ ...hero, slides: updated });
    setActiveSlide(updated.length - 1);
  };

  const removeSlide = (idx: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== idx);
    setHero({ ...hero, slides: updated });
    setActiveSlide(Math.min(activeSlide, updated.length - 1));
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= slides.length) return;
    const updated = [...slides];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setHero({ ...hero, slides: updated });
    setActiveSlide(newIdx);
  };

  const tabs = [
    { id: "hero" as const, label: "Hero Slider" },
    { id: "features" as const, label: "Produce section" },
    { id: "quality" as const, label: "Quality section" },
    { id: "cta" as const, label: "Call to action" },
  ];

  return (
    <>
      <AdminHeader title="Home Page" description="Edit all homepage sections." />
      <div className="mb-6 flex gap-2 border-b border-green-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.id ? "border-green-900 text-green-900" : "border-transparent text-gray-500"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HERO SLIDER ── */}
      {tab === "hero" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Slide list */}
          <Card title={`Slides (${slides.length}/5)`} className="lg:col-span-1">
            <ul className="space-y-2 mb-4">
              {slides.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setActiveSlide(i)}
                    className={`w-full rounded-lg text-left transition-all ${activeSlide === i
                        ? "bg-green-100 border border-green-300"
                        : "bg-gray-50 border border-transparent hover:bg-green-50"
                      }`}
                    style={{ padding: "8px 12px" }}
                  >
                    <div className="flex items-center gap-3">
                      {s.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.image} alt="" className="w-12 h-8 object-cover rounded flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-8 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                          No img
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-green-900">Slide {i + 1}</p>
                        <p className="text-xs text-gray-500 truncate">{s.headline || "Untitled"}</p>
                      </div>
                    </div>
                  </button>
                  <div className="flex gap-1 mt-1 justify-end">
                    <button
                      type="button"
                      onClick={() => moveSlide(i, -1)}
                      disabled={i === 0}
                      className="p-1 text-gray-400 hover:text-green-700 disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSlide(i, 1)}
                      disabled={i === slides.length - 1}
                      className="p-1 text-gray-400 hover:text-green-700 disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    {slides.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlide(i)}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="Remove slide"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {slides.length < 5 && can("home:write") && (
              <Button variant="secondary" onClick={addSlide} className="w-full">
                <Plus className="h-4 w-4" /> Add slide
              </Button>
            )}
            {slides.length >= 5 && (
              <p className="text-xs text-gray-400 text-center">Maximum 5 slides reached</p>
            )}
          </Card>

          {/* Slide editor */}
          {slides[activeSlide] && (
            <Card title={`Edit Slide ${activeSlide + 1}`} className="lg:col-span-2">
              <ImageUpload
                value={slides[activeSlide].image}
                onChange={(v) => updateSlide(activeSlide, { image: v })}
                label="Slide background image"
                folder="hero"
              />
              <FormField label="Headline *">
                <input
                  value={slides[activeSlide].headline}
                  onChange={(e) => updateSlide(activeSlide, { headline: e.target.value })}
                  placeholder="Nigerian Produce. Exported with Integrity."
                />
              </FormField>
              <FormField label="Subheadline">
                <textarea
                  rows={3}
                  value={slides[activeSlide].subheadline}
                  onChange={(e) => updateSlide(activeSlide, { subheadline: e.target.value })}
                  placeholder="A compelling description for this slide..."
                />
              </FormField>
              <FormGrid>
                <FormField label="Primary CTA label">
                  <input
                    value={slides[activeSlide].ctaLabel}
                    onChange={(e) => updateSlide(activeSlide, { ctaLabel: e.target.value })}
                    placeholder="View Our Products"
                  />
                </FormField>
                <FormField label="Primary CTA link">
                  <input
                    value={slides[activeSlide].ctaHref}
                    onChange={(e) => updateSlide(activeSlide, { ctaHref: e.target.value })}
                    placeholder="/shop"
                  />
                </FormField>
                <FormField label="Secondary CTA label (optional)">
                  <input
                    value={slides[activeSlide].ctaSecondaryLabel ?? ""}
                    onChange={(e) => updateSlide(activeSlide, { ctaSecondaryLabel: e.target.value })}
                    placeholder="Book a Consultation"
                  />
                </FormField>
                <FormField label="Secondary CTA link (optional)">
                  <input
                    value={slides[activeSlide].ctaSecondaryHref ?? ""}
                    onChange={(e) => updateSlide(activeSlide, { ctaSecondaryHref: e.target.value })}
                    placeholder="/book-online"
                  />
                </FormField>
              </FormGrid>

              {/* Live preview strip */}
              {slides[activeSlide].image && (
                <div className="mt-4 rounded-lg overflow-hidden relative" style={{ height: 140 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slides[activeSlide].image}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-950/80 to-green-950/30 flex items-center px-6">
                    <div>
                      <p className="text-white font-bold text-sm leading-tight line-clamp-2">
                        {slides[activeSlide].headline}
                      </p>
                      <p className="text-green-200 text-xs mt-1 line-clamp-1">
                        {slides[activeSlide].subheadline}
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 text-xs text-white/60 bg-black/30 px-2 py-0.5 rounded">
                    Preview
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* ── PRODUCE SECTION ── */}
      {tab === "features" && (
        <Card title="Our Produce">
          <FormField label="Section title">
            <input value={features.sectionTitle} onChange={(e) => setFeatures({ ...features, sectionTitle: e.target.value })} />
          </FormField>
          <FormField label="Section subtitle">
            <textarea rows={2} value={features.sectionSubtitle} onChange={(e) => setFeatures({ ...features, sectionSubtitle: e.target.value })} />
          </FormField>
          {features.cards.map((card, i) => (
            <div key={card.id} className="mt-6 rounded-lg border border-green-50 p-4">
              <h3 className="font-medium text-green-900 mb-3">Card {i + 1}</h3>
              <FormGrid>
                <FormField label="Number">
                  <input value={card.number} onChange={(e) => {
                    const cards = [...features.cards];
                    cards[i] = { ...card, number: e.target.value };
                    setFeatures({ ...features, cards });
                  }} />
                </FormField>
                <FormField label="Title">
                  <input value={card.title} onChange={(e) => {
                    const cards = [...features.cards];
                    cards[i] = { ...card, title: e.target.value };
                    setFeatures({ ...features, cards });
                  }} />
                </FormField>
              </FormGrid>
              <FormField label="Description">
                <textarea rows={2} value={card.description} onChange={(e) => {
                  const cards = [...features.cards];
                  cards[i] = { ...card, description: e.target.value };
                  setFeatures({ ...features, cards });
                }} />
              </FormField>
              <FormGrid>
                <FormField label="CTA label">
                  <input value={card.ctaLabel} onChange={(e) => {
                    const cards = [...features.cards];
                    cards[i] = { ...card, ctaLabel: e.target.value };
                    setFeatures({ ...features, cards });
                  }} />
                </FormField>
                <FormField label="CTA link">
                  <input value={card.ctaHref} onChange={(e) => {
                    const cards = [...features.cards];
                    cards[i] = { ...card, ctaHref: e.target.value };
                    setFeatures({ ...features, cards });
                  }} />
                </FormField>
              </FormGrid>
              <ImageUpload
                value={card.image}
                onChange={(v) => {
                  const cards = [...features.cards];
                  cards[i] = { ...card, image: v };
                  setFeatures({ ...features, cards });
                }}
                folder="home/features"
              />
            </div>
          ))}
        </Card>
      )}

      {/* ── QUALITY SECTION ── */}
      {tab === "quality" && (
        <Card title="Quality section">
          <FormField label="Section title">
            <input value={quality.sectionTitle} onChange={(e) => setQuality({ ...quality, sectionTitle: e.target.value })} />
          </FormField>
          <FormGrid>
            <ImageUpload
              value={quality.mainImage}
              onChange={(v) => setQuality({ ...quality, mainImage: v })}
              label="Main image"
              folder="home/quality"
            />
            <ImageUpload
              value={quality.secondaryImage}
              onChange={(v) => setQuality({ ...quality, secondaryImage: v })}
              label="Secondary image"
              folder="home/quality"
            />
          </FormGrid>
          {quality.blocks.map((block, i) => (
            <div key={block.id} className="mt-4 rounded-lg border border-green-50 p-4">
              <FormField label="Block title">
                <input value={block.title} onChange={(e) => {
                  const blocks = [...quality.blocks];
                  blocks[i] = { ...block, title: e.target.value };
                  setQuality({ ...quality, blocks });
                }} />
              </FormField>
              <FormField label="Description">
                <textarea rows={3} value={block.description} onChange={(e) => {
                  const blocks = [...quality.blocks];
                  blocks[i] = { ...block, description: e.target.value };
                  setQuality({ ...quality, blocks });
                }} />
              </FormField>
            </div>
          ))}
        </Card>
      )}

      {/* ── CALL TO ACTION ── */}
      {tab === "cta" && (
        <Card title="Call to action">
          <FormField label="Title">
            <input value={cta.title} onChange={(e) => setCta({ ...cta, title: e.target.value })} />
          </FormField>
          <FormField label="Description">
            <textarea rows={3} value={cta.description} onChange={(e) => setCta({ ...cta, description: e.target.value })} />
          </FormField>
          <ImageUpload
            value={cta.contactImage}
            onChange={(v) => setCta({ ...cta, contactImage: v })}
            folder="home/cta"
          />
          <FormField label="Secondary title">
            <input value={cta.secondaryTitle} onChange={(e) => setCta({ ...cta, secondaryTitle: e.target.value })} />
          </FormField>
          <FormField label="Secondary description">
            <textarea rows={2} value={cta.secondaryDescription} onChange={(e) => setCta({ ...cta, secondaryDescription: e.target.value })} />
          </FormField>
        </Card>
      )}

      <SaveBar saving={saving} message={message} canSave={can("home:write")} onSave={saveCurrent} />
    </>
  );
}
