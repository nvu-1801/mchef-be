import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();

  // Adapter nhỏ cho cookieStore của Next -> cast về CookieMethodsServer để thỏa kiểu
  const cookieAdapter = {
    get: (name: string) => cookieStore.get(name)?.value,
    set: (name: string, value: string, options?: Record<string, unknown>) =>
      cookieStore.set({
        name,
        value,
        ...(options as Record<string, unknown> | undefined),
      }),
    remove: (name: string) => cookieStore.delete(name),
  } as unknown as CookieMethodsServer;

  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieAdapter }
  );

  // Lấy record (RLS owner)
  const { data: rows, error } = await sb
    .from("certificates")
    .select("id,file_path,status")
    .eq("id", params.id)
    .limit(1);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const row = rows?.[0];
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.status !== "pending")
    return NextResponse.json(
      { error: "Only pending can be deleted" },
      { status: 403 }
    );

  // Xoá record trước (RLS cho delete owner pending)
  const { error: delErr } = await sb
    .from("certificates")
    .delete()
    .eq("id", params.id);
  if (delErr)
    return NextResponse.json({ error: delErr.message }, { status: 500 });

  // Xoá file storage (không block nếu lỗi)
  await sb.storage
    .from("certificates")
    .remove([row.file_path])
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
