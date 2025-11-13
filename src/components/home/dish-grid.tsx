// components/dishes/dish-grid.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { dishImageUrl } from "@/modules/dishes/lib/image-url";
import VideoDialog from "@/components/common/VideoDialog";
import { SmartVideo } from "@/components/common/SmartVideo";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type DishCard = {
  id?: string;
  slug: string;
  title: string;
  category_name?: string;
  diet?: string | null;
  time_minutes?: number | null;
  servings?: number | null;
  review_status?: ReviewStatus | null;
  video_url?: string | null;
  cover_image_url?: string | null;
  images?: string[] | string | null;

  // 👇 thêm từ premium_dishes
  premium?: {
    active: boolean;
    required_plan: string;
    chef_id?: string;
  } | null;
};

function firstImage(images?: string[] | string | null) {
  if (!images) return null;
  return Array.isArray(images) ? images[0] ?? null : images;
}
function getCoverUrl(d: DishCard) {
  const raw = d.cover_image_url ?? firstImage(d.images) ?? null;
  return dishImageUrl(raw) ?? "/placeholder.png";
}

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
  hasPremiumAccess = false,
}: {
  dishes: DishCard[];
  className?: string;
  itemClassName?: string;
  hrefBuilder?: (d: DishCard) => string;
  hasPremiumAccess?: boolean;
}) {
  const visible = (dishes ?? []).filter(
    (d) => (d.review_status ?? "").toLowerCase() === "approved"
  );

  const [upgradeOpen, setUpgradeOpen] = useState<null | { title: string }>(
    null
  );
  const router = useRouter();

  return (
    <>
      <ul className={className} role="list">
        {visible.map((d) => {
          const idKey = (d.id ?? d.slug ?? d.title) as string;
          const rating = fakeRatingFromId(idKey);
          const href = hrefBuilder ? hrefBuilder(d) : `/home/${d.slug}`;
          const dietKey = (d.diet || "").toLowerCase();
          const dietText = dietLabelMap[dietKey] || d.diet || undefined;
          const dietEmoji = dietEmojiMap[dietKey];

          // 🔧 Fix: Check premium properly
          const isPremium = Boolean(d.premium && d.premium.active === true);
          const gated = isPremium && !hasPremiumAccess;

          // Debug log (có thể xóa sau khi test)
          if (d.premium) {
            console.log(
              "Dish:",
              d.title,
              "Premium:",
              d.premium,
              "isPremium:",
              isPremium,
              "gated:",
              gated
            );
          }

          // Khi bị gate, chặn click và mở modal
          const onCardClick: React.MouseEventHandler<HTMLAnchorElement> = (
            e
          ) => {
            if (gated) {
              e.preventDefault();
              e.stopPropagation();
              setUpgradeOpen({ title: d.title });
            }
          };

          return (
            <li key={idKey} className={`group ${itemClassName} flex`}>
              <Link
                href={href}
                onClick={onCardClick}
                aria-disabled={gated}
                className={[
                  "block w-full rounded-xl border bg-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                  gated
                    ? "border-amber-300/70 hover:shadow-md"
                    : "border-gray-200/70 hover:shadow-md",
                ].join(" ")}
                aria-label={d.title}
              >
                <div className="flex flex-col relative">
                  {/* Premium gradient ring */}
                  {isPremium && (
                    <div
                      className="pointer-events-none absolute -inset-[1px] rounded-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(251,191,36,0.8), rgba(244,63,94,0.7))",
                        WebkitMask:
                          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                        WebkitMaskComposite: "xor",
                        padding: 1,
                      }}
                    />
                  )}

                  {/* Ribbon Premium */}
                  {isPremium && (
                    <div className="absolute right-2 top-2 z-30">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          className="-mt-px"
                          aria-hidden
                        >
                          <path
                            fill="currentColor"
                            d="M12 2 9.5 8h-6l5 3.6L6 18l6-4 6 4-2.5-6.4 5-3.6h-6L12 2z"
                          />
                        </svg>
                        Premium
                      </span>
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="relative overflow-hidden rounded-t-xl bg-gray-100 aspect-[16/10] group">
                    {d.video_url ? (
                      <>
                        <SmartVideo
                          url={d.video_url}
                          poster={getCoverUrl(d)}
                          className="absolute inset-0 h-full w-full object-cover"
                          autoPlay={false}
                          muted
                          loop={false}
                        />
                        <div className="absolute inset-0 z-10 grid place-items-center">
                          <VideoDialog
                            url={d.video_url}
                            poster={d.cover_image_url ?? getCoverUrl(d)}
                            trigger="overlay"
                          />
                        </div>
                      </>
                    ) : (
                      <img
                        src={d.cover_image_url ?? getCoverUrl(d)}
                        alt={d.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    )}

                    {/* top-left chips */}
                    <div className="absolute left-2 top-2 z-20 flex items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium shadow-sm">
                        ⏱ {d.time_minutes ? `${d.time_minutes}’` : "—"}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium shadow-sm">
                        🍽 {d.servings ?? "—"}
                      </span>
                    </div>

                    {/* rating bottom-right */}
                    <div className="absolute right-2 bottom-2 z-20 rounded-lg bg-white/95 px-2 py-1 shadow-md">
                      <RatingStars rating={rating} />
                    </div>

                    {/* badge xem video (nếu có) */}
                    {d.video_url && (
                      <div className="absolute left-2 bottom-2 z-20">
                        <VideoDialog
                          url={d.video_url}
                          poster={d.cover_image_url ?? getCoverUrl(d)}
                          trigger="badge"
                        />
                      </div>
                    )}

                    {/* Premium lock overlay khi bị chặn */}
                    {gated && (
                      <div className="absolute inset-0 z-20 grid place-items-center bg-black/30 backdrop-blur-[1px]">
                        <div className="rounded-xl bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-gray-800 shadow">
                          <span className="mr-1">🔒</span> Chỉ dành cho Premium
                        </div>
                      </div>
                    )}
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
                      {(dietText || isPremium) && (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] text-emerald-700">
                          {isPremium ? "👑 Premium" : dietEmoji ?? "🍽️"}
                          {!isPremium && <>&nbsp;{dietText}</>}
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

      {/* Modal nâng cấp Premium */}
      {upgradeOpen && (
        <div className="fixed inset-0 z-[9999]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setUpgradeOpen(null)}
          />
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
              <div className="border-b px-4 py-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-white">
                    👑
                  </span>
                  Nâng cấp Premium
                </h3>
              </div>
              <div className="px-4 py-3 text-sm text-gray-700">
                <p className="mb-1 font-semibold">{upgradeOpen.title}</p>
                <p>
                  Món này chỉ dành cho thành viên Premium. Bạn muốn nâng cấp
                  ngay?
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 px-4 py-3">
                <button
                  onClick={() => setUpgradeOpen(null)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Để sau
                </button>
                <button
                  onClick={() => {
                    setUpgradeOpen(null);
                    router.push("/upgrade");
                  }}
                  className="rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow hover:brightness-105"
                >
                  Nâng cấp ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
