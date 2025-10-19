import { supabaseServer } from "@/libs/supabase/supabase-server";

/**
 * Fetch pending certificates from internal API with DB fallback.
 * Safe to call from server runtime.
 */
export default async function fetchPendingCertificates(): Promise<any[]> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined) ??
    "http://localhost:3000";

  try {
    const res = await fetch(
      new URL("/api/admin/certificates/pending", base).toString(),
      {
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const payload = await res.json().catch(() => null);
    return Array.isArray(payload?.items) ? payload.items : [];
  } catch (e) {
    // fallback query directly from DB
    try {
      const sb = await supabaseServer();
      const { data } = await sb
        .from("certificates")
        .select("id,user_id,title,file_path,mime_type,created_at,status")
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
}
