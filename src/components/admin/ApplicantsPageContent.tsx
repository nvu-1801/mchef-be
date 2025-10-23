"use client";

import React, { useState, useMemo } from "react";
import ApplicantCard from "@/components/chef/ApplicantCard";

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: string[] | null;
  cert_status: string | null;
  certificates: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  [key: string]: unknown;
};

type CertificateItem = {
  id?: string;
  user_id?: string | null; // ✅ Changed from string | undefined to string | null
  userId?: string;
  title?: string | null;
  file_path?: string | null;
  mime_type?: string | null;
  signedUrl?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
};

type ApplicantWithCerts = ProfileRow & {
  adminCertificates: CertificateItem[];
};

export default function ApplicantsPageContent({
  rows,
  certItems,
}: {
  rows: ProfileRow[] | null;
  certItems: CertificateItem[];
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "with-cert" | "no-cert">("all");

  const certsByUser = useMemo(() => {
    const map = new Map<string, CertificateItem[]>();
    for (const it of certItems) {
      const uid = it.user_id ?? it.userId ?? null;
      if (!uid) continue;
      const arr = map.get(uid) ?? [];
      arr.push(it);
      map.set(uid, arr);
    }
    return map;
  }, [certItems]);

  const rowsWithCerts = useMemo(
    (): ApplicantWithCerts[] =>
      (rows ?? []).map((r) => ({
        ...r,
        adminCertificates: certsByUser.get(r.id) ?? [],
      })),
    [rows, certsByUser]
  );

  const filtered = useMemo(() => {
    let list = rowsWithCerts;

    // filter by cert
    if (filter === "with-cert") {
      list = list.filter((r) => r.adminCertificates.length > 0);
    } else if (filter === "no-cert") {
      list = list.filter((r) => r.adminCertificates.length === 0);
    }

    // search
    const key = q.trim().toLowerCase();
    if (!key) return list;
    return list.filter((r) => {
      const name = r.display_name ?? "";
      const email = r.email ?? "";
      return (
        name.toLowerCase().includes(key) || email.toLowerCase().includes(key)
      );
    });
  }, [rowsWithCerts, filter, q]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Search applicants
            </label>
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Filter by certificate
            </label>
            <div className="flex gap-2">
              {[
                {
                  value: "all" as const,
                  label: "All",
                  icon: "📋",
                },
                {
                  value: "with-cert" as const,
                  label: "With cert",
                  icon: "✅",
                },
                {
                  value: "no-cert" as const,
                  label: "No cert",
                  icon: "❌",
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    filter === opt.value
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30"
                      : "border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Showing{" "}
            <span className="font-bold text-gray-900">{filtered.length}</span>{" "}
            of{" "}
            <span className="font-bold text-gray-900">
              {rowsWithCerts.length}
            </span>{" "}
            applicants
          </div>
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((a) => (
          <ApplicantCard key={a.id} applicant={a} />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-3xl border bg-white p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No applicants found
            </h3>
            <p className="text-sm text-gray-600">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
