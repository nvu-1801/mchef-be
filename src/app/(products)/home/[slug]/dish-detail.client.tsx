"use client";

import Link from "next/link";
import React, { useMemo, useRef, useState } from "react";
import type { DishFull } from "@/modules/dishes/dish-public";

export default function DishDetailClient({
  dish,
  coverUrl,
  ratingAvg,
  ratingCount,
}: {
  dish: DishFull;
  coverUrl?: string | null;
  ratingAvg?: number;
  ratingCount?: number;
}) {
  // compute sensible defaults
  const computedCover =
    coverUrl ||
    dish.cover_image_url ||
    dish.dish_images?.[0]?.image_url ||
    "/placeholder.png";

  const ratings = dish.ratings ?? [];
  const avg =
    typeof ratingAvg === "number"
      ? ratingAvg
      : ratings.length
      ? ratings.reduce((s, r) => s + (r.stars || 0), 0) / ratings.length
      : 0;
  const count = typeof ratingCount === "number" ? ratingCount : ratings.length;

  const dietTag = dish.diet ? dietLabel(dish.diet) : null;

  const otherImages = useMemo(
    () =>
      (dish.dish_images || [])
        .map((img) => img.image_url)
        .filter(Boolean)
        .filter((u) => u !== dish.cover_image_url && u !== computedCover),
    [dish.dish_images, dish.cover_image_url, computedCover]
  );

  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(computedCover);

  function scrollGallery(delta: number) {
    if (!galleryRef.current) return;
    galleryRef.current.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      {/* breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2 truncate">
          <Link href="/home" className="text-sky-600 hover:underline">
            Trang chủ
          </Link>
          <span className="text-gray-300">/</span>
          {dish.category?.slug && (
            <>
              <Link
                href={{ pathname: "/home", query: { cat: dish.category.slug } }}
                className="hover:underline"
              >
                {dish.category.name}
              </Link>
              <span className="text-gray-300">/</span>
            </>
          )}
          <span className="font-medium text-gray-800 truncate">
            {dish.title}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <button onClick={() => history.back()} className="hover:underline">
            ← Trước
          </button>
          <button onClick={() => history.forward()} className="hover:underline">
            Tiếp →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* left: media + content */}
        <div className="space-y-6">
          {/* media */}
          <div className="rounded-xl overflow-hidden bg-white border">
            <div className="w-full aspect-[4/3] bg-gray-100">
              {/* main image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage ?? computedCover}
                alt={dish.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>

            {/* gallery controls */}
            <div className="flex items-center justify-between gap-3 p-3">
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <span className="px-2 py-1 text-xs rounded bg-gray-50 text-gray-700">
                    ⏱ {dish.time_minutes ? `${dish.time_minutes} phút` : "—"}
                  </span>
                  <span className="px-2 py-1 text-xs rounded bg-gray-50 text-gray-700">
                    🍽 {dish.servings ? `${dish.servings} phần` : "—"}
                  </span>
                  {dietTag && (
                    <span className="px-2 py-1 text-xs rounded bg-emerald-50 text-emerald-700">
                      {dietTag}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-gray-700">
                  <StarBar value={avg} />
                  <span className="ml-2 text-xs text-gray-600">
                    {avg.toFixed(1)} ({count})
                  </span>
                </div>
              </div>
            </div>

            {/* thumbnail strip - responsive: horizontal scroll on small, grid on md+ */}
            <div className="px-3 pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">
                  Hình ảnh
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollGallery(-240)}
                    aria-label="Prev"
                    className="p-1 rounded-md hover:bg-gray-100"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => scrollGallery(240)}
                    aria-label="Next"
                    className="p-1 rounded-md hover:bg-gray-100"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div
                ref={galleryRef}
                className="flex gap-2 overflow-x-auto no-scrollbar py-1"
                role="list"
              >
                {[computedCover, ...otherImages].map((u, i) => (
                  <button
                    key={u + i}
                    onClick={() => setActiveImage(u)}
                    className={`flex-shrink-0 rounded-lg overflow-hidden border ${
                      activeImage === u ? "ring-2 ring-sky-400" : ""
                    }`}
                    style={{ width: 96, height: 72 }}
                    aria-label={`Image ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={u}
                      alt={`${dish.title} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* tips / description */}
          {dish.tips && (
            <div className="rounded-xl border bg-white p-4">
              <div className="text-xs font-semibold text-gray-500">Gợi ý</div>
              <p className="mt-2 text-sm text-gray-800 whitespace-pre-line">
                {dish.tips}
              </p>
            </div>
          )}

          {/* ingredients + steps stacked on mobile */}
          <div className="grid gap-6 md:grid-cols-[320px_1fr]">
            <section className="rounded-xl border bg-white p-4">
              <h3 className="text-sm font-semibold mb-2">Nguyên liệu</h3>
              {dish.dish_ingredients?.length ? (
                <ul className="space-y-2 text-sm text-gray-800">
                  {dish.dish_ingredients.map((it, idx) => (
                    <li key={idx} className="flex justify-between gap-3">
                      <div>{it.ingredient?.name}</div>
                      <div className="text-gray-600 text-sm">
                        {[it.amount, it.ingredient?.unit]
                          .filter(Boolean)
                          .join(" ")}{" "}
                        {it.note ? (
                          <span className="text-gray-400">· {it.note}</span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-500">
                  Chưa có nguyên liệu.
                </div>
              )}
            </section>

            <section className="rounded-xl border bg-white p-4">
              <h3 className="text-sm font-semibold mb-3">Các bước</h3>
              {dish.recipe_steps?.length ? (
                <ol className="space-y-4">
                  {dish.recipe_steps.map((s) => (
                    <li key={s.step_no} className="flex gap-3">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold">
                        {s.step_no}
                      </div>
                      <div className="flex-1 text-sm text-gray-800">
                        <div className="whitespace-pre-line">{s.content}</div>
                        {s.image_url && (
                          <div className="mt-2 rounded-lg overflow-hidden border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={s.image_url}
                              alt={`step ${s.step_no}`}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="text-sm text-gray-500">Chưa có hướng dẫn.</div>
              )}
            </section>
          </div>

          {/* ratings list */}
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Đánh giá ({count})</h3>
              <div className="text-sm text-gray-600">{avg.toFixed(1)} / 5</div>
            </div>

            {ratings.length ? (
              <ul className="mt-3 space-y-3">
                {ratings.map((r, idx) => (
                  <li key={idx} className="border rounded p-3 bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                          {r.user_id?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {r.user_id ?? "User"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(r.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        <StarRow stars={r.stars} />
                      </div>
                    </div>
                    {r.comment && (
                      <p className="mt-2 text-sm text-gray-800">{r.comment}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 text-sm text-gray-500">
                Chưa có đánh giá.
              </div>
            )}
          </div>
        </div>

        {/* right: sticky info */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border bg-white p-4">
              <h2 className="text-lg font-bold text-gray-900">{dish.title}</h2>
              <div className="mt-2 text-sm text-gray-600">
                {dish.category?.name}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <div className="text-xs text-gray-500">Thời gian</div>
                  <div className="font-medium">
                    {dish.time_minutes ? `${dish.time_minutes} phút` : "—"}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <div className="text-xs text-gray-500">Khẩu phần</div>
                  <div className="font-medium">
                    {dish.servings ? `${dish.servings} phần` : "—"}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-xs text-gray-500">Người đăng</div>
                <div className="mt-1 text-sm text-gray-800">
                  {dish.creator?.display_name ?? "Đầu bếp"}
                </div>
              </div>

              <div className="mt-4">
                <button className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-violet-500 text-white font-medium hover:brightness-105">
                  Lưu / Yêu thích
                </button>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-3 text-sm text-gray-600">
              <div>Đăng: {formatDate(dish.created_at || "")}</div>
              {dish.updated_at && (
                <div className="mt-1">
                  Cập nhật: {formatDate(dish.updated_at)}
                </div>
              )}
              <div className="mt-2">
                ID:{" "}
                <span className="text-xs text-gray-400 break-all">
                  {dish.id}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

/* ---------- helpers & small components ---------- */

function Star({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`w-4 h-4 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 17.27l6.18 3.73-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function StarHalf({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id="halfg">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 17.27l6.18 3.73-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
        fill="url(#halfg)"
        stroke="currentColor"
      />
    </svg>
  );
}

function StarBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <div className="relative inline-block" aria-hidden>
      <div className="flex gap-1 text-gray-300">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} />
        ))}
      </div>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        <div className="flex gap-1 text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StarRow({ stars }: { stars: number }) {
  const full = Math.floor(stars);
  const half = stars - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <Star key={i} className="text-amber-400" />;
        if (i === full && half)
          return <StarHalf key={i} className="text-amber-400" />;
        return <Star key={i} className="text-gray-300" />;
      })}
    </div>
  );
}

function dietLabel(key: string) {
  if (!key) return "";
  if (key === "veg") return "Vegetarian";
  if (key === "vegan") return "Vegan";
  if (key === "nonveg") return "Non-Veg";
  return key;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}
