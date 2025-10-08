import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (k:string)=>cookieStore.get(k)?.value } }
  );

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Lấy cert của chính mình theo RLS
  const { data, error } = await sb
    .from("certificates")
    .select("id,title,file_path,mime_type,status,created_at,reviewed_at,rejection_reason")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Kèm signedUrl 10 phút (link/url thì giữ nguyên)
  const items = await Promise.all((data ?? []).map(async (r) => {
    if (r.mime_type === "link/url") return { ...r, viewUrl: r.file_path };
    const { data: s } = await sb.storage.from("certificates").createSignedUrl(r.file_path, 60 * 10);
    return { ...r, viewUrl: s?.signedUrl ?? null };
  }));

  return NextResponse.json({ items });
}
