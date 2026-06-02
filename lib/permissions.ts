import type { Permission } from "./types";

export const ALL_PERMISSIONS: Permission[] = [
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
  "admins:read",
  "admins:write",
  "roles:read",
  "roles:write",
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  "site:read": "View site settings",
  "site:write": "Edit site settings",
  "navigation:read": "View navigation",
  "navigation:write": "Edit navigation",
  "home:read": "View home page",
  "home:write": "Edit home page",
  "footer:read": "View footer",
  "footer:write": "Edit footer",
  "shop:read": "View shop",
  "shop:write": "Edit shop & products",
  "portfolio:read": "View portfolio",
  "portfolio:write": "Edit portfolio",
  "services:read": "View services",
  "services:write": "Edit book-online services",
  "blog:read": "View blog",
  "blog:write": "Edit blog posts",
  "media:read": "View media library",
  "media:write": "Upload & manage media",
  "orders:read": "View orders",
  "orders:write": "Manage orders",
  "admins:read": "View admin users",
  "admins:write": "Manage admin users",
  "roles:read": "View roles",
  "roles:write": "Manage roles & permissions",
};

export const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  { label: "Site", permissions: ["site:read", "site:write"] },
  { label: "Navigation", permissions: ["navigation:read", "navigation:write"] },
  { label: "Home", permissions: ["home:read", "home:write"] },
  { label: "Footer", permissions: ["footer:read", "footer:write"] },
  { label: "Shop", permissions: ["shop:read", "shop:write"] },
  { label: "Portfolio", permissions: ["portfolio:read", "portfolio:write"] },
  { label: "Services", permissions: ["services:read", "services:write"] },
  { label: "Blog", permissions: ["blog:read", "blog:write"] },
  { label: "Media", permissions: ["media:read", "media:write"] },
  { label: "Orders", permissions: ["orders:read", "orders:write"] },
  { label: "Admins", permissions: ["admins:read", "admins:write"] },
  { label: "Roles", permissions: ["roles:read", "roles:write"] },
];

export function hasPermission(
  userPermissions: Permission[],
  required: Permission
): boolean {
  return userPermissions.includes(required);
}

export function hasAnyPermission(
  userPermissions: Permission[],
  required: Permission[]
): boolean {
  return required.some((p) => userPermissions.includes(p));
}
