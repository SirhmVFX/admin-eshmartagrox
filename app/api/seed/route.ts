import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { withCors, corsHeaders } from "@/lib/cors";
import { getSessionFromRequest } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { saveSiteContent } from "@/lib/db";
import { seedSiteContent } from "@/lib/seed-content";
import { initializeApp } from "@/lib/seed";

export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get("origin");
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: NextRequest) {
    await initializeApp();
    const origin = request.headers.get("origin");
    const session = await getSessionFromRequest(request);
    const check = requirePermission(session, "site:write");
    if (!check.ok) {
        return withCors(jsonError(check.message, check.status), origin);
    }

    try {
        const saved = await saveSiteContent(seedSiteContent);
        return withCors(jsonOk({ message: "Content seeded successfully", version: saved.version }), origin);
    } catch (err) {
        return withCors(jsonError("Seed failed: " + String(err), 500), origin);
    }
}
