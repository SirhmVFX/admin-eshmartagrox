import { getAdminById, getRoleById } from "./db";
import type { Permission, SessionPayload } from "./types";
import { hasPermission } from "./permissions";

export async function getPermissionsForRole(
  roleId: string
): Promise<Permission[]> {
  const role = await getRoleById(roleId);
  return role?.permissions ?? [];
}

export function requirePermission(
  session: SessionPayload | null,
  permission: Permission
): { ok: true } | { ok: false; status: number; message: string } {
  if (!session) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }
  if (!hasPermission(session.permissions, permission)) {
    return { ok: false, status: 403, message: "Forbidden" };
  }
  return { ok: true };
}

export async function buildSessionForAdmin(
  adminId: string,
  email: string,
  name: string,
  roleId: string
): Promise<SessionPayload> {
  const permissions = await getPermissionsForRole(roleId);
  return { sub: adminId, email, name, roleId, permissions };
}

export async function getAdminByEmail(email: string) {
  const { getAdminByEmail: lookup } = await import("./db");
  return lookup(email);
}

export async function resolveSessionFromUid(uid: string): Promise<SessionPayload | null> {
  const admin = await getAdminById(uid);
  if (!admin || !admin.isActive) return null;
  return buildSessionForAdmin(admin.id, admin.email, admin.name, admin.roleId);
}
