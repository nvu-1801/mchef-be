"use client";

import Link from "next/link";
import type { DishFull } from "@/modules/dishes/dish-public";
import { useMemo } from "react";

export default function DishDetailClient({
  dish,
  coverUrl,
  ratingAvg,
  ratingCount,
}: {
  dish: DishFull;
  coverUrl: string;
  ratingAvg: number;
  ratingCount: number;
}) {
  const dietTag = dish.diet ? dietLabel(dish.diet) : null;

  const otherImages = useMemo(
    () =>
      (dish.dish_images || []).filter(
        (img) => img.image_url && img.image_url !== dish.cover_image_url
      ),
    [dish.dish_images, dish.cover_image_url]
  );

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb + back/forward */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-5">
        <div className="space-x-2 truncate">
          <Link href="/home" className="hover:underline">
            Trang chủ
          </Link>
          <span>/</span>
          {dish.category?.slug ? (
            <>
              <Link
                href={{ pathname: "/home", query: { cat: dish.category.slug } }}
                className="hover:underline"
              >
                {dish.category?.name || "Danh mục"}
              </Link>
              <span>/</span>
            </>
          ) : null}
          <span className="text-gray-700">{dish.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="hover:underline" onClick={() => history.back()}>
            ← Trước
          </button>
          <button className="hover:underline" onClick={() => history.forward()}>
            Tiếp →
          </button>
        </div>
      </div>

      {/* Header: Cover + Title + Meta + Rating */}
      <div className="grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-10">
        {/* Cover + gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl border overflow-hidden bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={dish.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          {otherImages.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {otherImages.slice(0, 8).map((img) => (
                <div
                  key={img.id}
                  className="aspect-square rounded-lg overflow-hidden bg-white border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt={img.alt || dish.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {dish.title}
          </h1>

          {/* Category + diet */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {dish.category?.name && (
              <span className="px-2 py-1 rounded bg-violet-50 text-violet-700 border border-violet-200">
                {dish.category.name}
              </span>
            )}
            {dietTag && (
              <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {dietTag}
              </span>
            )}
          </div>

          {/* Meta: time, servings, favorites */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-gray-700">
            <MetaChip
              label="Thời gian"
              value={dish.time_minutes ? `${dish.time_minutes} phút` : "—"}
            />
            <MetaChip
              label="Khẩu phần"
              value={dish.servings ? `${dish.servings} phần` : "—"}
            />
            <MetaChip
              label="Yêu thích"
              value={dish.favorites?.length ? `${dish.favorites.length}` : "0"}
            />
          </div>

          {/* Rating summary */}
          <div className="mt-5 flex items-center gap-3">
            <StarBar value={ratingAvg} />
            <span className="text-sm text-gray-700">
              {ratingAvg.toFixed(1)} / 5
            </span>
            <span className="text-xs text-gray-500">
              ({ratingCount} đánh giá)
            </span>
          </div>

          {/* Tips */}
          {dish.tips && (
            <div className="mt-6 rounded-xl border bg-white p-4">
              <div className="text-xs font-semibold text-gray-500">
                GỢI Ý / MẸO
              </div>
              <p className="mt-1 text-sm leading-6 text-gray-800 whitespace-pre-line">
                {dish.tips}
              </p>
            </div>
          )}

          {/* Chef / author */}
          {dish.creator?.id && (
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dish.creator.avatar_url || "/avatar.svg"}
                  alt={dish.creator.display_name || "Chef"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {dish.creator.display_name || "Đầu bếp"}
                </div>
                <div className="text-gray-500">
                  Đăng ngày {formatDate(dish.created_at || "")}{" "}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ingredients & Steps */}
      <div className="mt-10 grid md:grid-cols-[1fr_1.3fr] gap-8 md:gap-12">
        {/* Ingredients */}
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-lg font-bold">Nguyên liệu</h2>
          {dish.dish_ingredients?.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {dish.dish_ingredients.map((it, idx) => (
                <li
                  key={idx}
                  className="flex items-start justify-between gap-3 border-b last:border-none py-2"
                >
                  <div className="text-gray-900">{it.ingredient?.name}</div>
                  <div className="text-gray-700">
                    {[it.amount, it.ingredient?.unit].filter(Boolean).join(" ")}
                    {it.note ? (
                      <span className="text-gray-500"> — {it.note}</span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              Chưa có danh sách nguyên liệu.
            </p>
          )}
        </section>

        {/* Steps */}
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-lg font-bold">Các bước thực hiện</h2>
          {dish.recipe_steps?.length ? (
            <ol className="mt-3 space-y-5">
              {dish.recipe_steps.map((s) => (
                <li key={s.step_no} className="flex items-start gap-4">
                  <div className="shrink-0 h-7 w-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-semibold">
                    {s.step_no}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 whitespace-pre-line">
                      {s.content}
                    </p>
                    {s.image_url && (
                      <div className="mt-2 rounded-lg overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.image_url}
                          alt={`step ${s.step_no}`}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              Chưa có hướng dẫn từng bước.
            </p>
          )}
        </section>
      </div>

      {/* Comments / Ratings list */}
      <section className="mt-10 rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Đánh giá & bình luận</h2>
          <div className="text-sm text-gray-600">
            Trung bình <b>{ratingAvg.toFixed(1)}</b> từ <b>{ratingCount}</b>{" "}
            lượt
          </div>
        </div>

        {dish.ratings?.length ? (
          <ul className="mt-4 divide-y">
            {dish.ratings.map((r, i) => (
              <li key={i} className="py-4">
                <div className="flex items-center gap-2">
                  <StarRow stars={r.stars} />
                  <span className="text-xs text-gray-500">
                    {formatDate(r.created_at)}
                  </span>
                </div>
                {r.comment ? (
                  <p className="mt-1 text-sm text-gray-800">{r.comment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-gray-500">Chưa có đánh giá nào.</p>
        )}
      </section>
    </section>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}

function StarBar({ value }: { value: number }) {
  // vẽ 5 sao với phần lấp đầy theo value
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <div className="relative inline-block">
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
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <Star key={i} className="text-amber-400" />;
        if (i === full && half)
          return <StarHalf key={i} className="text-amber-400" />;
        return <Star key={i} className="text-gray-300" />;
      })}
    </div>
  );
}

function Star({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`w-4 h-4 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 17.27l6.18 3.73-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
function StarHalf({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="half">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 17.27l6.18 3.73-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
        fill="url(#half)"
        stroke="currentColor"
      />
    </svg>
  );
}

function dietLabel(key: string) {
  if (key === "veg") return "Vegetarian";
  if (key === "vegan") return "Vegan";
  if (key === "nonveg") return "Non-Veg";
  return key;
}
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso?.slice(0, 10) || "";
  }
}
