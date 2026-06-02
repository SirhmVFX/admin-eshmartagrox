import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk, newId, parseBody } from "@/lib/api-utils";
import { getSessionFromRequest } from "@/lib/auth";
import { getRoles, upsertRole } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import { initializeApp } from "@/lib/seed";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import type { Permission, Role } from "@/lib/types";

const permissionSchema = z
  .array(z.string())
  .refine(
    (arr) => arr.every((p) => ALL_PERMISSIONS.includes(p as Permission)),
    "Invalid permission"
  )
  .transform((arr) => arr as Permission[]);

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string(),
  permissions: permissionSchema,
});

export async function GET(request: NextRequest) {
  await initializeApp();
  const session = await getSessionFromRequest(request);
  const check = requirePermission(session, "roles:read");
  if (!check.ok) return jsonError(check.message, check.status);

  const roles = await getRoles();
  return jsonOk({ roles });
}

export async function POST(request: NextRequest) {
  await initializeApp();
  const session = await getSessionFromRequest(request);
  const check = requirePermission(session, "roles:write");
  if (!check.ok) return jsonError(check.message, check.status);

  const body = await request.json();
  const parsed = parseBody(createSchema, body);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const roles = await getRoles();
  if (roles.some((r) => r.name.toLowerCase() === parsed.data.name.toLowerCase())) {
    return jsonError("Role name already exists", 409);
  }

  const now = new Date().toISOString();
  const role: Role = {
    id: newId("role"),
    name: parsed.data.name,
    description: parsed.data.description,
    permissions: parsed.data.permissions,
    createdAt: now,
    updatedAt: now,
  };

  await upsertRole(role);
  return jsonOk({ role }, 201);
}
