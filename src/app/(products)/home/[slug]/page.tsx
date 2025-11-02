import { notFound } from "next/navigation";
import {
  dishImageUrl,
  getDishFullBySlug,
} from "@/modules/dishes/service/dish.service";
import DishDetailClient from "./dish-detail.client";
import { supabaseServer } from "@/libs/supabase/supabase-server";

type Props = { params: Promise<{ slug: string }> };

export default async function DishDetailPage({ params }: Props) {
  const { slug } = await params;
  const sb = await supabaseServer();

  const {
    data: { user },
  } = await sb.auth.getUser();

  try {
    const dish = await getDishFullBySlug(slug);
    const coverUrl =
      dishImageUrl(dish) ?? dish.cover_image_url ?? "/placeholder.png";

    const ratings = dish.ratings ?? [];
    const ratingCount = ratings.length;
    const ratingAvg = ratingCount
      ? Number(
          (
            ratings.reduce((s, r) => s + (r.stars || 0), 0) / ratingCount
          ).toFixed(1)
        )
      : 0;

    // 👉 Thêm currentUser object
    const currentUser = user
      ? {
          id: user.id,
        }
      : null;

    return (
      <DishDetailClient
        dish={dish}
        coverUrl={coverUrl}
        ratingAvg={ratingAvg}
        ratingCount={ratingCount}
        currentUser={currentUser} 
      />
    );
  } catch (e: unknown) {
    const message =
      typeof e === "object" &&
      e !== null &&
      "message" in e &&
      typeof (e as { message?: unknown }).message === "string"
        ? (e as { message: string }).message
        : undefined;

    if (message === "NOT_FOUND") return notFound();
    throw e;
  }
}
