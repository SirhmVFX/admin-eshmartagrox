"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Card } from "@/components/ui/Card";
import { FormField, FormGrid } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useContent } from "@/lib/hooks/useContent";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Product, ShopContent } from "@/lib/types";

function newProduct(): Product {
  return {
    id: `prod-${Date.now()}`,
    name: "New Product",
    price: 0,
    category: "Okra",
    priceRange: "NGN 8-35",
    length: null,
    quantity: null,
    size: null,
    weight: null,
    image: "/product1.jpg",
    isPublished: true,
    sortOrder: 99,
  };
}

export default function ShopPage() {
  const { content, loading, saving, message, saveSection } = useContent();
  const { can } = useAuth();
  const [shop, setShop] = useState<ShopContent | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (content) setShop(JSON.parse(JSON.stringify(content.shop)));
  }, [content]);

  if (loading || !shop) return <p className="text-gray-500">Loading...</p>;

  const editing = shop.products.find((p) => p.id === editingId);

  const updateProduct = (id: string, patch: Partial<Product>) => {
    setShop({
      ...shop,
      products: shop.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  };

  return (
    <>
      <AdminHeader
        title="Shop & Products"
        description="Manage products, shop banner, and filter options."
        actions={
          can("shop:write") && (
            <Button
              variant="secondary"
              onClick={() => {
                const p = newProduct();
                setShop({ ...shop, products: [...shop.products, p] });
                setEditingId(p.id);
              }}
            >
              <Plus className="h-4 w-4" /> Add product
            </Button>
          )
        }
      />

      <Card title="Shop banner">
        <FormGrid>
          <FormField label="Banner title">
            <input
              value={shop.bannerTitle}
              onChange={(e) => setShop({ ...shop, bannerTitle: e.target.value })}
            />
          </FormField>
          <ImageUpload
            value={shop.bannerImage}
            onChange={(v) => setShop({ ...shop, bannerImage: v })}
            label="Banner image"
          />
        </FormGrid>
      </Card>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card title="Products" className="lg:col-span-1">
          <ul className="space-y-2 max-h-[500px] overflow-y-auto">
            {shop.products
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setEditingId(p.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      editingId === p.id ? "bg-green-100 text-green-900" : "hover:bg-gray-50"
                    }`}
                  >
                    {p.name}
                    {!p.isPublished && (
                      <span className="ml-2 text-xs text-gray-400">(draft)</span>
                    )}
                  </button>
                </li>
              ))}
          </ul>
        </Card>

        {editing && (
          <Card title="Edit product" className="lg:col-span-2">
            <FormGrid>
              <FormField label="Name">
                <input
                  value={editing.name}
                  onChange={(e) => updateProduct(editing.id, { name: e.target.value })}
                />
              </FormField>
              <FormField label="Price">
                <input
                  type="number"
                  step="0.01"
                  value={editing.price}
                  onChange={(e) =>
                    updateProduct(editing.id, { price: parseFloat(e.target.value) || 0 })
                  }
                />
              </FormField>
              <FormField label="Category">
                <select
                  value={editing.category}
                  onChange={(e) => updateProduct(editing.id, { category: e.target.value })}
                >
                  {["Okra", "Ugu", "Packaging"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Price range label">
                <input
                  value={editing.priceRange}
                  onChange={(e) => updateProduct(editing.id, { priceRange: e.target.value })}
                />
              </FormField>
              <FormField label="Quantity">
                <input
                  value={editing.quantity ?? ""}
                  onChange={(e) =>
                    updateProduct(editing.id, { quantity: e.target.value || null })
                  }
                />
              </FormField>
              <FormField label="Size">
                <input
                  value={editing.size ?? ""}
                  onChange={(e) => updateProduct(editing.id, { size: e.target.value || null })}
                />
              </FormField>
              <FormField label="Weight">
                <input
                  value={editing.weight ?? ""}
                  onChange={(e) => updateProduct(editing.id, { weight: e.target.value || null })}
                />
              </FormField>
              <FormField label="Length">
                <input
                  value={editing.length ?? ""}
                  onChange={(e) => updateProduct(editing.id, { length: e.target.value || null })}
                />
              </FormField>
            </FormGrid>
            <ImageUpload
              value={editing.image}
              onChange={(v) => updateProduct(editing.id, { image: v })}
            />
            <label className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.isPublished}
                onChange={(e) => updateProduct(editing.id, { isPublished: e.target.checked })}
              />
              Published
            </label>
            {can("shop:write") && (
              <Button
                variant="danger"
                className="mt-4"
                onClick={() => {
                  setShop({
                    ...shop,
                    products: shop.products.filter((p) => p.id !== editing.id),
                  });
                  setEditingId(null);
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete product
              </Button>
            )}
          </Card>
        )}
      </div>

      <SaveBar
        saving={saving}
        message={message}
        canSave={can("shop:write")}
        onSave={() => saveSection("shop", shop)}
      />
    </>
  );
}
