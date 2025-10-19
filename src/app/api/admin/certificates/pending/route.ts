import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function GET() {
  const sb = await supabaseServer();

  const { data, error } = await sb
    .from("certificates")
    .select("id,user_id,title,file_path,mime_type,created_at,status")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const items = await Promise.all(
    (data ?? []).map(async (r) => {
      try {
        if (!r.file_path)
          return { ...r, signedUrl: null, _signErr: "missing file_path" };
        if (r.mime_type === "link/url") return { ...r, signedUrl: r.file_path };
        const { data: s, error: e } = await sb.storage
          .from("certificates")
          .createSignedUrl(r.file_path, 60 * 10);
        const signedUrl =
          (s as any)?.signedUrl ?? (s as any)?.signedURL ?? null;
        return { ...r, signedUrl, _signErr: e?.message ?? null };
      } catch (ex: any) {
        return { ...r, signedUrl: null, _signErr: ex?.message ?? String(ex) };
      }
    })
  );

  return NextResponse.json({ items });
}
