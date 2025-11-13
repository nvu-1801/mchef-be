// app/api/dishes/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/libs/supabase/supabase-server";
// ❌ Sai:
// import { verifyUserApiKey } from "../../auth/get-api-key/route";
// ✅ Đúng:
import { verifyUserApiKey } from "@/libs/auth/verify-user-api-key";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Validate API key - support 2 modes:
 * 1. Internal API key (server-to-server)
 * 2. User API key (client-to-server)
 */
async function validateApiKey(
  req: Request
): Promise<{ valid: boolean; userId?: string }> {
  const apiKey = (req.headers.get("x-api-key") || "").trim();
  const userId = (req.headers.get("x-user-id") || "").trim();

  // Mode 1: Internal API key
  const internalKey = (process.env.INTERNAL_API_KEY || "").trim();
  if (internalKey && apiKey === internalKey) {
    console.log("[x-api-key] Internal key valid");
    return { valid: true };
  }

  // Mode 2: User API key
  if (userId && apiKey) {
    const valid = verifyUserApiKey(apiKey, userId);
    console.log("[x-api-key] User key valid:", valid, "userId:", userId);
    return { valid, userId };
  }

  console.log("[x-api-key] Invalid - got.len:", apiKey.length);
  return { valid: false };
}

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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function extractIdFromRequest(req: Request): string | null {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("dishes");
  return idx >= 0 && parts.length > idx + 1 ? parts[idx + 1] : null;
}

// GET - Lấy món ăn (public, không cần API key)
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
      created_by, published, created_at, updated_at, video_url, 
      category:category_id ( id, slug, name, icon ),
      dish_images ( id, image_url, alt, sort ),
      recipe_steps ( step_no, content, image_url ),
      dish_ingredients ( amount, note, ingredient:ingredient_id ( id, name, unit ) ),
      ratings ( user_id, stars, comment, created_at ),
      favorites ( user_id ),
      creator:created_by ( id, display_name, avatar_url ),
      premium:premium_dishes ( active, required_plan, chef_id )
    `
    )
    .eq(byId ? "id" : "slug", identifier)
    .order("sort", { foreignTable: "dish_images", ascending: true })
    .order("step_no", { foreignTable: "recipe_steps", ascending: true })
    .order("created_at", { foreignTable: "ratings", ascending: false });

  const { data, error } = await q.maybeSingle();
  if (error) {
    console.log("[GET Error]", error);
    return NextResponse.json(
      { error: "Fetch failed", detail: error.message },
      { status: 500 }
    );
  }
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}

// PUT - Cập nhật món ăn (cần API key)
export async function PUT(request: Request) {
  const validation = await validateApiKey(request);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Forbidden: Invalid API Key" },
      { status: 403 }
    );
  }

  const identifier = extractIdFromRequest(request);
  if (!identifier)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sb = await supabaseServer();

  // Nếu có userId from API key, dùng nó thay vì auth
  let userId = validation.userId;
  if (!userId) {
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    userId = user.id;
  }

  const byId = UUID_RE.test(identifier);
  const { data: existed, error: fErr } = await sb
    .from("dishes")
    .select("id, created_by")
    .eq(byId ? "id" : "slug", identifier)
    .maybeSingle();

  if (fErr) {
    return NextResponse.json(
      { error: "Fetch failed", detail: fErr.message },
      { status: 500 }
    );
  }
  if (!existed)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: prof } = await sb
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  const isAdmin = prof?.role === "admin";
  const isOwner = existed.created_by === userId;
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

  const patch = { ...parsed.data, updated_at: new Date().toISOString() };

  const { data, error } = await sb
    .from("dishes")
    .update(patch)
    .eq(byId ? "id" : "slug", identifier)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Update failed", detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

// DELETE - Xoá món ăn (cần API key + admin)
export async function DELETE(request: Request) {
  const validation = await validateApiKey(request);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Forbidden: Invalid API Key" },
      { status: 403 }
    );
  }

  const identifier = extractIdFromRequest(request);
  if (!identifier)
    return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sb = await supabaseServer();

  let userId = validation.userId;
  if (!userId) {
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    userId = user.id;
  }

  const byId = UUID_RE.test(identifier);
  const { data: prof } = await sb
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  const isAdmin = prof?.role === "admin";
  if (!isAdmin) return new NextResponse("Forbidden", { status: 403 });

  const { error } = await sb
    .from("dishes")
    .delete()
    .eq(byId ? "id" : "slug", identifier);

  if (error) {
    return NextResponse.json(
      { error: "Delete failed", detail: error.message },
      { status: 500 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
