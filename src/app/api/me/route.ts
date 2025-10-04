// app/api/me/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";

export const runtime = "nodejs";
export const revalidate = 0;

function assertEnv() {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!URL) throw new Error("ENV NEXT_PUBLIC_SUPABASE_URL missing");
  if (!ANON) throw new Error("ENV NEXT_PUBLIC_SUPABASE_ANON_KEY missing");
  return { URL, ANON };
}

async function getUserScopedClient(req: Request) {
  const { URL, ANON } = assertEnv();
  const authHeader = req.headers.get("authorization") ?? "";
  const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (jwt) {
    const sb = createClient(URL, ANON, {
      auth: { persistSession: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data, error } = await sb.auth.getUser();
    if (error || !data?.user) {
      return { errorRes: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    return { userId: data.user.id, sb };
  }

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { errorRes: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { userId: user.id, sb };
}

/** ===================== GET /api/me ===================== */
export async function GET(req: Request) {
  const who = await getUserScopedClient(req);
  if ("errorRes" in who) return who.errorRes;
  const { sb, userId } = who;

  const { data, error } = await sb
    .from("profiles")
    .select("id, email, display_name, avatar_url, bio, skills, role, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    id: data?.id ?? userId,
    email: data?.email ?? "",
    fullName: data?.display_name ?? "",
    avatarUrl: data?.avatar_url ?? "",
    bio: data?.bio ?? "",
    skills: data?.skills ?? [],
    role: data?.role ?? "user",
    updatedAt: data?.updated_at ?? null,
  });
}

/** ===================== PUT /api/me ===================== */
const Body = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  avatarUrl: z.string().trim().url("Avatar URL không hợp lệ").optional().or(z.literal("")),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
  skills: z.array(z.string().trim()).optional(),
});

export async function PUT(req: Request) {
  const who = await getUserScopedClient(req);
  if ("errorRes" in who) return who.errorRes;
  const { sb, userId } = who;

  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Bad payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const patch: Record<string, any> = {};
  const { fullName, avatarUrl, bio, skills } = parsed.data;

  if (fullName !== undefined) patch.display_name = fullName;
  if (avatarUrl !== undefined) patch.avatar_url = avatarUrl || null;
  if (bio !== undefined) patch.bio = bio || null;
  if (skills !== undefined) patch.skills = skills;

  if (Object.keys(patch).length === 0) {
    // Không đổi gì -> vẫn trả lại state hiện tại cho client đồng bộ
    const { data, error } = await sb
      .from("profiles")
      .select("id, email, display_name, avatar_url, bio, skills, role, updated_at")
      .eq("id", userId)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({
      id: data.id,
      email: data.email ?? "",
      fullName: data.display_name ?? "",
      avatarUrl: data.avatar_url ?? "",
      bio: data.bio ?? "",
      skills: data.skills ?? [],
      role: data.role ?? "user",
      updatedAt: data.updated_at ?? null,
    });
  }

  const { data, error } = await sb
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select("id, email, display_name, avatar_url, bio, skills, role, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    id: data.id,
    email: data.email ?? "",
    fullName: data.display_name ?? "",
    avatarUrl: data.avatar_url ?? "",
    bio: data.bio ?? "",
    skills: data.skills ?? [],
    role: data.role ?? "user",
    updatedAt: data.updated_at ?? null,
  });
}
