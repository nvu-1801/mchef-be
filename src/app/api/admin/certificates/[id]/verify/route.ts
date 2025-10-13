// app/api/admin/certificates/[id]/verify/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function POST(request: Request, context: unknown) {
  // safe extract id (context may be different shapes during build/runtime)
  const rawId = (context as { params?: Record<string, string | string[]> })
    ?.params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Missing id" },
      { status: 400 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const action = body.action === "reject" ? "rejected" : "approved";

  const sb = await supabaseServer();
  const {
    data: { user },
    error: authErr,
  } = await sb.auth.getUser();
  if (authErr || !user)
    return NextResponse.json({ ok: false }, { status: 401 });

  // Optionally check user role === 'admin' here

  const { error } = await sb
    .from("certificates")
    .update({ status: action })
    .eq("id", id);
  if (error)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );

  return NextResponse.json({ ok: true });
}
