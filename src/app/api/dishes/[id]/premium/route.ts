// app/api/dishes/[id]/premium/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

type Ctx = { params: { id: string } };

async function getCurrentUser(sb: ReturnType<typeof supabaseServer> extends Promise<infer T> ? T : never) {
  const { data, error } = await sb.auth.getUser();
  if (error) throw new Error(error.message);
  return data.user ?? null;
}

// GET: trạng thái premium + quyền xem
export async function GET(_req: Request, { params }: Ctx) {
  const dishId = params.id;
  const sb = await supabaseServer();

  // lấy user + role
  const user = await getCurrentUser(sb);
  const userId = user?.id ?? null;
  let role: string | null = null;
  if (userId) {
    const { data: me } = await sb.from("profiles").select("role").eq("id", userId).maybeSingle();
    role = me?.role ?? null;
  }

  // lấy premium row
  const { data: prem, error: premErr } = await sb
    .from("premium_dishes")
    .select("dish_id, chef_id, required_plan, active")
    .eq("dish_id", dishId)
    .maybeSingle();

  if (premErr) return NextResponse.json({ error: premErr.message }, { status: 400 });

  const isPremium = !!prem;
  if (!isPremium) {
    return NextResponse.json({ isPremium: false, canView: true });
  }

  // chef sở hữu món hoặc admin => xem được
  if (userId && (userId === prem!.chef_id || role === "admin")) {
    return NextResponse.json({
      isPremium: true,
      active: prem!.active,
      required_plan: prem!.required_plan,
      canView: true,
      reason: "owner_or_admin",
    });
  }

  // nếu không active => coi như free
  if (!prem!.active) {
    return NextResponse.json({
      isPremium: true,
      active: false,
      required_plan: prem!.required_plan,
      canView: true,
      reason: "inactive",
    });
  }

  // kiểm tra quyền xem qua orders (đã thanh toán plan đúng loại)
  let canView = false;
  if (userId) {
    const { data: paid, error } = await sb
      .from("orders")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .eq("status", "PAID")
      .eq("plan_id", prem!.required_plan)
      .limit(1);
    if (!error) {
      canView = (paid?.length ?? 0) > 0;
    }
  }

  return NextResponse.json({
    isPremium: true,
    active: prem!.active,
    required_plan: prem!.required_plan,
    canView,
    reason: canView ? "has_plan" : "plan_required",
  });
}

// chỉ chef (hoặc admin) được phép chỉnh sửa premium của món
async function assertChefOrAdmin(sb: any, dishId: string) {
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

// POST: bật premium
export async function POST(req: Request, { params }: Ctx) {
  const dishId = params.id;
  const sb = await supabaseServer();
  const gate = await assertChefOrAdmin(sb, dishId);
  if (!gate.ok) return NextResponse.json({ error: gate.msg }, { status: gate.status });

  const body = await req.json().catch(() => ({}));
  const required_plan: string = body?.required_plan || "premium";
  const note: string | null = body?.note ?? null;
  const active: boolean = body?.active ?? true;

  // xác định chef_id: ưu tiên created_by của dish
  const { data: dish } = await sb.from("dishes").select("created_by").eq("id", dishId).maybeSingle();
  const chefId = dish?.created_by ?? gate.uid;

  // upsert theo unique(dish_id)
  const { error } = await sb.from("premium_dishes").upsert(
    {
      dish_id: dishId,
      chef_id: chefId,
      required_plan,
      note,
      active,
    },
    { onConflict: "dish_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

// PATCH: cập nhật premium (active / required_plan / note)
export async function PATCH(req: Request, { params }: Ctx) {
  const dishId = params.id;
  const sb = await supabaseServer();
  const gate = await assertChefOrAdmin(sb, dishId);
  if (!gate.ok) return NextResponse.json({ error: gate.msg }, { status: gate.status });

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body.required_plan === "string") patch.required_plan = body.required_plan;
  if (typeof body.note === "string" || body.note === null) patch.note = body.note;
  if (typeof body.active === "boolean") patch.active = body.active;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await sb.from("premium_dishes").update(patch).eq("dish_id", dishId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

// DELETE: gỡ premium khỏi món
export async function DELETE(_req: Request, { params }: Ctx) {
  const dishId = params.id;
  const sb = await supabaseServer();
  const gate = await assertChefOrAdmin(sb, dishId);
  if (!gate.ok) return NextResponse.json({ error: gate.msg }, { status: gate.status });

  const { error } = await sb.from("premium_dishes").delete().eq("dish_id", dishId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
