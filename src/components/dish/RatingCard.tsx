"use client";
import React from "react";

type Props = {
  ratingAvg: number;
  ratingCount: number;
};

export default function RatingCard({ ratingAvg, ratingCount }: Props) {
  return (
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
                i < Math.round(ratingAvg) ? "text-amber-400" : "text-gray-300"
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <div className="text-sm text-gray-500 mb-4">{ratingCount} đánh giá</div>
        <button className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-xl transition">
          ⭐ Đánh giá món này
        </button>
      </div>
    </div>
  );
}
