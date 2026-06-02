import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";
import { getSessionFromRequest } from "@/lib/auth";
import { getAdminById, upsertAdmin, deleteAdmin, getRoles, getAdminByEmail } from "@/lib/db";
import { getAdminAuth } from "@/lib/firebase-admin";
import { requirePermission } from "@/lib/rbac";
import { initializeApp } from "@/lib/seed";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  roleId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initializeApp();
  const session = await getSessionFromRequest(request);
  const check = requirePermission(session, "admins:write");
  if (!check.ok) return jsonError(check.message, check.status);

  const { id } = await params;
  const body = await request.json();
  const parsed = parseBody(updateSchema, body);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const current = await getAdminById(id);
  if (!current) return jsonError("Admin not found", 404);

  if (parsed.data.roleId) {
    const roles = await getRoles();
    if (!roles.find((r) => r.id === parsed.data.roleId)) {
      return jsonError("Invalid role", 400);
    }
  }

  if (parsed.data.email) {
    const dup = await getAdminByEmail(parsed.data.email);
    if (dup && dup.id !== id) return jsonError("Email already exists", 409);
  }

  try {
    const authUpdate: { email?: string; password?: string; displayName?: string; disabled?: boolean } = {};
    if (parsed.data.email) authUpdate.email = parsed.data.email;
    if (parsed.data.password) authUpdate.password = parsed.data.password;
    if (parsed.data.name) authUpdate.displayName = parsed.data.name;
    if (parsed.data.isActive !== undefined) authUpdate.disabled = !parsed.data.isActive;

    if (Object.keys(authUpdate).length > 0) {
      await getAdminAuth().updateUser(id, authUpdate);
    }

    const updated = {
      ...current,
      name: parsed.data.name ?? current.name,
      email: (parsed.data.email ?? current.email).toLowerCase(),
      roleId: parsed.data.roleId ?? current.roleId,
      isActive: parsed.data.isActive ?? current.isActive,
      updatedAt: new Date().toISOString(),
    };

    await upsertAdmin(updated);
    return jsonOk({ admin: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return jsonError(message, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initializeApp();
  const session = await getSessionFromRequest(request);
  const check = requirePermission(session, "admins:write");
  if (!check.ok) return jsonError(check.message, check.status);

  const { id } = await params;
  if (session?.sub === id) {
    return jsonError("Cannot delete your own account", 400);
  }

  const admin = await getAdminById(id);
  if (!admin) return jsonError("Admin not found", 404);

  try {
    await getAdminAuth().deleteUser(id);
    await deleteAdmin(id);
    return jsonOk({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed";
    return jsonError(message, 500);
  }
}
