import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { new_path, new_mime = "application/octet-stream", new_title = "Certificate" } = await req.json();
  if (!new_path) return NextResponse.json({ error: "new_path required" }, { status: 400 });

  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (k:string)=>cookieStore.get(k)?.value } }
  );

  // Lấy record theo RLS (chỉ owner thấy)
  const { data: rows, error } = await sb
    .from("certificates")
    .select("id,file_path,status")
    .eq("id", params.id)
    .limit(1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const row = rows?.[0];
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.status !== "pending") return NextResponse.json({ error: "Only pending can be replaced" }, { status: 403 });

  // Update record → trỏ sang file mới + reset review fields
  const { error: upErr } = await sb
    .from("certificates")
    .update({
      file_path: new_path,
      mime_type: new_mime,
      title: new_title,
      status: "pending",
      reviewed_at: null,
      rejection_reason: null,
      reviewed_by: null
    })
    .eq("id", params.id);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // Xoá file cũ trong storage (nếu khác)
  if (row.file_path !== new_path) {
    await sb.storage.from("certificates").remove([row.file_path]).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
