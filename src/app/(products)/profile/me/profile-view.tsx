"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProfileForm from "./profile-form";
import type { ProfileData } from "./types";

type ToastState = { type: "success" | "error"; msg: string } | null;

// API /api/me TRẢ VỀ OBJECT PHẲNG
type ApiMe = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  skills: string[];
  role: string;
  certStatus: string | null;
  certificates: any[];
  createdAt: string | null;
  updatedAt: string | null;
};

export default function ProfileView({ initial }: { initial: ProfileData }) {
  // ---- STATE CHÍNH ----
  const [profile, setProfile] = useState<ProfileData>(initial);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  // ---- MODAL EDIT PROFILE ----
  const [showEditModal, setShowEditModal] = useState(false);

  // ---- MODAL UPGRADE CERTIFICATE (MỚI) ----
  const [showCertModal, setShowCertModal] = useState(false);
  const [certTab, setCertTab] = useState<"file" | "link">("file");
  const [certFiles, setCertFiles] = useState<File[]>([]);
  const [certLink, setCertLink] = useState("");
  const [certSubmitting, setCertSubmitting] = useState(false);

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
        const data: ApiMe | { error: string } = await res.json();
        if ("error" in data) throw new Error(data.error || "Unauthorized");
        if (!mounted) return;

        const next: ProfileData = {
          id: data.id,
          email: data.email ?? "",
          fullName: data.fullName ?? "",
          avatarUrl: data.avatarUrl ?? "",
          bio: data.bio ?? "",
          skills: Array.isArray(data.skills) ? data.skills : [],
          role: data.role ?? "user",
          certStatus: data.certStatus ?? null,
          certificates: Array.isArray(data.certificates)
            ? data.certificates
            : [],
          updatedAt: data.updatedAt ?? null,
        };
        setProfile(next);
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

  const updatedLabel = useMemo(() => {
    if (!profile.updatedAt) return "—";
    const t = new Date(profile.updatedAt);
    return Number.isNaN(t.getTime()) ? "—" : t.toLocaleString();
  }, [profile.updatedAt]);

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

  // ---- Helpers: upload file → lấy publicUrl qua API ký URL ----
  async function uploadCertificateFiles(files: File[]): Promise<string[]> {
    const uploadedUrls: string[] = [];
    for (const f of files) {
      const filename = `${Date.now()}_${encodeURIComponent(f.name)}`;
      // Ký url
      const signRes = await fetch("/api/uploads/sign", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket: "certificates",
          path: filename,
          contentType: f.type || "application/octet-stream",
        }),
      });
      if (!signRes.ok) {
        const txt = await signRes.text();
        throw new Error(txt || "Sign upload URL failed");
      }
      const { uploadUrl, publicUrl } = await signRes.json();

      // PUT file lên storage
      const putRes = await fetch(uploadUrl, { method: "PUT", body: f });
      if (!putRes.ok) {
        const txt = await putRes.text();
        throw new Error(txt || "Upload file failed");
      }
      uploadedUrls.push(publicUrl);
    }
    return uploadedUrls;
  }

  // ---- Submit chứng chỉ ----
  async function handleSubmitCertificates(e: React.FormEvent) {
    e.preventDefault();
    try {
      setCertSubmitting(true);

      // 1) Upload file (nếu có)
      let fileUrls: string[] = [];
      if (certFiles.length > 0) {
        fileUrls = await uploadCertificateFiles(certFiles);
      }

      // 2) Chuẩn bị links
      const links: string[] = certLink.trim() ? [certLink.trim()] : [];

      if (fileUrls.length === 0 && links.length === 0) {
        showToast({ type: "error", msg: "Hãy chọn file hoặc nhập link" });
        return;
      }

      // 3) Gọi API lưu certificates
      const saveRes = await fetch("/api/profiles/me/certificates", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: fileUrls, links }),
      });
      if (!saveRes.ok) {
        const txt = await saveRes.text();
        throw new Error(txt || "Save certificates failed");
      }

      const updated = await saveRes.json();
      // Chấp nhận 2 trường hợp: API trả full profile hoặc chỉ certificates
      if (updated && typeof updated === "object") {
        setProfile((prev) => ({
          ...prev,
          certificates: Array.isArray(updated.certificates)
            ? updated.certificates
            : Array.isArray(prev.certificates)
            ? prev.certificates
            : [],
          updatedAt:
            updated.updatedAt ?? prev.updatedAt ?? new Date().toISOString(),
        }));
      }

      // Reset & close
      setCertFiles([]);
      setCertLink("");
      setShowCertModal(false);
      showToast({ type: "success", msg: "Certificate updated" });
    } catch (err: any) {
      showToast({
        type: "error",
        msg: err?.message || "Cannot upload certificate",
      });
    } finally {
      setCertSubmitting(false);
    }
  }

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

      {(loading || loadErr) && (
        <div className="mb-4 rounded-lg border px-4 py-2 text-sm">
          {loading ? (
            "Loading profile…"
          ) : (
            <span className="text-rose-600">Error: {loadErr}</span>
          )}
        </div>
      )}

      {/* Profile Display */}
      <div className="rounded-2xl border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500 p-[1px]">
          <div className="rounded-2xl bg-white/90 backdrop-blur">
            <div className="p-6">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
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

                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCertModal(true)}
                    className="rounded-md bg-blue-600 me-2 px-4 py-2 text-sm text-white shadow hover:bg-blue-700"
                  >
                    Upgrade Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
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

      {/* Sections */}
      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-3">
            <div className="text-sm font-semibold tracking-wide text-gray-700">
              General
            </div>
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

      {/* Modal: Edit Profile */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-auto max-h-[90vh] p-6 relative">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
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

              <ProfileForm
                initial={profile}
                onProfileUpdated={(updatedProfile) => {
                  setProfile(updatedProfile);
                  setShowEditModal(false);
                  showToast({ type: "success", msg: "Profile updated" });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upgrade Certificate (NEW) */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900/40 via-fuchsia-900/40 to-emerald-900/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl">
            <div className="rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/10">
              {/* Header */}
              <div className="relative p-[1px] bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500">
                <div className="rounded-t-2xl bg-white">
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm">
                        {/* Trophy / certificate icon */}
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M8 21l4-2 4 2V7H8v14z" />
                          <path d="M5 7h14a2 2 0 0 0 2-2V3H3v2a2 2 0 0 0 2 2z" />
                        </svg>
                      </span>
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">
                          Upgrade Certificate
                        </h2>
                        <p className="text-xs text-gray-500">
                          Tải lên file hoặc gắn link chứng chỉ
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCertModal(false)}
                      className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
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
                  </div>

                  {/* Tabs */}
                  <div className="px-6 pb-3">
                    <div className="inline-flex items-center rounded-xl bg-gray-100 p-1">
                      <button
                        type="button"
                        onClick={() => setCertTab("file")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition
                    ${
                      certTab === "file"
                        ? "bg-white shadow text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                      >
                        Upload files
                      </button>
                      <button
                        type="button"
                        onClick={() => setCertTab("link")}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition
                    ${
                      certTab === "link"
                        ? "bg-white shadow text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                      >
                        Paste link
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <form
                onSubmit={handleSubmitCertificates}
                className="bg-white p-6"
              >
                {/* FILE TAB */}
                {certTab === "file" && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-800">
                      Chọn file chứng chỉ
                    </label>

                    {/* Dropzone */}
                    <label
                      htmlFor="cert-files"
                      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition hover:border-indigo-300 hover:bg-indigo-50/50"
                    >
                      <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 p-3 text-white shadow">
                        {/* Upload icon */}
                        <svg
                          viewBox="0 0 24 24"
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
                          <path d="M20 16.5A3.5 3.5 0 0016.5 13H16a5 5 0 10-9.9 1.5" />
                          <path d="M4 16v4h16v-4" />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          Kéo thả file vào đây, hoặc{" "}
                          <span className="text-indigo-600 underline">
                            chọn từ máy
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Hỗ trợ PDF, PNG, JPG (tối đa ~10MB mỗi file)
                        </p>
                      </div>
                      <input
                        id="cert-files"
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        onChange={(e) =>
                          setCertFiles(Array.from(e.target.files ?? []))
                        }
                        className="hidden"
                      />
                    </label>

                    {/* Preview selected files */}
                    {certFiles.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-700">
                          Đã chọn {certFiles.length} file
                        </div>
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {certFiles.map((f, idx) => (
                            <li
                              key={`${f.name}-${idx}`}
                              className="flex items-center justify-between rounded-xl border bg-gray-50/60 px-3 py-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                                  {/* File icon */}
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4 text-gray-700"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V8l-6-6z" />
                                  </svg>
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-gray-900">
                                    {f.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(f.size / 1024).toFixed(0)} KB
                                  </p>
                                </div>
                              </div>
                              {/* Remove single file */}
                              <button
                                type="button"
                                onClick={() =>
                                  setCertFiles((prev) =>
                                    prev.filter((_, i) => i !== idx)
                                  )
                                }
                                className="rounded-md p-1 text-gray-500 hover:bg-white hover:text-rose-600"
                                title="Remove"
                              >
                                <svg
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                        {/* Clear all */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setCertFiles([])}
                            className="text-xs text-rose-600 hover:underline"
                          >
                            Xoá tất cả file đã chọn
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* LINK TAB */}
                {certTab === "link" && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-800">
                      Nhập link chứng chỉ
                    </label>
                    <div className="flex items-stretch gap-2">
                      <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                          {/* Link icon */}
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 10-7.07-7.07L10 5" />
                            <path d="M14 11a5 5 0 01-7.07 0L5.5 9.57a5 5 0 117.07-7.07L14 3" />
                          </svg>
                        </div>
                        <input
                          type="url"
                          value={certLink}
                          onChange={(e) => setCertLink(e.target.value)}
                          placeholder="https://drive.google.com/file/d/... hoặc https://example.com/certificate.pdf"
                          className="w-full rounded-xl border border-gray-300 bg-white px-9 py-3 text-sm placeholder:text-gray-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>
                      {certLink && (
                        <button
                          type="button"
                          onClick={() => setCertLink("")}
                          className="rounded-xl border px-3 text-sm text-gray-600 hover:bg-gray-50"
                          title="Clear"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Nên dùng link công khai (public). Nếu là Google Drive, hãy
                      bật quyền “Anyone with the link”.
                    </p>
                  </div>
                )}

                {/* Footer actions */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Dung lượng khuyến nghị &lt; 10MB. Hỗ trợ PDF/PNG/JPG.
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCertModal(false)}
                      className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      disabled={certSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60"
                      disabled={certSubmitting}
                    >
                      {certSubmitting ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
