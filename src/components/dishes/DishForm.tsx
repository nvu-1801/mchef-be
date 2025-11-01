"use client";

import React, { useState } from "react";
import { useFormStatus } from "react-dom";

type Category = { id: string; name: string };

const DIET_OPTIONS = [
  { value: "veg", label: "🥗 Vegetarian", icon: "🥗" },
  { value: "nonveg", label: "🍖 Non-Veg", icon: "🍖" },
  { value: "vegan", label: "🌱 Vegan", icon: "🌱" },
];

export default function DishForm({
  action,
  categories,
  defaultValues,
  submitText = "Lưu",
}: {
  action: (formData: FormData) => Promise<void> | void;
  categories: Category[];
  defaultValues?: Partial<{
    title: string;
    category_id: string | null;
    cover_image_url: string | null;
    diet: string | null;
    time_minutes: number | null;
    servings: number | null;
    tips: string | null;
    published: boolean;
  }>;
  submitText?: string;
}) {
  const [coverPreview, setCoverPreview] = useState<string | null>(
    defaultValues?.cover_image_url ?? null
  );
  const [imageSource, setImageSource] = useState<"url" | "upload">("url");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setCoverPreview(url || null);
    setUploadedFile(null);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <form action={action} className="space-y-6">
        {/* Title Section */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 opacity-50 blur-3xl" />

          <div className="relative space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/30">
                📝
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Thông tin cơ bản
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Tiêu đề món ăn <span className="text-rose-500">*</span>
                </label>
                <input
                  name="title"
                  defaultValue={defaultValues?.title ?? ""}
                  placeholder="Ví dụ: Gà kho gừng"
                  required
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition text-sm"
                />
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 002 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2z" />
                  </svg>
                  Tên món hấp dẫn sẽ thu hút người xem hơn
                </p>
              </div>

              {/* Category + Diet Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Danh mục
                  </label>
                  <select
                    name="category_id"
                    defaultValue={defaultValues?.category_id ?? ""}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-gray-900 text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  >
                    <option value="">— Chọn danh mục —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Chế độ ăn
                  </label>
                  <select
                    name="diet"
                    defaultValue={defaultValues?.diet ?? ""}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-gray-900 text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  >
                    <option value="">— Chọn chế độ —</option>
                    {DIET_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time + Servings Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    ⏱️ Thời gian (phút)
                  </label>
                  <input
                    name="time_minutes"
                    type="number"
                    min={0}
                    defaultValue={defaultValues?.time_minutes ?? 0}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-gray-900 text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    👥 Khẩu phần
                  </label>
                  <input
                    name="servings"
                    type="number"
                    min={0}
                    defaultValue={defaultValues?.servings ?? 0}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-gray-900 text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
          <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 opacity-50 blur-3xl" />

          <div className="relative space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white text-xl shadow-lg shadow-rose-500/30">
                🖼️
              </div>
              <h3 className="text-lg font-bold text-gray-900">Ảnh bìa</h3>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setImageSource("url")}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  imageSource === "url"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🔗 URL
              </button>
              <button
                type="button"
                onClick={() => setImageSource("upload")}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  imageSource === "upload"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📁 Upload
              </button>
            </div>

            {/* Gửi cho server biết đang chọn gì */}
            <input type="hidden" name="image_source" value={imageSource} />

            {/* URL Input */}
            {imageSource === "url" && (
              <div>
                <input
                  name="cover_image_url"
                  defaultValue={defaultValues?.cover_image_url ?? ""}
                  placeholder="https://example.com/image.jpg"
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                />
              </div>
            )}

            {/* File Upload */}
            {imageSource === "upload" && (
              <div>
                {/* CHỈ SỬA: có name="cover_file" để form gửi file */}
                <input
                  type="file"
                  name="cover_file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className="block w-full rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 text-center cursor-pointer
                         hover:border-indigo-400 hover:bg-indigo-50/50 transition group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                      📤
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {uploadedFile ? uploadedFile.name : "Chọn ảnh từ máy"}
                    </div>
                    <div className="text-xs text-gray-500">
                      PNG, JPG, GIF ≤ 10MB
                    </div>
                  </div>
                </label>
                {/* BỎ hidden input cover_image_file cũ đi */}
              </div>
            )}

            {/* Preview */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Preview
              </div>
              {coverPreview ? (
                <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-100 aspect-video">
                  <img
                    src={coverPreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={() => setCoverPreview(null)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverPreview(null);
                      setUploadedFile(null);
                    }}
                    className="absolute top-2 right-2 rounded-lg bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs text-white
                               opacity-0 group-hover:opacity-100 transition hover:bg-black/80"
                  >
                    ✕ Xóa
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2 opacity-20">🖼️</div>
                    <div className="text-sm text-gray-400">No preview</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 opacity-50 blur-3xl" />

          <div className="relative space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl shadow-lg shadow-amber-500/30">
                💡
              </div>
              <h3 className="text-lg font-bold text-gray-900">Mẹo nấu ăn</h3>
            </div>

            <textarea
              name="tips"
              defaultValue={defaultValues?.tips ?? ""}
              rows={5}
              placeholder="• Ướp gà với gừng nghiền 20 phút&#10;• Kho lửa nhỏ 25 phút cho thấm gia vị&#10;• Cho thêm sả để món ăn thơm hơn"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 -mx-6 -mb-6 border-t bg-white/95 backdrop-blur-sm px-6 py-4 rounded-b-3xl shadow-lg">
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-3 select-none group cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={defaultValues?.published ?? true}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-teal-500 transition-all shadow-inner" />
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition">
                Công khai ngay
              </span>
            </label>

            <SubmitButton label={submitText} />
          </div>
        </div>
      </form>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-bold text-white
                 hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {pending ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Đang lưu...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <path d="M17 21v-8H7v8M7 3v5h8" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
