"use client";

import React from "react";

type Props = {
  open: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: { files: File[]; link: string }) => void | Promise<void>;
};

export default function CertificateModal({
  open,
  submitting = false,
  onClose,
  onSubmit,
}: Props) {
  const [certTab, setCertTab] = React.useState<"file" | "link">("file");
  const [certFiles, setCertFiles] = React.useState<File[]>([]);
  const [certLink, setCertLink] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      // reset khi đóng
      setCertTab("file");
      setCertFiles([]);
      setCertLink("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ files: certFiles, link: certLink.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900/40 via-fuchsia-900/40 to-emerald-900/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl">
        <div className="rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/10">
          {/* Header */}
          <div className="relative p-[1px] bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500">
            <div className="rounded-t-2xl bg-white">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 21l4-2 4 2V7H8v14z" />
                      <path d="M5 7h14a2 2 0 0 0 2-2V3H3v2a2 2 0 0 0 2 2z" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Upgrade Certificate</h2>
                    <p className="text-xs text-gray-500">Tải lên file hoặc gắn link chứng chỉ</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                  title="Close"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      certTab === "file" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Upload files
                  </button>
                  <button
                    type="button"
                    onClick={() => setCertTab("link")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      certTab === "link" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Paste link
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="bg-white p-6">
            {/* FILE TAB */}
            {certTab === "file" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-800">Chọn file chứng chỉ</label>

                {/* Dropzone */}
                <label
                  htmlFor="cert-files"
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition hover:border-indigo-300 hover:bg-indigo-50/50"
                >
                  <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 p-3 text-white shadow">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
                      <path d="M20 16.5A3.5 3.5 0 0016.5 13H16a5 5 0 10-9.9 1.5" />
                      <path d="M4 16v4h16v-4" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      Kéo thả file vào đây, hoặc <span className="text-indigo-600 underline">chọn từ máy</span>
                    </p>
                    <p className="text-xs text-gray-500">Hỗ trợ PDF, PNG, JPG (tối đa ~10MB mỗi file)</p>
                  </div>
                  <input
                    id="cert-files"
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={(e) => setCertFiles(Array.from(e.target.files ?? []))}
                    className="hidden"
                  />
                </label>

                {/* Preview selected files */}
                {certFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-700">Đã chọn {certFiles.length} file</div>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {certFiles.map((f, idx) => (
                        <li
                          key={`${f.name}-${idx}`}
                          className="flex items-center justify-between rounded-xl border bg-gray-50/60 px-3 py-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                              <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V8l-6-6z" />
                              </svg>
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900">{f.name}</p>
                              <p className="text-xs text-gray-500">{(f.size / 1024).toFixed(0)} KB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCertFiles((prev) => prev.filter((_, i) => i !== idx))}
                            className="rounded-md p-1 text-gray-500 hover:bg-white hover:text-rose-600"
                            title="Remove"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-1">
                      <button type="button" onClick={() => setCertFiles([])} className="text-xs text-rose-600 hover:underline">
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
                <label className="block text-sm font-medium text-gray-800">Nhập link chứng chỉ</label>
                <div className="flex items-stretch gap-2">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
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
                  Nên dùng link công khai (public). Nếu là Google Drive, hãy bật quyền “Anyone with the link”.
                </p>
              </div>
            )}

            {/* Footer actions */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-gray-500">Dung lượng khuyến nghị &lt; 10MB. Hỗ trợ PDF/PNG/JPG.</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
