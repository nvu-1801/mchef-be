// app/api/chefs/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export const dynamic = "force-dynamic";

// Kiểu cho ratings (không giả định có cột id)
interface ChefRatingRow {
  rater_id: string;
  stars: number;
  comment: string | null;
  created_at: string;
}

// ⚠️ Ở bản Next của bạn, params là Promise => kiểu như sau
type RouteContextPromise = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteContextPromise) {
  // 🔑 BẮT BUỘC await params trước khi lấy id
  const { id } = await ctx.params;

  try {
    const sb = await supabaseServer();

    // 1) Tìm chef theo chef.id HOẶC user_id
    const { data: chef, error: chefError } = await sb
      .from("chefs")
      .select(
        "id, user_id, display_name, avatar_url, bio, is_active, can_post, verified_at, created_at, updated_at"
      )
      .or(`id.eq.${id},user_id.eq.${id}`)
      .limit(1)
      .maybeSingle();

    if (chefError) {
      return NextResponse.json({ error: chefError.message }, { status: 400 });
    }
    if (!chef) {
      return NextResponse.json({ error: "Chef not found" }, { status: 404 });
    }

    // 2) Lấy ratings bằng chef.id (đúng quan hệ)
    const { data: ratings, error: ratingError } = await sb
      .from("chef_ratings")
      .select("rater_id, stars, comment, created_at")
      .eq("chef_id", chef.id)
      .order("created_at", { ascending: false })
      .returns<ChefRatingRow[]>();

    if (ratingError) {
      return NextResponse.json({ error: ratingError.message }, { status: 400 });
    }

    const list = ratings ?? [];
    const totalRatings = list.length;
    const sum = list.reduce((s, r) => s + (r.stars ?? 0), 0);
    const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(2)) : null;

    const ratingsWithUser = list.map((r) => ({
      id: `${r.rater_id}::${r.created_at}`, // synthetic id nếu bảng không có id
      raterId: r.rater_id,
      stars: r.stars,
      comment: r.comment,
      createdAt: r.created_at,
    }));

    return NextResponse.json({
      id: chef.id,
      userId: chef.user_id,
      displayName: chef.display_name,
      avatarUrl: chef.avatar_url,
      bio: chef.bio,
      isActive: chef.is_active,
      canPost: chef.can_post,
      verifiedAt: chef.verified_at,
      createdAt: chef.created_at,
      updatedAt: chef.updated_at,
      averageRating,
      totalRatings,
      ratings: ratingsWithUser,
    });
  } catch (err) {
    console.error("[GET /api/chefs/[id]] error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
