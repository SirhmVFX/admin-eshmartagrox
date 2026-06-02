import {
  getAdmins,
  getRoles,
  getSiteContent,
  saveSiteContent,
  upsertRole,
} from "./db";
import { defaultSiteContent } from "./content-defaults";
import { ALL_PERMISSIONS } from "./permissions";
import type { Role } from "./types";

export async function seedDatabase() {
  const now = new Date().toISOString();

  let roles = await getRoles();
  if (roles.length === 0) {
    const defaultRoles: Role[] = [
      {
        id: "role-super-admin",
        name: "Super Admin",
        description: "Full access to all features",
        permissions: [...ALL_PERMISSIONS],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "role-editor",
        name: "Content Editor",
        description: "Can edit site content but not manage admins",
        permissions: [
          "site:read",
          "site:write",
          "navigation:read",
          "navigation:write",
          "home:read",
          "home:write",
          "footer:read",
          "footer:write",
          "shop:read",
          "shop:write",
          "portfolio:read",
          "portfolio:write",
          "services:read",
          "services:write",
          "blog:read",
          "blog:write",
          "media:read",
          "media:write",
          "orders:read",
          "orders:write",
        ],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "role-viewer",
        name: "Viewer",
        description: "Read-only access to content",
        permissions: [
          "site:read",
          "navigation:read",
          "home:read",
          "footer:read",
          "shop:read",
          "portfolio:read",
          "services:read",
          "blog:read",
          "media:read",
          "orders:read",
        ],
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
    for (const role of defaultRoles) {
      await upsertRole(role);
    }
    roles = defaultRoles;
  }

  const admins = await getAdmins();
  if (admins.length === 0) {
    console.warn(
      "[seed] No admins in Firestore. Create a user in Firebase Auth, then add a document to admins/{uid} with roleId role-super-admin"
    );
  }

  const content = await getSiteContent();
  if (!content.version) {
    await saveSiteContent(defaultSiteContent);
  }

  return { roles, admins };
}

export async function initializeApp() {
  await seedDatabase();
}
