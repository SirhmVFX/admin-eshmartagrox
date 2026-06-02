import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { withCors, corsHeaders } from "@/lib/cors";
import { getSiteContent, saveSiteContent } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { initializeApp } from "@/lib/seed";
import type { ContentSection, Permission, SiteContent } from "@/lib/types";

const SECTION_PERMISSION: Record<ContentSection, Permission> = {
  settings: "site:write",
  navigation: "navigation:write",
  hero: "home:write",
  homeFeatures: "home:write",
  homeQuality: "home:write",
  callToAction: "home:write",
  footer: "footer:write",
  shop: "shop:write",
  portfolio: "portfolio:write",
  services: "services:write",
  blog: "blog:write",
  trackOrder: "orders:write",
};

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  await initializeApp();
  const origin = request.headers.get("origin");
  const { section } = await params;
  const content = await getSiteContent();

  if (!(section in content) || section === "version" || section === "updatedAt") {
    const res = jsonError("Section not found", 404);
    return withCors(res, origin);
  }

  const res = jsonOk({
    section,
    data: content[section as ContentSection],
    updatedAt: content.updatedAt,
  });
  return withCors(res, origin);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  await initializeApp();
  const origin = request.headers.get("origin");
  const { section } = await params;
  const session = await getSessionFromRequest(request);

  if (!(section in SECTION_PERMISSION)) {
    const res = jsonError("Invalid section", 400);
    return withCors(res, origin);
  }

  const perm = SECTION_PERMISSION[section as ContentSection];
  const check = requirePermission(session, perm);
  if (!check.ok) {
    const res = jsonError(check.message, check.status);
    return withCors(res, origin);
  }

  try {
    const body = await request.json();
    const content = await getSiteContent();
    const key = section as ContentSection;
    const updated: SiteContent = {
      ...content,
      [key]: body,
    };
    const saved = await saveSiteContent(updated);
    const res = jsonOk({
      section,
      data: saved[key],
      updatedAt: saved.updatedAt,
    });
    return withCors(res, origin);
  } catch {
    const res = jsonError("Failed to update section", 500);
    return withCors(res, origin);
  }
}
