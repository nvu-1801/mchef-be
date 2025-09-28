// app/api/dishes/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";

type Params = { params: { id: string } };

const UpdateDish = z.object({
  name: z.string().min(1).max(160).optional(),
  slug: z.string().min(1).max(160).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(5000).optional(),
  images: z.array(z.string()).optional(),
  category: z.string().max(120).optional(),
  is_veg: z.boolean().optional(),
  cook_time: z.number().int().min(0).max(10000).optional(),
});

// UUID v4/v7 thoáng: chỉ cần 8-4-4-4-12 hex
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: Params) {
  const identifier = params.id;
  const sb = await supabaseServer();

  const q = sb
    .from("dishes")
    .select("id, name, slug, description, images, category, is_veg, cook_time, chef_id, created_at, updated_at")
    [UUID_RE.test(identifier) ? "eq" : "eq"](
      UUID_RE.test(identifier) ? "id" : "slug",
      identifier
    );

  const { data, error } = await q.maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Fetch failed", detail: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: Params) {
  const identifier = params.id;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  // Tải dish trước để check quyền
  const { data: existed, error: fErr } = await sb
    .from("dishes")
    .select("id, chef_id")
    [UUID_RE.test(identifier) ? "eq" : "eq"](
      UUID_RE.test(identifier) ? "id" : "slug",
      identifier
    )
    .maybeSingle();

  if (fErr) return NextResponse.json({ error: "Fetch failed", detail: fErr.message }, { status: 500 });
  if (!existed) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Quyền: admin hoặc chủ sở hữu (chef_id)
  const { data: prof } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = prof?.role === "admin";
  const isOwner = existed.chef_id && existed.chef_id === user.id;
  if (!isAdmin && !isOwner) return new NextResponse("Forbidden", { status: 403 });

  const json = await req.json().catch(() => ({}));
  const parsed = UpdateDish.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.format() }, { status: 400 });
  }

  const patch = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from("dishes")
    .update(patch)
    [UUID_RE.test(identifier) ? "eq" : "eq"](
      UUID_RE.test(identifier) ? "id" : "slug",
      identifier
    )
    .select("id, name, slug, description, images, category, is_veg, cook_time, chef_id, created_at, updated_at")
    .single();

  if (error) return NextResponse.json({ error: "Update failed", detail: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const identifier = params.id;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  // Chỉ admin được xoá (dễ kiểm soát). Muốn cho owner xoá thì lấy dish & so sánh chef_id.
  const { data: prof } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = prof?.role === "admin";
  if (!isAdmin) return new NextResponse("Forbidden", { status: 403 });

  const { error } = await sb
    .from("dishes")
    .delete()
    [UUID_RE.test(identifier) ? "eq" : "eq"](
      UUID_RE.test(identifier) ? "id" : "slug",
      identifier
    );

  if (error) return NextResponse.json({ error: "Delete failed", detail: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
