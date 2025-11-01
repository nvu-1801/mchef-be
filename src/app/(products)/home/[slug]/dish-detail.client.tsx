"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DishFull } from "@/modules/dishes/dish-public";

type Props = {
  dish: DishFull;
  coverUrl: string;
  ratingAvg: number;
  ratingCount: number;
};

export default function DishDetailClient({
  dish,
  coverUrl,
  ratingAvg,
  ratingCount,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">(
    "ingredients"
  );
  console.log(dish);
  const dietIcons: Record<string, string> = {
    veg: "🥗",
    nonveg: "🍖",
    vegan: "🌱",
  };

  const dietLabels: Record<string, string> = {
    veg: "Vegetarian",
    nonveg: "Non-Veg",
    vegan: "Vegan",
  };

  const difficultyColors: Record<string, string> = {
    easy: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    hard: "bg-red-100 text-red-800 border-red-200",
  };

  const difficultyLabels: Record<string, string> = {
    easy: "Dễ",
    medium: "Trung bình",
    hard: "Khó",
  };

  // thêm ngay sau phần destructuring props
  const videoUrl =
    dish.video_url ||
    "https://media.istockphoto.com/id/675787815/vi/video/ng%E1%BB%8Dn-l%E1%BB%ADa-ch%C3%A1y-d%C6%B0%E1%BB%9Di-ch%E1%BA%A3o-chi%C3%AAn-ch%E1%BB%A9a-%C4%91%E1%BA%A7y-t%C3%B4m.mp4?s=mp4-640x640-is&k=20&c=YSLyQP9FjhyZF3ABSEX-3zCksmcFvttdG22YSjiOd0w=";

  // helper để build proxy url cho remote images; nếu là local (bắt đầu bằng "/") giữ nguyên
  const proxied = (u?: string | null, fallback = "/default-avatar.png") => {
    if (!u) return fallback;
    if (u.startsWith("/")) return u;
    return `/api/img?u=${encodeURIComponent(u)}`;
  };

  const coverProxy = proxied(coverUrl, coverUrl);
  const avatarProxy = proxied(
    dish.creator?.avatar_url ?? null,
    "/default-avatar.png"
  );

  return (
    <div className="min-h-screen mt-2 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="group flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border hover:shadow-md transition"
            >
              <svg
                className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {dish.title}
              </h1>
              <p className="text-sm text-gray-500">
                {dish.category?.name ?? "Uncategorized"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center justify-center h-10 w-10 rounded-xl border bg-white hover:bg-gray-50 transition">
                <svg
                  className="w-5 h-5 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="flex items-center justify-center h-10 w-10 rounded-xl border bg-white hover:bg-gray-50 transition">
                <svg
                  className="w-5 h-5 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="relative overflow-hidden rounded-3xl border bg-white shadow-xl mx-auto max-w-xl">
              <div className="aspect-square relative">
                <Image
                  src={coverProxy}
                  alt={dish.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 640px) 100vw, 576px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Overlay badges */}
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                  {dish.diet && (
                    <span className="inline-flex items-center gap-2 rounded-lg bg-white/95 backdrop-blur-sm border border-white/50 px-3 py-1.5 text-xs font-semibold shadow-lg">
                      <span className="text-base">{dietIcons[dish.diet]}</span>
                      {dietLabels[dish.diet]}
                    </span>
                  )}
                  {dish.time_minutes && dish.time_minutes > 0 && (
                    <span className="inline-flex items-center gap-2 rounded-lg bg-white/95 backdrop-blur-sm border border-white/50 px-3 py-1.5 text-xs font-semibold shadow-lg">
                      <span className="text-base">⏱️</span>
                      {dish.time_minutes} phút
                    </span>
                  )}
                  {dish.servings && dish.servings > 0 && (
                    <span className="inline-flex items-center gap-2 rounded-lg bg-white/95 backdrop-blur-sm border border-white/50 px-3 py-1.5 text-xs font-semibold shadow-lg">
                      <span className="text-base">👥</span>
                      {dish.servings} người
                    </span>
                  )}
                  {/* {dish.difficulty && (
                    <span
                      className={`inline-flex items-center gap-2 rounded-lg backdrop-blur-sm border px-3 py-1.5 text-xs font-semibold shadow-lg ${
                        difficultyColors[dish.difficulty] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <span className="text-base">📊</span>
                      {difficultyLabels[dish.difficulty] || dish.difficulty}
                    </span>
                  )}
                  {dish.calories && dish.calories > 0 && (
                    <span className="inline-flex items-center gap-2 rounded-lg bg-white/95 backdrop-blur-sm border border-white/50 px-3 py-1.5 text-xs font-semibold shadow-lg">
                      <span className="text-base">🔥</span>
                      {dish.calories} kcal
                    </span>
                  )} */}
                </div>
              </div>
            </div>

            {/* Description */}
            {/* {dish.description && (
              <div className="relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/30 flex-shrink-0">
                    📖
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Mô tả món ăn
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {dish.description}
                    </p>
                  </div>
                </div>
              </div>
            )} */}

            {/* Video Section */}
            {videoUrl && (
              <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-6 shadow-sm mx-auto max-w-2xl">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 opacity-30 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center text-white text-xl shadow-lg shadow-rose-500/30">
                      🎬
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Video hướng dẫn
                    </h3>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl">
                    <div className="aspect-video">
                      <video
                        controls
                        className="w-full h-full"
                        poster={coverUrl}
                        preload="metadata"
                      >
                        <source src={videoUrl} type="video/mp4" />
                        <source src={videoUrl} type="video/webm" />
                        Trình duyệt của bạn không hỗ trợ video.
                      </video>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span>Xem video để học cách nấu chi tiết hơn</span>
                  </div>
                </div>
              </div>
            )}

            {/* Author Card */}
            {dish.creator && (
              <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-violet-200 shadow-lg flex-shrink-0">
                    <Image
                      src={avatarProxy}
                      alt={dish.creator.display_name ?? "Chef"}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Đầu bếp</div>
                    <div className="font-bold text-gray-900">
                      {dish.creator.display_name ?? "Anonymous"}
                    </div>
                  </div>
                  <button className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-xl transition">
                    Follow
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="border-b bg-gray-50/50 px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("ingredients")}
                    className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
                      activeTab === "ingredients"
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    🥕 Nguyên liệu ({dish.dish_ingredients?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("steps")}
                    className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
                      activeTab === "steps"
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    📝 Cách làm ({dish.recipe_steps?.length || 0} bước)
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === "ingredients" && (
                  <div className="space-y-3">
                    {dish.dish_ingredients &&
                    dish.dish_ingredients.length > 0 ? (
                      <>
                        <div className="mb-4 p-4 rounded-xl bg-violet-50 border border-violet-100">
                          <p className="text-sm text-violet-900 font-medium">
                            📋 Tổng cộng:{" "}
                            <span className="font-bold">
                              {dish.dish_ingredients.length}
                            </span>{" "}
                            nguyên liệu
                          </p>
                        </div>
                        {dish.dish_ingredients.map((ing, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 rounded-xl border bg-gray-50/50 p-4 hover:bg-gray-50 hover:border-violet-200 transition group"
                          >
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-100 to-fuchsia-100 group-hover:from-violet-200 group-hover:to-fuchsia-200 flex items-center justify-center text-xl flex-shrink-0 transition">
                              🥘
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900">
                                {idx + 1}.{" "}
                                {ing.ingredient?.name ?? "Nguyên liệu"}
                              </div>
                              {(ing.amount || ing.ingredient?.unit) && (
                                <div className="text-sm text-violet-600 font-medium mt-1">
                                  {[ing.amount, ing.ingredient?.unit]
                                    .filter(Boolean)
                                    .join(" ")}
                                </div>
                              )}
                              {ing.note && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {ing.note}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🥘</div>
                        <p className="text-gray-400 font-medium">
                          Chưa có nguyên liệu
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "steps" && (
                  <div className="space-y-6">
                    {dish.recipe_steps && dish.recipe_steps.length > 0 ? (
                      <>
                        <div className="mb-4 p-4 rounded-xl bg-violet-50 border border-violet-100">
                          <p className="text-sm text-violet-900 font-medium">
                            👨‍🍳 Tổng cộng:{" "}
                            <span className="font-bold">
                              {dish.recipe_steps.length}
                            </span>{" "}
                            bước thực hiện
                          </p>
                        </div>
                        {dish.recipe_steps.map((step, index) => (
                          <div key={step.step_no} className="relative">
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/30">
                                  {step.step_no}
                                </div>
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-2">
                                      Bước {step.step_no}
                                    </h4>
                                    <p className="text-gray-700 leading-relaxed">
                                      {step.content}
                                    </p>
                                  </div>
                                </div>
                                {step.image_url && (
                                  <div className="relative aspect-square rounded-xl overflow-hidden border shadow-sm max-w-xs hover:shadow-lg transition">
                                    <Image
                                      src={`/api/img?u=${encodeURIComponent(
                                        step.image_url
                                      )}`}
                                      alt={`Bước ${step.step_no}`}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 640px) 100vw, 320px"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            {index !== dish.recipe_steps!.length - 1 && (
                              <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-violet-200 to-transparent" />
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-gray-400 font-medium">
                          Chưa có hướng dẫn
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            {dish.tips && (
              <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 opacity-30 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl shadow-lg shadow-amber-500/30">
                      💡
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Mẹo hay</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {dish.tips}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Rating Card */}
              <div className="relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm">
                <div className="text-center">
                  <div className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    {ratingAvg > 0 ? ratingAvg.toFixed(1) : "—"}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.round(ratingAvg)
                            ? "text-amber-400"
                            : "text-gray-300"
                        }`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    {ratingCount} đánh giá
                  </div>
                  <button className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-xl transition">
                    ⭐ Đánh giá món này
                  </button>
                </div>
              </div>

              {/* Share Card */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4">
                  Chia sẻ món ăn
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      icon: "📘",
                      label: "Facebook",
                      color: "from-blue-500 to-blue-600",
                    },
                    {
                      icon: "📷",
                      label: "Instagram",
                      color: "from-pink-500 to-rose-500",
                    },
                    {
                      icon: "🐦",
                      label: "Twitter",
                      color: "from-sky-500 to-blue-500",
                    },
                    {
                      icon: "📋",
                      label: "Copy",
                      color: "from-gray-500 to-gray-600",
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="flex flex-col items-center gap-2 rounded-xl border p-4 hover:bg-gray-50 transition group"
                    >
                      <div
                        className={`h-10 w-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-xl text-white shadow-lg group-hover:scale-110 transition`}
                      >
                        {item.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Related */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4">
                  Món tương tự
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Link
                      key={i}
                      href="#"
                      className="flex gap-3 rounded-xl border p-3 hover:bg-gray-50 transition group"
                    >
                      <div className="h-16 w-16 rounded-lg bg-gray-200 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-violet-600 transition">
                          Món ăn #{i}
                        </div>
                        <div className="text-xs text-gray-500">
                          ⭐ 4.5 • 30 phút
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
