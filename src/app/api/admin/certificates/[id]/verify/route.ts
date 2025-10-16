// app/api/admin/certificates/[id]/verify/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Extract id from the incoming URL to avoid typing the second param
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const certIndex = parts.indexOf("certificates");
  const id =
    certIndex >= 0 && parts.length > certIndex + 1
      ? parts[certIndex + 1]
      : null;

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
  const actionRaw = typeof body.action === "string" ? body.action : "";
  const action =
    actionRaw === "reject"
      ? "rejected"
      : actionRaw === "approve"
      ? "approved"
      : null;
  if (!action) {
    return NextResponse.json(
      { ok: false, error: "Invalid action" },
      { status: 400 }
    );
  }

  const sb = await supabaseServer();
  const {
    data: { user },
    error: authErr,
  } = await sb.auth.getUser();
  if (authErr || !user)
    return NextResponse.json({ ok: false }, { status: 401 });

  // (optional) verify user.role === 'admin' here

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
