import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import { createDish as _createDish, deleteDish } from "./actions";
import AddDishButton from "./AddDishButton";

export const dynamic = "force-dynamic";

type Category = { id: string; name: string };

type DishListItem = {
  id: string;
  title: string;
  cover_image_url: string | null;
  published: boolean;
  created_at: string | null;
};

// ---------- Helpers (server-safe) ----------
function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h >>> 0;
}
function fakeRatingFromId(id: string) {
  const steps = [3.5, 4, 4.5, 5];
  return steps[hashStr(id) % steps.length];
}
function formatVN(dt?: string | null) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating ${rating.toFixed(1)} / 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const isFull = i < full;
        const isHalf = i === full && half;
        return (
          <span key={i} className="relative inline-block h-4 w-4">
            <svg
              viewBox="0 0 24 24"
              className="absolute inset-0 text-gray-300"
              fill="currentColor"
            >
              <path d="m12 17.27-6.18 3.73 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.73 1.64 7.03z" />
            </svg>
            {(isFull || isHalf) && (
              <svg
                viewBox="0 0 24 24"
                className="absolute inset-0 text-amber-400"
                style={isHalf ? { clipPath: "inset(0 50% 0 0)" } : undefined}
                fill="currentColor"
              >
                <path d="m12 17.27-6.18 3.73 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.73 1.64 7.03z" />
              </svg>
            )}
          </span>
        );
      })}
      <span className="ml-1 text-xs font-semibold text-gray-700">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default async function DishesManagerPage() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: catData } = await sb
    .from("categories")
    .select("id,name")
    .order("name", { ascending: true });
  const categories: Category[] = (catData ?? []) as Category[];

  const { data: dishData } = await sb
    .from("dishes")
    .select("id,title,cover_image_url,published,created_at")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });
  const dishes: DishListItem[] = (dishData ?? []) as DishListItem[];

  const createDishVoid = async (formData: FormData): Promise<void> => {
    "use server";
    await _createDish(formData);
  };

  const publishedCount = dishes.filter((d) => d.published).length;
  const draftCount = dishes.length - publishedCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header with glass effect */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/30">
                🍳
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Quản lý món của tôi
                </h1>
                <p className="text-sm text-gray-600">
                  Đăng món mới và quản lý danh sách món đã đăng
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/posts/manager"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 4v6h6M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
                Làm mới
              </Link>
              <AddDishButton categories={categories} action={createDishVoid} />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Stats cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
          {[
            {
              label: "Tổng món",
              value: dishes.length,
              icon: "🍽️",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              label: "Đã xuất bản",
              value: publishedCount,
              icon: "✅",
              gradient: "from-emerald-500 to-teal-500",
            },
            {
              label: "Nháp",
              value: draftCount,
              icon: "📝",
              gradient: "from-amber-500 to-orange-500",
            },
          ].map((stat, i) => (
            <div key={i} className="relative group">
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition blur-xl`}
              />
              <div className="relative rounded-2xl bg-white border p-6 hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl">{stat.icon}</div>
                  <div
                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} opacity-10`}
                  />
                </div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {stat.label}
                </div>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grid cards */}
        {dishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes.map((d) => {
              const rating = fakeRatingFromId(d.id);
              return (
                <article
                  key={d.id}
                  className="relative overflow-hidden rounded-3xl border bg-white shadow-sm hover:shadow-xl transition group"
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 opacity-0 group-hover:opacity-100 blur-2xl transition" />

                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {d.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.cover_image_url}
                        alt={d.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-6xl opacity-20">🍽️</span>
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute left-3 top-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg ${
                          d.published
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                            : "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                        }`}
                      >
                        {d.published ? "✓ Public" : "📝 Draft"}
                      </span>
                    </div>

                    {/* Rating badge */}
                    <div className="absolute right-3 bottom-3">
                      <div className="rounded-xl bg-white/95 backdrop-blur-sm px-3 py-2 shadow-lg border border-white/20">
                        <RatingStars rating={rating} />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-2 text-lg mb-2">
                        {d.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <span>{formatVN(d.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/posts/manager/${d.id}/edit`}
                        className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-bold text-white text-center hover:shadow-lg hover:shadow-indigo-500/30 transition"
                      >
                        ✏️ Sửa
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteDish(d.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2.5 text-sm font-bold text-white hover:shadow-lg hover:shadow-rose-500/30 transition"
                        >
                          🗑️ Xoá
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-4xl">
              🍽️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Bạn chưa đăng món nào
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Hãy bắt đầu bằng cách thêm món đầu tiên của bạn!
            </p>
            <AddDishButton categories={categories} action={createDishVoid} />
          </div>
        )}
      </div>
    </div>
  );
}
