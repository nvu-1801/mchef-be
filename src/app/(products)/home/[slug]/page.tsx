import { notFound } from "next/navigation";
import {
  getDishBySlug,
  dishImageUrl, // OK dùng ở server
} from "@/modules/dishes/service/dish.service";
import DishDetailClient from "./dish-detail.client";
type Props = { params: { slug: string } };

export default async function DishDetailPage({ params }: Props) {
  const { slug } = params;

  try {
    const dish = await getDishBySlug(slug); // { id,title,slug,cover_image_url,diet,time_minutes,servings,category_id,tips }
    const coverUrl = dishImageUrl(dish) ?? "/placeholder.png"; // TÍNH Ở SERVER
    return <DishDetailClient dish={dish} coverUrl={coverUrl} />;
  } catch (e: any) {
    if (e?.message === "NOT_FOUND") return notFound();
    throw e;
  }
}
