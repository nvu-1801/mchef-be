"use client";

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
  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Tiêu đề</label>
        <input
          name="title"
          defaultValue={defaultValues?.title ?? ""}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Ví dụ: Gà kho gừng"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Danh mục</label>
          <select
            name="category_id"
            defaultValue={defaultValues?.category_id ?? ""}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">— Không chọn —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Chế độ ăn (diet)</label>
          <select
            name="diet"
            defaultValue={defaultValues?.diet ?? ""}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">— Không đặt —</option>
            {DIET_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ảnh bìa (URL)</label>
        <input
          name="cover_image_url"
          defaultValue={defaultValues?.cover_image_url ?? ""}
          className="w-full border rounded-md px-3 py-2"
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Thời gian (phút)</label>
          <input
            name="time_minutes"
            type="number"
            min={0}
            defaultValue={defaultValues?.time_minutes ?? 0}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Khẩu phần</label>
          <input
            name="servings"
            type="number"
            min={0}
            defaultValue={defaultValues?.servings ?? 0}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mẹo / tips</label>
        <textarea
          name="tips"
          defaultValue={defaultValues?.tips ?? ""}
          className="w-full border rounded-md px-3 py-2"
          rows={4}
          placeholder="- Ướp 20 phút...\n- Kho lửa nhỏ 25 phút..."
        />
      </div>

      <label className="inline-flex items-center gap-2">
        <input type="checkbox" name="published" defaultChecked={defaultValues?.published ?? true} />
        <span className="text-sm">Công khai</span>
      </label>

      <div className="pt-2">
        <SubmitButton label={submitText} />
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-50"
    >
      {pending ? "Đang lưu..." : label}
    </button>
  );
}
