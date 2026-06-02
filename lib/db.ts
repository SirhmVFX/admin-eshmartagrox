import { getAdminDb } from "./firebase-admin";
import type { AdminUser, Role, SiteContent } from "./types";
import { defaultSiteContent } from "./content-defaults";

const CONTENT_PATH = { collection: "config", doc: "siteContent" } as const;
const ROLES_COLLECTION = "roles";
const ADMINS_COLLECTION = "admins";

export async function getSiteContent(): Promise<SiteContent> {
  const db = getAdminDb();
  const snap = await db
    .collection(CONTENT_PATH.collection)
    .doc(CONTENT_PATH.doc)
    .get();

  if (snap.exists) {
    return snap.data() as SiteContent;
  }

  await saveSiteContent(defaultSiteContent);
  return defaultSiteContent;
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  const db = getAdminDb();
  const updated: SiteContent = {
    ...content,
    version: (content.version ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };

  await db
    .collection(CONTENT_PATH.collection)
    .doc(CONTENT_PATH.doc)
    .set(updated, { merge: false });

  return updated;
}

export async function getRoles(): Promise<Role[]> {
  const db = getAdminDb();
  const snap = await db.collection(ROLES_COLLECTION).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Role));
}

export async function saveRoles(roles: Role[]): Promise<void> {
  const db = getAdminDb();
  const batch = db.batch();
  const existing = await db.collection(ROLES_COLLECTION).get();
  existing.docs.forEach((d) => batch.delete(d.ref));
  roles.forEach((role) => {
    const { id, ...data } = role;
    batch.set(db.collection(ROLES_COLLECTION).doc(id), data);
  });
  await batch.commit();
}

export async function getRoleById(roleId: string): Promise<Role | null> {
  const db = getAdminDb();
  const snap = await db.collection(ROLES_COLLECTION).doc(roleId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as Role;
}

export async function upsertRole(role: Role): Promise<void> {
  const db = getAdminDb();
  const { id, ...data } = role;
  await db.collection(ROLES_COLLECTION).doc(id).set(data, { merge: true });
}

export async function deleteRole(roleId: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(ROLES_COLLECTION).doc(roleId).delete();
}

export async function getAdmins(): Promise<AdminUser[]> {
  const db = getAdminDb();
  const snap = await db.collection(ADMINS_COLLECTION).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminUser));
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  const db = getAdminDb();
  const snap = await db.collection(ADMINS_COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as AdminUser;
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const db = getAdminDb();
  const snap = await db
    .collection(ADMINS_COLLECTION)
    .where("email", "==", email.toLowerCase())
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as AdminUser;
}

export async function upsertAdmin(admin: AdminUser): Promise<void> {
  const db = getAdminDb();
  const { id, ...data } = admin;
  await db
    .collection(ADMINS_COLLECTION)
    .doc(id)
    .set(
      {
        ...data,
        email: data.email.toLowerCase(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
}

export async function deleteAdmin(id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(ADMINS_COLLECTION).doc(id).delete();
}

export async function updateAdminLastLogin(id: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(ADMINS_COLLECTION).doc(id).update({
    lastLoginAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

/** @deprecated Use Firebase Storage via ImageUpload component */
export function getUploadsDir() {
  return "";
}

/** List recent uploads from Storage metadata collection (optional) */
export async function listUploads(): Promise<string[]> {
  return [];
}
