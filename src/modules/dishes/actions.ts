"use server";

import { supabaseServer } from "@/libs/supabase/supabase-server";
import { revalidatePath } from "next/cache";

export async function getDishBySlug(slug: string) {
  const sb = await supabaseServer();

  const { data, error } = await sb
    .from("dishes")
    .select(
      `
      id, category_id, title, slug, cover_image_url, diet, time_minutes, servings, tips,
      created_by, published, created_at, updated_at, video_url,
      category:category_id ( id, slug, name, icon ),
      dish_images ( id, image_url, alt, sort ),
      recipe_steps ( step_no, content, image_url ),
      dish_ingredients ( amount, note, ingredient:ingredient_id ( id, name, unit ) ),
      ratings ( user_id, stars, comment, created_at ),
      favorites ( user_id ),
      creator:created_by ( id, display_name, avatar_url ),
      premium:premium_dishes ( active, required_plan, chef_id )
    `
    )
    .eq("slug", slug)
    .order("sort", { foreignTable: "dish_images", ascending: true })
    .order("step_no", { foreignTable: "recipe_steps", ascending: true })
    .order("created_at", { foreignTable: "ratings", ascending: false })
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("NOT_FOUND");

  return data;
}

export async function updateDish(dishId: string, data: any) {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: dish, error } = await sb
    .from("dishes")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", dishId)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/home/${dish.slug}`);
  revalidatePath("/posts/manager");

  return dish;
}
