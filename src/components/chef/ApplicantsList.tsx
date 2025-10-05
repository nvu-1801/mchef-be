// app/admin/chefs/applicants/ApplicantsList.tsx
"use client";

import { useMemo, useState } from "react";
import type { FC } from "react";

type Applicant = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: string[] | null;
  cert_status: string | null;
  certificates: string[] | null; // jsonb array of URLs/paths
  created_at: string | null;
  updated_at: string | null;
};

const ApplicantsList: FC<{ applicants: Applicant[] }> = ({ applicants }) => {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return applicants;
    return applicants.filter((a) => {
      const name = a.display_name ?? "";
      const email = a.email ?? "";
      return (
        name.toLowerCase().includes(key) || email.toLowerCase().includes(key)
      );
    });
  }, [q, applicants]);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <span className="text-xs text-gray-500">{filtered.length} result(s)</span>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <ApplicantCard key={a.id} a={a} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border p-6 text-sm text-gray-600">
            No applicants found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantsList;

function ApplicantCard({ a }: { a: Applicant }) {
  const avatar =
    a?.avatar_url && /^https?:\/\//i.test(a.avatar_url)
      ? a.avatar_url
      : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
          a.display_name ?? a.email ?? "U"
        )}`;

  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <img src={avatar} className="h-12 w-12 rounded-full border" alt="" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate font-medium">
              {a.display_name || "Unnamed"}
            </div>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
              {a.cert_status ?? "pending"}
            </span>
          </div>
          <div className="truncate text-sm text-gray-600">
            {a.email || "—"}
          </div>
        </div>
      </div>

      {a.bio && (
        <div className="px-4 pb-3 text-sm text-gray-700 line-clamp-3">{a.bio}</div>
      )}

      {/* Certificates preview */}
      <div className="px-4 pb-4">
        <div className="text-xs font-semibold tracking-wide text-gray-600 mb-2">
          Certificates
        </div>
        {Array.isArray(a.certificates) && a.certificates.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {a.certificates.slice(0, 4).map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-md border"
                title={url}
              >
                {/* fallback nếu không phải ảnh */}
                <img
                  src={url}
                  alt=""
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                  className="h-20 w-28 object-cover transition group-hover:scale-[1.02]"
                />
                <div className="px-2 py-1 text-[11px] text-gray-600 group-hover:underline">
                  View
                </div>
              </a>
            ))}
            {a.certificates.length > 4 && (
              <span className="self-center text-xs text-gray-500">
                +{a.certificates.length - 4} more
              </span>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No certificate uploaded.</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-4 py-3">
        <button
          onClick={() => approve(a.id)}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
        >
          Approve
        </button>
        <button
          onClick={() => reject(a.id)}
          className="rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700"
        >
          Reject
        </button>
        <button
          onClick={() => editChef(a.id)}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-white"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

// Placeholder handlers — bạn sẽ nối API thật sau
async function approve(userId: string) {
  try {
    const res = await fetch(`/api/admin/chefs/${userId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canPost: true }),
    });
    if (!res.ok) throw new Error(await res.text());
    location.reload();
  } catch (e) {
    alert("Approve failed");
  }
}
async function reject(userId: string) {
  try {
    const res = await fetch(`/api/admin/chefs/${userId}/reject`, { method: "POST" });
    if (!res.ok) throw new Error(await res.text());
    location.reload();
  } catch {
    alert("Reject failed");
  }
}
async function editChef(userId: string) {
  // Mở modal chỉnh sửa… ở đây mình để placeholder:
  alert(`Open edit modal for user: ${userId}`);
}
