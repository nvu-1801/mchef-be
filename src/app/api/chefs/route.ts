// app/api/chefs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server"; // Giả định đây là đường dẫn đúng

// Luôn tìm nạp dữ liệu mới nhất, không cache
export const revalidate = 0; 

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 1. Lấy các tham số truy vấn (query params)
    const q = (searchParams.get("q") || "").trim();
    const page = Number(searchParams.get("page") || "1");
    
    // Giới hạn số lượng item mỗi trang, tối đa 50
    const limit = Math.min(Number(searchParams.get("limit") || "12"), 50); 
    
    // 2. Tính toán phân trang
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = await supabaseServer();

    // 3. Xây dựng truy vấn
    // Sử dụng VIEW 'chef_overview' đã tạo sẵn (giả định view này có chứa rating)
    let query = supabase
      .from("chef_overview")
      .select("*", { count: "exact" }) // Lấy tổng số lượng (count)
      .order("rating_avg", { ascending: false, nullsFirst: false }) // Sắp xếp theo rating
      .range(from, to); // Phân trang

    // 4. Thêm điều kiện tìm kiếm nếu có
    if (q) {
      // tìm theo display_name, không phân biệt hoa thường
      query = query.ilike("display_name", `%${q}%`);
    }

    // 5. Thực thi truy vấn
    const { data, error, count } = await query;

    if (error) {
      console.error("[GET /api/chefs] Lỗi Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 6. Trả về kết quả
    return NextResponse.json({
      page,
      limit,
      total: count ?? 0,
      items: data,
    });

  } catch (err: unknown) { // Đã sửa từ any sang unknown
    console.error("[GET /api/chefs] Lỗi máy chủ nội bộ:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}




// //app/api/chefs/route.ts
// import { NextResponse } from "next/server";
// import { supabaseServer } from "@/libs/db/supabase/supabase-server";

// export async function GET() {
//   try {
//     const sb = await supabaseServer();

//     // 1️⃣ Lấy danh sách chefs
//     const { data: chefs, error: chefsError } = await sb
//       .from("chefs")
//       .select("id, user_id, display_name, avatar_url, bio, is_active, can_post, verified_at, created_at, updated_at")
//       .order("created_at", { ascending: false });

//     if (chefsError) {
//       return NextResponse.json({ error: chefsError.message }, { status: 400 });
//     }

//     // 2️⃣ Lấy dữ liệu rating trung bình & tổng số đánh giá
//     const { data: ratings, error: ratingsError } = await sb
//       .from("chef_ratings")
//       .select("chef_id, stars");

//     if (ratingsError) {
//       return NextResponse.json({ error: ratingsError.message }, { status: 400 });
//     }

//     // 3️⃣ Tính trung bình rating cho từng chef
//     const ratingMap: Record<string, { total: number; count: number }> = {};

//     ratings?.forEach((r) => {
//       if (!ratingMap[r.chef_id]) ratingMap[r.chef_id] = { total: 0, count: 0 };
//       ratingMap[r.chef_id].total += r.stars;
//       ratingMap[r.chef_id].count += 1;
//     });

//     // 4️⃣ Kết hợp dữ liệu
//     const result = chefs.map((chef) => {
//       const rating = ratingMap[chef.id];
//       const avgRating = rating ? rating.total / rating.count : null;
//       const totalRatings = rating ? rating.count : 0;
//       return {
//         id: chef.id,
//         userId: chef.user_id,
//         displayName: chef.display_name,
//         avatarUrl: chef.avatar_url,
//         bio: chef.bio,
//         isActive: chef.is_active,
//         canPost: chef.can_post,
//         verifiedAt: chef.verified_at,
//         createdAt: chef.created_at,
//         updatedAt: chef.updated_at,
//         averageRating: avgRating,
//         totalRatings,
//       };
//     });

//     return NextResponse.json(result);
//   } catch (err) {
//     console.error("Error fetching chefs:", err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }

// // app/api/chefs/route.ts
// import { NextRequest } from "next/server";
// import { supabaseServer } from "@/libs/supabase/supabase-server";

// export const revalidate = 0; // luôn lấy mới cho API

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const q = (searchParams.get("q") || "").trim();
//   const page = Number(searchParams.get("page") || "1");
//   const limit = Math.min(Number(searchParams.get("limit") || "12"), 50);
//   const from = (page - 1) * limit;
//   const to = from + limit - 1;

//   const supabase = await supabaseServer();

//   // Dùng VIEW đã tạo
//   let query = supabase
//     .from("chef_overview")
//     .select("*", { count: "exact" })
//     .order("rating_avg", { ascending: false })
//     .range(from, to);

//   if (q) {
//     // tìm theo display_name, không phân biệt hoa thường
//     query = query.ilike("display_name", `%${q}%`);
//   }

//   const { data, error, count } = await query;

//   if (error) {
//     console.error("[GET /api/chefs] error", error);
//     return Response.json({ error: error.message }, { status: 500 });
//   }

//   return Response.json({
//     page,
//     limit,
//     total: count ?? 0,
//     items: data,
//   });
// }
