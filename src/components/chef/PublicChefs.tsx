"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type PublicChef = {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  can_post: boolean | null;
  is_active: boolean | null;
  verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  dishes_count?: number | null;
  comments_count?: number | null;
};

export default function PublicChefs({ items }: { items: PublicChef[] }) {
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "dishes" | "recent">(
    "rating"
  );

  const list = useMemo(() => {
    let filtered = items;

    // Search filter
    const key = q.trim().toLowerCase();
    if (key) {
      filtered = filtered.filter((c) =>
        (c.display_name ?? "").toLowerCase().includes(key)
      );
    }

    // Sort
    const sorted = [...filtered];
    if (sortBy === "rating") {
      sorted.sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0));
    } else if (sortBy === "dishes") {
      sorted.sort((a, b) => (b.dishes_count ?? 0) - (a.dishes_count ?? 0));
    } else if (sortBy === "recent") {
      sorted.sort(
        (a, b) =>
          new Date(b.verified_at ?? 0).getTime() -
          new Date(a.verified_at ?? 0).getTime()
      );
    }

    return sorted;
  }, [q, items, sortBy]);

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Search chefs
            </label>
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name…"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Sort by
            </label>
            <div className="flex gap-2">
              {
                {
                  rating: "⭐ Rating",
                  dishes: "🥘 Dishes",
                  recent: "🕐 Recent",
                }[sortBy]
              }
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Showing{" "}
            <span className="font-bold text-gray-900">{list.length}</span> of{" "}
            <span className="font-bold text-gray-900">{items.length}</span>{" "}
            chefs
          </div>
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <ChefCard key={c.id} c={c} />
        ))}
        {list.length === 0 && (
          <div className="col-span-full rounded-3xl border bg-white p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No chefs found
            </h3>
            <p className="text-sm text-gray-600">Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChefCard({ c }: { c: PublicChef }) {
  const avatar =
    c?.avatar_url && /^https?:\/\//i.test(c.avatar_url)
      ? c.avatar_url
      : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
          c.display_name ?? "C"
        )}`;

  const name = c.display_name ?? "Chef";

  return (
    <article className="relative overflow-hidden rounded-3xl border bg-white shadow-sm hover:shadow-xl transition group">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 opacity-0 group-hover:opacity-100 blur-2xl transition" />

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-400 blur opacity-30" />
            <img
              src={avatar}
              className="relative h-16 w-16 rounded-xl object-cover border-2 border-white"
              alt={`${name}'s avatar`}
            />
            {c.verified_at && (
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs shadow-lg">
                ✓
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-bold text-gray-900">{name}</h3>
              {c.can_post && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                  ✎
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm">
                <span className="text-amber-500 text-base">⭐</span>
                <span className="font-bold text-gray-900">
                  {Number(c.rating_avg ?? 0).toFixed(1)}
                </span>
                <span className="text-gray-500 text-xs">
                  ({c.rating_count ?? 0})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {c.bio && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed italic">
            "{c.bio}"
          </p>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-medium">
            <span className="text-base">🥘</span>
            <span className="font-bold text-gray-900">
              {c.dishes_count ?? 0}
            </span>
            <span className="text-gray-600">dishes</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium">
            <span className="text-base">💬</span>
            <span className="font-bold text-gray-900">
              {c.comments_count ?? 0}
            </span>
            <span className="text-gray-600">comments</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Link
            href={`/profile/${c.user_id}`}
            className="flex-1 rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm font-medium text-center hover:bg-gray-50 transition"
          >
            👤 Profile
          </Link>
          <Link
            href={`/admin/chefs/${c.id}`}
            className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2.5 text-sm font-bold text-white hover:shadow-lg hover:shadow-indigo-500/30 transition"
          >
            ⚙️ Manage
          </Link>
        </div>
      </div>
    </article>
  );
}
