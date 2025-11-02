import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sb = await supabaseServer();

  const { error } = await sb.from("comments").delete().eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 403 });

  return NextResponse.json({ ok: true });
}
