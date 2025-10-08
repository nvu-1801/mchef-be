// components/dishes/veg-dishes.tsx
import Link from "next/link";
import DishGrid, { type DishCard } from "@/components/dishes/dish-grid";
import { listDishes, dishImageUrl } from "@/modules/dishes/service/dish.service";

export const revalidate = 60;

type Props = {
  /** trang hiện tại cho khu vực món chay (đọc từ searchParams.vegPage) */
  page?: number;
  /** số item mỗi trang */
  pageSize?: number;
  /** nếu muốn lọc theo ô tìm kiếm hiện có */
  q?: string;
};

export default async function VegDishesSection({
  page = 1,
  pageSize = 12,
  q = "",
}: Props) {
  // Lấy rộng 1 lần để lọc (tùy dữ liệu của bạn có thể đổi sang truy vấn có điều kiện ở DB)
  const { items = [] } = await listDishes({ q, cat: "all", page: 1, pageSize: 48 });

  // Lọc món chay
  const veg = (items as any[]).filter((d) => {
    const v = String(d?.diet ?? "").toLowerCase();
    return v === "veg" || v === "vegetarian" || v === "vegan";
  });

  if (!veg.length) return null;

  // Phân trang phía server cho danh sách chay đã lọc
  const total = veg.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(Math.max(1, page), pageCount);
  const start = (clampedPage - 1) * pageSize;
  const show = veg.slice(start, start + pageSize);

  // Map sang DishCard để dùng lại DishGrid
  const dishes: DishCard[] = show.map((d: any) => ({
    id: d.id,
    slug: d.slug,
    title: d.title,
    category_name: d.category_name,
    time_minutes: d.time_minutes ?? null,
    servings: d.servings ?? null,
    // các field ảnh mà dishImageUrl cần
    ...d,
  }));

  const buildHref = (p: number) => {
    // Giữ nguyên /home và q nếu bạn muốn; ở đây mình chỉ thêm vegPage
    const usp = new URLSearchParams();
    if (q) usp.set("q", q);
    usp.set("vegPage", String(p));
    return { pathname: "/home", query: Object.fromEntries(usp) as any };
  };

  return (
    <section aria-labelledby="veg-title" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id="veg-title" className="text-base font-semibold">Món chay gợi ý</h2>
        <span className="text-sm text-gray-500">{total} món</span>
      </div>

      <DishGrid dishes={dishes} />

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <Link
          href={buildHref(Math.max(1, clampedPage - 1))}
          aria-disabled={clampedPage === 1}
          className={`px-3 py-1.5 rounded-lg border text-sm ${
            clampedPage === 1
              ? "pointer-events-none opacity-50"
              : "hover:bg-gray-50"
          }`}
        >
          « Trước
        </Link>
        <span className="text-sm text-gray-600">
          Trang {clampedPage} / {pageCount}
        </span>
        <Link
          href={buildHref(Math.min(pageCount, clampedPage + 1))}
          aria-disabled={clampedPage === pageCount}
          className={`px-3 py-1.5 rounded-lg border text-sm ${
            clampedPage === pageCount
              ? "pointer-events-none opacity-50"
              : "hover:bg-gray-50"
          }`}
        >
          Sau »
        </Link>
      </div>
    </section>
  );
}
