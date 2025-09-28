// app/api/me/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";

export async function GET() {
  const sb = await supabaseServer();
  const { data: { user }, error: authErr } = await sb.auth.getUser();

  if (authErr) {
    return NextResponse.json({ error: "Auth error", detail: authErr.message }, { status: 500 });
  }
  if (!user) {
    // Public (không đăng nhập) vẫn gọi được: trả user=null, profile=null
    return NextResponse.json({ user: null, profile: null });
  }

  const { data: prof, error } = await sb
    .from("profiles")
    .select("id, email, display_name, avatar_url, bio, skills, role, cert_status, certificates, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    // Có thể RLS chặn hoặc chưa có dòng profile -> trả user tối thiểu
    return NextResponse.json({
      user: { id: user.id, email: user.email },
      profile: null,
    });
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile: prof && {
      id: prof.id,
      email: prof.email,
      fullName: prof.display_name ?? "",
      avatarUrl: prof.avatar_url ?? "",
      bio: prof.bio ?? "",
      skills: Array.isArray(prof.skills) ? prof.skills : [],
      role: prof.role ?? "user",
      certStatus: prof.cert_status ?? null,
      certificates: Array.isArray(prof.certificates) ? prof.certificates : [],
      updatedAt: prof.updated_at ?? null,
    },
  });
}
