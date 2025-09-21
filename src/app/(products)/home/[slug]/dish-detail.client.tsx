"use client";

import Link from "next/link";
import type { Dish } from "@/modules/dishes/dish-public";

export default function DishDetailClient({
  dish,
  coverUrl,
}: {
  dish: Dish & { tips: string | null };
  coverUrl: string; // nhận từ server để tránh import server-only
}) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb + back/forward */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="space-x-2">
          <Link href="/home" className="hover:underline">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-700 line-clamp-1">{dish.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:underline" onClick={() => history.back()}>
            ← Trước
          </button>
          <button className="hover:underline" onClick={() => history.forward()}>
            Tiếp →
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Ảnh bìa */}
        <div>
          <div className="aspect-square rounded-xl border overflow-hidden bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={dish.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Thông tin món */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{dish.title}</h1>

          {/* diet tag (nếu có) */}
          {dish.diet && (
            <div className="mt-2 inline-flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {dietLabel(dish.diet)}
              </span>
            </div>
          )}

          {/* Meta: thời gian + khẩu phần */}
          <div className="mt-4 text-gray-700">
            <div className="flex items-center gap-4">
              <span>
                ⏱️ {dish.time_minutes ? `${dish.time_minutes} phút` : "—"}
              </span>
              <span>🍽️ {dish.servings ? `${dish.servings} phần` : "—"}</span>
            </div>
          </div>

          {/* Tips / mô tả ngắn */}
          {dish.tips && (
            <div className="mt-8">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                GỢI Ý / MẸO
              </div>
              <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                {dish.tips}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function dietLabel(key: string) {
  // map đơn giản – chỉnh theo enum của bạn
  if (key === "veg") return "Vegetarian";
  if (key === "vegan") return "Vegan";
  if (key === "nonveg") return "Non-Veg";
  return key;
}
