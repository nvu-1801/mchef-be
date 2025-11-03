"use client";
import React from "react";
import { useRouter } from "next/navigation";

type Props = {
  title: string;
  category?: string;
};

export default function DishHeader({ title, category }: Props) {
  const router = useRouter();
  return (
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
              {title}
            </h1>
            <p className="text-sm text-gray-500">
              {category ?? "Uncategorized"}
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
  );
}
