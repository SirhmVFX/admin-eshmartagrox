"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useContent } from "@/lib/hooks/useContent";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  ShoppingBag,
  FileText,
  Users,
  Package,
  ExternalLink,
  Database,
} from "lucide-react";

export default function DashboardPage() {
  const { content, loading, load } = useContent();
  const { user, can } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSeed = async () => {
    if (!confirm("This will overwrite all current content with demo data. Continue?")) return;
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Seed failed");
      setSeedMsg({ type: "success", text: `Content seeded successfully (v${data.version})` });
      load();
    } catch (e) {
      setSeedMsg({ type: "error", text: e instanceof Error ? e.message : "Seed failed" });
    } finally {
      setSeeding(false);
    }
  };

  const stats = content
    ? [
      { label: "Products", value: content.shop.products.length, href: "/shop" },
      { label: "Blog posts", value: content.blog.posts.length, href: "/blog" },
      { label: "Portfolio items", value: content.portfolio.items.length, href: "/portfolio" },
      { label: "Orders", value: content.trackOrder.orders.length, href: "/orders" },
    ]
    : [];

  return (
    <>
      <AdminHeader
        title={`Welcome, ${user?.name ?? "Admin"}`}
        description="Manage all content for the Eshmart Agrox client website."
        actions={
          <div className="flex gap-2">
            {can("site:write") && (
              <Button variant="secondary" onClick={handleSeed} disabled={seeding}>
                <Database className="h-4 w-4" />
                {seeding ? "Seeding..." : "Seed Demo Content"}
              </Button>
            )}
            <a
              href={process.env.NEXT_PUBLIC_CLIENT_URL ?? "http://localhost:3000"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-2 text-sm text-green-900 hover:bg-green-50"
            >
              <ExternalLink className="h-4 w-4" />
              View live site
            </a>
          </div>
        }
      />

      {seedMsg && (
        <div className="mb-4">
          <Alert type={seedMsg.type === "success" ? "success" : "error"}>{seedMsg.text}</Alert>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-green-100" />
          ))
          : stats.map((s) => (
            <Link key={s.label} href={s.href}>
              <Card>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-3xl font-bold text-green-900">{s.value}</p>
              </Card>
            </Link>
          ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card title="Quick links" description="Jump to common editing tasks">
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/shop" className="flex items-center gap-2 text-green-800 hover:underline">
                <ShoppingBag className="h-4 w-4" /> Manage products
              </Link>
            </li>
            <li>
              <Link href="/home" className="flex items-center gap-2 text-green-800 hover:underline">
                Edit home page
              </Link>
            </li>
            <li>
              <Link href="/blog" className="flex items-center gap-2 text-green-800 hover:underline">
                <FileText className="h-4 w-4" /> Blog posts
              </Link>
            </li>
            <li>
              <Link href="/admins" className="flex items-center gap-2 text-green-800 hover:underline">
                <Users className="h-4 w-4" /> Admin users & roles
              </Link>
            </li>
            <li>
              <Link href="/orders" className="flex items-center gap-2 text-green-800 hover:underline">
                <Package className="h-4 w-4" /> Track orders
              </Link>
            </li>
          </ul>
        </Card>
        <Card title="Setup guide" description="How to get started">
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong className="text-green-900">1. Add Firebase credentials</strong> — fill in both{" "}
              <code className="rounded bg-gray-100 px-1">.env.local</code> files with your Firebase project keys.
            </p>
            <p>
              <strong className="text-green-900">2. Create admin user</strong> — add a user in Firebase Auth console, then create{" "}
              <code className="rounded bg-gray-100 px-1">admins/&#123;uid&#125;</code> in Firestore with{" "}
              <code className="rounded bg-gray-100 px-1">roleId: &#39;role-super-admin&#39;</code>.
            </p>
            <p>
              <strong className="text-green-900">3. Seed content</strong> — click <code className="rounded bg-gray-100 px-1">Seed Demo Content</code> above to populate Firestore with sample data.
            </p>
            <p>
              <strong className="text-green-900">4. Run storefront</strong> — start the storefront app on port 3000. It reads content from Firestore automatically.
            </p>
          </div>
          {content && (
            <p className="mt-3 text-xs text-gray-500">
              Last updated: {new Date(content.updatedAt).toLocaleString()} (v{content.version})
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
