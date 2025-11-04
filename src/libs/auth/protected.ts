"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./useAuth";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";

export type UserRole = "admin" | "chef" | "learner" | "user" | null;

export function useProtectedAction() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  // --- Fetch role from profiles when user logged in ---
  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }
    let mounted = true;
    const sb = supabaseBrowser();

    (async () => {
      try {
        setRoleLoading(true);
        const { data, error } = await sb
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (!mounted) return;
        if (error) throw error;
        setRole((data?.role as UserRole) ?? "user");
      } catch (e) {
        if (mounted) setRole("user");
      } finally {
        if (mounted) setRoleLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  // --- Require login before executing an action ---
  function requireAuth(run: () => void, fallback?: () => void) {
    if (loading || roleLoading) return;
    if (!user) {
      const next = encodeURIComponent(pathname || "/");
      router.push(`/auth/signin?next=${next}`);
      fallback?.();
      return;
    }
    run();
  }

  // --- Require specific role(s) ---
  function requireRole(
    allowed: UserRole[] | UserRole,
    run: () => void,
    fallback?: () => void
  ) {
    if (loading || roleLoading) return;
    const roles = Array.isArray(allowed) ? allowed : [allowed];
    if (!user) {
      const next = encodeURIComponent(pathname || "/");
      router.push(`/auth/signin?next=${next}`);
      fallback?.();
      return;
    }
    if (!role || !roles.includes(role)) {
      fallback?.(); // ví dụ: toast “Bạn không có quyền truy cập”
      return;
    }
    run();
  }

  return { requireAuth, requireRole, user, role, loading: loading || roleLoading };
}
