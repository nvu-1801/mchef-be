"use client";

import { useEffect, useMemo, useState } from "react";
import useWishlist from "@/hooks/useWishlist";
import type { Dish } from "@/modules/dishes/dish-public";
import { resolveImageUrl } from "@/modules/dishes/dish-public";
import { supabaseBrowser } from "@/libs/supabase/supabase-client"; 

type Props = {
  tableName?: string; 
};

export default function WishlistView({ tableName = "dishes" }: Props) {
  const { wishlist, remove, clear } = useWishlist();
  const [items, setItems] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const hasItems = wishlist.length > 0;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!hasItems) {
        setItems([]);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const sb = supabaseBrowser();

        // ⚠️ Chỉnh select cho phù hợp view/bảng của bạn nếu cần.
        // Để an toàn, mình dùng select("*") + .in('id', wishlist).
        const { data, error } = await sb
          .from(tableName)
          .select("*")
          .in("id", wishlist);

        if (error) throw error;
        if (!cancelled) {
          // Ép kiểu thô theo Dish
          const mapped = (data ?? []) as Dish[];
          // Giữ nguyên thứ tự theo wishlist (id đã lưu)
          const orderMap = new Map(wishlist.map((id, idx) => [id, idx]));
          mapped.sort(
            (a, b) =>
              (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
          );
          setItems(mapped);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          if (error instanceof Error) {
            setErr(error.message ?? "Load wishlist failed");
          } else {
            setErr("Load wishlist failed");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [wishlist, tableName, hasItems]);

  const EmptyState = useMemo(
    () => (
      <div className="rounded-2xl border border-dashed p-8 text-center bg-gray-50">
        <div className="text-5xl mb-3">🫶</div>
        <h3 className="font-semibold text-gray-800">Chưa có món yêu thích</h3>
        <p className="text-gray-500 text-sm">
          Hãy bấm vào nút trái tim ♥ trên món ăn để lưu vào wishlist.
        </p>
      </div>
    ),
    []
  );

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Wishlist của bạn</h2>
        {hasItems && (
          <button
            onClick={clear}
            className="text-sm rounded-lg px-3 py-1.5 border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition"
          >
            Xoá tất cả
          </button>
        )}
      </header>

      {err && (
        <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-sm">
          {err}
        </div>
      )}

      {loading ? (
        <GridSkeleton count={6} />
      ) : !hasItems ? (
        EmptyState
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((d) => (
            <li key={d.id} className="group rounded-2xl border bg-white overflow-hidden hover:shadow-md transition">
              <div className="relative aspect-4/3 bg-gray-100">
                {/* Ảnh cover */}
                {resolveImageUrl(d.cover_image_url) ? (
                  // Nếu app dùng next/image, thay <img> bằng <Image> cho hợp dự án bạn
                  <img
                    src={resolveImageUrl(d.cover_image_url)!}
                    alt={d.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}

                {/* Badge premium */}
                {d?.premium?.active && (
                  <span className="absolute top-2 left-2 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1">
                    Premium • {d.premium?.required_plan}
                  </span>
                )}

                {/* Nút xoá */}
                <button
                  onClick={() => remove(d.id)}
                  className="absolute top-2 right-2 h-9 w-9 rounded-xl bg-white/90 border border-gray-200 hover:bg-rose-50 hover:border-rose-300 transition flex items-center justify-center"
                  aria-label="Bỏ khỏi wishlist"
                  title="Bỏ khỏi wishlist"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-rose-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold line-clamp-2">{d.title}</h3>
                  {/* Rating */}
                  <span className="shrink-0 inline-flex items-center gap-1 text-sm text-amber-600">
                    ⭐ {d.rating_avg ?? 0}
                    <span className="text-gray-400">({d.rating_count ?? 0})</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {d.diet && <span className="px-2 py-0.5 rounded-full bg-gray-100">{dietLabel(d.diet)}</span>}
                  {d.time_minutes != null && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100">⏱ {d.time_minutes}m</span>
                  )}
                  {d.servings != null && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100">🍽 {d.servings}</span>
                  )}
                  {d.difficulty && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100">🎚 {d.difficulty}</span>
                  )}
                </div>

                {d.category?.name && (
                  <div className="text-sm text-gray-600">
                    <span className="opacity-70">Danh mục:</span> {d.category.name}
                  </div>
                )}

                {d.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{d.description}</p>
                )}

                <div className="pt-1 flex items-center justify-between">
                  <a
                    href={`/home/${d.slug ?? d.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Xem chi tiết →
                  </a>
                  {d.calories != null && (
                    <span className="text-xs text-gray-500">{d.calories} kcal</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function dietLabel(diet?: string | null) {
  if (!diet) return "Diet";
  if (diet === "veg") return "Vegetarian";
  if (diet === "vegan") return "Vegan";
  if (diet === "nonveg") return "Non-Veg";
  return diet;
}

function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="rounded-2xl border bg-white overflow-hidden animate-pulse">
          <div className="aspect-4/3 bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import useWishlist from "@/hooks/useWishlist";
// import type { Dish } from "@/modules/dishes/dish-public";
// import { resolveImageUrl } from "@/modules/dishes/dish-public";
// import { supabaseBrowser } from "@/libs/supabase/supabase-client"; 

// type Props = {
//   tableName?: string; 
// };

// export default function WishlistView({ tableName = "dishes" }: Props) {
//   const { wishlist, remove, clear } = useWishlist();
//   const [items, setItems] = useState<Dish[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState<string | null>(null);

//   const hasItems = wishlist.length > 0;

//   useEffect(() => {
//     let cancelled = false;

//     async function load() {
//       if (!hasItems) {
//         setItems([]);
//         return;
//       }
//       setLoading(true);
//       setErr(null);
//       try {
//         const sb = supabaseBrowser();

//         // ⚠️ Chỉnh select cho phù hợp view/bảng của bạn nếu cần.
//         // Để an toàn, mình dùng select("*") + .in('id', wishlist).
//         const { data, error } = await sb
//           .from(tableName)
//           .select("*")
//           .in("id", wishlist);

//         if (error) throw error;
//         if (!cancelled) {
//           // Ép kiểu thô theo Dish
//           const mapped = (data ?? []) as Dish[];
//           // Giữ nguyên thứ tự theo wishlist (id đã lưu)
//           const orderMap = new Map(wishlist.map((id, idx) => [id, idx]));
//           mapped.sort(
//             (a, b) =>
//               (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
//           );
//           setItems(mapped);
//         }
//       } catch (e: any) {
//         if (!cancelled) setErr(e?.message ?? "Load wishlist failed");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, [wishlist, tableName, hasItems]);

//   const EmptyState = useMemo(
//     () => (
//       <div className="rounded-2xl border border-dashed p-8 text-center bg-gray-50">
//         <div className="text-5xl mb-3">🫶</div>
//         <h3 className="font-semibold text-gray-800">Chưa có món yêu thích</h3>
//         <p className="text-gray-500 text-sm">
//           Hãy bấm vào nút trái tim ♥ trên món ăn để lưu vào wishlist.
//         </p>
//       </div>
//     ),
//     []
//   );

//   return (
//     <section className="space-y-4">
//       <header className="flex items-center justify-between">
//         <h2 className="text-xl font-bold">Wishlist của bạn</h2>
//         {hasItems && (
//           <button
//             onClick={clear}
//             className="text-sm rounded-lg px-3 py-1.5 border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition"
//           >
//             Xoá tất cả
//           </button>
//         )}
//       </header>

//       {err && (
//         <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-sm">
//           {err}
//         </div>
//       )}

//       {loading ? (
//         <GridSkeleton count={6} />
//       ) : !hasItems ? (
//         EmptyState
//       ) : (
//         <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {items.map((d) => (
//             <li key={d.id} className="group rounded-2xl border bg-white overflow-hidden hover:shadow-md transition">
//               <div className="relative aspect-4/3 bg-gray-100">
//                 {/* Ảnh cover */}
//                 {resolveImageUrl(d.cover_image_url) ? (
//                   // Nếu app dùng next/image, thay <img> bằng <Image> cho hợp dự án bạn
//                   <img
//                     src={resolveImageUrl(d.cover_image_url)!}
//                     alt={d.title}
//                     className="w-full h-full object-cover"
//                     loading="lazy"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     No image
//                   </div>
//                 )}

//                 {/* Badge premium */}
//                 {d?.premium?.active && (
//                   <span className="absolute top-2 left-2 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1">
//                     Premium • {d.premium?.required_plan}
//                   </span>
//                 )}

//                 {/* Nút xoá */}
//                 <button
//                   onClick={() => remove(d.id)}
//                   className="absolute top-2 right-2 h-9 w-9 rounded-xl bg-white/90 border border-gray-200 hover:bg-rose-50 hover:border-rose-300 transition flex items-center justify-center"
//                   aria-label="Bỏ khỏi wishlist"
//                   title="Bỏ khỏi wishlist"
//                 >
//                   <svg
//                     className="w-5 h-5 text-gray-600 group-hover:text-rose-600"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
//                   </svg>
//                 </button>
//               </div>

//               <div className="p-4 space-y-2">
//                 <div className="flex items-start justify-between gap-3">
//                   <h3 className="font-semibold line-clamp-2">{d.title}</h3>
//                   {/* Rating */}
//                   <span className="shrink-0 inline-flex items-center gap-1 text-sm text-amber-600">
//                     ⭐ {d.rating_avg ?? 0}
//                     <span className="text-gray-400">({d.rating_count ?? 0})</span>
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-2 text-xs text-gray-500">
//                   {d.diet && <span className="px-2 py-0.5 rounded-full bg-gray-100">{dietLabel(d.diet)}</span>}
//                   {d.time_minutes != null && (
//                     <span className="px-2 py-0.5 rounded-full bg-gray-100">⏱ {d.time_minutes}m</span>
//                   )}
//                   {d.servings != null && (
//                     <span className="px-2 py-0.5 rounded-full bg-gray-100">🍽 {d.servings}</span>
//                   )}
//                   {d.difficulty && (
//                     <span className="px-2 py-0.5 rounded-full bg-gray-100">🎚 {d.difficulty}</span>
//                   )}
//                 </div>

//                 {d.category?.name && (
//                   <div className="text-sm text-gray-600">
//                     <span className="opacity-70">Danh mục:</span> {d.category.name}
//                   </div>
//                 )}

//                 {d.description && (
//                   <p className="text-sm text-gray-600 line-clamp-2">{d.description}</p>
//                 )}

//                 <div className="pt-1 flex items-center justify-between">
//                   <a
//                     href={`/home/${d.slug ?? d.id}`}
//                     className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
//                   >
//                     Xem chi tiết →
//                   </a>
//                   {d.calories != null && (
//                     <span className="text-xs text-gray-500">{d.calories} kcal</span>
//                   )}
//                 </div>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </section>
//   );
// }

// function dietLabel(diet?: string | null) {
//   if (!diet) return "Diet";
//   if (diet === "veg") return "Vegetarian";
//   if (diet === "vegan") return "Vegan";
//   if (diet === "nonveg") return "Non-Veg";
//   return diet;
// }

// function GridSkeleton({ count = 6 }: { count?: number }) {
//   return (
//     <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//       {Array.from({ length: count }).map((_, i) => (
//         <li key={i} className="rounded-2xl border bg-white overflow-hidden animate-pulse">
//           <div className="aspect-4/3 bg-gray-200" />
//           <div className="p-4 space-y-2">
//             <div className="h-4 bg-gray-200 rounded w-3/4" />
//             <div className="h-3 bg-gray-200 rounded w-1/2" />
//             <div className="h-3 bg-gray-200 rounded w-full" />
//           </div>
//         </li>
//       ))}
//     </ul>
//   );
// }
