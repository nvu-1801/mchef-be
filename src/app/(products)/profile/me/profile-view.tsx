"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProfileForm from "./profile-form";
import type { ProfileData } from "./types";
import CertificateModal from "../../../../components/profile/CertificateModal";

type ToastState = { type: "success" | "error"; msg: string } | null;

// API /api/me TRẢ VỀ OBJECT PHẲNG
type ApiMe = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  bio: string | null;
  skills: string[];
  role: string;
  certStatus: "none" | "pending" | "verified" | "rejected" | null;
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

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email || "");
      showToast({ type: "success", msg: "Email copied" });
    } catch {
      showToast({ type: "error", msg: "Cannot access clipboard" });
    }
  }

  const avatarSrc =
    profile.avatarUrl && /^https?:\/\//i.test(profile.avatarUrl)
      ? profile.avatarUrl
      : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
          profile.email || "U"
        )}`;

  // ---- Helpers: upload file → lấy publicUrl qua API ký URL ----

  async function handleSubmitCertificatesUI(payload: {
    files: File[];
    link: string;
  }) {
    try {
      setCertSubmitting(true);

      // 1) Upload các file → nhận về publicUrls (giống code bạn đang có)
      let fileUrls: string[] = [];
      if (payload.files.length > 0) {
        fileUrls = await uploadCertificateFiles(payload.files); // <- dùng helper bạn đã có
      }

      // 2) Link (nếu có)
      const links = payload.link ? [payload.link] : [];

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
        throw new Error(await saveRes.text());
      }
      const updated = await saveRes.json();

      setProfile((prev) => ({
        ...prev,
        certificates: Array.isArray(updated?.certificates)
          ? updated.certificates
          : prev.certificates,
        updatedAt:
          updated?.updatedAt ?? prev.updatedAt ?? new Date().toISOString(),
      }));

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
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": f.type || "application/octet-stream" },
        body: f,
      });

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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowEditModal(false)} // click nền ngoài sẽ đóng
        >
          <div
            className="relative w-full max-w-4xl mx-auto px-4"
            onClick={(e) => e.stopPropagation()} // chặn propagation để không đóng khi click bên trong
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-auto max-h-[90vh] p-6 relative">
              {/* Nút Close góc phải */}
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="absolute right-1 top-1 z-10 rounded-full bg-gray-100 p-1 text-gray-600 hover:bg-gray-200"
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

              {/* Nội dung form */}
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
      <CertificateModal
        open={showCertModal}
        submitting={certSubmitting}
        onClose={() => setShowCertModal(false)}
        onSubmit={handleSubmitCertificatesUI}
      />
    </>
  );
}
