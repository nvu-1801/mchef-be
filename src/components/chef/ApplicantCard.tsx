"use client";

import React, { useState, useEffect } from "react";
import type { Applicant } from "./ApplicantsList";

type AdminCert = {
  id?: string;
  user_id?: string;
  title?: string;
  file_path?: string | null;
  mime_type?: string | null;
  signedUrl?: string | null;
  created_at?: string | null;
  [k: string]: unknown;
};

function makePreviewUrl(cert: AdminCert): string | null {
  if (!cert) return null;
  if (cert.signedUrl) return cert.signedUrl;
  if (cert.file_path && /^https?:\/\//i.test(cert.file_path))
    return cert.file_path;
  if (cert.mime_type === "link/url" && cert.file_path) return cert.file_path;
  return null;
}

export default function ApplicantCard({ applicant }: { applicant: Applicant }) {
  const avatar =
    applicant?.avatar_url && /^https?:\/\//i.test(applicant.avatar_url)
      ? applicant.avatar_url
      : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
          applicant.display_name ?? applicant.email ?? "U"
        )}`;

  const adminCerts = Array.isArray(applicant.adminCertificates)
    ? (applicant.adminCertificates as AdminCert[])
    : [];

  const profileCerts = Array.isArray(applicant.certificates)
    ? applicant.certificates
    : [];

  const [signedMap, setSignedMap] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const need = adminCerts.filter((c) => !makePreviewUrl(c) && c.file_path);
    if (need.length === 0) return;

    let mounted = true;
    (async () => {
      const promises = need.map(async (c) => {
        try {
          const res = await fetch(
            `/api/admin/certificates/signed?file=${encodeURIComponent(
              c.file_path!
            )}`,
            { cache: "no-store" }
          );
          if (!res.ok) return { key: c.file_path!, url: null };
          const j = await res.json().catch(() => null);
          return { key: c.file_path!, url: j?.signedUrl ?? null };
        } catch {
          return { key: c.file_path!, url: null };
        }
      });

      const results = await Promise.all(promises);
      if (!mounted) return;
      setSignedMap((s) => {
        const copy = { ...s };
        for (const r of results) copy[r.key] = r.url;
        return copy;
      });
    })();

    return () => {
      mounted = false;
    };
  }, [adminCerts]);

  const previewItems: { url: string | null; label?: string }[] =
    adminCerts.length > 0
      ? adminCerts.map((c) => {
          const direct = makePreviewUrl(c);
          const fallback = c.file_path ? signedMap[c.file_path] ?? null : null;
          return { url: direct ?? fallback, label: c.title };
        })
      : profileCerts.map((u) => ({ url: typeof u === "string" ? u : null }));

  async function handleApprove() {
    if (!confirm("Approve this chef?")) return;
    try {
      const res = await fetch(`/api/admin/chefs/${applicant.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canPost: true }),
      });
      if (!res.ok) throw new Error(await res.text());
      location.reload();
    } catch {
      alert("Approve failed");
    }
  }

  async function handleReject() {
    if (!confirm("Reject this applicant?")) return;
    try {
      const res = await fetch(`/api/admin/chefs/${applicant.id}/reject`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(await res.text());
      location.reload();
    } catch {
      alert("Reject failed");
    }
  }

  function handleEdit() {
    alert(`Open edit modal for user: ${applicant.id}`);
  }

  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <img src={avatar} className="h-12 w-12 rounded-full border" alt="" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate font-medium">
              {applicant.display_name || "Unnamed"}
            </div>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
              {applicant.cert_status ?? "pending"}
            </span>
          </div>
          <div className="truncate text-sm text-gray-600">
            {applicant.email || "—"}
          </div>
        </div>
      </div>

      {applicant.bio && (
        <div className="px-4 pb-3 text-sm text-gray-700 line-clamp-3">
          {applicant.bio}
        </div>
      )}

      {/* Certificates preview */}
      <div className="px-4 pb-4">
        <div className="text-xs font-semibold tracking-wide text-gray-600 mb-2">
          Certificates
        </div>

        {previewItems.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {previewItems.slice(0, 4).map((it, idx) => {
              const url = it.url;
              const isImage =
                typeof url === "string" &&
                /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i.test(url);

              if (!url) {
                return (
                  <div
                    key={idx}
                    className="w-28 h-20 rounded-md border bg-gray-50 flex items-center justify-center text-xs text-gray-500"
                  >
                    No preview
                  </div>
                );
              }

              if (isImage) {
                return (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block overflow-hidden rounded-md border"
                    title={it.label ?? url}
                  >
                    <img
                      src={url}
                      alt={it.label ?? `cert-${idx}`}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                      className="h-20 w-28 object-cover transition group-hover:scale-[1.02]"
                    />
                  </a>
                );
              }

              return (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                  title={it.label ?? url}
                >
                  <svg
                    className="w-4 h-4 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <path d="M14 2v6h6"></path>
                  </svg>
                  <span className="truncate max-w-[8rem]">
                    {it.label ?? "View"}
                  </span>
                </a>
              );
            })}

            {previewItems.length > 4 && (
              <span className="self-center text-xs text-gray-500">
                +{previewItems.length - 4} more
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
          onClick={handleApprove}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
        >
          Approve
        </button>
        <button
          onClick={handleReject}
          className="rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700"
        >
          Reject
        </button>
        <button
          onClick={handleEdit}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-white"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
