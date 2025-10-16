// components/dishes/dish-grid.tsx
import Link from "next/link";
import { dishImageUrl } from "@/modules/dishes/service/dish.service";

export type DishCard = {
  id?: string;
  slug: string;
  title: string;
  category_name?: string;
  time_minutes?: number | null;
  servings?: number | null;
  // các field ảnh mà dishImageUrl cần (ví dụ path/bucket/..)
} & Parameters<typeof dishImageUrl>[0];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h >>> 0;
}
function fakeRatingFromId(id: string) {
  const steps = [3.5, 4, 4.5, 5];
  return steps[hashStr(id) % steps.length];
}

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating ${rating.toFixed(1)} / 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const isFull = i < full;
        const isHalf = i === full && half;
        return (
          <span key={i} className="relative inline-block h-4 w-4">
            <svg
              viewBox="0 0 24 24"
              className="absolute inset-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="m12 17.27-6.18 3.73 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.73 1.64 7.03z" />
            </svg>
            {(isFull || isHalf) && (
              <svg
                viewBox="0 0 24 24"
                className="absolute inset-0"
                style={isHalf ? { clipPath: "inset(0 50% 0 0)" } : undefined}
                fill="currentColor"
                aria-hidden
              >
                <path d="m12 17.27-6.18 3.73 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.73 1.64 7.03z" />
              </svg>
            )}
          </span>
        );
      })}
      <span className="ml-1 text-xs font-medium text-gray-700">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function DishGrid({
  dishes,
  className = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4",
  itemClassName = "",
  hrefBuilder,
}: {
  dishes: DishCard[];
  /** tuỳ biến grid ngoài (ví dụ ép 2 hàng với 6 cột ở xl) */
  className?: string;
  /** thêm class cho mỗi item/card */
  itemClassName?: string;
  /** custom link detail, mặc định dùng slug: /home/[slug] */
  hrefBuilder?: (d: DishCard) => string;
}) {
  return (
    <ul className={className} role="list">
      {dishes.map((d) => {
        const idKey = (d.id ?? d.slug ?? d.title) as string;
        const rating = fakeRatingFromId(idKey);
        const img = dishImageUrl(d) ?? "/placeholder.png";
        const href = hrefBuilder ? hrefBuilder(d) : `/home/${d.slug}`;

        return (
          <li key={idKey} className={`group ${itemClassName} flex`}>
            <Link
              href={href}
              className="block w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label={d.title}
            >
              <div className="flex flex-col h-full">
                <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[4/3] sm:aspect-[3/2] md:aspect-square">
                  <img
                    src={img}
                    alt={d.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium shadow-sm">
                      ⏱ {d.time_minutes ? `${d.time_minutes} phút` : "—"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium shadow-sm">
                      🍽 {d.servings ? `${d.servings} phần` : "—"}
                    </span>
                  </div>

                  <div className="absolute right-3 bottom-3">
                    <div className="rounded-xl bg-white/95 px-2.5 py-1 shadow-md">
                      <RatingStars rating={rating} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 px-0">
                  <p className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-gray-700 transition-colors">
                    {d.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {d.category_name ?? ""}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
