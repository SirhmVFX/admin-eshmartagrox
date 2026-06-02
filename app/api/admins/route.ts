import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";
import { getSessionFromRequest } from "@/lib/auth";
import { getAdmins, upsertAdmin, getRoles, getAdminByEmail } from "@/lib/db";
import { getAdminAuth } from "@/lib/firebase-admin";
import { requirePermission } from "@/lib/rbac";
import { initializeApp } from "@/lib/seed";
import type { AdminUser, PublicAdmin } from "@/lib/types";

function toPublic(admin: AdminUser): PublicAdmin {
  return admin;
}

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  roleId: z.string(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  await initializeApp();
  const session = await getSessionFromRequest(request);
  const check = requirePermission(session, "admins:read");
  if (!check.ok) return jsonError(check.message, check.status);

  const admins = await getAdmins();
  return jsonOk({ admins: admins.map(toPublic) });
}

export async function POST(request: NextRequest) {
  await initializeApp();
  const session = await getSessionFromRequest(request);
  const check = requirePermission(session, "admins:write");
  if (!check.ok) return jsonError(check.message, check.status);

  const body = await request.json();
  const parsed = parseBody(createSchema, body);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const roles = await getRoles();
  if (!roles.find((r) => r.id === parsed.data.roleId)) {
    return jsonError("Invalid role", 400);
  }

  const existing = await getAdminByEmail(parsed.data.email);
  if (existing) return jsonError("Email already exists", 409);

  try {
    const userRecord = await getAdminAuth().createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      displayName: parsed.data.name,
    });

    const now = new Date().toISOString();
    const newAdmin: AdminUser = {
      id: userRecord.uid,
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      roleId: parsed.data.roleId,
      isActive: parsed.data.isActive ?? true,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await upsertAdmin(newAdmin);
    return jsonOk({ admin: toPublic(newAdmin) }, 201);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create admin";
    return jsonError(message, 500);
  }
}
