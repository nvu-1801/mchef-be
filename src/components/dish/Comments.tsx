// components/dish/Comments.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type CommentUser = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type CommentItem = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: CommentUser | null;
};

type FetchRes = {
  items: CommentItem[];
  nextCursor: string | null;
  nextCursorId: string | null;
  hasMore: boolean;
};

type Props = {
  dishId: string;
  currentUserId?: string | null;
  isAdmin?: boolean;
  onRequireLogin?: () => void;
};

export default function Comments({
  dishId,
  currentUserId,
  isAdmin,
  onRequireLogin,
}: Props) {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [firstLoading, setFirstLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorId, setCursorId] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const MAX = 5000;
  const left = MAX - content.trim().length;

  const canPost = useMemo(() => content.trim().length > 0 && content.trim().length <= MAX, [content]);

  // --- helpers ---
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
  };

  // --- Load comments (cursor-based) ---
  const fetchComments = async (reset = false) => {
    if (reset) setFirstLoading(true);
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ dishId, limit: "10" });
      if (!reset && cursor) params.set("cursor", cursor);
      if (!reset && cursorId) params.set("cursorId", cursorId);

      const res = await fetch(`/api/comments?${params.toString()}`, { method: "GET" });
      const data: FetchRes = await res.json();

      if (!res.ok) throw new Error((data as any)?.error || "Load comments failed");

      setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
      setHasMore(data.hasMore);
      setCursor(data.nextCursor);
      setCursorId(data.nextCursorId);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
      setFirstLoading(false);
    }
  };

  useEffect(() => {
    // load lần đầu / khi đổi dish
    setItems([]);
    setCursor(null);
    setCursorId(null);
    fetchComments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishId]);

  // --- Post comment (auth-gated + optimistic) ---
  const onPost = async () => {
    if (!currentUserId) {
      onRequireLogin?.();
      return;
    }
    if (!canPost || posting) return;

    setPosting(true);
    setError(null);

    const payload = { dishId, content: content.trim() };

    // Optimistic UI
    const tmpId = `tmp-${Date.now()}`;
    const optimistic: CommentItem = {
      id: tmpId,
      content: payload.content,
      created_at: new Date().toISOString(),
      user_id: currentUserId,
      user: { id: currentUserId, full_name: "Bạn", avatar_url: null },
    };
    setItems((prev) => [optimistic, ...prev]);
    setContent("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Post comment failed");

      // thay optimistic bằng record thực
      setItems((prev) => {
        const idx = prev.findIndex((x) => x.id === tmpId);
        if (idx === -1) return prev;
        const cloned = [...prev];
        cloned[idx] = data.item as CommentItem;
        return cloned;
      });
    } catch (e: any) {
      // rollback optimistic
      setItems((prev) => prev.filter((x) => x.id !== tmpId));
      setError(e.message || "Không thể gửi bình luận");
      setContent(payload.content); // trả lại nội dung
    } finally {
      setPosting(false);
    }
  };

  // --- Delete comment (optimistic + confirm) ---
  const onDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá bình luận này?")) return;

    const snapshot = items;
    setItems((prev) => prev.filter((x) => x.id !== id));

    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Delete failed");
      }
    } catch (e: any) {
      setError(e.message || "Không thể xoá");
      setItems(snapshot); // rollback
    }
  };

  const canDelete = (c: CommentItem) =>
    !!currentUserId && (c.user_id === currentUserId || !!isAdmin);

  // --- UI ---
  return (
    <div className="rounded-2xl border bg-white p-0 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700 text-sm">💬</span>
          Bình luận
          <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {items.length}
          </span>
        </h3>

        {!currentUserId && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5z"/></svg>
            Cần đăng nhập
          </span>
        )}
      </div>

      {/* Form */}
      <div className="px-5 pt-5 pb-4">
        <div className="rounded-xl border bg-white overflow-hidden focus-within:ring-2 focus-within:ring-violet-500">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onPost();
            }}
            placeholder={currentUserId ? "Viết bình luận của bạn..." : "Đăng nhập để bình luận…"}
            className="w-full px-4 py-3 text-sm outline-none resize-y min-h-[84px]"
            rows={3}
            maxLength={MAX}
          />
          <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-50">
            <div className="text-[11px] text-gray-500">
              Nhấn <span className="font-semibold">Ctrl/⌘ + Enter</span> để gửi
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-[11px] ${
                  left < 0 ? "text-rose-600" : left < 50 ? "text-amber-600" : "text-gray-500"
                }`}
              >
                {Math.max(0, left)} / {MAX}
              </span>
              <button
                onClick={onPost}
                disabled={!canPost || posting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                    </svg>
                    Đang gửi…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
                    Gửi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}
      </div>

      {/* Danh sách */}
      <div ref={listRef} className="px-5 pb-5 space-y-3">
        {/* Skeleton khi load lần đầu */}
        {firstLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 rounded-xl border p-3 bg-white animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-40 bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-2/3 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!firstLoading && items.length === 0 && !loading && (
          <div className="text-center py-10">
            <div className="text-5xl mb-2">🥘</div>
            <p className="text-sm text-gray-500">Hãy là người bình luận đầu tiên!</p>
          </div>
        )}

        {items.map((c) => (
          <div
            key={c.id}
            className="group flex gap-3 rounded-xl border p-3 hover:bg-gray-50 transition"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden ring-1 ring-gray-200">
              {c.user?.avatar_url ? (
                <Image
                  src={c.user.avatar_url}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-cover"
                />
              ) : (
                <div className="h-10 w-10 flex items-center justify-center text-gray-500 text-sm">
                  🙂
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {c.user?.full_name || "Ẩn danh"}
                  </div>
                  <div className="text-[11px] text-gray-500">{fmt(c.created_at)}</div>
                </div>

                {canDelete(c) && (
                  <button
                    onClick={() => onDelete(c.id)}
                    className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
                    title="Xoá bình luận"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 7h2v8h-2v-8zm4 0h2v8h-2v-8zM6 10h2v8H6v-8z" />
                    </svg>
                    Xoá
                  </button>
                )}
              </div>

              <p className="mt-2 text-[15px] leading-relaxed text-gray-800 whitespace-pre-line break-words">
                {c.content}
              </p>
            </div>
          </div>
        ))}

        {/* Load more */}
        <div className="mt-3 flex justify-center">
          {hasMore ? (
            <button
              onClick={() => fetchComments(false)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8" />
                  </svg>
                  Đang tải...
                </>
              ) : (
                <>
                  Tải thêm
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                </>
              )}
            </button>
          ) : (
            !firstLoading &&
            items.length > 0 && (
              <p className="text-xs text-gray-400">Đã hết bình luận</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
