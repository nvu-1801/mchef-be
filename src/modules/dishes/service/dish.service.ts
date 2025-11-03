// ================================
// src/modules/dishes/service/dish.service.ts
// ================================
import type { Dish, DishFull } from "../dish-public";

/* =========================
 * 1) SUPABASE HELPERS (TỰ ĐỘNG CHỌN CLIENT)
 * ========================= */

/**
 * Tự động chọn client phù hợp:
 * - Nếu đang ở server (SSR hoặc route.ts) → dùng supabaseServer()
 * - Nếu đang ở client (trình duyệt) → dùng supabaseBrowser()
 *
 * ⚠️ Quan trọng: KHÔNG import trực tiếp supabase-server ở đầu file,
 * mà import động bên trong hàm, để tránh Next build nhầm trong client.
 */
async function getSupabase() {
  if (typeof window !== "undefined") {
    const { supabaseBrowser } = await import("@/libs/supabase/supabase-client");
    return supabaseBrowser();
  } else {
    const { supabaseServer } = await import("@/libs/supabase/supabase-server");
    return supabaseServer();
  }
}

/* =========================
 * 2) IMAGE UTILITIES
 * ========================= */

const SUPABASE_BASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ?? "";
const DEFAULT_IMAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET || "dishes";

export function imagePathToUrl(objectPath: string) {
  const safe = objectPath.split("/").map(encodeURIComponent).join("/");
  if (!SUPABASE_BASE) return `/${objectPath.replace(/^\/+/, "")}`;
  return `${SUPABASE_BASE}/storage/v1/object/public/${safe}`;
}

function isAbsoluteUrl(u: string) {
  return /^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("//");
}

export function resolveImageUrl(raw?: string | null): string | null {
  if (!raw) return null;

  // ✅ Bảo vệ: chỉ trim nếu là string
  const url = typeof raw === "string" ? raw.trim() : String(raw ?? "");

  if (!url) return null;
  if (isAbsoluteUrl(url)) return url.startsWith("//") ? `https:${url}` : url;
  if (url.startsWith("/")) return url;

  // fallback: thêm đường dẫn CDN/public nếu cần
  return `/images/${url}`;
}

/* =========================
 * 3) DISHES LIST
 * ========================= */

export async function listDishes({
  q = "",
  page = 1,
  pageSize = 10,
  diet,
  sortBy = "created_at",
}: {
  q?: string;
  page?: number;
  pageSize?: number;
  diet?: "veg" | "nonveg";
  sortBy?: "title" | "rating" | "created_at";
} = {}) {
  const sb = await getSupabase();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = sb
    .from("dishes")
    .select(
      "id,title,slug,cover_image_url,diet,time_minutes,servings,created_at",
      { count: "exact" }
    )
    .eq("published", true);

  if (q) query = query.ilike("title", `%${q}%`);
  if (diet) query = query.eq("diet", diet);

  if (sortBy === "created_at")
    query = query.order("created_at", { ascending: false });
  else query = query.order("title", { ascending: true });

  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);

  return {
    items: (data ?? []) as Dish[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

/* =========================
 * 4) DISH DETAIL
 * ========================= */

export async function getDishFullBySlug(slug: string) {
  const sb = await getSupabase();
  const { data, error } = await sb
    .from("dishes")
    .select(
      `
      id, category_id, title, slug, cover_image_url, diet, time_minutes, servings, tips,
      video_url,
      created_by, published, created_at, updated_at,
      description, difficulty, calories, 
      category:category_id ( id, slug, name, icon ),
      dish_images ( id, image_url, alt, sort ),
      recipe_steps ( step_no, content, image_url ),
      dish_ingredients (
        amount, note,
        ingredient:ingredient_id ( id, name, unit )
      ),
      ratings ( user_id, stars, comment, created_at ),
      favorites ( user_id ),
      creator:created_by ( id, display_name, avatar_url )
      `
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle<DishFull>();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("NOT_FOUND");
  return data;
}
export const dishImageUrl = resolveImageUrl;
