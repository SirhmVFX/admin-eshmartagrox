"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SaveBar } from "@/components/admin/SaveBar";
import { Card } from "@/components/ui/Card";
import { FormField, FormGrid } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useContent } from "@/lib/hooks/useContent";
import { useAuth } from "@/lib/hooks/useAuth";
import type { TrackOrderContent, Order } from "@/lib/types";

export default function OrdersPage() {
  const { content, loading, saving, message, saveSection } = useContent();
  const { can } = useAuth();
  const [data, setData] = useState<TrackOrderContent | null>(null);

  useEffect(() => {
    if (content) setData(JSON.parse(JSON.stringify(content.trackOrder)));
  }, [content]);

  if (loading || !data) return <p className="text-gray-500">Loading...</p>;

  const addOrder = () => {
    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `EA-${Date.now()}`,
      customerName: "",
      customerEmail: "",
      status: "pending",
      items: [],
      total: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData({ ...data, orders: [...data.orders, order] });
  };

  return (
    <>
      <AdminHeader
        title="Orders"
        description="Manage orders for the track-my-order page."
        actions={
          can("orders:write") && (
            <Button variant="secondary" onClick={addOrder}>
              <Plus className="h-4 w-4" /> Add order
            </Button>
          )
        }
      />
      <Card>
        <FormField label="Page title">
          <input value={data.pageTitle} onChange={(e) => setData({ ...data, pageTitle: e.target.value })} />
        </FormField>
        <FormField label="Page description">
          <textarea
            rows={2}
            value={data.pageDescription}
            onChange={(e) => setData({ ...data, pageDescription: e.target.value })}
          />
        </FormField>
      </Card>
      {data.orders.map((order, i) => (
        <Card key={order.id} title={`Order ${order.orderNumber}`} className="mt-4">
          <FormGrid>
            <FormField label="Order number">
              <input
                value={order.orderNumber}
                onChange={(e) => {
                  const orders = [...data.orders];
                  orders[i] = { ...order, orderNumber: e.target.value };
                  setData({ ...data, orders });
                }}
              />
            </FormField>
            <FormField label="Status">
              <select
                value={order.status}
                onChange={(e) => {
                  const orders = [...data.orders];
                  orders[i] = {
                    ...order,
                    status: e.target.value as Order["status"],
                    updatedAt: new Date().toISOString(),
                  };
                  setData({ ...data, orders });
                }}
              >
                {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Customer name">
              <input
                value={order.customerName}
                onChange={(e) => {
                  const orders = [...data.orders];
                  orders[i] = { ...order, customerName: e.target.value };
                  setData({ ...data, orders });
                }}
              />
            </FormField>
            <FormField label="Customer email">
              <input
                value={order.customerEmail}
                onChange={(e) => {
                  const orders = [...data.orders];
                  orders[i] = { ...order, customerEmail: e.target.value };
                  setData({ ...data, orders });
                }}
              />
            </FormField>
            <FormField label="Total">
              <input
                type="number"
                value={order.total}
                onChange={(e) => {
                  const orders = [...data.orders];
                  orders[i] = { ...order, total: parseFloat(e.target.value) || 0 };
                  setData({ ...data, orders });
                }}
              />
            </FormField>
          </FormGrid>
        </Card>
      ))}
      <SaveBar
        saving={saving}
        message={message}
        canSave={can("orders:write")}
        onSave={() => saveSection("trackOrder", data)}
      />
    </>
  );
}
