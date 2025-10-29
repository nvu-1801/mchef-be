// components/common/SearchBar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const qParam = sp.get("q") ?? "";
  const catParam = sp.get("cat") ?? "all";
  const [q, setQ] = useState(qParam);

  useEffect(() => {
    // đồng bộ khi back/forward
    setQ(qParam);
  }, [qParam]);

  const hasQuery = q.trim().length > 0;

  const buildUrl = useMemo(
    () => (next: { q?: string; cat?: string; page?: number }) => {
      const params = new URLSearchParams(sp.toString());
      // q
      if (typeof next.q === "string") {
        const val = next.q.trim();
        if (val) params.set("q", val);
        else params.delete("q");
      }
      // cat
      if (typeof next.cat === "string") {
        if (next.cat && next.cat !== "all") params.set("cat", next.cat);
        else params.delete("cat");
      }
      // page => reset về 1 khi search/clear
      params.set("page", String(next.page ?? 1));
      return `${pathname}?${params.toString()}`;
    },
    [pathname, sp]
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl({ q, cat: catParam, page: 1 }));
  }

  function onClear() {
    setQ("");
    router.push(buildUrl({ q: "", cat: catParam, page: 1 }));
  }

  function onResetAll() {
    // reset toàn bộ: q="", cat="all", page=1
    setQ("");
    const params = new URLSearchParams(sp.toString());
    params.delete("q");
    params.delete("cat");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full items-center gap-2">
      <div className="relative w-full">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm món ăn, nguyên liệu, đầu bếp…"
          className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 pr-20 text-sm shadow-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
        />
        {/* nút clear trong input */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {hasQuery && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              title="Xoá từ khoá"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-2 text-xs font-bold text-white shadow-md hover:brightness-110"
            title="Tìm kiếm"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-3.5-3.5" />
            </svg>
            Tìm
          </button>
        </div>
      </div>

      {/* nút Reset toàn bộ lọc */}
      <button
        type="button"
        onClick={onResetAll}
        className="hidden sm:inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        title="Đặt lại bộ lọc"
      >
        Đặt lại
      </button>
    </form>
  );
}
