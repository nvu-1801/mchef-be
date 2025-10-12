// app/api/admin/certificates/[id]/verify/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
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

  // Optionally: you may check user role here (admin) before proceeding

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
