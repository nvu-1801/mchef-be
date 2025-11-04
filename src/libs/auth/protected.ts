"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./useAuth";

export function useProtectedAction() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function requireAuth(run: () => void, fallback?: () => void) {
    if (loading) return; // có thể show spinner nếu muốn
    if (!user) {
      const next = encodeURIComponent(pathname || "/");
      router.push(`/auth/signin?next=${next}`);
      fallback?.(); // optional: toast “Bạn cần đăng nhập”
      return;
    }
    run();
  }

  return { requireAuth, user, loading };
}
