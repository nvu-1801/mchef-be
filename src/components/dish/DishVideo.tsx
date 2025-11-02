"use client";
import React from "react";

type Props = {
  videoUrl: string;
  poster?: string;
};

export default function DishVideo({ videoUrl, poster }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-6 shadow-sm mx-auto max-w-2xl">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 opacity-30 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center text-white text-xl shadow-lg shadow-rose-500/30">
            🎬
          </div>
          <h3 className="text-lg font-bold text-gray-900">Video hướng dẫn</h3>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl">
          <div className="aspect-video">
            <video
              controls
              className="w-full h-full"
              poster={poster}
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
  );
}
