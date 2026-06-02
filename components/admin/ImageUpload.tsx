"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";

const MAX_SIZE = 8 * 1024 * 1024; // 8MB

async function uploadToCloudinary(file: File, folder: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary environment variables.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed.");
  }

  return data.secure_url as string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Image URL",
  folder = "eshmartagrox",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Max file size is 8MB");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const url = await uploadToCloudinary(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-2">
      <label>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste URL or upload below"
      />
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg border border-green-200 px-3 py-2 text-sm hover:bg-green-50 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading ? `Uploading...` : "Upload image (max 8MB)"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {/* always show a preview; use placeholder when empty */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={value || "/placeholder.svg"} alt="Preview" className="mt-2 h-24 w-24 rounded object-cover border" />
    </div>
  );
}
