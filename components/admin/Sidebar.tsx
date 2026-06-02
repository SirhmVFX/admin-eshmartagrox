"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Navigation,
  Home,
  ShoppingBag,
  Briefcase,
  Calendar,
  FileText,
  Package,
  Users,
  Shield,
  Image,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Permission } from "@/lib/types";

const links: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
}[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/site", label: "Site Settings", icon: Settings, permission: "site:read" },
  { href: "/navigation", label: "Navigation", icon: Navigation, permission: "navigation:read" },
  { href: "/home", label: "Home Page", icon: Home, permission: "home:read" },
  { href: "/footer", label: "Footer", icon: Settings, permission: "footer:read" },
  { href: "/shop", label: "Shop & Products", icon: ShoppingBag, permission: "shop:read" },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase, permission: "portfolio:read" },
  { href: "/services", label: "Book Online", icon: Calendar, permission: "services:read" },
  { href: "/blog", label: "Blog", icon: FileText, permission: "blog:read" },
  { href: "/orders", label: "Orders", icon: Package, permission: "orders:read" },
  { href: "/media", label: "Media Library", icon: Image, permission: "media:read" },
  { href: "/admins", label: "Admin Users", icon: Users, permission: "admins:read" },
  { href: "/roles", label: "Roles & Permissions", icon: Shield, permission: "roles:read" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, can } = useAuth();

  const visibleLinks = links.filter(
    (l) => !l.permission || can(l.permission)
  );

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-green-100 bg-green-950 text-white">
      <div className="border-b border-green-800 px-5 py-6">
        <p className="text-xs uppercase tracking-wider text-green-300">Eshmart Agrox</p>
        <h1 className="text-lg font-bold">Admin Panel</h1>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {visibleLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-green-800 text-white"
                      : "text-green-100 hover:bg-green-900"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-green-800 p-4">
        {user && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-green-300 truncate">{user.email}</p>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-green-200 hover:bg-green-900"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
