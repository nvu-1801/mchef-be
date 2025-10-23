"use client";

import React, { useState } from "react";
import { useFormStatus } from "react-dom";

type Category = { id: string; name: string };

const DIET_OPTIONS = [
  { value: "veg", label: "Vegetarian" },
  { value: "nonveg", label: "Non-Veg" },
  { value: "vegan", label: "Vegan" },
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
  // cover preview state for better UX on mobile
  const [coverPreview, setCoverPreview] = useState<string | null>(
    defaultValues?.cover_image_url ?? null
  );

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
        {/* top gradient line */}
        <div className="h-1 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500" />

        <form action={action} className="p-4 sm:p-6 space-y-5">
          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">
              Tiêu đề
            </label>
            <input
              name="title"
              defaultValue={defaultValues?.title ?? ""}
              placeholder="Ví dụ: Gà kho gừng"
              required
              className="w-full rounded-xl border px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Tên món hấp dẫn sẽ thu hút người xem hơn.
            </p>
          </div>

          {/* Danh mục + Diet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800">
                Danh mục
              </label>
              <select
                name="category_id"
                defaultValue={defaultValues?.category_id ?? ""}
                className="w-full rounded-xl border px-3 py-2 bg-white text-gray-900 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              >
                <option value="">— Không chọn —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800">
                Chế độ ăn (diet)
              </label>
              <select
                name="diet"
                defaultValue={defaultValues?.diet ?? ""}
                className="w-full rounded-xl border px-3 py-2 bg-white text-gray-900 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              >
                <option value="">— Không đặt —</option>
                {DIET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ảnh bìa + preview (responsive) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-800">
                Ảnh bìa (URL)
              </label>
              <input
                name="cover_image_url"
                defaultValue={defaultValues?.cover_image_url ?? ""}
                placeholder="https://..."
                onInput={(e) =>
                  setCoverPreview((e.target as HTMLInputElement).value || null)
                }
                className="w-full rounded-xl border px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Đặt đường dẫn tới ảnh bìa hoặc để trống để dùng ảnh mặc định.
              </p>
            </div>

            <div className="flex items-center justify-center sm:justify-end">
              {coverPreview ? (
                // responsive preview box
                <div className="w-full max-w-[160px] rounded-lg overflow-hidden border bg-gray-50">
                  {/* maintain aspect ratio */}
                  <div className="aspect-[4/3] bg-gray-100">
                    <img
                      src={coverPreview}
                      alt="cover preview"
                      className="w-full h-full object-cover"
                      onError={() => setCoverPreview(null)}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-[160px] rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center text-xs text-gray-400 p-4">
                  No preview
                </div>
              )}
            </div>
          </div>

          {/* Thời gian + Khẩu phần */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800">
                Thời gian (phút)
              </label>
              <input
                name="time_minutes"
                type="number"
                min={0}
                defaultValue={defaultValues?.time_minutes ?? 0}
                className="w-full rounded-xl border px-3 py-2 bg-white text-gray-900 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800">
                Khẩu phần
              </label>
              <input
                name="servings"
                type="number"
                min={0}
                defaultValue={defaultValues?.servings ?? 0}
                className="w-full rounded-xl border px-3 py-2 bg-white text-gray-900 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tips */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">
              Mẹo / tips
            </label>
            <textarea
              name="tips"
              defaultValue={defaultValues?.tips ?? ""}
              rows={4}
              placeholder="- Ướp 20 phút...\n- Kho lửa nhỏ 25 phút..."
              className="w-full rounded-xl border px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          {/* Published */}
          <label className="inline-flex items-center gap-2 select-none">
            <input
              type="checkbox"
              name="published"
              defaultChecked={defaultValues?.published ?? true}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-800">Công khai</span>
          </label>

          {/* actions sticky on small screens, static on sm+ */}
          <div className="sticky bottom-0 -mx-4 mt-2 border-t bg-white/90 backdrop-blur py-3 sm:static sm:mt-6 sm:rounded-b-lg">
            <div className="flex items-center justify-end max-w-2xl mx-auto px-4 sm:px-0">
              <SubmitButton label={submitText} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white
                 hover:from-indigo-600/95 hover:to-violet-600/95 disabled:opacity-50 shadow-sm text-sm"
    >
      {pending ? "Đang lưu..." : label}
    </button>
  );
}
