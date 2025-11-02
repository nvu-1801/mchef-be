// components/dishes/dish-grid.tsx
import Link from "next/link";
import { dishImageUrl } from "@/modules/dishes/service/dish.service";

export type DishCard = {
  id?: string;
  slug: string;
  title: string;
  category_name?: string;
  diet?: string | null;
  time_minutes?: number | null;
  servings?: number | null;
  review_status?: string | null;
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
          <span
            key={i}
            className="relative inline-block h-3.5 w-3.5 text-amber-500"
          >
            <svg
              viewBox="0 0 24 24"
              className="absolute inset-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
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
      <span className="ml-0.5 text-[11px] font-medium text-gray-700">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

const dietLabelMap: Record<string, string> = {
  veg: "Vegetarian",
  nonveg: "Non-Veg",
  vegan: "Vegan",
};
const dietEmojiMap: Record<string, string> = {
  veg: "🥗",
  nonveg: "🍖",
  vegan: "🌱",
};

export default function DishGrid({
  dishes,
  className = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4",
  itemClassName = "",
  hrefBuilder,
}: {
  dishes: DishCard[];
  className?: string;
  itemClassName?: string;
  hrefBuilder?: (d: DishCard) => string;
}) {
  const visible = (dishes ?? []).filter(
    (d) => !d.review_status || d.review_status === "approved"
  );

  return (
    <ul className={className} role="list">
      {visible.map((d) => {
        const idKey = (d.id ?? d.slug ?? d.title) as string;
        const rating = fakeRatingFromId(idKey);
        const img = dishImageUrl(d) ?? "/placeholder.png";
        const href = hrefBuilder ? hrefBuilder(d) : `/home/${d.slug}`;
        const dietKey = (d.diet || "").toLowerCase();
        const dietText = dietLabelMap[dietKey] || d.diet || undefined;
        const dietEmoji = dietEmojiMap[dietKey];

        return (
          <li key={idKey} className={`group ${itemClassName} flex`}>
            <Link
              href={href}
              className="block w-full rounded-xl border border-gray-200/70 bg-white shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label={d.title}
            >
              <div className="flex flex-col">
                {/* Image */}
                <div className="relative overflow-hidden rounded-t-xl bg-gray-100 aspect-[4/3] sm:aspect-[3/2] md:aspect-square">
                  <img
                    src={img}
                    alt={d.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* top-left chips */}
                  <div className="absolute left-2 top-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium shadow-sm">
                      ⏱ {d.time_minutes ? `${d.time_minutes}’` : "—"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium shadow-sm">
                      🍽 {d.servings ?? "—"}
                    </span>
                  </div>
                  {/* rating bottom-right */}
                  <div className="absolute right-2 bottom-2 rounded-lg bg-white/95 px-2 py-1 shadow-md">
                    <RatingStars rating={rating} />
                  </div>
                </div>

                {/* Text block */}
                <div className="p-2.5">
                  <p className="font-semibold text-[13.5px] leading-snug text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors">
                    {d.title}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {d.category_name && (
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10.5px] text-gray-700">
                        🍲 {d.category_name}
                      </span>
                    )}
                    {dietText && (
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] text-emerald-700">
                        {dietEmoji ?? "🍽️"} {dietText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
