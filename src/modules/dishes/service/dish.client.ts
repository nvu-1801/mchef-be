// ================================
// src/modules/dishes/service/dish.client.ts
// ================================
"use client";

import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import type { Dish } from "../dish-public";
import { resolveImageUrl } from "../dish-public";

const sb = supabaseBrowser();

// Type cho dữ liệu trả về từ Supabase
type DishQueryResult = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  diet: "veg" | "nonveg";
  review_status: string;
  time_minutes: number | null;
  servings: number | null;
  video_url: string | null;
  category:
    | {
        id: string;
        slug: string;
        name: string;
        icon: string | null;
      }
    | {
        id: string;
        slug: string;
        name: string;
        icon: string | null;
      }[];
  premium:
    | {
        active: boolean;
        required_plan: string | null;
        chef_id: string | null;
      }[]
    | null;
};

/** 📱 Lấy danh sách món ăn (client-side, có phân trang) */
export async function listDishesClient({
  q = "",
  cat = "all",
  diet,
  sortBy = "title",
  page = 1,
  pageSize = 10,
}: {
  q?: string;
  cat?: string;
  diet?: "veg" | "nonveg";
  sortBy?: "title" | "created_at";
  page?: number;
  pageSize?: number;
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = sb
    .from("dishes")
    .select(
      `
      *,
      category:categories(id, slug, name, icon),
      premium:premium_dishes(active, required_plan, chef_id)
    `,
      { count: "exact" }
    )
    .eq("review_status", "approved")
    .range(from, to);

  if (cat !== "all") query = query.eq("category_id", cat);
  if (diet) query = query.eq("diet", diet);
  if (sortBy === "created_at")
    query = query.order("created_at", { ascending: false });
  else query = query.order("title", { ascending: true });

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  // 🔧 Transform data to ensure premium is an object
  const items = (data ?? []).map((dish) => ({
    ...dish,
    premium:
      Array.isArray(dish.premium) && dish.premium.length > 0
        ? dish.premium[0]
        : dish.premium || null,
  })) as Dish[];

  return {
    items,
    total: count ?? 0,
    page,
    pageSize,
  };
}

/** 📚 Lấy danh sách categories để render filter */
export async function listCategoriesClient() {
  const { data, error } = await sb
    .from("categories")
    .select("id, slug, name, icon")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** 🖼️ Trả về URL ảnh (client-safe) */
export function dishImageUrlClient(d: Pick<Dish, "cover_image_url">) {
  return resolveImageUrl(d.cover_image_url);
}
