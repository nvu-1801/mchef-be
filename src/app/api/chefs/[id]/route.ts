// app/api/chefs/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export const revalidate = 0;

export async function GET(request: Request) {
  // Extract id from request URL to avoid incompatible second param typing
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const chefsIndex = parts.indexOf("chefs");
  const id =
    chefsIndex >= 0 && parts.length > chefsIndex + 1
      ? parts[chefsIndex + 1]
      : null;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("chef_overview")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[GET /api/chefs/:id] error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Chef not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
