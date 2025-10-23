<<<<<<< HEAD
//app/api/chefs/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: Params) {
  const { id } = params;

  try {
    const sb = await supabaseServer();

    // 1️⃣ Lấy thông tin đầu bếp theo id
    const { data: chef, error: chefError } = await sb
      .from("chefs")
      .select("id, user_id, display_name, avatar_url, bio, is_active, can_post, verified_at, created_at, updated_at")
      .eq("id", id)
      .single();

    if (chefError || !chef) {
      return NextResponse.json({ error: "Chef not found" }, { status: 404 });
    }

    // 2️⃣ Lấy danh sách rating của đầu bếp này
    const { data: ratings, error: ratingError } = await sb
      .from("chef_ratings")
      .select("id, rater_id, stars, comment, created_at")
      .eq("chef_id", id)
      .order("created_at", { ascending: false });

    if (ratingError) {
      return NextResponse.json({ error: ratingError.message }, { status: 400 });
    }

    // 3️⃣ Tính toán trung bình & tổng số đánh giá
    const totalRatings = ratings?.length || 0;
    const avgRating =
      totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.stars, 0) / totalRatings
        : null;

    // 4️⃣ Option: Lấy thêm thông tin người đánh giá (nếu muốn join profiles)
    // (chỉ chạy nếu bạn có bảng profiles và muốn hiển thị tên người đánh giá)
    // const { data: raters } = await sb
    //   .from("profiles")
    //   .select("id, display_name, avatar_url")
    //   .in("id", ratings.map(r => r.rater_id));

    // const ratersMap = Object.fromEntries(
    //   (raters || []).map(r => [r.id, r])
    // );

    const ratingsWithUser = ratings?.map(r => ({
      id: r.id,
      raterId: r.rater_id,
      stars: r.stars,
      comment: r.comment,
      createdAt: r.created_at,
      // raterName: ratersMap[r.rater_id]?.display_name ?? "Anonymous",
      // raterAvatar: ratersMap[r.rater_id]?.avatar_url ?? null
    }));

    // 5️⃣ Trả kết quả cho FE
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
      averageRating: avgRating,
      totalRatings,
      ratings: ratingsWithUser ?? [],
    });
  } catch (err) {
    console.error("Error fetching chef:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
=======
// app/api/chefs/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export const revalidate = 0;

export async function GET(request: Request) {
  // Extract id from request URL to avoid incompatible second param typing
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const chefsIndex = parts.indexOf("chefs");
  const id =
    chefsIndex >= 0 && parts.length > chefsIndex + 1
      ? parts[chefsIndex + 1]
      : null;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("chef_overview")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[GET /api/chefs/:id] error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Chef not found" }, { status: 404 });
  }
  return NextResponse.json(data);
>>>>>>> 0e2ad2146c8e9a983b848cde5a3185edea7c6d2a
}
