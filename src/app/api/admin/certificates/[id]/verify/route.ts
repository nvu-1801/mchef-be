// app/api/admin/certificates/[id]/verify/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export const dynamic = "force-dynamic"; // (khuyên dùng khi có check auth)

type Params = { id: string };

export async function POST(
  req: Request,
  { params }: { params: Params }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }

  // parse body an toàn
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // giữ body = {}
  }

  // map action hợp lệ
  const actionRaw = typeof body.action === "string" ? body.action : "";
  const action =
    actionRaw === "reject" ? "rejected" :
    actionRaw === "approve" ? "approved" :
    null;

  if (!action) {
    return NextResponse.json(
      { ok: false, error: "Invalid action. Use 'approve' or 'reject'." },
      { status: 400 }
    );
  }

  const sb = await supabaseServer();
  const { data: { user }, error: authErr } = await sb.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // (tuỳ chọn) kiểm tra quyền admin ở đây nếu có cột/claim role

  // chuẩn bị payload update
  const update: Record<string, unknown> = {
    status: action,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  };
  if (action === "rejected" && typeof body.reason === "string") {
    update.rejection_reason = body.reason.slice(0, 500);
  }

  const { error } = await sb.from("certificates").update(update).eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
