import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request, context: unknown) {
  // extract id safely from context (avoid typing the second param)
  const rawId = (context as { params?: Record<string, string | string[]> })
    ?.params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const new_path =
    typeof body.new_path === "string" && body.new_path.trim()
      ? body.new_path.trim()
      : "";
  const new_mime =
    typeof body.new_mime === "string"
      ? body.new_mime
      : "application/octet-stream";
  const new_title =
    typeof body.new_title === "string" ? body.new_title : "Certificate";

  if (!new_path)
    return NextResponse.json({ error: "new_path required" }, { status: 400 });

  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // minimal cookies adapter (works at runtime; typed via inference)
    { cookies: { get: (k: string) => cookieStore.get(k)?.value } }
  );

  // Lấy record theo RLS (chỉ owner thấy)
  const { data: rows, error } = await sb
    .from("certificates")
    .select("id,file_path,status")
    .eq("id", id)
    .limit(1);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  const row = rows?.[0];
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.status !== "pending")
    return NextResponse.json(
      { error: "Only pending can be replaced" },
      { status: 403 }
    );

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
      reviewed_by: null,
    })
    .eq("id", id);
  if (upErr)
    return NextResponse.json({ error: upErr.message }, { status: 500 });

  // Xoá file cũ trong storage (nếu khác)
  if (row.file_path !== new_path) {
    await sb.storage
      .from("certificates")
      .remove([row.file_path])
      .catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
