"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Item = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string | null;
  published: boolean;
  review_status: "pending" | "approved" | "rejected";
  review_note: string | null;
  diet: string | null; // 👈 thêm diet
  creator?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  category?: {
    id: string;
    name: string | null;
    slug?: string | null;
    icon?: string | null;
  } | null; // 👈 thêm slug, icon
};

type ListRes = {
  items: Item[];
  pagination: { limit: number; offset: number; total: number };
};

const DIET_LABEL: Record<string, string> = {
  veg: "Vegetarian",
  nonveg: "Non-Veg",
  vegan: "Vegan",
};
const DIET_EMOJI: Record<string, string> = {
  veg: "🥗",
  nonveg: "🍖",
  vegan: "🌱",
};

const placeholder = "https://placehold.co/600x400/e5e7eb/9ca3af?text=No+Image";

export default function ModerationDishesClient() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    "pending"
  );
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(12);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actLoading, setActLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);
  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        status,
        limit: String(limit),
        offset: String(offset),
      });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/moderation/dishes?${params.toString()}`, {
        cache: "no-store",
      });
      const data: ListRes | { error: string } = await res.json();
      if (!res.ok) throw new Error((data as any).error || "Load failed");
      setItems((data as ListRes).items);
      setTotal((data as ListRes).pagination.total);
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, limit, offset]);

  const onSearch = () => {
    setOffset(0);
    load();
  };

  const act = async (id: string, action: "approve" | "reject") => {
    let reason: string | undefined = undefined;
    if (action === "reject") {
      reason = window.prompt("Lý do từ chối? (tuỳ chọn)") || undefined;
    }
    setActLoading(id);
    try {
      const res = await fetch(`/api/moderation/dishes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Action failed");

      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...data.item } : it))
      );
    } catch (e: any) {
      alert(e.message || "Không thể thực hiện");
    } finally {
      setActLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-2xl font-bold mb-4">Kiểm duyệt món ăn</h1>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex rounded-xl border p-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tiêu đề…"
            className="flex-1 outline-none px-2"
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <button
            onClick={onSearch}
            className="px-3 py-1 rounded-lg bg-violet-600 text-white text-sm"
          >
            Tìm
          </button>
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as any);
            setOffset(0);
          }}
          className="rounded-xl border p-2"
        >
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Bị từ chối</option>
        </select>

        <select
          value={String(limit)}
          onChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setOffset(0);
          }}
          className="rounded-xl border p-2"
        >
          {[12, 24, 48].map((n) => (
            <option key={n} value={n}>
              {n} / trang
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl border animate-pulse bg-gray-50"
              />
            ))
          : items.map((it) => {
              const dietKey = (it.diet || "").toLowerCase();
              const dietLabel = DIET_LABEL[dietKey] || it.diet || "—";
              const dietEmoji = DIET_EMOJI[dietKey] || "🍽️";
              const catName = it.category?.name || "—";
              const catIcon = it.category?.icon || "🍲";

              return (
                <div
                  key={it.id}
                  className="rounded-xl border bg-white shadow-sm overflow-hidden"
                >
                  {/* Ảnh bìa */}
                  <div className="relative aspect-[16/9] bg-gray-100">
                    <img
                      src={it.cover_image_url || placeholder}
                      alt={it.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Status chip trên ảnh */}
                    <div className="absolute left-2 top-2 flex gap-2">
                      <span className="text-[11px] font-medium rounded-full bg-white/90 border px-2 py-0.5">
                        {it.review_status}
                      </span>
                      {it.published ? (
                        <span className="text-[11px] font-medium rounded-full bg-emerald-600 text-white px-2 py-0.5">
                          Public
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium rounded-full bg-gray-300 text-gray-800 px-2 py-0.5">
                          Private
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold line-clamp-2">
                        {it.title}
                      </div>
                      <a
                        href={`/dish/${it.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-violet-700 hover:underline shrink-0"
                      >
                        Xem
                      </a>
                    </div>

                    {/* Badges: diet + category */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] rounded-full border px-2 py-0.5">
                        {dietEmoji} {dietLabel}
                      </span>
                      <span className="text-[11px] rounded-full border px-2 py-0.5">
                        {catIcon} {catName}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(it.created_at).toLocaleString()}
                    </div>

                    {/* Hành động */}
                    <div className="mt-3 flex gap-2">
                      {it.review_status === "pending" ? (
                        <>
                          <button
                            onClick={() => act(it.id, "approve")}
                            disabled={actLoading === it.id}
                            className="text-xs rounded-lg bg-emerald-600 text-white px-3 py-1 disabled:opacity-50"
                          >
                            {actLoading === it.id ? "Đang duyệt…" : "Duyệt"}
                          </button>
                          <button
                            onClick={() => act(it.id, "reject")}
                            disabled={actLoading === it.id}
                            className="text-xs rounded-lg bg-red-600 text-white px-3 py-1 disabled:opacity-50"
                          >
                            {actLoading === it.id ? "Đang từ chối…" : "Từ chối"}
                          </button>
                        </>
                      ) : (
                        <div className="text-xs text-gray-600">
                          {it.review_status === "approved"
                            ? "Đã công khai"
                            : it.review_note
                            ? `Từ chối: ${it.review_note}`
                            : "Đã từ chối"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={() => setOffset(Math.max(0, offset - limit))}
          disabled={page <= 1}
          className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
        >
          ← Trước
        </button>
        <div className="text-sm">
          {page} / {pages}
        </div>
        <button
          onClick={() => setOffset(offset + limit)}
          disabled={page >= pages}
          className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
