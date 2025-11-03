// src/modules/dishes/service/dish.service.server.ts
import "server-only";
import type { Dish, DishFull } from "../dish-public";
import { supabaseServer } from "@/libs/supabase/supabase-server";

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
  diet?: "veg" | "nonveg" | "vegan";
  sortBy?: "title" | "rating" | "created_at";
} = {}) {
  const sb = await supabaseServer(); // không cần await
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = sb
    .from("dishes")
    .select(
      `
      id, title, slug, cover_image_url, diet,
      time_minutes, servings, created_at,
      review_status, video_url
      `,
      { count: "exact" }
    )
    .eq("published", true)
    .eq("review_status", "approved"); // filter ngay DB

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

export async function getDishFullBySlug(slug: string) {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("dishes")
    .select(
      `
      id, category_id, title, slug, cover_image_url, diet, time_minutes, servings, tips,
      video_url, review_status,
      created_by, published, created_at, updated_at,
      description, difficulty, calories, 
      category:category_id ( id, slug, name, icon ),
      dish_images ( id, image_url, alt, sort ),
      recipe_steps ( step_no, content, image_url ),
      dish_ingredients ( amount, note, ingredient:ingredient_id ( id, name, unit ) ),
      ratings ( user_id, stars, comment, created_at ),
      favorites ( user_id ),
      creator:created_by ( id, display_name, avatar_url )
      `
    )
    .eq("slug", slug)
    .eq("published", true)
    .eq("review_status", "approved")
    .maybeSingle<DishFull>();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("NOT_FOUND");
  return data;
}
