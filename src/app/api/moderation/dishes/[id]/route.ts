// app/api/moderation/dishes/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/libs/supabase/supabase-server";

const Body = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().max(2000).optional(), // lý do reject
});

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sb = await supabaseServer();

  // check admin
  const { data: sessionRes } = await sb.auth.getUser();
  const uid = sessionRes.user?.id;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: prof } = await sb.from("profiles").select("role").eq("id", uid).single();
  if (prof?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.format() }, { status: 400 });
  }

  const { action, reason } = parsed.data;

  const payload =
    action === "approve"
      ? { review_status: "approved", published: true, review_note: null }
      : { review_status: "rejected", published: false, review_note: reason ?? null };

  const { data, error } = await sb
    .from("dishes")
    .update(payload)
    .eq("id", id)
    .select("id, title, review_status, published, review_note, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ item: data });
}
