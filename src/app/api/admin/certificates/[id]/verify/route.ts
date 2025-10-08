// app/api/admin/certificates/[id]/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { action, reason } = await req.json().catch(() => ({}));
  if (!["approve","reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const updates =
    action === "approve"
      ? { status: "approved", reviewed_at: new Date().toISOString(), rejection_reason: null }
      : { status: "rejected", reviewed_at: new Date().toISOString(), rejection_reason: reason ?? null };

  const { error } = await sb
    .from("certificates")
    .update(updates)
    .eq("id", params.id)
    .in("status", ["pending"]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
