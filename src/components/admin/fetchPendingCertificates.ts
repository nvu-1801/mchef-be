import { supabaseServer } from "@/libs/supabase/supabase-server";

export type PendingCertificate = {
  id: string;
  user_id: string | null;
  title: string | null;
  file_path: string | null;
  mime_type: string | null;
  created_at: string | null;
  status?: string | null;
  signedUrl?: string | null;
  _signErr?: string | null;
  [key: string]: unknown;
};

/**
 * Fetch pending certificates from internal API with DB fallback.
 * Safe to call from server runtime.
 */
export default async function fetchPendingCertificates(): Promise<
  PendingCertificate[]
> {
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

    const payload: unknown = await res.json().catch(() => null);

    if (
      typeof payload === "object" &&
      payload !== null &&
      "items" in payload &&
      Array.isArray(payload.items)
    ) {
      return payload.items as PendingCertificate[];
    }

    return [];
  } catch (e) {
    // fallback query directly from DB
    try {
      const sb = await supabaseServer();
      const { data } = await sb
        .from("certificates")
        .select("id,user_id,title,file_path,mime_type,created_at,status")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      return Array.isArray(data) ? (data as PendingCertificate[]) : [];
    } catch {
      return [];
    }
  }
}
