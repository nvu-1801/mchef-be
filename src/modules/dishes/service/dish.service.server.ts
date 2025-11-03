import type { Dish, DishFull } from "../dish-public";
import { supabaseServer } from "@/libs/supabase/supabase-server";

/** 📋 Lấy danh sách món ăn (server-side) */
export async function listDishesServer() {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("dishes")
    .select("id,title,slug,cover_image_url")
    .eq("published", true)
    .limit(10);

  if (error) throw new Error(error.message);
  return data as Dish[];
}

/** 📋 Lấy chi tiết đầy đủ món ăn (server-side) */
export async function getDishFullBySlugServer(slug: string) {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("dishes")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<DishFull>();

  if (error) throw new Error(error.message);
  return data;
}
