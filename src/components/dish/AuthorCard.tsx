// components/dish/AuthorCard.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type ChefApi = {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isActive: boolean | null;
  canPost: boolean | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  averageRating: number | null;
  totalRatings: number;
  ratings: Array<{
    id: string | number;
    raterId: string;
    stars: number;
    comment: string | null;
    createdAt: string;
  }>;
};

export default function AuthorCard({ chefId }: { chefId: string }) {
  const [chef, setChef] = useState<ChefApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`/api/chefs/${chefId}`, {
          signal: ac.signal,
          cache: "no-store",
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || `Fetch chef failed (${res.status})`);
        }
        const data: ChefApi = await res.json();
        setChef(data);
      } catch (e: any) {
        if (e.name !== "AbortError") setErr(e?.message || "Fetch error");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [chefId]);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-5">
        <div className="flex items-center gap-4 animate-pulse">
          <div className="h-16 w-16 rounded-2xl bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="h-5 w-40 bg-gray-200 rounded" />
          </div>
          <div className="h-9 w-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (err || !chef) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
        Không tải được thông tin đầu bếp. {err ? `(${err})` : ""}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-white via-orange-50/30 to-rose-50/30 p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-orange-200 shadow-md flex-shrink-0">
          <Image
            src={chef.avatarUrl ?? "/default-avatar.png"}
            alt={chef.displayName ?? "Chef"}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-500 mb-1">Đầu bếp</div>
          <div className="font-bold text-gray-900 text-lg truncate">
            {chef.displayName ?? "Anonymous"}
          </div>

          {/* rating mini-row */}
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
            <span>⭐ {chef.averageRating ?? "—"}</span>
            <span>•</span>
            <span>{chef.totalRatings} đánh giá</span>
          </div>
        </div>

        <button
          className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:scale-105 transition-all duration-200"
          onClick={() => {
            // TODO: gọi API follow nếu bạn đã có endpoint
            alert("TODO: Follow");
          }}
        >
          Follow
        </button>
      </div>

      {/* actions */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          href={`/profile/${chef.id}`}
          className="flex-1 rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm font-medium text-center hover:bg-gray-50 transition"
          prefetch
        >
          👤 Profile
        </Link>

        <Link
          href={`/chef/${chef.id}/dishes`}
          className="flex-1 rounded-xl border-2 border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-semibold text-orange-700 text-center hover:bg-orange-100 transition"
          prefetch
        >
          🍳 Món của đầu bếp
        </Link>
      </div>
    </div>
  );
}
