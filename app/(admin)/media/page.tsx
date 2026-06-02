"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useAuth } from "@/lib/hooks/useAuth";

export default function MediaPage() {
  const { can } = useAuth();
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [uploadUrl, setUploadUrl] = useState("");

  const load = async () => {
    const res = await fetch("/api/upload");
    if (res.ok) {
      const data = await res.json();
      setFiles(data.files ?? []);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <AdminHeader
        title="Media Library"
        description="Upload images for use across the site. Copy URLs into content fields."
      />
      {can("media:write") && (
        <Card title="Upload new image" className="mb-6">
          <ImageUpload
            value={uploadUrl}
            onChange={(v) => {
              setUploadUrl(v);
              load();
            }}
          />
        </Card>
      )}
      <Card title="Uploaded files">
        {files.length === 0 ? (
          <p className="text-sm text-gray-500">No uploads yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {files.map((f) => (
              <div key={f.name} className="rounded-lg border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={f.name} className="h-20 w-full rounded object-cover" />
                <p className="mt-1 truncate text-xs text-gray-500">{f.name}</p>
                <input
                  readOnly
                  className="mt-1 text-xs"
                  value={f.url}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
