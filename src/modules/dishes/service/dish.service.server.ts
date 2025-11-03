// src/modules/dishes/service/dish.service.server.ts
import "server-only";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function fetchApprovedDishes(limit = 60) {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("dishes")
    .select("id, slug, title, category_name, diet, time_minutes, servings, review_status, video_url, cover_image_url, images")
    .eq("review_status", "approved")
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
