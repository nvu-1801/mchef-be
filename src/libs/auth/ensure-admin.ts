// src/libs/auth/ensure-admin.ts
// Dùng chung cho client (supabaseBrowser) và server (supabaseServer)

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

/**
 * Kiểm tra quyền admin.
 * - Ưu tiên profiles.is_admin (boolean)
 * - Fallback app_metadata.role = 'admin' hoặc app_metadata.roles chứa 'admin'
 *
 * @param sb Supabase client (browser hoặc server)
 * @returns user { id, email }
 * @throws AdminAuthError("NOT_AUTHENTICATED" | "NOT_ADMIN" | "DB_ERROR")
 */
export async function ensureAdmin(sb: any): Promise<AdminCheckResult> {
  // đảm bảo session được refresh nếu cần
  await sb.auth.getSession().catch(() => {});

  const { data: { user }, error: userErr } = await sb.auth.getUser();
  if (userErr) throw new AdminAuthError("DB_ERROR", userErr.message);
  if (!user) throw new AdminAuthError("NOT_AUTHENTICATED");

  // Fallback 1: app_metadata
  const meta = (user as any)?.app_metadata || {};
  const metaRole = (meta.role as string | undefined)?.toLowerCase?.();
  const metaRoles = Array.isArray(meta.roles) ? meta.roles.map((r: any) => String(r).toLowerCase()) : [];
  const metaIsAdmin = metaRole === "admin" || metaRoles.includes("admin");

  // Chính: profiles.is_admin
  const { data: prof, error: profErr } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profErr && profErr.code !== "PGRST116") {
    // PGRST116 = row not found (tuỳ pgrest), vẫn có thể fallback meta
    throw new AdminAuthError("DB_ERROR", profErr.message);
  }

  const isAdmin = (prof?.role === "admin") || metaIsAdmin;
  if (!isAdmin) throw new AdminAuthError("NOT_ADMIN");

  return { user: { id: user.id, email: user.email } };
}
