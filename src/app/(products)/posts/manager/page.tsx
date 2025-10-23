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
function formatVN(dt?: string | null) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString("vi-VN");
  } catch {
    return "—";
  }
}
function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold " +
        (published
          ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200"
          : "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200")
      }
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        {published ? (
          <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
        ) : (
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 5h-2v6l5 3 .999-1.732L13 12.535Z" />
        )}
      </svg>
      {published ? "Public" : "Draft"}
    </span>
  );
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
              className="absolute inset-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="m12 17.27-6.18 3.73 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.73 1.64 7.03z" />
            </svg>
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
      <span className="ml-1 text-xs font-medium text-gray-700">
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
    // không return gì → Promise<void>
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 text-gray-800">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Quản lý món của tôi
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Đăng món mới và quản lý danh sách món đã đăng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/posts/manager"
            className="text-sm px-3 py-1.5 rounded-full border shadow-sm hover:shadow bg-white hover:bg-gray-50"
          >
            Làm mới
          </Link>
          {/* Nút mở modal form */}
          <AddDishButton categories={categories} action={createDishVoid} />
        </div>
      </div>

      {/* Grid cards */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dishes.map((d) => {
          const rating = fakeRatingFromId(d.id);
          const gradient = gradientFromId(d.id);
          return (
            <li key={d.id} className="group">
              <div className="relative overflow-hidden rounded-2xl border bg-white">
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  {d.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.cover_image_url}
                      alt={d.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100" />
                  )}
                  <div
                    className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr ${gradient} mix-blend-multiply`}
                  />
                  {/* chips */}
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium shadow-sm">
                      {d.published ? "Public" : "Draft"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium shadow-sm">
                      {formatVN(d.created_at)}
                    </span>
                  </div>
                  {/* rating badge */}
                  <div className="absolute right-3 bottom-3">
                    <div className="rounded-xl bg-white/95 px-2.5 py-1 shadow-md">
                      <RatingStars rating={rating} />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {d.title}
                    </h3>
                    <StatusBadge published={d.published} />
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-between">
                    <Link
                      href={`/posts/manager/${d.id}/edit`}
                      className="text-sm px-3 py-1.5 rounded-lg border shadow-sm hover:shadow transition bg-white hover:bg-gray-50"
                    >
                      Sửa
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteDish(d.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-sm px-3 py-1.5 rounded-lg border shadow-sm hover:shadow transition text-red-600 bg-white hover:bg-red-50"
                      >
                        Xoá
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        {dishes.length === 0 && (
          <li className="col-span-full">
            <div className="px-6 py-12 text-center rounded-2xl border bg-white">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-200 to-pink-200" />
              <p className="text-sm text-gray-500">Bạn chưa đăng món nào.</p>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}
