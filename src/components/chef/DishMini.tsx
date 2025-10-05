// app/chefs/[id]/ui/DishMini.tsx
"use client";

type Props = {
  dish: {
    id: string;
    slug: string | null;
    title: string | null;
    cover_image_url: string | null;
    time_minutes: number | null;
    servings: number | null;
  };
};

export default function DishMini({ dish }: Props) {
  const href = dish.slug ? `/d/${dish.slug}` : `/dish/${dish.id}`;
  const img =
    dish.cover_image_url && /^https?:\/\//i.test(dish.cover_image_url)
      ? dish.cover_image_url
      : "https://picsum.photos/640/360?blur=3";

  return (
    <a href={href} className="group rounded-2xl border shadow-sm overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={img}
          alt=""
          className="h-full w-full object-cover transition group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-3">
        <div className="truncate font-medium">{dish.title ?? "Untitled dish"}</div>
        <div className="mt-1 text-xs text-gray-600">
          {dish.time_minutes ?? "—"} mins · {dish.servings ?? "—"} servings
        </div>
      </div>
    </a>
  );
}
