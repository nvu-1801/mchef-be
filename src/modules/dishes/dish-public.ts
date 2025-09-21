export type Dish = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;   // path trong Storage, vd: "dishes/ga-kho/cover.jpg"
  diet: "veg" | "nonveg";           // enum 'diet' trong DB
  time_minutes: number | null;
  servings: number | null;
  created_at?: string;  
  updated_at?: string;
};
