"use client";

import { useEffect, useState } from "react";

type ProductInput = {
  name: string;
  slug: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  status: "DRAFT" | "ACTIVE" | "HIDDEN";
  categoryId?: string | null;
};

type Product = ProductInput & { id: string };

type Props = {
  initial?: Product;
  onClose: () => void;
  onSaved: () => void;
};

export default function ProductForm({ initial, onClose, onSaved }: Props) {
  const isEdit = !!initial;
  const [form, setForm] = useState<ProductInput>({
    name: "",
    slug: "",
    price: 0,
    stock: 0,
    imageUrl: "",
    status: "DRAFT",
    categoryId: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      const { id, ...rest } = initial;
      setForm({ ...rest });
    }
  }, [initial]);

  const submit = async () => {
    setSaving(true);
    setError(null);
    const endpoint = isEdit
      ? `/api/admin/products/${(initial as Product).id}`
      : "/api/admin/products";
    const method = isEdit ? "PUT" : "POST";
    const r = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j?.message || "Save failed");
      setSaving(false);
      return;
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Product" : "New Product"}
          </h2>
          <button onClick={onClose} className="px-2 py-1 rounded-lg hover:bg-gray-100">✕</button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border px-3 py-2 rounded-md w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="border px-3 py-2 rounded-md w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">Price (VND)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="border px-3 py-2 rounded-md w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Stock</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="border px-3 py-2 rounded-md w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">Image URL</label>
            <input
              value={form.imageUrl ?? ""}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="border px-3 py-2 rounded-md w-full"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="border px-3 py-2 rounded-md w-full"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="HIDDEN">HIDDEN</option>
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm text-gray-600">Category ID (optional)</label>
            <input
              value={form.categoryId ?? ""}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value || null })}
              className="border px-3 py-2 rounded-md w-full"
              placeholder="uuid của Category"
            />
          </div>
        </div>

        {error && <div className="px-4 pb-2 text-red-600 text-sm">{error}</div>}

        <div className="p-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
