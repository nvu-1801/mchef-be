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
  // Nếu bạn đã có thông tin user hiện tại, có thể truyền vào để ẩn/hiện nút xoá ngay trên client
  currentUserId?: string | null;
  isAdmin?: boolean; // tuỳ chọn
};

export default function Comments({ dishId, currentUserId, isAdmin }: Props) {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorId, setCursorId] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  const canPost = useMemo(() => content.trim().length > 0, [content]);

  const fetchComments = async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ dishId, limit: "10" });
      if (!reset && cursor) params.set("cursor", cursor);
      if (!reset && cursorId) params.set("cursorId", cursorId);

      const res = await fetch(`/api/comments?${params.toString()}`, {
        method: "GET",
      });
      const data: FetchRes & { error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Load comments failed");
      }

      if (reset) {
        setItems(data.items);
      } else {
        setItems((prev) => [...prev, ...data.items]);
      }

      setHasMore(data.hasMore);
      setCursor(data.nextCursor);
      setCursorId(data.nextCursorId);
    } catch (e) {
      const error = e instanceof Error ? e : new Error("Something went wrong");
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load lần đầu
    setItems([]);
    setCursor(null);
    setCursorId(null);
    fetchComments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishId]);

  const onPost = async () => {
    if (!canPost || posting) return;
    setPosting(true);
    setError(null);

    const payload = {
      dishId,
      content: content.trim(),
    };

    // Optimistic
    const tmpId = `tmp-${Date.now()}`;
    const optimistic: CommentItem = {
      id: tmpId,
      content: payload.content,
      created_at: new Date().toISOString(),
      user_id: currentUserId || "me",
      user: currentUserId
        ? {
            id: currentUserId,
            full_name: "Bạn",
            avatar_url: null,
          }
        : null,
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
      if (!res.ok) {
        throw new Error(data?.error || "Post comment failed");
      }

      // Thay optimistic bằng item thực
      setItems((prev) => {
        const idx = prev.findIndex((x) => x.id === tmpId);
        if (idx === -1) return prev;
        const cloned = [...prev];
        cloned[idx] = data.item;
        return cloned;
      });
    } catch (e) {
      const error = e instanceof Error ? e : new Error("Không thể gửi bình luận");
      // Rollback optimistic
      setItems((prev) => prev.filter((x) => x.id !== tmpId));
      setError(error.message);
      setContent(payload.content); // trả lại nội dung
    } finally {
      setPosting(false);
    }
  };

  const onDelete = async (id: string) => {
    // Xoá optimistic
    const snapshot = items;
    setItems((prev) => prev.filter((x) => x.id !== id));

    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Delete failed");
      }
    } catch (e) {
      const error = e instanceof Error ? e : new Error("Không thể xoá");
      setError(error.message);
      setItems(snapshot); // rollback
    }
  };

  const canDelete = (c: CommentItem) =>
    !!currentUserId && (c.user_id === currentUserId || isAdmin);

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Bình luận</h3>

      {/* Form */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết bình luận của bạn..."
          className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          rows={3}
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {content.trim().length}/5000 ký tự
          </p>
          <button
            onClick={onPost}
            disabled={!canPost || posting}
            className="rounded-lg bg-violet-600 px-4 py-2 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            {posting ? "Đang gửi..." : "Gửi bình luận"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Danh sách */}
      <div ref={listRef} className="space-y-4">
        {items.length === 0 && !loading && (
          <p className="text-sm text-gray-500">Hãy là người bình luận đầu tiên!</p>
        )}

        {items.map((c) => (
          <div
            key={c.id}
            className="flex gap-3 rounded-xl border p-3 hover:bg-gray-50 transition"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
              {c.user?.avatar_url ? (
                <Image
                  src={c.user.avatar_url}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-cover"
                />
              ) : (
                <div className="h-10 w-10 flex items-center justify-center text-gray-500">
                  🙂
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">
                  {c.user?.full_name || "Ẩn danh"}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(c.created_at).toLocaleString()}
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-700 whitespace-pre-line break-words">
                {c.content}
              </p>
              {canDelete(c) && (
                <div className="mt-2">
                  <button
                    onClick={() => onDelete(c.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Xoá
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      <div className="mt-4 flex justify-center">
        {hasMore ? (
          <button
            onClick={() => fetchComments(false)}
            disabled={loading}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Đang tải..." : "Tải thêm"}
          </button>
        ) : (
          items.length > 0 && (
            <p className="text-xs text-gray-400">Đã hết bình luận</p>
          )
        )}
      </div>
    </div>
  );
}

// // components/dish/Comments.tsx
// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Image from "next/image";

// type CommentUser = {
//   id: string;
//   full_name: string | null;
//   avatar_url: string | null;
// };

// type CommentItem = {
//   id: string;
//   content: string;
//   created_at: string;
//   user_id: string;
//   user: CommentUser | null;
// };

// type FetchRes = {
//   items: CommentItem[];
//   nextCursor: string | null;
//   nextCursorId: string | null;
//   hasMore: boolean;
// };

// type Props = {
//   dishId: string;
//   // Nếu bạn đã có thông tin user hiện tại, có thể truyền vào để ẩn/hiện nút xoá ngay trên client
//   currentUserId?: string | null;
//   isAdmin?: boolean; // tuỳ chọn
// };

// export default function Comments({ dishId, currentUserId, isAdmin }: Props) {
//   const [items, setItems] = useState<CommentItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [posting, setPosting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [content, setContent] = useState("");
//   const [hasMore, setHasMore] = useState(false);
//   const [cursor, setCursor] = useState<string | null>(null);
//   const [cursorId, setCursorId] = useState<string | null>(null);

//   const listRef = useRef<HTMLDivElement>(null);

//   const canPost = useMemo(() => content.trim().length > 0, [content]);

//   const fetchComments = async (reset = false) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const params = new URLSearchParams({ dishId, limit: "10" });
//       if (!reset && cursor) params.set("cursor", cursor);
//       if (!reset && cursorId) params.set("cursorId", cursorId);

//       const res = await fetch(`/api/comments?${params.toString()}`, {
//         method: "GET",
//       });
//       const data: FetchRes = await res.json();

//       if (!res.ok) {
//         throw new Error((data as any)?.error || "Load comments failed");
//       }

//       if (reset) {
//         setItems(data.items);
//       } else {
//         setItems((prev) => [...prev, ...data.items]);
//       }

//       setHasMore(data.hasMore);
//       setCursor(data.nextCursor);
//       setCursorId(data.nextCursorId);
//     } catch (e: any) {
//       setError(e.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // load lần đầu
//     setItems([]);
//     setCursor(null);
//     setCursorId(null);
//     fetchComments(true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [dishId]);

//   const onPost = async () => {
//     if (!canPost || posting) return;
//     setPosting(true);
//     setError(null);

//     const payload = {
//       dishId,
//       content: content.trim(),
//     };

//     // Optimistic
//     const tmpId = `tmp-${Date.now()}`;
//     const optimistic: CommentItem = {
//       id: tmpId,
//       content: payload.content,
//       created_at: new Date().toISOString(),
//       user_id: currentUserId || "me",
//       user: currentUserId
//         ? {
//             id: currentUserId,
//             full_name: "Bạn",
//             avatar_url: null,
//           }
//         : null,
//     };
//     setItems((prev) => [optimistic, ...prev]);
//     setContent("");

//     try {
//       const res = await fetch("/api/comments", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data?.error || "Post comment failed");
//       }

//       // Thay optimistic bằng item thực
//       setItems((prev) => {
//         const idx = prev.findIndex((x) => x.id === tmpId);
//         if (idx === -1) return prev;
//         const cloned = [...prev];
//         cloned[idx] = data.item;
//         return cloned;
//       });
//     } catch (e: any) {
//       // Rollback optimistic
//       setItems((prev) => prev.filter((x) => x.id !== tmpId));
//       setError(e.message || "Không thể gửi bình luận");
//       setContent(payload.content); // trả lại nội dung
//     } finally {
//       setPosting(false);
//     }
//   };

//   const onDelete = async (id: string) => {
//     // Xoá optimistic
//     const snapshot = items;
//     setItems((prev) => prev.filter((x) => x.id !== id));

//     try {
//       const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
//       if (!res.ok) {
//         const data = await res.json().catch(() => null);
//         throw new Error(data?.error || "Delete failed");
//       }
//     } catch (e: any) {
//       setError(e.message || "Không thể xoá");
//       setItems(snapshot); // rollback
//     }
//   };

//   const canDelete = (c: CommentItem) =>
//     !!currentUserId && (c.user_id === currentUserId || isAdmin);

//   return (
//     <div className="rounded-2xl border bg-white p-6 shadow-sm">
//       <h3 className="text-lg font-bold text-gray-900 mb-4">Bình luận</h3>

//       {/* Form */}
//       <div className="mb-4">
//         <textarea
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           placeholder="Viết bình luận của bạn..."
//           className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
//           rows={3}
//         />
//         <div className="mt-2 flex items-center justify-between">
//           <p className="text-xs text-gray-500">
//             {content.trim().length}/5000 ký tự
//           </p>
//           <button
//             onClick={onPost}
//             disabled={!canPost || posting}
//             className="rounded-lg bg-violet-600 px-4 py-2 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
//           >
//             {posting ? "Đang gửi..." : "Gửi bình luận"}
//           </button>
//         </div>
//       </div>

//       {error && (
//         <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       {/* Danh sách */}
//       <div ref={listRef} className="space-y-4">
//         {items.length === 0 && !loading && (
//           <p className="text-sm text-gray-500">Hãy là người bình luận đầu tiên!</p>
//         )}

//         {items.map((c) => (
//           <div
//             key={c.id}
//             className="flex gap-3 rounded-xl border p-3 hover:bg-gray-50 transition"
//           >
//             <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
//               {c.user?.avatar_url ? (
//                 <Image
//                   src={c.user.avatar_url}
//                   alt="avatar"
//                   width={40}
//                   height={40}
//                   className="h-10 w-10 object-cover"
//                 />
//               ) : (
//                 <div className="h-10 w-10 flex items-center justify-center text-gray-500">
//                   🙂
//                 </div>
//               )}
//             </div>
//             <div className="min-w-0 flex-1">
//               <div className="flex items-center justify-between">
//                 <div className="text-sm font-semibold text-gray-900">
//                   {c.user?.full_name || "Ẩn danh"}
//                 </div>
//                 <div className="text-xs text-gray-500">
//                   {new Date(c.created_at).toLocaleString()}
//                 </div>
//               </div>
//               <p className="mt-1 text-sm text-gray-700 whitespace-pre-line break-words">
//                 {c.content}
//               </p>
//               {canDelete(c) && (
//                 <div className="mt-2">
//                   <button
//                     onClick={() => onDelete(c.id)}
//                     className="text-xs text-red-600 hover:underline"
//                   >
//                     Xoá
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Load more */}
//       <div className="mt-4 flex justify-center">
//         {hasMore ? (
//           <button
//             onClick={() => fetchComments(false)}
//             disabled={loading}
//             className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
//           >
//             {loading ? "Đang tải..." : "Tải thêm"}
//           </button>
//         ) : (
//           items.length > 0 && (
//             <p className="text-xs text-gray-400">Đã hết bình luận</p>
//           )
//         )}
//       </div>
//     </div>
//   );
// }
