"use client";

import React, { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

type Category = { id: string; name: string };
type IngredientOption = { id: string; name: string; unit: string | null };

const DIET_OPTIONS = [
  { value: "veg", label: "🥗 Vegetarian", icon: "🥗" },
  { value: "nonveg", label: "🍖 Non-Veg", icon: "🍖" },
  { value: "vegan", label: "🌱 Vegan", icon: "🌱" },
];

const VIDEO_MAX_MB = 200;

export default function DishForm({
  action,
  categories,
  defaultValues,
  submitText = "Lưu",
  ingredientOptions, // ⬅️ optional: truyền list nguyên liệu để chọn
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
    video_url: string | null;
    published: boolean;
    recipe_steps?: {
      step_no: number;
      content: string;
      image_url: string | null;
    }[];
    dish_ingredients?: {
      amount: string | null;
      note: string | null;
      ingredient: { id: string; name: string; unit: string | null };
    }[];
  }>;
  submitText?: string;
  ingredientOptions?: IngredientOption[];
}) {
  const [coverPreview, setCoverPreview] = useState<string | null>(
    defaultValues?.cover_image_url ?? null
  );
  const [imageSource, setImageSource] = useState<"url" | "upload">("url");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [videoSource, setVideoSource] = useState<"url" | "upload">("url");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(
    defaultValues?.video_url ?? null
  );
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);

  // ---------- NEW: state cho steps & ingredients ----------
  const [steps, setSteps] = useState<
    { step_no: number; content: string; image_url: string | null }[]
  >(
    (defaultValues?.recipe_steps ?? []).length
      ? [...(defaultValues?.recipe_steps ?? [])].sort(
          (a, b) => a.step_no - b.step_no
        )
      : [{ step_no: 1, content: "", image_url: null }]
  );

  const [ingredients, setIngredients] = useState<
    {
      ingredient_id?: string | null; // nếu có select
      ingredient_name?: string; // nếu không có select
      ingredient_unit?: string | null; // nếu không có select
      amount: string | null;
      note: string | null;
    }[]
  >(() => {
    if (defaultValues?.dish_ingredients?.length) {
      return defaultValues.dish_ingredients.map((di) => ({
        ingredient_id: di.ingredient?.id ?? null,
        ingredient_name: di.ingredient?.name,
        ingredient_unit: di.ingredient?.unit ?? null,
        amount: di.amount ?? "",
        note: di.note ?? "",
      }));
    }
    return [
      {
        ingredient_id: "",
        ingredient_name: "",
        ingredient_unit: "",
        amount: "",
        note: "",
      },
    ];
  });

  const hasIngredientCatalog = (ingredientOptions?.length ?? 0) > 0;

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

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > VIDEO_MAX_MB * 1024 * 1024) {
      alert(`Video quá lớn (> ${VIDEO_MAX_MB}MB)`);
      e.currentTarget.value = "";
      return;
    }
    setUploadedVideo(f);
    setVideoPreviewUrl(URL.createObjectURL(f));
  };

  const handleVideoUrlChange = (url: string) => {
    setVideoPreviewUrl(url || null);
    setUploadedVideo(null);
  };

  const handleUrlChange = (url: string) => {
    setCoverPreview(url || null);
    setUploadedFile(null);
  };

  // Helpers cho Steps
  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { step_no: prev.length + 1, content: "", image_url: null },
    ]);
  };
  const removeStep = (index: number) => {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, step_no: i + 1 }))
    );
  };
  const moveStep = (index: number, dir: -1 | 1) => {
    setSteps((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      // re-number
      return next.map((s, i) => ({ ...s, step_no: i + 1 }));
    });
  };

  // Helpers cho Ingredients
  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      {
        ingredient_id: hasIngredientCatalog ? "" : undefined,
        ingredient_name: hasIngredientCatalog ? undefined : "",
        ingredient_unit: hasIngredientCatalog ? undefined : "",
        amount: "",
        note: "",
      },
    ]);
  };
  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto w-full max-w-5xl lg:max-w-6xl">
      <form action={action} className="space-y-6" encType="multipart/form-data">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Time */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    ⏱️ <span>Thời gian (phút)</span>
                  </label>
                  <input
                    name="time_minutes"
                    type="number"
                    min={0}
                    defaultValue={defaultValues?.time_minutes ?? ""}
                    placeholder="VD: 30"
                    className="rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-gray-900 text-sm
                 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
                 placeholder:text-gray-400 transition w-full"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Tổng thời gian chế biến món ăn
                  </p>
                </div>

                {/* Servings */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    👥 <span>Khẩu phần (người)</span>
                  </label>
                  <input
                    name="servings"
                    type="number"
                    min={1}
                    defaultValue={defaultValues?.servings ?? ""}
                    placeholder="VD: 2"
                    className="rounded-xl border-2 border-gray-200 px-4 py-3 bg-white text-gray-900 text-sm
                 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400
                 placeholder:text-gray-400 transition w-full"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Số người ăn phù hợp cho món này
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload Section (giữ nguyên) */}
        {/* ... (NGUYÊN KHỐI ẢNH như bạn đã có ở trên, không đổi) ... */}

        {/* VIDEO SECTION (giữ nguyên) */}
        {/* ... (NGUYÊN KHỐI VIDEO như bạn đã có ở trên, không đổi) ... */}

        {/* ---------- NEW: Recipe Steps ---------- */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl shadow-lg">
              🍳
            </div>
            <h3 className="text-lg font-bold text-gray-900">Các bước nấu</h3>
          </div>

          <div className="space-y-4">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="rounded-2xl border bg-white p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-700">
                    Bước {s.step_no}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveStep(idx, -1)}
                      className="rounded-lg px-2 py-1 text-xs border hover:bg-gray-50"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(idx, +1)}
                      className="rounded-lg px-2 py-1 text-xs border hover:bg-gray-50"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="rounded-lg px-2 py-1 text-xs border text-rose-600 hover:bg-rose-50"
                    >
                      ✕ Xóa
                    </button>
                  </div>
                </div>

                {/* Hidden step_no */}
                <input
                  type="hidden"
                  name={`recipe_steps[${idx}][step_no]`}
                  value={s.step_no}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-gray-600">
                      Nội dung
                    </label>
                    <textarea
                      name={`recipe_steps[${idx}][content]`}
                      value={s.content}
                      onChange={(e) =>
                        setSteps((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, content: e.target.value } : it
                          )
                        )
                      }
                      rows={3}
                      placeholder="Mô tả chi tiết thao tác trong bước này…"
                      className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 bg-white text-gray-900 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-600">
                      Ảnh minh họa (URL)
                    </label>
                    <input
                      name={`recipe_steps[${idx}][image_url]`}
                      value={s.image_url ?? ""}
                      onChange={(e) =>
                        setSteps((prev) =>
                          prev.map((it, i) =>
                            i === idx
                              ? { ...it, image_url: e.target.value || null }
                              : it
                          )
                        )
                      }
                      placeholder="https://example.com/step.jpg"
                      className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 bg-white text-gray-900 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />
                    {s.image_url ? (
                      <div className="mt-2 rounded-lg overflow-hidden border">
                        <img
                          src={s.image_url}
                          alt={`step-${s.step_no}`}
                          className="w-full h-28 object-cover"
                          onError={() =>
                            setSteps((prev) =>
                              prev.map((it, i) =>
                                i === idx ? { ...it, image_url: null } : it
                              )
                            )
                          }
                        />
                      </div>
                    ) : (
                      <div className="mt-2 rounded-lg border-2 border-dashed text-xs text-gray-400 h-28 flex items-center justify-center">
                        No preview
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              ➕ Thêm bước
            </button>
          </div>
        </div>

        {/* ---------- NEW: Ingredients ---------- */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white text-xl shadow-lg">
              🧂
            </div>
            <h3 className="text-lg font-bold text-gray-900">Nguyên liệu</h3>
          </div>

          <div className="space-y-4">
            {ingredients.map((ing, idx) => (
              <div
                key={idx}
                className="rounded-2xl border bg-white p-4 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3"
              >
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold mb-1 text-gray-600">
                    Nguyên liệu
                  </label>

                  {hasIngredientCatalog ? (
                    <select
                      name={`dish_ingredients[${idx}][ingredient_id]`}
                      value={ing.ingredient_id ?? ""}
                      onChange={(e) =>
                        setIngredients((prev) =>
                          prev.map((it, i) =>
                            i === idx
                              ? { ...it, ingredient_id: e.target.value }
                              : it
                          )
                        )
                      }
                      className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    >
                      <option value="">— Chọn —</option>
                      {ingredientOptions!.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name} {opt.unit ? `(${opt.unit})` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="grid grid-cols-5 gap-2">
                      <input
                        name={`dish_ingredients[${idx}][ingredient_name]`}
                        value={ing.ingredient_name ?? ""}
                        onChange={(e) =>
                          setIngredients((prev) =>
                            prev.map((it, i) =>
                              i === idx
                                ? { ...it, ingredient_name: e.target.value }
                                : it
                            )
                          )
                        }
                        placeholder="Tên"
                        className="col-span-3 rounded-xl border-2 border-gray-200 px-3 py-2 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                      />
                      <input
                        name={`dish_ingredients[${idx}][ingredient_unit]`}
                        value={ing.ingredient_unit ?? ""}
                        onChange={(e) =>
                          setIngredients((prev) =>
                            prev.map((it, i) =>
                              i === idx
                                ? { ...it, ingredient_unit: e.target.value }
                                : it
                            )
                          )
                        }
                        placeholder="Đơn vị"
                        className="col-span-2 rounded-xl border-2 border-gray-200 px-3 py-2 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                      />
                    </div>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold mb-1 text-gray-600">
                    Lượng
                  </label>
                  <input
                    name={`dish_ingredients[${idx}][amount]`}
                    value={ing.amount ?? ""}
                    onChange={(e) =>
                      setIngredients((prev) =>
                        prev.map((it, i) =>
                          i === idx ? { ...it, amount: e.target.value } : it
                        )
                      )
                    }
                    placeholder="vd: 2 muỗng"
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold mb-1 text-gray-600">
                    Ghi chú
                  </label>
                  <input
                    name={`dish_ingredients[${idx}][note]`}
                    value={ing.note ?? ""}
                    onChange={(e) =>
                      setIngredients((prev) =>
                        prev.map((it, i) =>
                          i === idx ? { ...it, note: e.target.value } : it
                        )
                      )
                    }
                    placeholder="vd: băm nhỏ / để lạnh"
                    className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                </div>

                <div className="sm:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={() => removeIngredient(idx)}
                    className="w-full rounded-lg px-3 py-2 text-xs border text-rose-600 hover:bg-rose-50"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addIngredient}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              ➕ Thêm nguyên liệu
            </button>
          </div>
        </div>

        {/* Tips Section (giữ nguyên) */}
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

        {/* Actions (giữ nguyên) */}
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
