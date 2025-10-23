// src/hooks/useAdminGuard.ts
"use client";

import { useEffect, useState } from "react";
import { ensureAdmin, AdminAuthError } from "@/libs/auth/ensure-admin";
import type { SupabaseClient } from "@supabase/supabase-js";

type Options = {
  supabaseClient: SupabaseClient; // Typed Supabase client
  redirectTo?: string; // default: /auth/sign-in
  next?: string; // default: window.location.pathname + search
  onFail?: (error: AdminAuthError) => void;
};

export function useAdminGuard({
  supabaseClient,
  redirectTo = "/auth/sign-in",
  next,
  onFail,
}: Options) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<AdminAuthError | null>(null);
  const [user, setUser] = useState<{
    id: string;
    email?: string | null;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await ensureAdmin(supabaseClient);
        if (!mounted) return;
        setUser(res.user);
        setReady(true);
      } catch (e: unknown) {
        const err = e as AdminAuthError;
        if (!mounted) return;
        setError(err);
        onFail?.(err);

        // Tự redirect nếu không có onFail
        if (!onFail) {
          const targetNext =
            next ||
            (typeof window !== "undefined"
              ? window.location.pathname + window.location.search
              : "/admin");
          const url = `${redirectTo}?next=${encodeURIComponent(targetNext)}`;
          // dùng location để không phụ thuộc router cụ thể
          if (typeof window !== "undefined") window.location.replace(url);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [supabaseClient, redirectTo, next, onFail]);

  return { ready, error, user };
}
