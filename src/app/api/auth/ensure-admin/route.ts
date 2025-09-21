// src/app/api/auth/ensure-admin/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const cookieStore = await cookies();

  // client theo session hiện tại để lấy user
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: (n, v, o) => (cookieStore as any).set({ name: n, value: v, ...o }),
        remove: (n, o) => (cookieStore as any).set({ name: n, value: "", ...o, maxAge: 0 }),
      },
    }
  );

  const { data: { user }, error } = await sb.auth.getUser();
  if (error || !user) return NextResponse.json({ ok: false }, { status: 401 });

  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

  if (allow.includes((user.email || "").toLowerCase())) {
    // service role để vượt RLS khi set role
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: upErr } = await admin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);

    if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
