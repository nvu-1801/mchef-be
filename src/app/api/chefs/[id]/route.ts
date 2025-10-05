// app/api/chefs/[id]/route.ts
import { NextRequest } from "next/server";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";

export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await supabaseServer();

  // id là UUID của bảng chefs
  const { data, error } = await supabase
    .from("chef_overview")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    console.error("[GET /api/chefs/:id] error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: "Chef not found" }, { status: 404 });
  }
  return Response.json(data);
}
