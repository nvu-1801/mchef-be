// app/api/dishes/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";

const CreateDish = z.object({
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(160).regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional(),
  images: z.array(z.string()).optional(),         // URL/path trong bucket
  category: z.string().max(120).optional(),
  is_veg: z.boolean().optional(),
  cook_time: z.number().int().min(0).max(10000).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);
  const category = searchParams.get("category") || undefined;
  const isVegParam = searchParams.get("is_veg");
  const isVeg = typeof isVegParam === "string" ? isVegParam === "true" : undefined;

  const sb = await supabaseServer();
  let query = sb
    .from("dishes")
    .select("id, name, slug, description, images, category, is_veg, cook_time, chef_id, created_at, updated_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`);
  if (category) query = query.eq("category", category);
  if (typeof isVeg === "boolean") query = query.eq("is_veg", isVeg);

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: "List failed", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({
    items: data ?? [],
    pagination: { limit, offset, total: count ?? 0 },
  });
}

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const json = await req.json().catch(() => ({}));
  const parsed = CreateDish.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.format() }, { status: 400 });
  }

  const payload = parsed.data;

  const { data, error } = await sb
    .from("dishes")
    .insert({
      ...payload,
      chef_id: user.id,
      images: payload.images ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id, name, slug, description, images, category, is_veg, cook_time, chef_id, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Create failed", detail: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
