"use client";

import React from "react";
import { uploadCertificateFiles } from "@/libs/storage/upload-certs"; // helper trả về storage paths

export default function MyCertificates() {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/certificates/me", { credentials: "include", cache: "no-store" });
    const j = await res.json();
    if (res.ok) setItems(j.items || []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function replaceOne(id: string, file: File) {
    // upload file mới → path
    const [newPath] = await uploadCertificateFiles([file]);
    const ext = file.name.split(".").pop() || "bin";
    const mime = file.type || (ext === "pdf" ? "application/pdf" : ext === "png" ? "image/png" : "image/jpeg");

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
    const res = await fetch(`/api/certificates/${id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) throw new Error(await res.text());
    await load();
  }

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading…</div>;

  return (
    <div className="space-y-3">
      {items.length === 0 && <div className="text-sm text-gray-500">Chưa có chứng chỉ.</div>}
      {items.map((c) => (
        <div key={c.id} className="flex items-center justify-between rounded-xl border p-3">
          <div className="min-w-0">
            <div className="font-medium truncate">{c.title || c.file_path}</div>
            <div className="text-xs text-gray-500">
              {c.status.toUpperCase()} · {new Date(c.created_at).toLocaleString()}
              {c.status === "rejected" && c.rejection_reason ? ` · Lý do: ${c.rejection_reason}` : ""}
            </div>
            {c.viewUrl && (
              <a href={c.viewUrl} target="_blank" className="text-indigo-600 text-sm underline">
                View
              </a>
            )}
          </div>

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
