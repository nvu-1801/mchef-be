"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  dishId: string;
  currentUserId: string | null | undefined;
  ratingAvg: number;
  ratingCount: number;
};

type RatingItem = {
<<<<<<< HEAD
  id: string;
  dish_id: string;
  user_id: string;
  stars: number;
  comment: string | null;
  created_at: string;
};

type RatingsResponse = {
  items: RatingItem[];
  nextCursor?: string | null;
  nextCursorId?: string | null;
  hasMore?: boolean;
};

type ErrorResponse = {
  error: string;
=======
  user_id: string;
  stars: number;
>>>>>>> 3057f1c6c06ccbc727f902bb54446fc1c00e25b5
};

export default function RatingCard({
  dishId,
  currentUserId,
  ratingAvg,
  ratingCount,
}: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverStars, setHoverStars] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);

  // Load user's existing rating (lọc từ list)
  useEffect(() => {
    if (!currentUserId) return;

    const loadUserRating = async () => {
      try {
        const res = await fetch(`/api/ratings?dishId=${dishId}`);
        if (!res.ok) return;
<<<<<<< HEAD
        const json: RatingsResponse = await res.json();
        const items = Array.isArray(json?.items) ? json.items : [];
        const mine = items.find((r) => r.user_id === currentUserId);
=======
        const json = await res.json();
        const items = Array.isArray(json?.items) ? json.items as RatingItem[] : [];
        const mine = items.find((r: RatingItem) => r.user_id === currentUserId);
>>>>>>> 3057f1c6c06ccbc727f902bb54446fc1c00e25b5
        setUserRating(mine?.stars ?? null);
      } catch (err) {
        console.error("Error loading user rating:", err);
      }
    };

    loadUserRating();
  }, [dishId, currentUserId]);

  const handleRating = async (stars: number) => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // ✅ Route của bạn upsert bằng POST và cần body.dishId (camelCase)
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dishId,           // ⬅️ phải là dishId, không phải dish_id
          stars,            // 1..5
          // comment: "..."  // nếu có UI nhập comment, thêm vào đây
        }),
      });

      if (!res.ok) {
        const j: ErrorResponse = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(j?.error || "Failed to submit rating");
      }

      setUserRating(stars);
      router.refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error submitting rating";
      console.error("Error submitting rating:", errorMsg);
      // TODO: toast lỗi nếu bạn dùng sonner/other
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm">
      <div className="text-center">
        <div className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
          {ratingAvg > 0 ? ratingAvg.toFixed(1) : "—"}
        </div>

        <div className="flex items-center justify-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => {
            const starIndex = i + 1;
            const active =
              starIndex <= (hoverStars || userRating || Math.round(ratingAvg));
            return (
              <button
                key={i}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleRating(starIndex)}
                onMouseEnter={() => setHoverStars(starIndex)}
                onMouseLeave={() => setHoverStars(0)}
                className={`w-8 h-8 rounded-lg hover:bg-amber-50 transition ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label={`Đánh giá ${starIndex} sao`}
              >
                <svg
                  className={`w-6 h-6 mx-auto ${
                    active ? "text-amber-400" : "text-gray-300"
                  }`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            );
          })}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          {ratingCount} {ratingCount === 1 ? "đánh giá" : "đánh giá"}
        </div>

        {!currentUserId && (
          <button
            onClick={() => router.push("/login")}
            className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-xl transition"
          >
            🔒 Đăng nhập để đánh giá
          </button>
        )}

        {userRating && (
          <p className="text-sm text-gray-600 mt-2">
            Bạn đã đánh giá: {userRating} sao
          </p>
        )}
      </div>
    </div>
  );
}

// "use client";
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// type Props = {
//   dishId: string;
//   currentUserId: string | null | undefined;
//   ratingAvg: number;
//   ratingCount: number;
// };

// export default function RatingCard({
//   dishId,
//   currentUserId,
//   ratingAvg,
//   ratingCount,
// }: Props) {
//   const router = useRouter();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [hoverStars, setHoverStars] = useState(0);
//   const [userRating, setUserRating] = useState<number | null>(null);

//   // Load user's existing rating (lọc từ list)
//   useEffect(() => {
//     if (!currentUserId) return;

//     const loadUserRating = async () => {
//       try {
//         const res = await fetch(`/api/ratings?dishId=${dishId}`);
//         if (!res.ok) return;
//         const json = await res.json();
//         const items = Array.isArray(json?.items) ? json.items : [];
//         const mine = items.find((r: any) => r.user_id === currentUserId);
//         setUserRating(mine?.stars ?? null);
//       } catch (err) {
//         console.error("Error loading user rating:", err);
//       }
//     };

//     loadUserRating();
//   }, [dishId, currentUserId]);

//   const handleRating = async (stars: number) => {
//     if (!currentUserId) {
//       router.push("/login");
//       return;
//     }
//     if (isSubmitting) return;

//     try {
//       setIsSubmitting(true);

//       // ✅ Route của bạn upsert bằng POST và cần body.dishId (camelCase)
//       const res = await fetch("/api/ratings", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           dishId,           // ⬅️ phải là dishId, không phải dish_id
//           stars,            // 1..5
//           // comment: "..."  // nếu có UI nhập comment, thêm vào đây
//         }),
//       });

//       if (!res.ok) {
//         const j = await res.json().catch(() => ({}));
//         throw new Error(j?.error || "Failed to submit rating");
//       }

//       setUserRating(stars);
//       router.refresh();
//     } catch (err) {
//       console.error("Error submitting rating:", err);
//       // TODO: toast lỗi nếu bạn dùng sonner/other
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm">
//       <div className="text-center">
//         <div className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
//           {ratingAvg > 0 ? ratingAvg.toFixed(1) : "—"}
//         </div>

//         <div className="flex items-center justify-center gap-1 mb-2">
//           {Array.from({ length: 5 }).map((_, i) => {
//             const starIndex = i + 1;
//             const active =
//               starIndex <= (hoverStars || userRating || Math.round(ratingAvg));
//             return (
//               <button
//                 key={i}
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={() => handleRating(starIndex)}
//                 onMouseEnter={() => setHoverStars(starIndex)}
//                 onMouseLeave={() => setHoverStars(0)}
//                 className={`w-8 h-8 rounded-lg hover:bg-amber-50 transition ${
//                   isSubmitting ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//                 aria-label={`Đánh giá ${starIndex} sao`}
//               >
//                 <svg
//                   className={`w-6 h-6 mx-auto ${
//                     active ? "text-amber-400" : "text-gray-300"
//                   }`}
//                   viewBox="0 0 24 24"
//                   fill="currentColor"
//                 >
//                   <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
//                 </svg>
//               </button>
//             );
//           })}
//         </div>

//         <div className="text-sm text-gray-500 mb-4">
//           {ratingCount} {ratingCount === 1 ? "đánh giá" : "đánh giá"}
//         </div>

//         {!currentUserId && (
//           <button
//             onClick={() => router.push("/login")}
//             className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-xl transition"
//           >
//             🔒 Đăng nhập để đánh giá
//           </button>
//         )}

//         {userRating && (
//           <p className="text-sm text-gray-600 mt-2">
//             Bạn đã đánh giá: {userRating} sao
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
