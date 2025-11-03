"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DishFull } from "@/modules/dishes/dish-public";
import { SmartVideo } from "@/components/common/SmartVideo";

// Khai báo lại các kiểu dữ liệu và hằng số
type Props = {
  dish: DishFull;
  coverUrl: string;
  ratingAvg: number;
  ratingCount: number;
  currentUser?: {
    id: string;
    isAdmin?: boolean;
  } | null;
};

// Constants moved outside component
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

// Đã thêm lại các hằng số cho 'difficulty'
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

  const videoUrl =
    dish.video_url ||
    "https://media.istockphoto.com/id/675787815/vi/video/ng%E1%BB%8Dn-l%E1%BB%ADa-ch%C3%A1y-d%C6%B0%E1%BB%9Bi-ch%E1%BA%A3o-chi%C3%AAn-ch%E1%BB%A9a-%C4%91%E1%BA%A7y-t%C3%B4m.mp4?s=mp4-640x640-is&k=20&c=YSLyQP9FjhyZF3ABSEX-3zCksmcFvttdG22YSjiOd0w=";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50">
      {/* Header */}
      <header className="top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-gray-200/50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => router.back()}
                className="group flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="Quay lại"
              >
                <svg
                  className="w-5 h-5 text-gray-700 group-hover:text-orange-600 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {dish.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {dish.category?.name ?? "Uncategorized"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex items-center justify-center h-10 w-10 rounded-xl border border-gray-200 bg-white hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 shadow-sm hover:shadow-md group"
                aria-label="Yêu thích"
              >
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              <button
                className="flex items-center justify-center h-10 w-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="Tùy chọn khác"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                  <circle cx="5" cy="12" r="2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Hero Section - Cover Image with Info Overlay */}
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-gray-100">
              <div className="aspect-[4/3] sm:aspect-square relative">
                <Image
                  src={coverUrl}
                  alt={dish.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-rose-500/10" />

                {/* Info Badges (ĐÃ THÊM LẠI 'difficulty' VÀ 'calories') */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <div className="flex flex-wrap gap-2">
                    {/* Diet */}
                    {dish.diet && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/50 px-3 py-1.5 text-xs font-bold shadow-lg hover:scale-105 transition-transform">
                        <span className="text-base">
                          {dietIcons[dish.diet]}
                        </span>
                        <span className="text-gray-800">
                          {dietLabels[dish.diet]}
                        </span>
                      </span>
                    )}
                    {/* Time */}
                    {dish.time_minutes && dish.time_minutes > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/50 px-3 py-1.5 text-xs font-bold shadow-lg hover:scale-105 transition-transform">
                        <span className="text-base">⏱️</span>
                        <span className="text-gray-800">
                          {dish.time_minutes} phút
                        </span>
                      </span>
                    )}
                    {/* Servings */}
                    {dish.servings && dish.servings > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/50 px-3 py-1.5 text-xs font-bold shadow-lg hover:scale-105 transition-transform">
                        <span className="text-base">👥</span>
                        <span className="text-gray-800">
                          {dish.servings} người
                        </span>
                      </span>
                    )}
                    {/* Difficulty (ĐÃ HIỂN THỊ LẠI) */}
                    {dish.difficulty && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-xl backdrop-blur-md border px-3 py-1.5 text-xs font-bold shadow-lg hover:scale-105 transition-transform ${
                          difficultyColors[dish.difficulty] ||
                          "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        <span className="text-base">📊</span>
                        {difficultyLabels[dish.difficulty] || dish.difficulty}
                      </span>
                    )}
                    {/* Calories (ĐÃ HIỂN THỊ LẠI) */}
                    {dish.calories && dish.calories > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/50 px-3 py-1.5 text-xs font-bold shadow-lg hover:scale-105 transition-transform">
                        <span className="text-base">🔥</span>
                        <span className="text-gray-800">
                          {dish.calories} kcal
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description (ĐÃ HIỂN THỊ LẠI) */}
            {dish.description && (
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/30 flex-shrink-0">
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
            )}

            {/* Author Card */}
            {dish.creator && (
              <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-white via-orange-50/30 to-rose-50/30 p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-orange-200 shadow-md flex-shrink-0">
                    <Image
                      src={dish.creator.avatar_url ?? "/default-avatar.png"}
                      alt={dish.creator.display_name ?? "Chef"}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Đầu bếp
                    </div>
                    <div className="font-bold text-gray-900 text-lg truncate">
                      {dish.creator.display_name ?? "Anonymous"}
                    </div>
                  </div>

                  <button className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:scale-105 transition-all duration-200">
                    Follow
                  </button>
                </div>
              </div>
            )}

            {/* Video Section */}
            {videoUrl && (
              <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 shadow-sm">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 opacity-20 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-500/30">
                      🎬
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Video hướng dẫn
                      </h3>
                      <p className="text-sm text-gray-600">
                        Xem cách nấu chi tiết
                      </p>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-black/5">
                    <div className="aspect-video">
                      <SmartVideo
                        url={videoUrl}
                        poster={coverUrl}
                        className="w-full h-full"
                        autoPlay={false}
                        muted
                        loop={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              {/* Tab Headers */}
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 py-4">
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => setActiveTab("ingredients")}
                    className={`relative flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      activeTab === "ingredients"
                        ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30 scale-105"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className="text-lg">🥕</span>
                    <span className="hidden sm:inline">Nguyên liệu</span>
                    <span
                      className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-lg text-xs font-bold ${
                        activeTab === "ingredients"
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {dish.dish_ingredients?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("steps")}
                    className={`relative flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      activeTab === "steps"
                        ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30 scale-105"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className="text-lg">📝</span>
                    <span className="hidden sm:inline">Cách làm</span>
                    <span
                      className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-lg text-xs font-bold ${
                        activeTab === "steps"
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {dish.recipe_steps?.length || 0}
                    </span>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {activeTab === "ingredients" && (
                  <div className="space-y-3">
                    {dish.dish_ingredients &&
                    dish.dish_ingredients.length > 0 ? (
                      <>
                        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-rose-50 border border-orange-100">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-xl shadow-lg shadow-orange-500/30">
                              📋
                            </div>
                            <p className="text-sm text-gray-800 font-bold">
                              Tổng cộng:{" "}
                              <span className="text-orange-600">
                                {dish.dish_ingredients.length}
                              </span>{" "}
                              nguyên liệu
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3">
                          {dish.dish_ingredients.map((ing, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-4 hover:border-orange-200 hover:shadow-md transition-all duration-200 group"
                            >
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 group-hover:from-orange-200 group-hover:to-rose-200 flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-200 shadow-sm">
                                🥘
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 mb-1">
                                  <span className="text-orange-600 mr-2">
                                    {idx + 1}.
                                  </span>
                                  {ing.ingredient?.name ?? "Nguyên liệu"}
                                </div>

                                {(ing.amount || ing.ingredient?.unit) && (
                                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg mb-1">
                                    <span>⚖️</span>
                                    {[ing.amount, ing.ingredient?.unit]
                                      .filter(Boolean)
                                      .join(" ")}
                                  </div>
                                )}

                                {ing.note && (
                                  <div className="text-sm text-gray-600 mt-2 pl-3 border-l-2 border-orange-200">
                                    {ing.note}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-16">
                        <div className="text-7xl mb-4">🥘</div>
                        <p className="text-gray-400 font-semibold text-lg">
                          Chưa có nguyên liệu
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "steps" && (
                  <div className="space-y-8">
                    {dish.recipe_steps && dish.recipe_steps.length > 0 ? (
                      <>
                        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-rose-50 border border-orange-100">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-xl shadow-lg shadow-orange-500/30">
                              👨‍🍳
                            </div>
                            <p className="text-sm text-gray-800 font-bold">
                              Tổng cộng:{" "}
                              <span className="text-orange-600">
                                {dish.recipe_steps.length}
                              </span>{" "}
                              bước thực hiện
                            </p>
                          </div>
                        </div>

                        {dish.recipe_steps.map((step, index) => (
                          <div key={step.step_no} className="relative">
                            <div className="flex gap-5">
                              <div className="flex-shrink-0">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/30">
                                  {step.step_no}
                                </div>
                              </div>

                              <div className="flex-1 space-y-4">
                                <div>
                                  <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-lg bg-orange-50 border border-orange-100">
                                    <span className="text-xs font-bold text-orange-600">
                                      BƯỚC {step.step_no}
                                    </span>
                                  </div>
                                  <p className="text-gray-800 leading-relaxed text-base">
                                    {step.content}
                                  </p>
                                </div>

                                {step.image_url && (
                                  <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 shadow-md max-w-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
                                    <Image
                                      src={step.image_url}
                                      alt={`Bước ${step.step_no}`}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 640px) 100vw, 384px"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {index !== dish.recipe_steps!.length - 1 && (
                              <div className="absolute left-7 top-20 bottom-0 w-0.5 bg-gradient-to-b from-orange-200 via-rose-200 to-transparent" />
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-16">
                        <div className="text-7xl mb-4">📝</div>
                        <p className="text-gray-400 font-semibold text-lg">
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
              <div className="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 shadow-sm">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-amber-300 to-orange-300 opacity-20 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-amber-500/30">
                      💡
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Mẹo hay
                      </h3>
                      <p className="text-sm text-gray-600">
                        Bí quyết thành công
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-amber-100">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {dish.tips}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Rating Card */}
              <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 opacity-50" />

                <div className="relative p-6 text-center">
                  <div className="mb-3">
                    <div className="text-6xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent mb-2">
                      {ratingAvg > 0 ? ratingAvg.toFixed(1) : "—"}
                    </div>

                    <div className="flex items-center justify-center gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-7 h-7 transition-all ${
                            i < Math.round(ratingAvg)
                              ? "text-amber-400 drop-shadow-md"
                              : "text-gray-300"
                          }`}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>

                    <div className="text-sm text-gray-600 font-semibold">
                      {ratingCount} đánh giá
                    </div>
                  </div>

                  <button className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200">
                    ⭐ Đánh giá món này
                  </button>
                </div>
              </div>

              {/* Share Card */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
                <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Chia sẻ món ăn
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {/* Facebook */}
                  <button className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50 hover:shadow-md transition-all duration-200 group">
                    <div className="h-12 w-12 rounded-xl bg-[#1877F2] hover:bg-[#0C63D4] flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-200">
                      <svg
                        className="w-6 h-6 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      Facebook
                    </span>
                  </button>

                  {/* Instagram */}
                  <button className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 p-4 hover:border-pink-200 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:shadow-md transition-all duration-200 group">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FD1D1D] flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-200">
                      <svg
                        className="w-6 h-6 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="20"
                          height="20"
                          rx="5"
                          ry="5"
                        />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      Instagram
                    </span>
                  </button>

                  {/* Twitter/X */}
                  <button className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 p-4 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md transition-all duration-200 group">
                    <div className="h-12 w-12 rounded-xl bg-black hover:bg-gray-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-200">
                      <svg
                        className="w-5 h-5 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      Twitter
                    </span>
                  </button>

                  {/* Copy Link */}
                  <button className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 p-4 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md transition-all duration-200 group">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-200">
                      <svg
                        className="w-6 h-6 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-gray-700">
                      Copy Link
                    </span>
                  </button>
                </div>
              </div>

              {/* Related */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
                <h3 className="text-base font-bold text-gray-900 mb-4">
                  Món tương tự
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <a
                      key={i}
                      href="#"
                      className="flex gap-3 rounded-xl border border-gray-100 p-3 hover:bg-orange-50 hover:border-orange-200 transition-all duration-200 group"
                    >
                      <div className="h-16 w-16 rounded-lg bg-gray-200 flex-shrink-0 relative overflow-hidden">
                        {/* Placeholder for image */}
                        <div className="absolute inset-0 bg-gray-300/50 flex items-center justify-center text-gray-500 text-xs">
                          Ảnh Món
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                          Món ăn #{i}: Tên Món Ăn Liên Quan
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="font-semibold text-amber-500">
                            ⭐ 4.5
                          </span>{" "}
                          • 30 phút
                        </div>
                        <div className="text-xs text-gray-400 truncate mt-0.5">
                          Thể loại liên quan
                        </div>
                      </div>
                    </a>
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
