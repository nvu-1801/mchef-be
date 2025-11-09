// app/api/comments/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

export async function DELETE(_req: Request, ctx: { params: Params }) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const sb = await supabaseServer();

  // --- Lấy user hiện tại ---
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Lấy thông tin user.role ---
  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";

  // --- Nếu không phải admin → chỉ xoá comment của chính mình ---
  if (!isAdmin) {
    const { data: comment } = await sb
      .from("comments")
      .select("user_id")
      .eq("id", id)
      .maybeSingle();

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // --- Thực hiện xoá ---
  const { error } = await sb.from("comments").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
