import { notFound } from "next/navigation";
import { dishImageUrl, getDishFullBySlug } from "@/modules/dishes/service/dish.service";
import DishDetailClient from "./dish-detail.client";

type Props = { params: { slug: string } };

export default async function DishDetailPage({ params }: Props) {
  const { slug } = params;

  try {
    const dish = await getDishFullBySlug(slug); // lấy đủ các field join
    const coverUrl = dishImageUrl(dish) ?? dish.cover_image_url ?? "/placeholder.png";

    const ratings = dish.ratings ?? [];
    const ratingCount = ratings.length;
    const ratingAvg = ratingCount
      ? Number((ratings.reduce((s, r) => s + (r.stars || 0), 0) / ratingCount).toFixed(1))
      : 0;

    return (
      <DishDetailClient
        dish={dish}
        coverUrl={coverUrl}
        ratingAvg={ratingAvg}
        ratingCount={ratingCount}
      />
    );
  } catch (e: any) {
    if (e?.message === "NOT_FOUND") return notFound();
    throw e;
  }
}
