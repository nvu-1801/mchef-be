// src/modules/dishes/service/dish.service.ts
import "server-only";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import type { Dish, DishFull } from "../dish-public";

/* =========================
 * 1) CONSTANTS & UTILITIES
 * ========================= */

const SUPABASE_BASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ?? "";
const DEFAULT_IMAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET || "dishes";

/** Supabase public object URL builder: bucket/key -> full URL */
export function imagePathToUrl(objectPath: string) {
  const safe = objectPath.split("/").map(encodeURIComponent).join("/");
  if (!SUPABASE_BASE) {
    // Fallback khi chưa có env: coi như ảnh trong /public
    return `/${objectPath.replace(/^\/+/, "")}`;
  }
  return `${SUPABASE_BASE}/storage/v1/object/public/${safe}`;
}

function isAbsoluteUrl(u: string) {
  return /^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("//");
}

/** Chuẩn hoá giá trị ảnh lưu trong DB thành URL dùng được */
export function resolveImageUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const url = raw.trim();
  if (!url) return null;

  // 1) URL tuyệt đối (http/https/data/ //...)
  if (isAbsoluteUrl(url)) {
    // Chuẩn hoá dạng protocol-relative: //domain.com/...
    if (url.startsWith("//")) return `https:${url}`;
    return url;
  }

  // 2) Ảnh trong thư mục /public
  if (url.startsWith("/")) return url;

  // 3) Key của Supabase Storage: "bucket/file" hoặc chỉ "file"
  const objectPath = url.includes("/") ? url : `${DEFAULT_IMAGE_BUCKET}/${url}`;
  return imagePathToUrl(objectPath);
}

/** Wrapper cho model Dish */
export function dishImageUrl(d: Pick<Dish, "cover_image_url">) {
  return resolveImageUrl(d.cover_image_url);
}

/* =========================
 * 2) CATEGORIES
 * ========================= */

/** Lấy danh mục (id, name, slug) sắp xếp theo name */
export async function listCategories() {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/* =========================
 * 3) DISHES (LIST + DETAIL)
 * ========================= */

type CatKey = "all" | string;

// Chọn cột chung cho list
const DISH_FIELDS =
  "id,title,slug,cover_image_url,diet,time_minutes,servings,category_id";

// Khi filter theo slug danh mục, phải dùng !inner để join bắt buộc
const DISH_SELECT_WITH_FILTER = `${DISH_FIELDS},categories:category_id!inner(slug,name)`;
// Khi không filter, join thường (left) để không loại các record không có category
const DISH_SELECT_DEFAULT = `${DISH_FIELDS},categories:category_id(slug,name)`;

/**
 * Lấy danh sách món:
 * - q: tìm theo title (ILIKE)
 * - cat: "all" hoặc slug của category
 * - Chỉ lấy published: true
 * - Tạm order theo title (nếu muốn theo thời gian, thêm created_at trong schema & select)
 */ export async function listDishes({
  q = "",
  cat = "all",
  page = 1,
  pageSize = 12,
}: { q?: string; cat?: CatKey; page?: number; pageSize?: number } = {}) {
  const sb = await supabaseServer();
  const usingFilter = !!cat && cat !== "all";

  // đảm bảo page hợp lệ
  const _page = Math.max(1, Number(page) || 1);
  const _size = Math.max(1, Number(pageSize) || 12);
  const from = (_page - 1) * _size;
  const to = from + _size - 1;

  let qy = sb
    .from("dishes")
    // lấy cả count để tính tổng trang
    .select(usingFilter ? DISH_SELECT_WITH_FILTER : DISH_SELECT_DEFAULT, {
      count: "exact",
    })
    .eq("published", true)
    .order("title", { ascending: true });

  if (q) qy = qy.ilike("title", `%${q}%`);
  if (usingFilter) qy = qy.eq("categories.slug", cat); // giữ nguyên cách filter theo slug của bạn

  // phân trang với range (to là chỉ số *inclusive*)
  qy = qy.range(from, to);

  const { data, count, error } = await qy;
  if (error) {
    console.error("[listDishes]", error);
    throw new Error(error.message);
  }

  return {
    items: (data ?? []) as Dish[],
    total: count ?? 0,
    page: _page,
    pageSize: _size,
  };
}

/** Lấy 1 món FULL theo slug (published) */
export async function getDishFullBySlug(slug: string) {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("dishes")
    .select(
      `
      id, category_id, title, slug, cover_image_url, diet, time_minutes, servings, tips,
      video_url,
      created_by, published, created_at, updated_at,

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
    .order("sort", { foreignTable: "dish_images", ascending: true })
    .order("step_no", { foreignTable: "recipe_steps", ascending: true })
    .order("created_at", { foreignTable: "ratings", ascending: false })
    .maybeSingle<DishFull>();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("NOT_FOUND");

  return data;
}

/** Lấy 1 món theo slug (published) */
export async function getDishBySlug(slug: string) {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("dishes")
    .select(
      "id,title,slug,cover_image_url,diet,time_minutes,servings,category_id,tips"
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("NOT_FOUND");

  return data as Dish & { tips: string | null };
}
