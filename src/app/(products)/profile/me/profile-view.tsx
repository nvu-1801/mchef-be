// app/profile/me/profile-view.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProfileForm from "./profile-form";
import type { ProfileData } from "./types";

type ToastState = { type: "success" | "error"; msg: string } | null;

interface ApiMeSuccess {
  user: { id: string; email: string | null };
  profile: {
    id: string;
    email: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    skills: string[] | null;
    role: string | null;
    certStatus?: string | null;
    certificates?: any[] | null;
    updatedAt: string | null;
  } | null;
  _debug?: any;
}

interface ApiMeError {
  error: string;
}

type ApiMeResponse = ApiMeSuccess | ApiMeError;

function normalizeProfile(p: ApiMeResponse["profile"]): ProfileData {
  // Nếu chưa có dòng profile trên DB, trả về skeleton tối thiểu
  if (!p) {
    return {
      id: "",
      email: "",
      fullName: "",
      avatarUrl: "",
      bio: "",
      skills: [],
      role: "user",
      certStatus: null,
      certificates: [],
      updatedAt: null,
    };
  }
  return {
    id: p.id,
    email: p.email ?? "",
    fullName: p.fullName ?? "",
    avatarUrl: p.avatarUrl ?? "",
    bio: p.bio ?? "",
    skills: Array.isArray(p.skills) ? p.skills : [],
    role: p.role ?? "user",
    certStatus: p.certStatus ?? null,
    certificates: p.certificates ?? [],
    updatedAt: p.updatedAt ?? null,
  };
}

export default function ProfileView({ initial }: { initial: ProfileData }) {
  // Dùng initial từ server ngay lập tức để tránh FOUC, sau đó refresh từ /api/me ở client
  const [profile, setProfile] = useState<ProfileData>(
    normalizeProfile(initial)
  );
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // Lấy lại dữ liệu mới nhất từ API (cookie-based)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setLoadErr(null);
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Fetch /api/me failed (${res.status})`);
        }

        const data: ApiMeResponse = await res.json();

        // ✅ Type guard: nếu có field "error" thì đây là ApiMeError
        if ("error" in data) {
          throw new Error(data.error || "Unauthorized");
        }

        // ✅ Đến đây TS biết chắc là ApiMeSuccess => có data.profile
        if (mounted) {
          const normalized = normalizeProfile(data.profile);
          setProfile((prev) => ({
            ...normalized,
            email: normalized.email || prev.email || "",
            role: normalized.role || prev.role || "user",
          }));
        }
      } catch (e: any) {
        if (mounted) setLoadErr(e?.message || "Cannot load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Label thời gian cập nhật: an toàn với invalid date string
  const updatedLabel = useMemo(() => {
    if (!profile.updatedAt) return "—";
    const t = new Date(profile.updatedAt);
    return Number.isNaN(t.getTime()) ? "—" : t.toLocaleString();
  }, [profile.updatedAt]);

  // Toast helper
  function showToast(t: ToastState) {
    setToast(t);
    if (t) setTimeout(() => setToast(null), 2500);
  }

  function copyEmail() {
    navigator.clipboard.writeText(profile.email || "");
    showToast({ type: "success", msg: "Email copied" });
  }

  const avatarSrc =
    profile.avatarUrl && /^https?:\/\//i.test(profile.avatarUrl)
      ? profile.avatarUrl
      : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
          profile.email || "U"
        )}`;

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-lg px-4 py-2 shadow ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Loading / Error banner (nhẹ) */}
      {(loading || loadErr) && (
        <div className="mb-4 rounded-lg border px-4 py-2 text-sm">
          {loading ? (
            "Loading profile…"
          ) : (
            <span className="text-rose-600">Error: {loadErr}</span>
          )}
        </div>
      )}

      {/* Profile Display (View Mode) */}
      <div className="rounded-2xl border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500 p-[1px]">
          <div className="rounded-2xl bg-white/90 backdrop-blur">
            <div className="p-6">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                {/* Avatar and Name */}
                <div className="relative">
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    className="h-20 w-20 rounded-full border object-cover shadow-sm"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">
                      {profile.fullName || "Unnamed User"}
                    </span>
                    {profile.role && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">
                        {profile.role}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-gray-50"
                      title="Copy email"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      {profile.email || "—"}
                    </button>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">
                      Updated: {updatedLabel}
                    </span>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white shadow hover:bg-black"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Sections */}
      <div className="grid gap-6 mt-6 md:grid-cols-2">
        {/* General Section (Bio) */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-3">
            <h2 className="text-sm font-semibold tracking-wide text-gray-700">
              General
            </h2>
          </div>
          <div className="p-5">
            <div className="text-sm text-gray-600">Bio</div>
            <div className="mt-1 text-sm text-gray-800">
              {profile.bio ? (
                profile.bio
              ) : (
                <span className="text-gray-500 italic">No bio provided.</span>
              )}
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-3">
            <h2 className="text-sm font-semibold tracking-wide text-gray-700">
              Skills
            </h2>
          </div>
          <div className="p-5">
            {profile.skills.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-gray-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-gray-500">No skills added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Section (Email, Role, Last Updated) */}
      <div className="mt-6 rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-5 py-3">
          <h2 className="text-sm font-semibold tracking-wide text-gray-700">
            Account
          </h2>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Email
            </div>
            <div className="mt-1 flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
              <span className="truncate">{profile.email || "—"}</span>
              <button
                type="button"
                onClick={copyEmail}
                className="rounded-md border px-2 py-1 text-xs hover:bg-white"
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Role
            </div>
            <div className="mt-1">
              <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">
                {profile.role || "—"}
              </span>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Last updated
            </div>
            <div className="mt-1 rounded-md bg-gray-50 px-3 py-2 text-sm">
              {updatedLabel}
            </div>
          </div>
        </div>
        <div className="flex justify-end border-t px-5 py-3">
          <a
            href="/auth/change-password"
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Change password
          </a>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-auto max-h-[90vh] p-6 relative">
              {/* Close Modal Button */}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                title="Close"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* ProfileForm: khi submit xong sẽ cập nhật lại state ở đây */}
              <ProfileForm
                initial={profile}
                onProfileUpdated={(updatedProfile) => {
                  setProfile(updatedProfile); // đã được chuẩn hoá trong form
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
