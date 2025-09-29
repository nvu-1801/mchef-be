// app/api/profiles/me/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import { z } from "zod";

const Body = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  skills: z.array(z.string().trim().min(1)).max(50).optional(),
});

export async function PUT(req: Request) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { fullName, avatarUrl, bio, skills } = parsed.data;

  // Map camelCase -> snake_case
  const patch: Record<string, any> = {};
  if (fullName !== undefined) patch.display_name = fullName;
  if (avatarUrl !== undefined) patch.avatar_url = avatarUrl || null;
  if (bio !== undefined) patch.bio = bio || null;
  if (skills !== undefined) patch.skills = skills;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: true }); // không có gì để cập nhật
  }

  const { data, error } = await sb
    .from("profiles")
    .update(patch)
    .eq("id", user.id)
    .select("id, email, display_name, avatar_url, bio, skills, role, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Trả về theo camelCase cho FE
  return NextResponse.json({
    id: data.id,
    email: data.email,
    fullName: data.display_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    skills: data.skills ?? [],
    role: data.role,
    updatedAt: data.updated_at,
  });
}
