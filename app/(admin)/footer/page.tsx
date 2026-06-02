"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useContent } from "@/lib/hooks/useContent";
import { useAuth } from "@/lib/hooks/useAuth";
import type { FooterContent } from "@/lib/types";

export default function FooterPage() {
  const { content, loading, saving, message, saveSection } = useContent();
  const { can } = useAuth();
  const [footer, setFooter] = useState<FooterContent | null>(null);

  useEffect(() => {
    if (content) setFooter(JSON.parse(JSON.stringify(content.footer)));
  }, [content]);

  if (loading || !footer) return <p className="text-gray-500">Loading...</p>;

  return (
    <>
      <AdminHeader title="Footer" description="Footer columns, links, and social." />
      <Card title="Copyright">
        <FormField label="Copyright text">
          <input value={footer.copyright} onChange={(e) => setFooter({ ...footer, copyright: e.target.value })} />
        </FormField>
      </Card>
      {footer.columns.map((col, ci) => (
        <Card key={col.id} title={`Column: ${col.title}`} className="mt-6">
          <FormField label="Column title">
            <input
              value={col.title}
              onChange={(e) => {
                const columns = [...footer.columns];
                columns[ci] = { ...col, title: e.target.value };
                setFooter({ ...footer, columns });
              }}
            />
          </FormField>
          {col.links.map((link, li) => (
            <div key={li} className="mt-2 flex gap-2">
              <input
                placeholder="Label"
                value={link.label}
                onChange={(e) => {
                  const columns = [...footer.columns];
                  const links = [...col.links];
                  links[li] = { ...link, label: e.target.value };
                  columns[ci] = { ...col, links };
                  setFooter({ ...footer, columns });
                }}
              />
              <input
                placeholder="URL"
                value={link.href}
                onChange={(e) => {
                  const columns = [...footer.columns];
                  const links = [...col.links];
                  links[li] = { ...link, href: e.target.value };
                  columns[ci] = { ...col, links };
                  setFooter({ ...footer, columns });
                }}
              />
              <Button
                variant="ghost"
                onClick={() => {
                  const columns = [...footer.columns];
                  columns[ci] = { ...col, links: col.links.filter((_, i) => i !== li) };
                  setFooter({ ...footer, columns });
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button
            variant="secondary"
            className="mt-2"
            onClick={() => {
              const columns = [...footer.columns];
              columns[ci] = { ...col, links: [...col.links, { label: "Link", href: "/" }] };
              setFooter({ ...footer, columns });
            }}
          >
            <Plus className="h-4 w-4" /> Add link
          </Button>
        </Card>
      ))}
      <Card title="Social links" className="mt-6">
        {footer.socialLinks.map((s, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <input
              placeholder="Platform"
              value={s.platform}
              onChange={(e) => {
                const socialLinks = [...footer.socialLinks];
                socialLinks[i] = { ...s, platform: e.target.value };
                setFooter({ ...footer, socialLinks });
              }}
            />
            <input
              placeholder="URL"
              value={s.url}
              onChange={(e) => {
                const socialLinks = [...footer.socialLinks];
                socialLinks[i] = { ...s, url: e.target.value };
                setFooter({ ...footer, socialLinks });
              }}
            />
          </div>
        ))}
        <Button
          variant="secondary"
          onClick={() =>
            setFooter({
              ...footer,
              socialLinks: [...footer.socialLinks, { platform: "New", url: "" }],
            })
          }
        >
          <Plus className="h-4 w-4" /> Add social
        </Button>
      </Card>
      <SaveBar
        saving={saving}
        message={message}
        canSave={can("footer:write")}
        onSave={() => saveSection("footer", footer)}
      />
    </>
  );
}
