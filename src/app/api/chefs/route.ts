// app/api/chefs/route.ts
import { NextRequest } from "next/server";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";

export const revalidate = 0; // luôn lấy mới cho API

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = Number(searchParams.get("page") || "1");
  const limit = Math.min(Number(searchParams.get("limit") || "12"), 50);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = await supabaseServer();

  // Dùng VIEW đã tạo
  let query = supabase
    .from("chef_overview")
    .select("*", { count: "exact" })
    .order("rating_avg", { ascending: false })
    .range(from, to);

  if (q) {
    // tìm theo display_name, không phân biệt hoa thường
    query = query.ilike("display_name", `%${q}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[GET /api/chefs] error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    page,
    limit,
    total: count ?? 0,
    items: data,
  });
}
