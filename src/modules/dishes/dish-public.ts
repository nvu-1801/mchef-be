export type Dish = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  diet: "veg" | "nonveg" | "vegan" | string | null;
  time_minutes: number | null;
  servings: number | null;
  category_id?: string | null;
  tips?: string | null;
  created_at?: string;
  updated_at?: string | null;
  published?: boolean;
  created_by?: string;
};

export type DishFull = Dish & {
  category?: { id: string; slug: string; name: string; icon: string | null } | null;
  dish_images?: { id: string; image_url: string; alt: string | null; sort: number | null }[];
  recipe_steps?: { step_no: number; content: string; image_url: string | null }[];
  dish_ingredients?: {
    amount: string | null;
    note: string | null;
    ingredient: { id: string; name: string; unit: string | null };
  }[];
  ratings?: { user_id: string; stars: number; comment: string | null; created_at: string }[];
  favorites?: { user_id: string }[];
  creator?: { id: string; display_name: string | null; avatar_url: string | null } | null;
};
