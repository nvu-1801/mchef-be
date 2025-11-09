// app/api/dishes/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import { createClient } from "@supabase/supabase-js";

/* =====================
 * 1. VALIDATION SCHEMA
 * ===================== */
const CreateDish = z.object({
  title: z.string().min(1).max(160),
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/),
  cover_image_url: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  category_id: z.string().uuid(),
  diet: z.string().min(1).max(30).optional(), // "veg" | "nonveg"
  time_minutes: z.number().int().min(0).max(100000).optional(),
  servings: z.number().int().min(1).max(1000).optional(),
  tips: z.string().max(5000).optional(),
  published: z.boolean().optional(),
  video_url: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

/* =====================
 * 2. TYPES
 * ===================== */
type DishRatingStats = {
  rating_avg: number | null;
  rating_count: number | null;
};

type DishImage = {
  id: string;
  image_url: string;
  alt: string | null;
  sort: number | null;
};

type RecipeStep = {
  step_no: number;
  content: string;
  image_url: string | null;
};

type Ingredient = {
  id: string;
  name: string;
  unit: string | null;
};

type DishIngredient = {
  amount: string | null;
  note: string | null;
  ingredient: Ingredient | Ingredient[] | null;
};

type Rating = {
  user_id: string;
  stars: number;
  comment: string | null;
  created_at: string;
};

type Favorite = {
  user_id: string;
};

type Creator = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
};

// Raw row từ Supabase (có thể có array từ joins)
type DishRawRow = {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  diet: string | null;
  time_minutes: number | null;
  servings: number | null;
  tips: string | null;
  video_url: string | null;
  review_status: string;
  created_by: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  category: Category | Category[] | null;
  dish_rating_stats: DishRatingStats[];
  dish_images: DishImage[];
  recipe_steps: RecipeStep[];
  dish_ingredients: DishIngredient[];
  ratings: Rating[];
  favorites: Favorite[];
  creator: Creator | Creator[] | null;
};

// Normalized row (đã flatten arrays từ joins)
type DishRow = {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  diet: string | null;
  time_minutes: number | null;
  servings: number | null;
  tips: string | null;
  video_url: string | null;
  review_status: string;
  created_by: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  category: Category | null;
  dish_rating_stats: DishRatingStats[];
  dish_images: DishImage[];
  recipe_steps: RecipeStep[];
  dish_ingredients: Array<{
    amount: string | null;
    note: string | null;
    ingredient: Ingredient | null;
  }>;
  ratings: Rating[];
  favorites: Favorite[];
  creator: Creator | null;
};

function normalizeDishRow(raw: DishRawRow): DishRow {
  // Normalize nested ingredients
  const normalizedIngredients = raw.dish_ingredients.map((di) => ({
    amount: di.amount,
    note: di.note,
    ingredient: Array.isArray(di.ingredient)
      ? di.ingredient[0] ?? null
      : di.ingredient ?? null,
  }));

  return {
    ...raw,
    category: Array.isArray(raw.category) ? raw.category[0] ?? null : raw.category ?? null,
    creator: Array.isArray(raw.creator) ? raw.creator[0] ?? null : raw.creator ?? null,
    dish_ingredients: normalizedIngredients,
  };
}

