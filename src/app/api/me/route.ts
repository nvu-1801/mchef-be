// app/api/me/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import { fromDb, toDbUpdate, type DbUser } from "../../../libs/server/profile-mapper";

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
    const sbUserScoped = createClient(URL, ANON, {
      auth: { persistSession: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: me, error: meErr } = await sbUserScoped.auth.getUser();
    if (meErr || !me?.user) {
      return {
        errorRes: NextResponse.json(
          { error: "Unauthorized (invalid/expired token)" },
          { status: 401 }
        ),
      };
    }
    return { userId: me.user.id, sb: sbUserScoped };
  }

  // Fallback cookie-based (SSR)
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return {
      errorRes: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { userId: user.id, sb };
}

/** ===================== GET /api/me ===================== */
export async function GET(req: Request) {
  try {
    const who = await getUserScopedClient(req);
    if ("errorRes" in who) return who.errorRes;
    const { sb, userId } = who;

    const { data: prof, error } = await sb
      .from("profiles")
      .select(
        `
        id, email, display_name, avatar_url, bio, skills, role,
        diet_preference, specialties, experience_years, cert_status,
        certificates, social_links, cooking_level, learning_goals,
        location, languages, created_at, updated_at
      `
      )
      .eq("id", userId)
      .maybeSingle();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      id: prof?.id ?? userId,
      email: prof?.email ?? "",
      fullName: prof?.display_name ?? "",
      avatarUrl: prof?.avatar_url ?? "",
      bio: prof?.bio ?? "",
      skills: prof?.skills ?? [],
      dietPreference: prof?.diet_preference ?? null,
      specialties: prof?.specialties ?? [],
      experienceYears: prof?.experience_years ?? 0,
      certStatus: prof?.cert_status ?? "none",
      certificates: prof?.certificates ?? [],
      socialLinks: prof?.social_links ?? {},
      cookingLevel: prof?.cooking_level ?? null,
      learningGoals: prof?.learning_goals ?? "",
      location: prof?.location ?? "",
      languages: prof?.languages ?? [],
      role: prof?.role ?? "user",
      createdAt: prof?.created_at ?? null,
      // updatedAt: prof?.updated_at ?? null,
    });
  } catch (e: any) {
    console.error("[/api/me GET] 500", e);
    return NextResponse.json(
      { error: "Internal", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

/** ===================== PUT /api/me ===================== */
/** Kiểu dữ liệu con */
const CertificateSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().optional().default(""),
  file_url: z.string().min(1), // nếu bạn muốn chặt chẽ hơn có thể dùng .url()
  issue_date: z.string().min(1), // để nguyên string 'YYYY-MM-DD' (đồng bộ mẫu DB)
});

const SocialLinksSchema = z.record(z.string(), z.string().min(1)).default({});

/** Body schema: tất cả optional để hỗ trợ PATCH-like */
const Body = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  avatarUrl: z.string().trim().optional().nullable(),
  bio: z.string().trim().max(1000).optional().nullable(),
  skills: z.array(z.string().trim()).optional(),

  dietPreference: z.enum(["veg", "nonveg", "vegan"]).optional().nullable(),
  specialties: z.array(z.string().trim()).optional(),
  experienceYears: z.number().int().min(0).max(80).optional(),

  // ⚠️ certStatus thường để admin set. Chỉ bật nếu bạn thực sự muốn user sửa.
  certStatus: z.enum(["none", "pending", "verified", "rejected"]).optional(),

  certificates: z.array(CertificateSchema).optional(),
  socialLinks: SocialLinksSchema.optional(),
  cookingLevel: z
    .enum(["beginner", "intermediate", "advanced"])
    .optional()
    .nullable(),
  learningGoals: z.string().trim().optional().nullable(),
  location: z.string().trim().optional().nullable(),
  languages: z.array(z.string().trim()).optional(),
});

export async function PUT(req: Request) {
  try {
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

    const {
      fullName,
      avatarUrl,
      bio,
      skills,
      dietPreference,
      specialties,
      experienceYears,
      certStatus, // chỉ map xuống nếu bạn cho phép user đổi
      certificates,
      socialLinks,
      cookingLevel,
      learningGoals,
      location,
      languages,
    } = parsed.data;

    // camelCase -> snake_case (chỉ map field có trong body)
    const patch: Record<string, any> = {};
    if (fullName !== undefined) patch.display_name = fullName;
    if (avatarUrl !== undefined) patch.avatar_url = avatarUrl ?? null;
    if (bio !== undefined) patch.bio = bio ?? null;
    if (skills !== undefined) patch.skills = skills;

    if (dietPreference !== undefined)
      patch.diet_preference = dietPreference ?? null;
    if (specialties !== undefined) patch.specialties = specialties;
    if (experienceYears !== undefined) patch.experience_years = experienceYears;

    if (certificates !== undefined) patch.certificates = certificates;
    if (socialLinks !== undefined) patch.social_links = socialLinks;
    if (cookingLevel !== undefined) patch.cooking_level = cookingLevel ?? null;
    if (learningGoals !== undefined)
      patch.learning_goals = learningGoals ?? null;
    if (location !== undefined) patch.location = location ?? null;
    if (languages !== undefined) patch.languages = languages;

    // Nếu KHÔNG muốn user tự đổi trạng thái, hãy comment dòng dưới:
    if (certStatus !== undefined) patch.cert_status = certStatus;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: true }); // không có gì để cập nhật
    }

    const { data, error } = await sb
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select(
        `
        id, email, display_name, avatar_url, bio, skills, role, updated_at,
        diet_preference, specialties, experience_years, cert_status,
        certificates, social_links, cooking_level, learning_goals,
        location, languages
      `
      )
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({
      id: data.id,
      email: data.email ?? "",
      fullName: data.display_name ?? "",
      avatarUrl: data.avatar_url ?? "",
      bio: data.bio ?? "",
      skills: data.skills ?? [],
      dietPreference: data.diet_preference ?? null,
      specialties: data.specialties ?? [],
      experienceYears: data.experience_years ?? 0,
      certStatus: data.cert_status ?? "none",
      certificates: data.certificates ?? [],
      socialLinks: data.social_links ?? {},
      cookingLevel: data.cooking_level ?? null,
      learningGoals: data.learning_goals ?? "",
      location: data.location ?? "",
      languages: data.languages ?? [],
      role: data.role ?? "user",
      // updatedAt: data.updated_at ?? null,
    });
  } catch (e: any) {
    console.error("[/api/me PUT] 500", e);
    return NextResponse.json(
      { error: "Internal", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
