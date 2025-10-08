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

  const list = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return items;
    return items.filter((c) =>
      (c.display_name ?? "").toLowerCase().includes(key)
    );
  }, [q, items]);

  return (
    <>
      <div className="mt-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search chefs…"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <ChefCard key={c.id} c={c} />
        ))}
        {list.length === 0 && (
          <div className="col-span-full rounded-xl border p-6 text-sm text-gray-600">
            No chefs found.
          </div>
        )}
      </div>
    </>
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
  const stars = toStars(c.rating_avg ?? 0);

  return (
    <div className="rounded-3xl border border-gray-200 shadow-lg overflow-hidden bg-white transition hover:shadow-xl">
      <div className="flex items-center gap-4 p-5">
        <img
          src={avatar}
          className="h-16 w-16 rounded-full border-2 border-yellow-400 shadow-sm object-cover"
          alt={`${name}'s avatar`}
        />
        <div className="flex-1 min-w-0">
          <div className="text-lg font-semibold text-gray-800 truncate">
            {name}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <span
              title={`${c.rating_avg ?? 0}/5`}
              className="flex items-center gap-1"
            >
              ⭐ {stars}{" "}
              <span className="font-medium">
                {Number(c.rating_avg ?? 0).toFixed(1)}
              </span>
            </span>
            <span>· {c.rating_count ?? 0} ratings</span>
          </div>
          {c.verified_at && (
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
              ✅ Verified Chef
            </div>
          )}
        </div>
      </div>

      {c.bio && (
        <div className="px-5 pb-4 text-sm text-gray-700 line-clamp-3 italic">
          “{c.bio}”
        </div>
      )}

      <div className="flex items-center justify-between border-t bg-gray-50 px-5 py-4">
        <div className="text-xs text-gray-500">
          🍽 {c.dishes_count ?? 0} dishes · 💬 {c.comments_count ?? 0} comments
        </div>
        <Link
          href={`/admin/chefs/${c.id}`}
          className="rounded-full bg-yellow-400 text-white px-4 py-2 text-sm font-medium hover:bg-yellow-500 transition"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

function toStars(avg: number) {
  // Hiển thị 5 ký tự sao theo avg
  const full = Math.floor(avg);
  const half = avg - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}
