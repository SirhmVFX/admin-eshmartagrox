import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { withCors, corsHeaders } from "@/lib/cors";
import { getSiteContent, saveSiteContent } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { initializeApp } from "@/lib/seed";
import type { SiteContent } from "@/lib/types";

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(request: NextRequest) {
  await initializeApp();
  const origin = request.headers.get("origin");
  const content = await getSiteContent();
  const res = jsonOk(content);
  return withCors(res, origin);
}

export async function PUT(request: NextRequest) {
  await initializeApp();
  const origin = request.headers.get("origin");
  const session = await getSessionFromRequest(request);
  const check = requirePermission(session, "site:write");
  if (!check.ok) {
    const res = jsonError(check.message, check.status);
    return withCors(res, origin);
  }

  try {
    const body = (await request.json()) as SiteContent;
    const saved = await saveSiteContent(body);
    const res = jsonOk(saved);
    return withCors(res, origin);
  } catch {
    const res = jsonError("Failed to save content", 500);
    return withCors(res, origin);
  }
}
