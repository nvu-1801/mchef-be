// app/api/dishes/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";

// ⚠️ Nếu enum diet của bạn khác (vd: 'veg' | 'nonveg' | 'vegan' ...)
// hãy đổi validator dưới đây cho khớp. Ở đây cho phép string để không kẹt enum.
const CreateDish = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().min(1).max(160).regex(/^[a-z0-9-]+$/),
  cover_image_url: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  category_id: z.string().uuid(),            // liên kết tới bảng categories (UUID)
  diet: z.string().min(1).max(30).optional(),// đổi sang z.enum([...]) nếu muốn chặt chẽ
  time_minutes: z.number().int().min(0).max(100000).optional(),
  servings: z.number().int().min(1).max(1000).optional(),
  tips: z.string().max(5000).optional(),
  published: z.boolean().optional()
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
      "id, category_id, title, slug, cover_image_url, diet, time_minutes, servings, tips, created_by, published, created_at, updated_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

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
    pagination: { limit, offset, total: count ?? 0 }
  });
}

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const {
    data: { user }
  } = await sb.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const json = await req.json().catch(() => ({}));
  const parsed = CreateDish.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.format() },
      { status: 400 }
    );
  }

  const payload = parsed.data;

  const { data, error } = await sb
    .from("dishes")
    .insert({
      // map đúng tên cột
      title: payload.title,
      slug: payload.slug,
      cover_image_url: payload.cover_image_url ?? null,
      category_id: payload.category_id,
      diet: payload.diet ?? null,
      time_minutes: payload.time_minutes ?? null,
      servings: payload.servings ?? null,
      tips: payload.tips ?? null,
      published: payload.published ?? false,

      // audit
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select(
      "id, category_id, title, slug, cover_image_url, diet, time_minutes, servings, tips, created_by, published, created_at, updated_at"
    )
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Create failed", detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
