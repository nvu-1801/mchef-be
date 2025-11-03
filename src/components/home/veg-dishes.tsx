// components/dishes/veg-dishes.tsx
import Link from "next/link";
import DishGrid, { type DishCard } from "@/components/home/dish-grid";
import { listDishes } from "@/modules/dishes/service/dish.service";

export const revalidate = 60;

type Props = {
  /** trang hiện tại cho khu vực món chay (đọc từ searchParams.vegPage) */
  page?: number;
  /** số item mỗi trang */
  pageSize?: number;
  /** nếu muốn lọc theo ô tìm kiếm hiện có */
  q?: string;
};

type DishItem = {
  id: string;
  slug: string;
  title: string;
  category_name?: string | null;
  time_minutes?: number | null;
  servings?: number | null;
  diet?: string | null;
  cover_image_url?: string | null;
  [k: string]: unknown;
};

export default async function VegDishesSection({
  page = 1,
  pageSize = 12,
  q = "",
}: Props) {
  // Lấy rộng 1 lần để lọc (tùy dữ liệu của bạn có thể đổi sang truy vấn có điều kiện ở DB)
  const { items = [] } = await listDishes({
    q,
    page: 1,
    pageSize: 48,
  });

  const itemsTyped = items as unknown as DishItem[];

  const veg = itemsTyped.filter((d) => {
    const v = String(d?.diet ?? "").toLowerCase();
    const status = String(d?.review_status ?? "").toLowerCase();
    return (
      (v === "veg" || v === "vegetarian" || v === "vegan") &&
      status === "approved"
    );
  });

  // Phân trang phía server cho danh sách chay đã lọc
  const total = veg.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(Math.max(1, page), pageCount);
  const start = (clampedPage - 1) * pageSize;
  const show = veg.slice(start, start + pageSize);

  const dishes: DishCard[] = show.map((d) => ({
    id: String(d.id),
    slug: String(d.slug),
    title: String(d.title),
    category_name: d.category_name ?? undefined,
    time_minutes: typeof d.time_minutes === "number" ? d.time_minutes : null,
    servings: typeof d.servings === "number" ? d.servings : null,
    diet: (d.diet ?? null) as string | null,
    review_status: (d as any).review_status ?? null,
    video_url: (d as any).video_url ?? null,
    cover_image_url: (d as any).cover_image_url ?? null,
    images: (d as any).images ?? null,
  }));

  const buildHref = (p: number) => {
    const usp = new URLSearchParams();
    if (q) usp.set("q", q);
    usp.set("vegPage", String(p));
    return `/home?${usp.toString()}`;
  };

  return (
    <section aria-labelledby="veg-title" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id="veg-title" className="text-base sm:text-lg font-semibold">
          Món chay gợi ý
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:inline">
            {total} món
          </span>
          <Link
            href={{ pathname: "/home", query: { cat: "veg", page: 1 } }}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            Xem tất cả
          </Link>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-3 sm:p-4">
        <DishGrid
          dishes={dishes}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
          itemClassName="h-full"
          hrefBuilder={(d) => `/home/${d.slug}`}
        />

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-center gap-2">
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

          <div className="px-3 py-1 text-sm text-gray-700">
            Trang {clampedPage} / {pageCount}
          </div>

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
      </div>
    </section>
  );
}
