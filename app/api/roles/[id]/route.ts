import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";
import { getSessionFromRequest } from "@/lib/auth";
import { upsertRole, deleteRole, getAdmins, getRoleById } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import { initializeApp } from "@/lib/seed";
import { ALL_PERMISSIONS } from "@/lib/permissions";
import type { Permission } from "@/lib/types";

const permissionSchema = z
  .array(z.string())
  .refine(
    (arr) => arr.every((p) => ALL_PERMISSIONS.includes(p as Permission)),
    "Invalid permission"
  )
  .transform((arr) => arr as Permission[]);

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  permissions: permissionSchema.optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initializeApp();
  const session = await getSessionFromRequest(request);
  const check = requirePermission(session, "roles:write");
  if (!check.ok) return jsonError(check.message, check.status);

  const { id } = await params;
  const body = await request.json();
  const parsed = parseBody(updateSchema, body);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const current = await getRoleById(id);
  if (!current) return jsonError("Role not found", 404);

  if (current.isSystem && parsed.data.permissions) {
    return jsonError("Cannot change permissions of system roles", 400);
  }

  const updated = {
    ...current,
    name: parsed.data.name ?? current.name,
    description: parsed.data.description ?? current.description,
    permissions: parsed.data.permissions ?? current.permissions,
    updatedAt: new Date().toISOString(),
  };

  await upsertRole(updated);
  return jsonOk({ role: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initializeApp();
  const session = await getSessionFromRequest(request);
  const check = requirePermission(session, "roles:write");
  if (!check.ok) return jsonError(check.message, check.status);

  const { id } = await params;
  const role = await getRoleById(id);
  if (!role) return jsonError("Role not found", 404);
  if (role.isSystem) return jsonError("Cannot delete system roles", 400);

  const admins = await getAdmins();
  if (admins.some((a) => a.roleId === id)) {
    return jsonError("Role is assigned to admins. Reassign them first.", 400);
  }

  await deleteRole(id);
  return jsonOk({ success: true });
}
