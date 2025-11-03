import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function GET(req: Request) {
  const sb = await supabaseServer();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) return NextResponse.json([]);

  const { data, error } = await sb
    .from("dishes")
    .select(`
      title,
      slug,
      cover_image_url,
      category:category_id ( name )
    `)
    .ilike("title", `%${q}%`)
    .eq("published", true)
    .limit(10);

  if (error) {
    console.error("Suggestion API error:", error);
    return NextResponse.json([]);
  }

  return NextResponse.json(
    data.map((d) => ({
      title: d.title,
      slug: d.slug,
      image: d.cover_image_url,
      category: d.category?.name ?? "",
    }))
  );
}
