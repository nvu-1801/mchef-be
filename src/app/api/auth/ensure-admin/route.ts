// src/app/api/auth/ensure-admin/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function POST() {
  // use central helper that already configures a server supabase client
  const sb = await supabaseServer();

  const {
    data: { user },
    error,
  } = await sb.auth.getUser();

  if (error || !user) return NextResponse.json({ ok: false }, { status: 401 });

  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (allow.includes((user.email || "").toLowerCase())) {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: upErr } = await admin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);

    if (upErr)
      return NextResponse.json(
        { ok: false, error: upErr.message },
        { status: 500 }
      );
  }

  return NextResponse.json({ ok: true });
}
