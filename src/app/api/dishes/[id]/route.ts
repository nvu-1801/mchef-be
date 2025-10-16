// app/api/dishes/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/libs/supabase/supabase-server";

const UpdateDish = z.object({
  title: z.string().min(1).max(160).optional(),
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  cover_image_url: z.string().url().optional(),
  category_id: z.string().uuid().optional(),
  diet: z.string().max(30).optional(),
  time_minutes: z.number().int().min(0).max(100000).optional(),
  servings: z.number().int().min(1).max(1000).optional(),
  tips: z.string().max(5000).optional(),
  published: z.boolean().optional(),
});

// UUID v4/v7
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function extractIdFromRequest(req: Request): string | null {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("dishes");
  return idx >= 0 && parts.length > idx + 1 ? parts[idx + 1] : null;
}

export async function GET(request: Request) {
  const identifier = extractIdFromRequest(request);
  if (!identifier)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sb = await supabaseServer();

  const byId = UUID_RE.test(identifier);
  const q = sb
    .from("dishes")
    .select(
      `
    id, category_id, title, slug, cover_image_url, diet, time_minutes, servings, tips,
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
    `
    )
    .eq(byId ? "id" : "slug", identifier)
    .order("sort", { foreignTable: "dish_images", ascending: true })
    .order("step_no", { foreignTable: "recipe_steps", ascending: true })
    .order("created_at", { foreignTable: "ratings", ascending: false });

  const { data, error } = await q.maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Fetch failed", detail: error.message },
      { status: 500 }
    );
  }
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const identifier = extractIdFromRequest(request);
  if (!identifier)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const byId = UUID_RE.test(identifier);

  const { data: existed, error: fErr } = await sb
    .from("dishes")
    .select("id, created_by")
    .eq(byId ? "id" : "slug", identifier)
    .maybeSingle();

  if (fErr)
    return NextResponse.json(
      { error: "Fetch failed", detail: fErr.message },
      { status: 500 }
    );
  if (!existed)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: prof } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = prof?.role === "admin";
  const isOwner = existed.created_by === user.id;
  if (!isAdmin && !isOwner)
    return new NextResponse("Forbidden", { status: 403 });

  const json = (await request.json().catch(() => ({}))) as unknown;
  const parsed = UpdateDish.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.format() },
      { status: 400 }
    );
  }

  const patch = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from("dishes")
    .update(patch)
    .eq(byId ? "id" : "slug", identifier)
    .select(
      "id, category_id, title, slug, cover_image_url, diet, time_minutes, servings, tips, created_by, published, created_at, updated_at"
    )
    .single();

  if (error)
    return NextResponse.json(
      { error: "Update failed", detail: error.message },
      { status: 500 }
    );

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const identifier = extractIdFromRequest(request);
  if (!identifier)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const byId = UUID_RE.test(identifier);

  const { data: prof } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = prof?.role === "admin";
  if (!isAdmin) return new NextResponse("Forbidden", { status: 403 });

  const { error } = await sb
    .from("dishes")
    .delete()
    .eq(byId ? "id" : "slug", identifier);

  if (error)
    return NextResponse.json(
      { error: "Delete failed", detail: error.message },
      { status: 500 }
    );
  return new NextResponse(null, { status: 204 });
}
