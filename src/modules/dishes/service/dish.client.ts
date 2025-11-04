// ================================
// src/modules/dishes/service/dish.client.ts
// ================================
"use client";

import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import type { Dish } from "../dish-public";
import { resolveImageUrl } from "../dish-public";

const sb = supabaseBrowser();

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
      id, title, slug, cover_image_url, diet,
      review_status, time_minutes, servings, video_url,
      category:categories ( id, slug, name, icon )
      `,
      { count: "exact" }
    )
    .eq("published", true)
    .eq("review_status", "approved");

  if (q) query = query.ilike("title", `%${q}%`);
  if (cat !== "all") query = query.eq("category_id", cat);
  if (diet) query = query.eq("diet", diet);

  if (sortBy === "created_at")
    query = query.order("created_at", { ascending: false });
  else query = query.order("title", { ascending: true });

  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);

  const items = (data ?? []).map((d: any) => {
    const category =
      Array.isArray(d.category) && d.category.length > 0
        ? d.category[0]
        : d.category ?? { id: "", slug: "", name: "", icon: null };
    return {
      ...d,
      category,
    };
  }) as Dish[];

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
