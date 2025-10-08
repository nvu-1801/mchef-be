"use client";

import React from "react";
import { uploadCertificateFiles } from "../../libs/supabase/upload-certs"; // trả về STORAGE PATHS

type CertItem = {
  id: string;
  title?: string | null;
  file_path: string;
  mime_type: string;             // "image/*" | "application/pdf" | "link/url" | ...
  status: "pending" | "approved" | "rejected";
  created_at: string;
  rejection_reason?: string | null;
  viewUrl?: string | null;       // API /api/certificates/me trả signed URL (10 phút)
};

export default function MyCertificates() {
  const [items, setItems] = React.useState<CertItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/certificates/me", {
      credentials: "include",
      cache: "no-store",
    });
    const j = await res.json();
    if (res.ok) setItems(j.items || []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  // === Actions ===
  async function replaceOne(id: string, file: File) {
    const [newPath] = await uploadCertificateFiles([file]); // STORAGE PATH
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const mime =
      file.type ||
      (ext === "pdf" ? "application/pdf" : ext === "png" ? "image/png" : "image/jpeg");

    const res = await fetch(`/api/certificates/${id}/replace`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ new_path: newPath, new_mime: mime, new_title: file.name }),
    });
    if (!res.ok) throw new Error(await res.text());
    await load();
  }

  async function deleteOne(id: string) {
    const res = await fetch(`/api/certificates/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    await load();
  }

  // === Helpers ===
  const isImage = (c: CertItem) =>
    c.mime_type?.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(c.viewUrl || "");

  const isPdf = (c: CertItem) =>
    c.mime_type === "application/pdf" || /(\/|\.)(pdf)(\?|#|$)/i.test(c.viewUrl || "");

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading…</div>;

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <div className="text-sm text-gray-500">Chưa có chứng chỉ.</div>
      )}

      {items.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-xl border p-3">
          {/* Preview */}
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-gray-200 bg-white flex items-center justify-center">
            {isImage(c) && c.viewUrl ? (
              <img
                src={c.viewUrl}
                alt={c.title || "certificate"}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={() => {
                  // Signed URL có thể hết hạn → reload danh sách để lấy URL mới
                  load();
                }}
              />
            ) : isPdf(c) ? (
              <div className="flex h-full w-full items-center justify-center text-gray-500">
                {/* PDF icon */}
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V8l-6-6z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                {/* Link / unknown */}
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 10-7.07-7.07L10 5" />
                  <path d="M14 11a5 5 0 01-7.07 0L5.5 9.57a5 5 0 117.07-7.07L14 3" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{c.title || c.file_path}</div>
            <div className="text-xs text-gray-500">
              {c.status.toUpperCase()} · {new Date(c.created_at).toLocaleString()}
              {c.status === "rejected" && c.rejection_reason ? ` · Lý do: ${c.rejection_reason}` : ""}
            </div>

            {/* View link */}
            {c.viewUrl && (
              <a
                href={c.viewUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-indigo-600 text-sm underline"
              >
                View
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {c.status === "pending" && (
              <>
                <label className="cursor-pointer text-sm rounded-lg border px-3 py-1 hover:bg-gray-50">
                  Replace
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) replaceOne(c.id, f).catch((err) => alert(err.message));
                    }}
                  />
                </label>
                <button
                  onClick={() => deleteOne(c.id).catch((err) => alert(err.message))}
                  className="text-sm rounded-lg bg-rose-600 text-white px-3 py-1 hover:opacity-90"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
