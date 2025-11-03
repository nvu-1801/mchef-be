// app/api/moderation/dishes/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const status = (searchParams.get("status") as "pending"|"approved"|"rejected"|null) ?? "pending";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

  const sb = await supabaseServer();

  // check admin
  const { data: sessionRes } = await sb.auth.getUser();
  const uid = sessionRes.user?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: prof } = await sb.from("profiles").select("role").eq("id", uid).single();
  if (prof?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

 let query = sb
  .from("dishes")
  .select(`
    id, title, slug, cover_image_url, created_at, updated_at, published,
    review_status, review_note, diet,                
    creator:created_by ( id, display_name, avatar_url ),
    category:category_id ( id, name, slug, icon )
  `, { count: "exact" })
  .order("created_at", { ascending: false });


  if (status) query = query.eq("review_status", status);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    items: data ?? [],
    pagination: { limit, offset, total: count ?? 0 },
  });
}
