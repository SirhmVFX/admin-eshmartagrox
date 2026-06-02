"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useContent } from "@/lib/hooks/useContent";
import { useAuth } from "@/lib/hooks/useAuth";
import type { PortfolioContent, PortfolioItem } from "@/lib/types";

export default function PortfolioPage() {
  const { content, loading, saving, message, saveSection } = useContent();
  const { can } = useAuth();
  const [data, setData] = useState<PortfolioContent | null>(null);

  useEffect(() => {
    if (content) setData(JSON.parse(JSON.stringify(content.portfolio)));
  }, [content]);

  if (loading || !data) return <p className="text-gray-500">Loading...</p>;

  const addItem = () => {
    const item: PortfolioItem = {
      id: `port-${Date.now()}`,
      title: "New Project",
      description: "",
      image: "/project1.jpg",
      sortOrder: data.items.length + 1,
      isPublished: true,
    };
    setData({ ...data, items: [...data.items, item] });
  };

  return (
    <>
      <AdminHeader
        title="Portfolio"
        description="Case studies and project gallery."
        actions={
          can("portfolio:write") && (
            <Button variant="secondary" onClick={addItem}>
              <Plus className="h-4 w-4" /> Add item
            </Button>
          )
        }
      />
      <Card>
        <FormField label="Page title">
          <input value={data.pageTitle} onChange={(e) => setData({ ...data, pageTitle: e.target.value })} />
        </FormField>
        <FormField label="Page subtitle">
          <input value={data.pageSubtitle} onChange={(e) => setData({ ...data, pageSubtitle: e.target.value })} />
        </FormField>
      </Card>
      {data.items.map((item, i) => (
        <Card key={item.id} title={item.title} className="mt-4">
          <FormField label="Title">
            <input
              value={item.title}
              onChange={(e) => {
                const items = [...data.items];
                items[i] = { ...item, title: e.target.value };
                setData({ ...data, items });
              }}
            />
          </FormField>
          <FormField label="Description">
            <textarea
              rows={2}
              value={item.description}
              onChange={(e) => {
                const items = [...data.items];
                items[i] = { ...item, description: e.target.value };
                setData({ ...data, items });
              }}
            />
          </FormField>
          <ImageUpload
            value={item.image}
            onChange={(v) => {
              const items = [...data.items];
              items[i] = { ...item, image: v };
              setData({ ...data, items });
            }}
          />
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={item.isPublished}
              onChange={(e) => {
                const items = [...data.items];
                items[i] = { ...item, isPublished: e.target.checked };
                setData({ ...data, items });
              }}
            />
            Published
          </label>
          {can("portfolio:write") && (
            <Button
              variant="danger"
              className="mt-2"
              onClick={() => setData({ ...data, items: data.items.filter((x) => x.id !== item.id) })}
            >
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          )}
        </Card>
      ))}
      <SaveBar
        saving={saving}
        message={message}
        canSave={can("portfolio:write")}
        onSave={() => saveSection("portfolio", data)}
      />
    </>
  );
}
