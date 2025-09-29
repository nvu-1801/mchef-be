// app/api/me/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";

export const runtime = "nodejs"; // optional, an toàn cho Node APIs
export const revalidate = 0;

function assertEnv() {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!URL) throw new Error("ENV NEXT_PUBLIC_SUPABASE_URL missing");
  if (!ANON) throw new Error("ENV NEXT_PUBLIC_SUPABASE_ANON_KEY missing");
  return { URL, ANON };
}

export async function GET(req: Request) {
  try {
    const { URL, ANON } = assertEnv();

    const authHeader = req.headers.get("authorization") ?? "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    let userId: string;
    let sbUserScoped: any; // Supabase client mang danh user

    if (jwt) {
      // KHÔNG verify bằng service role; để PostgREST/RLS kiểm tra token
      sbUserScoped = createClient(URL, ANON, {
        auth: { persistSession: false, detectSessionInUrl: false },
        global: { headers: { Authorization: `Bearer ${jwt}` } },
      });

      const { data: me, error: meErr } = await sbUserScoped.auth.getUser();
      if (meErr || !me?.user) {
        return NextResponse.json({ error: "Unauthorized (invalid/expired token)" }, { status: 401 });
      }
      userId = me.user.id;
    } else {
      // Fallback cookie (SSR/session của app)
      const sb = await supabaseServer();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      userId = user.id;
      sbUserScoped = sb;
    }

    const { data: prof, error } = await sbUserScoped
      .from("profiles")
      .select(`
        id, email, display_name, avatar_url, bio, skills, role,
        diet_preference, specialties, experience_years, cert_status,
        certificates, social_links, cooking_level, learning_goals,
        location, languages, created_at
      `)
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

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
      updatedAt: prof?.updated_at ?? null,
    });
  } catch (e: any) {
    console.error("[/api/me] 500", e);
    return NextResponse.json({ error: "Internal", detail: String(e?.message ?? e) }, { status: 500 });
  }
}



// /** ---------- Cập nhật hồ sơ của chính mình ---------- */
// export async function PUT(req: Request) {
//   const sb = await supabaseServer();
//   const {
//     data: { user },
//   } = await sb.auth.getUser();
//   if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const parsed = Body.safeParse(await req.json());
//   if (!parsed.success) {
//     return NextResponse.json(
//       { error: "Bad payload", details: parsed.error.flatten() },
//       { status: 400 }
//     );
//   }

//   const {
//     fullName,
//     avatarUrl,
//     bio,
//     skills,
//     dietPreference,
//     specialties,
//     experienceYears,
//     // certStatus: thường để admin set; nếu bạn muốn user không được sửa, đừng map xuống
//     certStatus,
//     certificates,
//     socialLinks,
//     cookingLevel,
//     learningGoals,
//     location,
//     languages,
//   } = parsed.data;

//   // camelCase -> snake_case (chỉ map field có trong body)
//   const patch: Record<string, any> = {};
//   if (fullName !== undefined) patch.display_name = fullName;
//   if (avatarUrl !== undefined) patch.avatar_url = avatarUrl || null;
//   if (bio !== undefined) patch.bio = bio || null;
//   if (skills !== undefined) patch.skills = skills;

//   if (dietPreference !== undefined) patch.diet_preference = dietPreference || null;
//   if (specialties !== undefined) patch.specialties = specialties;
//   if (experienceYears !== undefined) patch.experience_years = experienceYears;
//   if (certificates !== undefined) patch.certificates = certificates;
//   if (socialLinks !== undefined) patch.social_links = socialLinks;
//   if (cookingLevel !== undefined) patch.cooking_level = cookingLevel || null;
//   if (learningGoals !== undefined) patch.learning_goals = learningGoals || null;
//   if (location !== undefined) patch.location = location || null;
//   if (languages !== undefined) patch.languages = languages;

//   // Nếu cho phép user chỉnh certStatus thì giữ dòng dưới; nếu KHÔNG, hãy xoá
//   if (certStatus !== undefined) patch.cert_status = certStatus;

//   if (Object.keys(patch).length === 0) {
//     return NextResponse.json({ ok: true });
//   }

//   const { data, error } = await sb
//     .from("profiles")
//     .update(patch)
//     .eq("id", user.id)
//     .select(
//       `
//       id, email, display_name, avatar_url, bio, skills, role, updated_at,
//       diet_preference, specialties, experience_years, cert_status,
//       certificates, social_links, cooking_level, learning_goals,
//       location, languages
//       `
//     )
//     .single();

//   if (error) return NextResponse.json({ error: error.message }, { status: 400 });

//   return NextResponse.json({
//     id: data.id,
//     email: data.email,
//     fullName: data.display_name,
//     avatarUrl: data.avatar_url,
//     bio: data.bio,
//     skills: data.skills ?? [],
//     dietPreference: data.diet_preference ?? null,
//     specialties: data.specialties ?? [],
//     experienceYears: data.experience_years ?? 0,
//     certStatus: data.cert_status ?? "none",
//     certificates: data.certificates ?? [],
//     socialLinks: data.social_links ?? {},
//     cookingLevel: data.cooking_level ?? null,
//     learningGoals: data.learning_goals ?? "",
//     location: data.location ?? "",
//     languages: data.languages ?? [],
//     role: data.role,
//     updatedAt: data.updated_at,
//   });
// }
