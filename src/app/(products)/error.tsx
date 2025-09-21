"use client";

export default function ProductsError({ error, reset }: { error: Error; reset: () => void }) {
  // hiển thị lỗi đẹp + nút thử lại
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-xl font-semibold mb-3">Đã có lỗi xảy ra</h1>
      <p className="text-sm text-gray-600 mb-6">{error.message}</p>
      <button className="px-4 py-2 rounded bg-black text-white" onClick={() => reset()}>
        Thử lại
      </button>
    </div>
  );
}
