//app/api/chefs/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";

export async function GET() {
  try {
    const sb = await supabaseServer();

    // 1️⃣ Lấy danh sách chefs
    const { data: chefs, error: chefsError } = await sb
      .from("chefs")
      .select("id, user_id, display_name, avatar_url, bio, is_active, can_post, verified_at, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (chefsError) {
      return NextResponse.json({ error: chefsError.message }, { status: 400 });
    }

    // 2️⃣ Lấy dữ liệu rating trung bình & tổng số đánh giá
    const { data: ratings, error: ratingsError } = await sb
      .from("chef_ratings")
      .select("chef_id, stars");

    if (ratingsError) {
      return NextResponse.json({ error: ratingsError.message }, { status: 400 });
    }

    // 3️⃣ Tính trung bình rating cho từng chef
    const ratingMap: Record<string, { total: number; count: number }> = {};

    ratings?.forEach((r) => {
      if (!ratingMap[r.chef_id]) ratingMap[r.chef_id] = { total: 0, count: 0 };
      ratingMap[r.chef_id].total += r.stars;
      ratingMap[r.chef_id].count += 1;
    });

    // 4️⃣ Kết hợp dữ liệu
    const result = chefs.map((chef) => {
      const rating = ratingMap[chef.id];
      const avgRating = rating ? rating.total / rating.count : null;
      const totalRatings = rating ? rating.count : 0;
      return {
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
        averageRating: avgRating,
        totalRatings,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching chefs:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