/* =====================
 * 3. GET /api/dishes
 * ===================== */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

  const category_id = searchParams.get("category_id") || undefined;
  const diet = searchParams.get("diet") || undefined; // veg | nonveg
  const highlight = searchParams.get("highlight") === "true"; // nổi bật
  const sortBy = searchParams.get("sort") || "rating"; // rating | created_at | servings

  const sb = await supabaseServer();

  // ====== TRUY VẤN CƠ BẢN ======
  let query = sb
    .from("dishes")
    .select(
      `
    id, category_id, title, slug, cover_image_url, diet, time_minutes, servings, tips,
    video_url, review_status,
    created_by, published, created_at, updated_at,
    category:category_id ( id, slug, name, icon ),
    dish_rating_stats ( rating_avg, rating_count ),
    dish_images ( id, image_url, alt, sort ),
    recipe_steps ( step_no, content, image_url ),
    dish_ingredients ( amount, note, ingredient:ingredient_id ( id, name, unit ) ),
    ratings ( user_id, stars, comment, created_at ),
    favorites ( user_id ),
    creator:created_by ( id, display_name, avatar_url )
    `,
      { count: "exact" }
    )
    .eq("review_status", "approved") // chỉ lấy approved
    .eq("published", true);

  // ====== LỌC ======
  if (q) query = query.ilike("title", `%${q}%`);
  if (category_id) query = query.eq("category_id", category_id);
  if (diet) query = query.eq("diet", diet);

  // ====== SẮP XẾP ======
  if (highlight) {
    // Món nổi bật = nhiều lượt rating và điểm cao
    query = query
      .order("rating_count", {
        foreignTable: "dish_rating_stats",
        ascending: false,
      })
      .order("rating_avg", {
        foreignTable: "dish_rating_stats",
        ascending: false,
      })
      .range(0, 4); // chỉ lấy top 5 món nổi bật
  } else if (sortBy === "rating") {
    query = query.order("rating_avg", {
      foreignTable: "dish_rating_stats",
      ascending: false,
    });
  } else if (sortBy === "created_at") {
    query = query.order("created_at", { ascending: false });
  } else if (sortBy === "servings") {
    query = query.order("servings", { ascending: false });
  } else {
    query = query.order("title", { ascending: true });
  }

  // ====== PHÂN TRANG ======
  if (!highlight) query = query.range(offset, offset + limit - 1);

  // ====== THỰC THI ======
  const { data, error, count } = await query;

  if (error) {
    console.error("[GET /api/dishes] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ====== SAU KHI LẤY VỀ ======

  // Helper: lấy rating trung bình an toàn
  function getRatingAvg(d: DishRow) {
    return d?.dish_rating_stats?.[0]?.rating_avg ?? 0;
  }

  // Normalize và tách món chay / mặn, sắp xếp giảm dần theo rating
  const items = (data ?? []).map((row) => normalizeDishRow(row as unknown as DishRawRow));

  const veg = items
    .filter((d) => d.diet === "veg")
    .sort((a, b) => getRatingAvg(b) - getRatingAvg(a));

  const nonveg = items
    .filter((d) => d.diet === "nonveg")
    .sort((a, b) => getRatingAvg(b) - getRatingAvg(a));

  // Gộp lại (món chay trước, món mặn sau)
  const combined = [...veg, ...nonveg];

  return NextResponse.json({
    items: combined,
    pagination: { limit, offset, total: count ?? 0 },
  });
}

/* =====================
 * 4. POST /api/dishes
 * ===================== */
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!jwt) return new Response("Unauthorized", { status: 401 });

  // ✅ Verify JWT bằng service key
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data: u, error: vErr } = await admin.auth.getUser(jwt);
  if (vErr || !u?.user) return new Response("Invalid token", { status: 401 });
  const user = u.user;

  // ✅ Client gắn JWT => RLS pass
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    }
  );

  const json = await req.json().catch(() => ({}));
  const parsed = CreateDish.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.format() },
      { status: 400 }
    );
  }

  const payload = parsed.data;

  const { data, error } = await userClient
    .from("dishes")
    .insert({
      title: payload.title,
      slug: payload.slug,
      cover_image_url: payload.cover_image_url ?? null,
      category_id: payload.category_id,
      diet: payload.diet ?? null,
      time_minutes: payload.time_minutes ?? null,
      servings: payload.servings ?? null,
      tips: payload.tips ?? null,
      video_url: payload.video_url ?? null,
      published: payload.published ?? false,
      created_by: user.id,
      review_status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select(
      `id, category_id, title, slug, cover_image_url, diet, time_minutes, servings,
     tips, created_by, published, created_at, updated_at, video_url, review_status`
    )
    .single();

  if (error) {
    console.error("[POST /api/dishes] Insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// // app/api/dishes/route.ts
// import { NextResponse } from "next/server";
// import { z } from "zod";
// import { supabaseServer } from "@/libs/supabase/supabase-server";
// import { createClient } from "@supabase/supabase-js";

// /* =====================
//  * 1. VALIDATION SCHEMA
//  * ===================== */
// const CreateDish = z.object({
//   title: z.string().min(1).max(160),
//   slug: z
//     .string()
//     .min(1)
//     .max(160)
//     .regex(/^[a-z0-9-]+$/),
//   cover_image_url: z
//     .string()
//     .url()
//     .optional()
//     .or(z.literal("").transform(() => undefined)),
//   category_id: z.string().uuid(),
//   diet: z.string().min(1).max(30).optional(), // "veg" | "nonveg"
//   time_minutes: z.number().int().min(0).max(100000).optional(),
//   servings: z.number().int().min(1).max(1000).optional(),
//   tips: z.string().max(5000).optional(),
//   published: z.boolean().optional(),
//   video_url: z
//     .string()
//     .url()
//     .optional()
//     .or(z.literal("").transform(() => undefined)),
// });

// /* =====================
//  * 2. GET /api/dishes
//  * ===================== */
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const q = searchParams.get("q")?.trim() || "";
//   const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
//   const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

//   const category_id = searchParams.get("category_id") || undefined;
//   const diet = searchParams.get("diet") || undefined; // veg | nonveg
//   const highlight = searchParams.get("highlight") === "true"; // nổi bật
//   const sortBy = searchParams.get("sort") || "rating"; // rating | created_at | servings

//   const sb = await supabaseServer();

//   // ====== TRUY VẤN CƠ BẢN ======
//   let query = sb
//     .from("dishes")
//     .select(
//       `
//     id, category_id, title, slug, cover_image_url, diet, time_minutes, servings, tips,
//     video_url, review_status,
//     created_by, published, created_at, updated_at,
//     category:category_id ( id, slug, name, icon ),
//     dish_rating_stats ( rating_avg, rating_count ),
//     dish_images ( id, image_url, alt, sort ),
//     recipe_steps ( step_no, content, image_url ),
//     dish_ingredients ( amount, note, ingredient:ingredient_id ( id, name, unit ) ),
//     ratings ( user_id, stars, comment, created_at ),
//     favorites ( user_id ),
//     creator:created_by ( id, display_name, avatar_url )
//     `,
//       { count: "exact" }
//     )
//     .eq("review_status", "approved") // chỉ lấy approved
//     .eq("published", true);

//   // ====== LỌC ======
//   if (q) query = query.ilike("title", `%${q}%`);
//   if (category_id) query = query.eq("category_id", category_id);
//   if (diet) query = query.eq("diet", diet);

//   // ====== SẮP XẾP ======
//   if (highlight) {
//     // Món nổi bật = nhiều lượt rating và điểm cao
//     query = query
//       .order("rating_count", {
//         foreignTable: "dish_rating_stats",
//         ascending: false,
//       })
//       .order("rating_avg", {
//         foreignTable: "dish_rating_stats",
//         ascending: false,
//       })
//       .range(0, 4); // chỉ lấy top 5 món nổi bật
//   } else if (sortBy === "rating") {
//     query = query.order("rating_avg", {
//       foreignTable: "dish_rating_stats",
//       ascending: false,
//     });
//   } else if (sortBy === "created_at") {
//     query = query.order("created_at", { ascending: false });
//   } else if (sortBy === "servings") {
//     query = query.order("servings", { ascending: false });
//   } else {
//     query = query.order("title", { ascending: true });
//   }

//   // ====== PHÂN TRANG ======
//   if (!highlight) query = query.range(offset, offset + limit - 1);

//   // ====== THỰC THI ======
//   const { data, error, count } = await query;

//   if (error) {
//     console.error("[GET /api/dishes] Error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   // ====== SAU KHI LẤY VỀ ======

//   // Helper: lấy rating trung bình an toàn
//   function getRatingAvg(d: any) {
//     return d?.dish_rating_stats?.[0]?.rating_avg ?? 0;
//   }

//   // Tách món chay / mặn, sắp xếp giảm dần theo rating
//   const items = (data ?? []) as any[];

//   const veg = items
//     .filter((d: any) => d.diet === "veg")
//     .sort((a: any, b: any) => getRatingAvg(b) - getRatingAvg(a));

//   const nonveg = items
//     .filter((d: any) => d.diet === "nonveg")
//     .sort((a: any, b: any) => getRatingAvg(b) - getRatingAvg(a));

//   // Gộp lại (món chay trước, món mặn sau)
//   const combined = [...veg, ...nonveg];

//   return NextResponse.json({
//     items: combined,
//     pagination: { limit, offset, total: count ?? 0 },
//   });
// }

// /* =====================
//  * 3. POST /api/dishes
//  * ===================== */
// export async function POST(req: Request) {
//   const authHeader = req.headers.get("authorization") || "";
//   const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
//   if (!jwt) return new Response("Unauthorized", { status: 401 });

//   // ✅ Verify JWT bằng service key
//   const admin = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!,
//     { auth: { persistSession: false } }
//   );
//   const { data: u, error: vErr } = await admin.auth.getUser(jwt);
//   if (vErr || !u?.user) return new Response("Invalid token", { status: 401 });
//   const user = u.user;

//   // ✅ Client gắn JWT => RLS pass
//   const userClient = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       auth: { persistSession: false, detectSessionInUrl: false },
//       global: { headers: { Authorization: `Bearer ${jwt}` } },
//     }
//   );

//   const json = await req.json().catch(() => ({}));
//   const parsed = CreateDish.safeParse(json);
//   if (!parsed.success) {
//     return NextResponse.json(
//       { error: "Invalid body", issues: parsed.error.format() },
//       { status: 400 }
//     );
//   }

//   const payload = parsed.data;

//   const { data, error } = await userClient
//     .from("dishes")
//     .insert({
//       title: payload.title,
//       slug: payload.slug,
//       cover_image_url: payload.cover_image_url ?? null,
//       category_id: payload.category_id,
//       diet: payload.diet ?? null,
//       time_minutes: payload.time_minutes ?? null,
//       servings: payload.servings ?? null,
//       tips: payload.tips ?? null,
//       video_url: payload.video_url ?? null,
//       published: payload.published ?? false,
//       created_by: user.id,
//       review_status: "pending",
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//     })
//     .select(
//       `id, category_id, title, slug, cover_image_url, diet, time_minutes, servings,
//      tips, created_by, published, created_at, updated_at, video_url, review_status`
//     )
//     .single();

//   if (error) {
//     console.error("[POST /api/dishes] Insert error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   return NextResponse.json(data, { status: 201 });
// }
