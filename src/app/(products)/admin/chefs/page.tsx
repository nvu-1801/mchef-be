// app/chefs/page.tsx
import { supabaseServer } from "@/libs/supabase/supabase-server";
import PublicChefs from "../../../../components/chef/PublicChefs";
import Link from "next/link";
import React from "react";
import PendingChefCard from "@/components/admin/PendingChefCard";

export const revalidate = 60;

export default async function ChefsPublicPage() {
  const sb = await supabaseServer();

  // lấy tất cả chefs, để phân loại verified / pending
  const { data, error } = await sb
    .from("chef_overview") // nếu không có view, đổi tên tương ứng
    .select(
      `
      id, user_id, display_name, avatar_url, bio,
      is_active, can_post, verified_at, created_at, updated_at,
      rating_avg, rating_count, dishes_count, comments_count
    `
    )
    .order("verified_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="mx-auto max-w-6xl p-6">
          <div className="rounded-3xl border bg-white p-8 shadow-xl">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white text-2xl mb-4">
                ⚠️
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Load Failed
              </h1>
              <p className="text-rose-600">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const items = (data ?? []) as any[];
  const verified = items.filter((c) => !!c.is_active && !!c.verified_at);
  const pending = items.filter((c) => !c.is_active || !c.verified_at);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header with glass effect */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/30">
                👨‍🍳
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Chef Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage verified chefs and pending applications
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/chefs/applicants"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-xl transition"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Applicants ({pending.length})
              </Link>

              <Link
                href="/chefs"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition"
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
                View public chefs ({verified.length})
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Stats cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[{
            label: "Total Chefs",
            value: items.length,
            icon: "👨‍🍳",
            gradient: "from-blue-500 to-cyan-500",
          },
          {
            label: "Verified",
            value: verified.length,
            icon: "✅",
            gradient: "from-emerald-500 to-teal-500",
          },
          {
            label: "Pending",
            value: pending.length,
            icon: "⏳",
            gradient: "from-amber-500 to-orange-500",
          },
          {
            label: "Avg Rating",
            value: (
              (items.reduce(
                (s, c) => s + (c.rating_avg || 0),
                0
              ) / items.length) ||
              0
            ).toFixed(1),
            icon: "⭐",
            gradient: "from-violet-500 to-purple-500",
          }].map((stat, i) => (
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

        {/* Verified chefs section */}
        <section className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 p-6 shadow-sm">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-200/40 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-500/30">
                  ✓
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Verified Chefs
                  </h2>
                  <p className="text-sm text-gray-600">
                    Active and approved chef profiles
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-white/80 backdrop-blur-sm border px-4 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Total
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {verified.length}
                </div>
              </div>
            </div>
          </div>

          {verified.length > 0 ? (
            <PublicChefs items={verified} />
          ) : (
            <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">
              <div className="text-6xl mb-4">👨‍🍳</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No verified chefs yet
              </h3>
              <p className="text-sm text-gray-600">
                Start by reviewing pending applications.
              </p>
            </div>
          )}
        </section>

        {/* Pending section */}
        <section className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 p-6 shadow-sm">
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-200/40 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-amber-500/30">
                  ⏳
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Pending Applications
                  </h2>
                  <p className="text-sm text-gray-600">
                    Awaiting review and approval
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-white/80 backdrop-blur-sm border px-4 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Waiting
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {pending.length}
                </div>
              </div>
            </div>
          </div>

          {pending.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {pending.map((c) => (
                <PendingChefCard key={c.id} chef={c} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                All caught up!
              </h3>
              <p className="text-sm text-gray-600">
                No pending applications at the moment.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
