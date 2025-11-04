// app/api/chefs/[id]/follow/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

type Ctx = { params: { id: string } };

// GET: trả trạng thái + số liệu follow cho chef {id}
export async function GET(_req: Request, { params }: Ctx) {
  const chefId = params.id;
  const sb = await supabaseServer();

  // user hiện tại
  const { data: userRes, error: userErr } = await sb.auth.getUser();
  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });
  const currentUserId = userRes.user?.id ?? null;

  // đếm followers của chef
  const { count: followersCount, error: followersErr } = await sb
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("followed_id", chefId);
  if (followersErr) return NextResponse.json({ error: followersErr.message }, { status: 500 });

  // đếm following của chef (số người chef này đang theo dõi)
  const { count: followingCount, error: followingErr } = await sb
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", chefId);
  if (followingErr) return NextResponse.json({ error: followingErr.message }, { status: 500 });

  // current user có đang follow chef?
  let isFollowing = false;
  if (currentUserId) {
    const { data: rel, error: relErr } = await sb
      .from("follows")
      .select("follower_id")
      .eq("follower_id", currentUserId)
      .eq("followed_id", chefId)
      .maybeSingle();
    if (relErr) return NextResponse.json({ error: relErr.message }, { status: 500 });
    isFollowing = !!rel;
  }

  return NextResponse.json({
    chefId,
    followers: followersCount ?? 0,
    following: followingCount ?? 0,
    isFollowing,
    currentUserId,
  });
}

// POST: follow chef {id}
export async function POST(_req: Request, { params }: Ctx) {
  const chefId = params.id;
  const sb = await supabaseServer();

  const { data: userRes, error: userErr } = await sb.auth.getUser();
  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });
  const userId = userRes.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (userId === chefId) {
    return NextResponse.json({ error: "Bạn không thể tự theo dõi chính mình" }, { status: 400 });
  }

  // Upsert để tránh lỗi trùng (PK: follower_id + followed_id)
  const { error } = await sb
    .from("follows")
    .upsert({ follower_id: userId, followed_id: chefId })
    .eq("follower_id", userId)
    .eq("followed_id", chefId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

// DELETE: unfollow chef {id}
export async function DELETE(_req: Request, { params }: Ctx) {
  const chefId = params.id;
  const sb = await supabaseServer();

  const { data: userRes, error: userErr } = await sb.auth.getUser();
  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });
  const userId = userRes.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await sb
    .from("follows")
    .delete()
    .eq("follower_id", userId)
    .eq("followed_id", chefId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
