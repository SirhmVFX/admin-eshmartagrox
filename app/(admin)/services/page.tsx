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
import type { ServicesContent, Service } from "@/lib/types";

export default function ServicesPage() {
  const { content, loading, saving, message, saveSection } = useContent();
  const { can } = useAuth();
  const [data, setData] = useState<ServicesContent | null>(null);

  useEffect(() => {
    if (content) setData(JSON.parse(JSON.stringify(content.services)));
  }, [content]);

  if (loading || !data) return <p className="text-gray-500">Loading...</p>;

  const addService = () => {
    const svc: Service = {
      id: `svc-${Date.now()}`,
      title: "New Service",
      duration: "30 minutes",
      price: "₦0",
      image: "/service1.jpg",
      description: "",
      bookLabel: "Book Now",
      bookHref: "/book-online",
      isPublished: true,
      sortOrder: data.services.length + 1,
    };
    setData({ ...data, services: [...data.services, svc] });
  };

  return (
    <>
      <AdminHeader
        title="Book Online Services"
        description="Services shown on the book-online page."
        actions={
          can("services:write") && (
            <Button variant="secondary" onClick={addService}>
              <Plus className="h-4 w-4" /> Add service
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
      {data.services.map((svc, i) => (
        <Card key={svc.id} title={svc.title} className="mt-4">
          <FormGrid>
            <FormField label="Title">
              <input
                value={svc.title}
                onChange={(e) => {
                  const services = [...data.services];
                  services[i] = { ...svc, title: e.target.value };
                  setData({ ...data, services });
                }}
              />
            </FormField>
            <FormField label="Duration">
              <input
                value={svc.duration}
                onChange={(e) => {
                  const services = [...data.services];
                  services[i] = { ...svc, duration: e.target.value };
                  setData({ ...data, services });
                }}
              />
            </FormField>
            <FormField label="Price">
              <input
                value={svc.price}
                onChange={(e) => {
                  const services = [...data.services];
                  services[i] = { ...svc, price: e.target.value };
                  setData({ ...data, services });
                }}
              />
            </FormField>
          </FormGrid>
          <FormField label="Description">
            <textarea
              rows={2}
              value={svc.description}
              onChange={(e) => {
                const services = [...data.services];
                services[i] = { ...svc, description: e.target.value };
                setData({ ...data, services });
              }}
            />
          </FormField>
          <ImageUpload
            value={svc.image}
            onChange={(v) => {
              const services = [...data.services];
              services[i] = { ...svc, image: v };
              setData({ ...data, services });
            }}
          />
          {can("services:write") && (
            <Button
              variant="danger"
              className="mt-2"
              onClick={() =>
                setData({ ...data, services: data.services.filter((x) => x.id !== svc.id) })
              }
            >
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          )}
        </Card>
      ))}
      <SaveBar
        saving={saving}
        message={message}
        canSave={can("services:write")}
        onSave={() => saveSection("services", data)}
      />
    </>
  );
}
