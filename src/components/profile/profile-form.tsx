// app/profile/me/profile-form.tsx
"use client";

import * as React from "react";
import type { ProfileData } from "../../app/(products)/profile/me/types";

type ToastState = { type: "success" | "error"; msg: string } | null;

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg className={`animate-spin h-5 w-5 ${className}`} viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
      />
    </svg>
  );
}

interface ProfileFormProps {
  initial: ProfileData;
  onProfileUpdated?: (updatedProfile: ProfileData) => void;
}

export default function ProfileForm({
  initial,
  onProfileUpdated,
}: ProfileFormProps) {
  // [CHANGE A] – luôn là string
  const [fullName, setFullName] = React.useState<string>(
    initial.fullName ?? ""
  );
  const [avatarUrl, setAvatarUrl] = React.useState<string>(
    initial.avatarUrl ?? ""
  );
  const [bio, setBio] = React.useState<string>(initial.bio ?? "");
  const [skills, setSkills] = React.useState<string[]>(
    Array.isArray(initial.skills) ? initial.skills : []
  );
  const [lastUpdatedAt, setLastUpdatedAt] = React.useState<string | null>(
    initial.updatedAt ?? null
  );
  const [baseline, setBaseline] = React.useState<ProfileData>(initial);
  const [newSkill, setNewSkill] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);
  const [dirty, setDirty] = React.useState(false);

  // Recompute dirty state whenever fields or baseline change
  // [CHANGE B] – so sánh kiểu an toàn
  React.useEffect(() => {
    const isDirty =
      fullName !== (baseline.fullName ?? "") ||
      avatarUrl !== (baseline.avatarUrl ?? "") ||
      bio !== (baseline.bio ?? "") ||
      JSON.stringify(skills) !== JSON.stringify(baseline.skills ?? []);
    setDirty(isDirty);
  }, [fullName, avatarUrl, bio, skills, baseline]);

  // Warn user if leaving with unsaved changes
  React.useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function showToast(t: ToastState) {
    setToast(t);
    if (t) setTimeout(() => setToast(null), 2500);
  }

  function addSkill() {
    const s = newSkill.trim();
    if (!s) return;
    if (skills.includes(s)) {
      return showToast({ type: "error", msg: "Skill already added" });
    }
    setSkills((prev) => [...prev, s]);
    setNewSkill("");
  }

  function removeSkill(s: string) {
    setSkills((prev) => prev.filter((x) => x !== s));
  }

  function resetForm() {
    setFullName(baseline.fullName ?? "");
    setAvatarUrl(baseline.avatarUrl ?? "");
    setBio(baseline.bio ?? "");
    setSkills(baseline.skills ?? []);
    setNewSkill("");
    showToast({ type: "success", msg: "Reverted changes" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    // Basic validation
    if (fullName.trim().length < 2) {
      setSaving(false);
      return showToast({ type: "error", msg: "Full name is too short" });
    }
    if (avatarUrl && !/^https?:\/\/.+/i.test(avatarUrl)) {
      setSaving(false);
      return showToast({
        type: "error",
        msg: "Avatar URL must start with http(s)://",
      });
    }

    try {
      const res = await fetch("/api/me", {
        method: "PUT",
        credentials: "include", // đề phòng cần cookie-based
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          avatarUrl: avatarUrl.trim(),
          bio,
          skills,
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Update failed");
      }
      const updated = await res.json();

      // Update controlled fields (luôn là string/array)
      setFullName(updated.fullName ?? "");
      setAvatarUrl(updated.avatarUrl ?? "");
      setBio(updated.bio ?? "");
      setSkills(updated.skills ?? []);
      setLastUpdatedAt(updated.updatedAt ?? null);
      showToast({ type: "success", msg: "Profile updated" });

      // Sync với parent + baseline
      if (onProfileUpdated) {
        const updatedProfile: ProfileData = {
          ...baseline,
          ...updated,
          fullName: updated.fullName ?? "",
          avatarUrl: updated.avatarUrl ?? "",
          bio: updated.bio ?? "",
          skills: updated.skills ?? [],
          updatedAt: updated.updatedAt ?? baseline.updatedAt ?? null,
        };
        setBaseline(updatedProfile);
        onProfileUpdated(updatedProfile);
      } else {
        setBaseline((prev) => ({
          ...prev,
          ...updated,
          fullName: updated.fullName ?? prev.fullName ?? "",
          avatarUrl: updated.avatarUrl ?? prev.avatarUrl ?? "",
          bio: updated.bio ?? prev.bio ?? "",
          skills: updated.skills ?? prev.skills ?? [],
          updatedAt: updated.updatedAt ?? prev.updatedAt ?? null,
        }));
      }
    } catch (err: any) {
      showToast({ type: "error", msg: err.message || "Something went wrong" });
    } finally {
      setSaving(false);
    }
  }

  function copyEmail() {
    navigator.clipboard.writeText(initial.email || "");
    showToast({ type: "success", msg: "Email copied" });
  }

  const updatedLabel =
    lastUpdatedAt && !Number.isNaN(new Date(lastUpdatedAt).getTime())
      ? new Date(lastUpdatedAt).toLocaleString()
      : "—";

  return (
    <>
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

      <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-[1fr]">
        {/* Top Card (Profile Summary) */}
        <div className="rounded-2xl border shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500 p-[1px]">
            <div className="rounded-2xl bg-white/90 backdrop-blur">
              <div className="p-6">
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                  {/* Avatar with edit prompt */}
                  <div className="relative">
                    <img
                      src={
                        avatarUrl ||
                        `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                          initial.email || "U"
                        )}`
                      }
                      alt="avatar"
                      className="h-20 w-20 rounded-full border object-cover shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt("Paste image URL");
                        if (url) setAvatarUrl(url);
                      }}
                      className="absolute -bottom-2 -right-2 rounded-full border bg-white px-2 py-1 text-xs shadow hover:bg-gray-50"
                      title="Set Avatar URL"
                    >
                      Edit
                    </button>
                  </div>
                  {/* Name and status */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold">
                        {fullName || "Unnamed User"}
                      </span>
                      {initial.role && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">
                          {initial.role}
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
                        {initial.email || "—"}
                      </button>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        Updated: {updatedLabel}
                      </span>
                      {dirty && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                            Unsaved changes
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Form Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={!dirty || saving}
                      className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm text-white shadow hover:bg-black disabled:opacity-60"
                    >
                      {saving && <Spinner className="text-white" />}
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Info (Editable Fields) */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: General */}
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-5 py-3">
              <h2 className="text-sm font-semibold tracking-wide text-gray-700">
                General
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-gray-600">Full name</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-md border px-3 py-2 outline-none focus:border-indigo-500"
                  placeholder="Nguyễn Văn A"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-gray-600">Avatar URL</span>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="rounded-md border px-3 py-2 outline-none focus:border-fuchsia-500"
                  placeholder="https://..."
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-gray-600">Bio</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-[100px] rounded-md border px-3 py-2 outline-none focus:border-emerald-500"
                  placeholder="Đôi dòng giới thiệu về bạn…"
                />
              </label>
            </div>
          </div>

          {/* Right Column: Skills */}
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-5 py-3">
              <h2 className="text-sm font-semibold tracking-wide text-gray-700">
                Skills
              </h2>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="flex-1 rounded-md border px-3 py-2 outline-none focus:border-indigo-500"
                  placeholder="Type a skill and press Enter"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white shadow hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
              {skills.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-gray-700"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="ml-1 rounded-full p-0.5 text-gray-500 hover:bg-rose-50 hover:text-rose-600"
                        title="Remove"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  No skills yet. Add your first one!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Account Info (Read-only fields like Email, Role, Last updated) */}
        <div className="rounded-2xl border bg-white shadow-sm">
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
                <span className="truncate">{initial.email || "—"}</span>
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
                  {initial.role || "—"}
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
        </div>
      </form>
    </>
  );
}
