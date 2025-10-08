// app/api/profiles/me/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/libs/supabase/supabase-server";

const ProfileInput = z.object({
  fullName: z.string().max(120).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(1000).optional(),
  skills: z.array(z.string()).max(100).optional(),
});

export async function PUT(req: Request) {
  const payload = await req.json().catch(() => ({}));
  const parsed = ProfileInput.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.format() },
      { status: 400 }
    );
  }

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  // Chuẩn bị dữ liệu cập nhật
  const { fullName, avatarUrl, bio, skills } = parsed.data;

  const { data, error } = await sb
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? undefined,
        display_name: fullName,
        avatar_url: avatarUrl,
        bio,
        skills,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select(
      "id, email, display_name, avatar_url, bio, skills, role, cert_status, certificates, updated_at"
    )
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Update failed", detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: data.id,
    email: data.email,
    fullName: data.display_name ?? "",
    avatarUrl: data.avatar_url ?? "",
    bio: data.bio ?? "",
    skills: Array.isArray(data.skills) ? data.skills : [],
    role: data.role ?? "user",
    certStatus: data.cert_status ?? null,
    certificates: Array.isArray(data.certificates) ? data.certificates : [],
    updatedAt: data.updated_at ?? null,
  });
}
