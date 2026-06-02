"use client";

import { useCallback, useEffect, useState } from "react";
import type { ContentSection, SiteContent } from "@/lib/types";

export function useContent() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveSection = async <K extends ContentSection>(
    section: K,
    data: SiteContent[K]
  ) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/content/${section}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Save failed");
      }
      const result = await res.json();
      setContent((prev) =>
        prev ? { ...prev, [section]: result.data, updatedAt: result.updatedAt } : prev
      );
      setMessage({ type: "success", text: "Saved successfully" });
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Save failed",
      });
    } finally {
      setSaving(false);
    }
  };

  return { content, loading, saving, message, load, saveSection, setMessage };
}
