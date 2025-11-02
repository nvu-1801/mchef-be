"use client";

import React from "react";
import { DishFull } from "@/modules/dishes/dish-public";
import { proxied as buildProxy } from "@/utils/image-proxy";
import DishHeader from "@/components/dish/DishHeader";
import DishCover from "@/components/dish/DishCover";
import DishVideo from "@/components/dish/DishVideo";
import AuthorCard from "@/components/dish/AuthorCard";
import DishTabs from "@/components/dish/DishTabs";
import RatingCard from "@/components/dish/RatingCard";
import Comments from "@/components/dish/Comments";

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

export default function DishDetailClient({
  dish,
  coverUrl,
  ratingAvg,
  ratingCount,
  currentUser,
}: Props) {
  const videoUrl =
    dish.video_url ||
    "https://media.istockphoto.com/id/675787815/vi/video/ng%E1%BB%8Dn-l%E1%BB%ADa-ch%C3%A1y-d%C6%B0%E1%BB%9Di-ch%E1%BA%A3o-chi%C3%AAn-ch%E1%BB%A9a-%C4%91%E1%BA%A7y-t%C3%B4m.mp4?s=mp4-640x640-is&k=20&c=YSLyQP9FjhyZF3ABSEX-3zCksmcFvttdG22YSjiOd0w=";

  const proxied = (u?: string | null, fallback = "/default-avatar.png") =>
    buildProxy(u, fallback);

  const coverProxy = proxied(coverUrl, coverUrl);
  const avatarProxy = proxied(
    dish.creator?.avatar_url ?? null,
    "/default-avatar.png"
  );
  return (
   <div className="min-h-screen mt-2 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <DishHeader title={dish.title} category={dish.category?.name} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Content Column */}
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <DishCover cover={coverProxy} dish={dish} />
              {videoUrl && <DishVideo videoUrl={videoUrl} poster={coverProxy} />}
              {dish.creator && (
                <AuthorCard avatar={avatarProxy} creator={dish.creator} />
              )}
            </div>

            {/* Recipe Content */}
            <div className="space-y-8">
              <DishTabs dish={dish} proxied={proxied} />
              
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

              {/* Comments Section */}
              <Comments
                dishId={dish.id}
                currentUserId={currentUser?.id}
                isAdmin={currentUser?.isAdmin}
              />
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Rating Widget */}
              <RatingCard
                dishId={dish.id}
                currentUserId={currentUser?.id}
                ratingAvg={ratingAvg}
                ratingCount={ratingCount}
              />

              {/* Share Widget */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
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
                      className="flex flex-col items-center gap-2 rounded-xl border p-4 hover:bg-gray-50 hover:border-violet-200 transition group"
                    >
                      <div
                        className={`h-10 w-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-xl text-white shadow-lg group-hover:scale-110 transition`}
                      >
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Related Dishes */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Món tương tự
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <a
                      key={i}
                      href="#"
                      className="flex gap-4 rounded-xl border p-3 hover:bg-gray-50 hover:border-violet-200 transition group"
                    >
                      <div className="h-20 w-20 rounded-lg bg-gray-200 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-violet-600 transition">
                          Món ăn #{i}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            ⭐ 4.5
                          </span>
                          <span>•</span>
                          <span>30 phút</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
