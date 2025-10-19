// app/chefs/[id]/page.tsx
import { notFound } from "next/navigation";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import Link from "next/link";
import DishMini from "../../../../../components/chef/DishMini";
import RatingItem from "../../../../../components/chef/RatingItem";

export const revalidate = 60;

type Chef = {
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
  rating_avg: number | null;
  rating_count: number | null;
  dishes_count: number | null;
  comments_count: number | null;
};

type Dish = {
  id: string;
  slug: string | null;
  title: string | null;
  cover_image_url: string | null;
  time_minutes: number | null;
  servings: number | null;
  created_at: string | null;
};

type Rating = {
  stars: number | null;
  comment: string | null;
  created_at: string | null;
  rater: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export default async function ChefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await supabaseServer();

  const { data: chef, error: e1 } = await sb
    .from("chef_overview")
    .select("*")
    .eq("id", id)
    .single<Chef>();

  if (e1 || !chef || !chef.is_active) {
    return notFound();
  }

  const avatar =
    chef.avatar_url && /^https?:\/\//i.test(chef.avatar_url)
      ? chef.avatar_url
      : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
          chef.display_name ?? chef.user_id ?? "U"
        )}`;

  const { data: dishes } = (await sb
    .from("dishes")
    .select(
      "id, slug, title, cover_image_url, time_minutes, servings, created_at"
    )
    .eq("created_by", chef.user_id)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(8)) as { data: Dish[] | null };

  const { data: ratings } = (await sb
    .from("chef_ratings")
    .select(
      `stars, comment, created_at, rater:profiles ( id, display_name, avatar_url )`
    )
    .eq("chef_id", chef.id)
    .order("created_at", { ascending: false })
    .limit(10)) as { data: Rating[] | null };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header with glass effect */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/chefs"
                className="group flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border hover:shadow-md transition"
              >
                <svg
                  className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Chef Management
                </h1>
                <p className="text-xs text-gray-500">
                  View & manage chef profile
                </p>
              </div>
            </div>
            <Link
              href={`/profile/${chef.user_id}`}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
              Public profile
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero card with gradient */}
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-white via-sky-50/30 to-violet-50/30 p-8 shadow-xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-sky-200/40 to-violet-200/40 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-br from-pink-200/40 to-amber-200/40 blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-start gap-8">
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-sky-400 via-violet-400 to-pink-400 blur-lg opacity-40" />
              <img
                src={avatar}
                alt={chef.display_name ?? "chef"}
                className="relative h-32 w-32 rounded-2xl object-cover border-4 border-white shadow-lg"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  {chef.display_name ?? "Unnamed Chef"}
                </h2>

                {chef.is_active && chef.verified_at ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/30">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-amber-500/30">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pending
                  </span>
                )}

                {chef.can_post && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Can post
                  </span>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                {chef.bio ?? "No bio provided by this chef."}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    icon: "⭐",
                    label: "Rating",
                    value: `${chef.rating_avg?.toFixed(1) ?? "—"} (${
                      chef.rating_count ?? 0
                    })`,
                    gradient: "from-amber-400 to-orange-500",
                  },
                  {
                    icon: "🥘",
                    label: "Dishes",
                    value: chef.dishes_count ?? 0,
                    gradient: "from-rose-400 to-pink-500",
                  },
                  {
                    icon: "💬",
                    label: "Comments",
                    value: chef.comments_count ?? 0,
                    gradient: "from-blue-400 to-cyan-500",
                  },
                  {
                    icon: "📅",
                    label: "Member since",
                    value: chef.created_at
                      ? new Date(chef.created_at).toLocaleDateString()
                      : "—",
                    gradient: "from-violet-400 to-purple-500",
                  },
                ].map((stat, i) => (
                  <div key={i} className="relative group">
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition blur-xl`}
                    />
                    <div className="relative rounded-2xl bg-white/60 backdrop-blur-sm border p-4 hover:shadow-lg transition">
                      <div className="text-2xl mb-2">{stat.icon}</div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {stat.label}
                      </div>
                      <div className="text-lg font-bold text-gray-900 mt-1">
                        {stat.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-[1fr_380px]">
          {/* Main content */}
          <div className="space-y-6">
            {/* Dishes */}
            <section className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white">
                    🥘
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Recent Dishes
                    </h2>
                    <p className="text-xs text-gray-500">Published recipes</p>
                  </div>
                </div>
                <a
                  href={`/search?chef=${chef.user_id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  View all
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {!dishes || dishes.length === 0 ? (
                <div className="rounded-2xl bg-gray-50 p-8 text-center">
                  <div className="text-4xl mb-3">🍳</div>
                  <p className="text-sm text-gray-600">
                    This chef hasn't published any dishes yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {dishes.map((d) => (
                    <DishMini key={d.id} dish={d} />
                  ))}
                </div>
              )}
            </section>

            {/* Ratings */}
            <section className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                  ⭐
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Recent Ratings
                  </h2>
                  <p className="text-xs text-gray-500">Customer feedback</p>
                </div>
              </div>

              {!ratings || ratings.length === 0 ? (
                <div className="rounded-2xl bg-gray-50 p-8 text-center">
                  <div className="text-4xl mb-3">💭</div>
                  <p className="text-sm text-gray-600">No ratings yet.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {ratings.map((r, i) => (
                    <RatingItem key={i} rating={r} />
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="rounded-3xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-emerald-500/30 transition">
                  ✓ Approve Chef
                </button>
                <button className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-rose-500/30 transition">
                  ✕ Reject Application
                </button>
                <button className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
                  ✎ Edit Details
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Information
              </h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    User ID
                  </dt>
                  <dd className="text-xs text-gray-700 break-all font-mono bg-gray-50 rounded-lg p-2">
                    {chef.user_id}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Created
                  </dt>
                  <dd className="text-gray-900 font-medium">
                    {chef.created_at
                      ? new Date(chef.created_at).toLocaleString()
                      : "—"}
                  </dd>
                </div>
                {chef.verified_at && (
                  <div>
                    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Verified at
                    </dt>
                    <dd className="text-gray-900 font-medium">
                      {new Date(chef.verified_at).toLocaleString()}
                    </dd>
                  </div>
                )}
                {chef.updated_at && (
                  <div>
                    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Last updated
                    </dt>
                    <dd className="text-gray-900 font-medium">
                      {new Date(chef.updated_at).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
