// app/api/dishes/[id]/premium/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

type Ctx = { params: { id: string } };

async function getCurrentUser(sb: Awaited<ReturnType<typeof supabaseServer>>) {
  const { data, error } = await sb.auth.getUser();
  if (error) throw new Error(error.message);
  return data.user ?? null;
}

// GET: trạng thái premium + quyền xem
export async function GET(_req: Request, { params }: Ctx) {
  const dishId = params.id;
  const sb = await supabaseServer();

  const user = await getCurrentUser(sb);
  const userId = user?.id ?? null;

  let role: string | null = null;
  if (userId) {
    const { data: me } = await sb.from("profiles").select("role").eq("id", userId).maybeSingle();
    role = me?.role ?? null;
  }

  const { data: prem, error: premErr } = await sb
    .from("premium_dishes")
    .select("dish_id, chef_id, active, required_plan")
    .eq("dish_id", dishId)
    .maybeSingle();
  if (premErr) return NextResponse.json({ error: premErr.message }, { status: 400 });

  const isPremium = !!prem;
  if (!isPremium) {
    // Free
    return NextResponse.json({ isPremium: false, canView: true });
  }

  // Chủ món hoặc admin -> xem được
  if (userId && (userId === prem!.chef_id || role === "admin")) {
    return NextResponse.json({
      isPremium: true,
      active: prem!.active,
      canView: true,
      reason: "owner_or_admin",
    });
  }

  // Nếu đang inactive -> coi như free
  if (!prem!.active) {
    return NextResponse.json({
      isPremium: true,
      active: false,
      canView: true,
      reason: "inactive",
    });
  }

  // Kiểm tra đã mua plan 'premium' chưa
  let canView = false;
  if (userId) {
    const { data: paid, error } = await sb
      .from("orders")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .eq("status", "PAID")
      .eq("plan_id", "premium") // cố định
      .limit(1);
    if (!error) canView = (paid?.length ?? 0) > 0;
  }

  return NextResponse.json({
    isPremium: true,
    active: prem!.active,
    canView,
    reason: canView ? "has_plan" : "plan_required",
  });
}

async function assertChefOrAdmin(sb: Awaited<ReturnType<typeof supabaseServer>>, dishId: string) {
  const { data: me } = await sb.auth.getUser();
  const uid = me.user?.id;
  if (!uid) return { ok: false, status: 401, msg: "Unauthorized" };

  const [{ data: roleRow }, { data: dishRow }] = await Promise.all([
    sb.from("profiles").select("role").eq("id", uid).maybeSingle(),
    sb.from("dishes").select("created_by").eq("id", dishId).maybeSingle(),
  ]);

  const isAdmin = roleRow?.role === "admin";
  const isOwner = dishRow?.created_by === uid;
  if (!(isAdmin || isOwner)) return { ok: false, status: 403, msg: "Forbidden" };
  return { ok: true, uid };
}

// POST: bật premium (mặc định required_plan = 'premium')
export async function POST(req: Request, { params }: Ctx) {
  const dishId = params.id;
  const sb = await supabaseServer();
  const gate = await assertChefOrAdmin(sb, dishId);
  if (!gate.ok) return NextResponse.json({ error: gate.msg }, { status: gate.status });

  const body = await req.json().catch(() => ({}));
  const active: boolean = body?.active ?? true;

  const { data: dish } = await sb.from("dishes").select("created_by").eq("id", dishId).maybeSingle();
  const chefId = dish?.created_by ?? gate.uid;

  const { error } = await sb.from("premium_dishes").upsert(
    {
      dish_id: dishId,
      chef_id: chefId,
      required_plan: "premium", // cố định
      active,
    },
    { onConflict: "dish_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// PATCH: chỉ cho phép bật/tắt (active)
export async function PATCH(req: Request, { params }: Ctx) {
  const dishId = params.id;
  const sb = await supabaseServer();
  const gate = await assertChefOrAdmin(sb, dishId);
  if (!gate.ok) return NextResponse.json({ error: gate.msg }, { status: gate.status });

  const body = await req.json().catch(() => ({}));
  if (typeof body.active !== "boolean") {
    return NextResponse.json({ error: "Missing 'active' boolean" }, { status: 400 });
  }

  const { error } = await sb.from("premium_dishes").update({ active: body.active }).eq("dish_id", dishId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

// DELETE: gỡ premium -> Free
export async function DELETE(_req: Request, { params }: Ctx) {
  const dishId = params.id;
  const sb = await supabaseServer();
  const gate = await assertChefOrAdmin(sb, dishId);
  if (!gate.ok) return NextResponse.json({ error: gate.msg }, { status: gate.status });

  const { error } = await sb.from("premium_dishes").delete().eq("dish_id", dishId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
