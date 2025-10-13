import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";

export async function DELETE(request: Request, context: unknown) {
  // extract id safely (avoid typing second param)
  const rawId =
    (context as { params?: Record<string, string | string[]> })?.params?.id ??
    // fallback: parse from url path
    new URL(request.url).pathname.split("/").filter(Boolean).slice(-2)[1];
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const cookieStore = await cookies();

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
      { error: "Only pending can be deleted" },
      { status: 403 }
    );

  const { error: delErr } = await sb.from("certificates").delete().eq("id", id);
  if (delErr)
    return NextResponse.json({ error: delErr.message }, { status: 500 });

  await sb.storage
    .from("certificates")
    .remove([row.file_path])
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
