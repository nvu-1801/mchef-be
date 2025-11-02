// app/api/dishes/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import { createClient } from "@supabase/supabase-js";

// ⚠️ Nếu enum diet của bạn khác (vd: 'veg' | 'nonveg' | 'vegan' ...)
// hãy đổi validator dưới đây cho khớp. Ở đây cho phép string để không kẹt enum.
const CreateDish = z.object({
  title: z.string().min(1).max(160),
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/),
  cover_image_url: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  category_id: z.string().uuid(), // liên kết tới bảng categories (UUID)
  diet: z.string().min(1).max(30).optional(), // đổi sang z.enum([...]) nếu muốn chặt chẽ
  time_minutes: z.number().int().min(0).max(100000).optional(),
  servings: z.number().int().min(1).max(1000).optional(),
  tips: z.string().max(5000).optional(),
  published: z.boolean().optional(),
  video_url: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

  const category_id = searchParams.get("category_id") || undefined;
  const diet = searchParams.get("diet") || undefined;
  const publishedParam = searchParams.get("published");
  const published =
    typeof publishedParam === "string" ? publishedParam === "true" : undefined;

  const sb = await supabaseServer();

  let query = sb
    .from("dishes")
    .select(
      `
    id, category_id, title, slug, cover_image_url, diet, time_minutes, servings, tips,
    video_url,
    created_by, published, created_at, updated_at,
    category:category_id ( id, slug, name, icon ),
    dish_images ( id, image_url, alt, sort ),
    recipe_steps ( step_no, content, image_url ),
    dish_ingredients (
      amount, note,
      ingredient:ingredient_id ( id, name, unit )
    ),
    ratings ( user_id, stars, comment, created_at ),
    favorites ( user_id ),
    creator:created_by ( id, display_name, avatar_url )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .order("sort", { foreignTable: "dish_images", ascending: true })
    .order("step_no", { foreignTable: "recipe_steps", ascending: true })
    // nếu lỗi ở dòng dưới (vì foreign table lồng 2 cấp), hãy bỏ hoặc đổi sang 'ingredient'
    .order("name", {
      foreignTable: "dish_ingredients.ingredient",
      ascending: true,
    })
    .order("created_at", { foreignTable: "ratings", ascending: false });

  if (q) query = query.ilike("title", `%${q}%`);
  if (category_id) query = query.eq("category_id", category_id);
  if (diet) query = query.eq("diet", diet);
  if (typeof published === "boolean") query = query.eq("published", published);

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: "List failed", detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    items: data ?? [],
    pagination: { limit, offset, total: count ?? 0 },
  });
}

export async function POST(req: Request) {
  // Lấy Bearer token
  const authHeader = req.headers.get("authorization") || "";
  const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!jwt) return new Response("Unauthorized", { status: 401 });

  // (tuỳ chọn) Verify JWT trước bằng service role (để báo 401 sớm nếu token sai)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data: u, error: vErr } = await admin.auth.getUser(jwt);
  if (vErr || !u?.user) return new Response("Invalid token", { status: 401 });
  const user = u.user;

  // ✅ Tạo client “mang danh user” để RLS nhận diện auth.uid()
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // dùng anon key
    {
      auth: { persistSession: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } }, // quan trọng
    }
  );

  // Validate body
  const json = await req.json().catch(() => ({}));
  const parsed = CreateDish.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.format() },
      { status: 400 }
    );
  }
  const payload = parsed.data;

  // Insert bằng client đã gắn JWT ⇒ RLS pass (auth.uid() = user.id)
  const { data, error } = await userClient
    .from("dishes")
    .insert({
      title: payload.title,
      slug: payload.slug,
      cover_image_url: payload.cover_image_url ?? null,
      category_id: payload.category_id,
      diet: payload.diet ?? null,
      time_minutes: payload.time_minutes ?? null,
      servings: payload.servings ?? null,
      tips: payload.tips ?? null,
      video_url: payload.video_url ?? null,
      published: payload.published ?? false,
      created_by: user.id, // server quyết định
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select(
      "id, category_id, title, slug, cover_image_url, diet, time_minutes, servings, tips, created_by, published, created_at, updated_at, video_url"
    )
    .single();

  if (error) {
    // sẽ thấy thông điệp RLS/constraint rõ ràng ở đây nếu còn lỗi
    return NextResponse.json(
      { error: "Create failed", detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
