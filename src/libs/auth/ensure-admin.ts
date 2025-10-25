// src/libs/auth/ensure-admin.ts
// Dùng chung cho client (supabaseBrowser) và server (supabaseServer)

import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminCheckResult = {
  user: { id: string; email?: string | null };
};

export class AdminAuthError extends Error {
  code: "NOT_AUTHENTICATED" | "NOT_ADMIN" | "DB_ERROR";
  constructor(code: AdminAuthError["code"], message?: string) {
    super(message || code);
    this.code = code;
  }
}

type UserMetadata = {
  role?: unknown;
  roles?: unknown;
  [key: string]: unknown;
};

type AuthUser = {
  id: string;
  email?: string | null;
  app_metadata?: UserMetadata;
  [key: string]: unknown;
};

type ProfileRow = {
  role?: unknown;
  [key: string]: unknown;
};

/**
 * Kiểm tra quyền admin.
 * - Ưu tiên profiles.is_admin (boolean)
 * - Fallback app_metadata.role = 'admin' hoặc app_metadata.roles chứa 'admin'
 *
 * @param sb Supabase client (browser hoặc server)
 * @returns user { id, email }
 * @throws AdminAuthError("NOT_AUTHENTICATED" | "NOT_ADMIN" | "DB_ERROR")
 */
export async function ensureAdmin(
  sb: SupabaseClient
): Promise<AdminCheckResult> {
  // đảm bảo session được refresh nếu cần
  await sb.auth.getSession().catch(() => {});

  const {
    data: { user },
    error: userErr,
  } = await sb.auth.getUser();
  if (userErr) throw new AdminAuthError("DB_ERROR", userErr.message);
  if (!user) throw new AdminAuthError("NOT_AUTHENTICATED");

  const authUser = user as unknown as AuthUser;

  // Fallback 1: app_metadata
  const meta = authUser.app_metadata ?? {};
  const metaRole = typeof meta.role === "string" ? meta.role.toLowerCase() : "";
  const metaRoles = Array.isArray(meta.roles)
    ? meta.roles.map((r) =>
        typeof r === "string" ? r.toLowerCase() : String(r).toLowerCase()
      )
    : [];
  const metaIsAdmin = metaRole === "admin" || metaRoles.includes("admin");

  // Chính: profiles.role
  const { data: prof, error: profErr } = await sb
    .from("profiles")
    .select("role")
    .eq("id", authUser.id)
    .single();

  if (profErr && profErr.code !== "PGRST116") {
    // PGRST116 = row not found (tuỳ pgrest), vẫn có thể fallback meta
    throw new AdminAuthError("DB_ERROR", profErr.message);
  }

  const profileData = prof as unknown as ProfileRow | null;
  const profileRole =
    typeof profileData?.role === "string" ? profileData.role.toLowerCase() : "";

  const isAdmin = profileRole === "admin" || metaIsAdmin;
  if (!isAdmin) throw new AdminAuthError("NOT_ADMIN");

  return { user: { id: authUser.id, email: authUser.email } };
}
