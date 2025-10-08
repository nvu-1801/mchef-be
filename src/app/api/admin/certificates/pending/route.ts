// app/api/admin/certificates/pending/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
  );

  const { data, error } = await sb
    .from("certificates")
    .select("id,user_id,title,file_path,mime_type,created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = await Promise.all(
    (data ?? []).map(async (r) => {
      if (r.mime_type === "link/url") return { ...r, signedUrl: r.file_path };
      const { data: s, error: e } = await sb
        .storage
        .from("certificates")
        .createSignedUrl(r.file_path, 60 * 10);
      return { ...r, signedUrl: s?.signedUrl ?? null, _signErr: e?.message ?? null };
    })
  );

  return NextResponse.json({ items });
}
