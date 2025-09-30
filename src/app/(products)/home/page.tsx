import Link from "next/link";
import {
  listDishes,
  dishImageUrl,
  listCategories,
} from "@/modules/dishes/service/dish.service";

export const revalidate = 60;

type Search = { q?: string; cat?: string };

// ===== Helpers (server-safe, không cần "use client") =====
function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h >>> 0;
}
function fakeRatingFromId(id: string) {
  const steps = [3.5, 4, 4.5, 5]; // đủ “đẹp”
  return steps[hashStr(id) % steps.length];
}
function gradientFromId(id: string) {
  const palettes = [
    "from-pink-500 via-fuchsia-500 to-indigo-500",
    "from-amber-400 via-orange-500 to-rose-500",
    "from-emerald-400 via-teal-500 to-sky-500",
    "from-violet-500 via-purple-500 to-blue-500",
    "from-cyan-400 via-blue-500 to-indigo-600",
  ];
  return palettes[hashStr(id) % palettes.length];
}
function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${rating.toFixed(1)} / 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const isFull = i < full;
        const isHalf = i === full && half;
        return (
          <span key={i} className="relative inline-block h-4 w-4">
            {/* outline */}
            <svg viewBox="0 0 24 24" className="absolute inset-0" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="m12 17.27-6.18 3.73 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.73 1.64 7.03z" />
            </svg>
            {/* fill */}
            <svg
              viewBox="0 0 24 24"
              className="absolute inset-0"
              style={isHalf ? { clipPath: "inset(0 50% 0 0)" } : undefined}
              fill="currentColor"
            >
              {(isFull || isHalf) && (
                <path d="m12 17.27-6.18 3.73 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.73 1.64 7.03z" />
              )}
            </svg>
          </span>
        );
      })}
      <span className="ml-1 text-xs font-medium text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  // Next 15: searchParams là Promise
  searchParams: Promise<Search>;
}) {
  const { q = "", cat = "all" } = await searchParams;

  const cats = await listCategories();
  const dishes = await listDishes({ q, cat });

  const Tab = (label: string, key: string) => {
    const isActive = (cat || "all") === key;
    const query: Record<string, string> = {};
    if (q) query.q = q;
    if (key !== "all") query.cat = key;

    return (
      <Link
        key={key}
        href={{ pathname: "/home", query }}
        className={`px-3 py-1.5 rounded-full text-sm border transition whitespace-nowrap
          ${isActive ? "bg-black text-white border-black" : "bg-white text-gray-700 hover:bg-gray-50"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Món ăn</h1>
      </div>

      {/* Tabs filter: sticky ngay dưới header */}
      <div className="sticky top-27 z-30 -mx-4 px-4 py-4 mb-6 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b">
        <div className="flex items-center gap-2 overflow-x-auto">
          {Tab("Tất cả", "all")}
          {cats.map((c: any) => Tab(c.name, c.slug))}
        </div>
      </div>

      {/* Grid cards */}
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {dishes.map((d: any) => {
          const rating = fakeRatingFromId(d.id ?? d.slug ?? d.title);
          const gradient = gradientFromId(d.id ?? d.slug ?? d.title);
          const img = dishImageUrl(d) ?? "/placeholder.png";
          return (
            <li key={d.id} className="group">
              <Link href={`/home/${d.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden rounded-2xl border">
                  <img
                    src={img}
                    alt={d.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* viền sáng + overlay gradient để card bắt mắt */}
                  <div
                    className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity bg-gradient-to-tr ${gradient} mix-blend-multiply`}
                  />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-black/5 rounded-2xl" />
                  {/* chip thời gian/phần ăn */}
                  <div className="absolute left-2 top-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium shadow-sm">
                      ⏱ {d.time_minutes ? `${d.time_minutes} phút` : "—"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium shadow-sm">
                      🍽 {d.servings ? `${d.servings} phần` : "—"}
                    </span>
                  </div>
                  {/* rating badge */}
                  <div className="absolute right-2 bottom-2">
                    <div className="rounded-xl bg-white/95 px-2.5 py-1 shadow-md">
                      <RatingStars rating={rating} />
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="font-semibold line-clamp-1 text-gray-900 group-hover:text-gray-700 transition-colors">
                    {d.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    {d.category_name ? d.category_name : ""}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
