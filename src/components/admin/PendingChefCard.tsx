"use client";

import React from "react";
import Link from "next/link";

export default function PendingChefCard({ chef }: { chef: any }) {
  const avatar =
    chef.avatar_url && /^https?:\/\//i.test(chef.avatar_url)
      ? chef.avatar_url
      : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
          chef.display_name ?? chef.user_id ?? "U"
        )}`;

  async function handleApprove() {
    if (!confirm("Approve this chef?")) return;
    try {
      const res = await fetch(
        `/api/admin/chefs/${chef.user_id ?? chef.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approve: true }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      location.reload();
    } catch {
      alert("Approve failed");
    }
  }

  async function handleReject() {
    if (!confirm("Reject this applicant?")) return;
    try {
      const res = await fetch(
        `/api/admin/chefs/${chef.user_id ?? chef.id}/reject`,
        {
          method: "POST",
        }
      );
      if (!res.ok) throw new Error(await res.text());
      location.reload();
    } catch {
      alert("Reject failed");
    }
  }

  return (
    <article className="relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm hover:shadow-xl transition group">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 opacity-0 group-hover:opacity-100 blur-2xl transition" />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 blur opacity-30" />
            <img
              src={avatar}
              alt={chef.display_name ?? "chef"}
              className="relative h-16 w-16 rounded-xl object-cover border-2 border-white"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-bold text-gray-900">
                {chef.display_name ?? "Unnamed"}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2v6M5 8l7 12 7-12" />
                </svg>
                Pending
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {chef.bio ?? "No bio provided."}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2">
          {[
            {
              icon: "⭐",
              value: chef.rating_avg ? Number(chef.rating_avg).toFixed(1) : "—",
              gradient: "from-amber-50 to-orange-50 border-amber-200",
            },
            {
              icon: "🥘",
              value: `${chef.dishes_count ?? 0}`,
              label: "dishes",
              gradient: "from-rose-50 to-pink-50 border-rose-200",
            },
            {
              icon: "📅",
              value: chef.created_at
                ? new Date(chef.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "—",
              gradient: "from-blue-50 to-cyan-50 border-blue-200",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`inline-flex items-center gap-2 bg-gradient-to-r ${stat.gradient} border px-3 py-1.5 rounded-lg text-xs font-medium`}
            >
              <span className="text-base">{stat.icon}</span>
              <span className="font-bold text-gray-900">{stat.value}</span>
              {stat.label && (
                <span className="text-gray-600">{stat.label}</span>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${chef.user_id ?? chef.id}`}
              className="flex-1 rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm font-medium text-center hover:bg-gray-50 transition"
            >
              👤 Profile
            </Link>

            <Link
              href={`/admin/chefs/${chef.user_id ?? chef.id}`}
              className="flex-1 rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-2.5 text-sm font-medium text-center text-indigo-700 hover:from-indigo-100 hover:to-violet-100 transition"
            >
              ⚙️ Manage
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApprove}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2.5 text-sm font-bold text-white hover:shadow-lg hover:shadow-emerald-500/30 transition"
            >
              ✓ Approve
            </button>
            <button
              onClick={handleReject}
              className="flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-2.5 text-sm font-bold text-white hover:shadow-lg hover:shadow-rose-500/30 transition"
            >
              ✕ Reject
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
