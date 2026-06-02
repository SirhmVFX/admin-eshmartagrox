"use client";

import { useCallback, useEffect, useState } from "react";
import type { Permission } from "@/lib/types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  permissions: Permission[];
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  };

  const can = (permission: Permission) =>
    user?.permissions.includes(permission) ?? false;

  return { user, loading, refresh, logout, can };
}
