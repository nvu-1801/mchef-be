// app/home/page.tsx
import Link from "next/link";
import {
  listDishes,
  listCategories,
} from "@/modules/dishes/service/dish.service";
import VegDishesSection from "@/components/dishes/veg-dishes";
import DishGrid from "@/components/dishes/dish-grid";
import SideToc from "@/components/common/side-toc";

export const revalidate = 60;

type Search = { q?: string; cat?: string; page?: string; vegPage?: string };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const {
    q = "",
    cat = "all",
    page: pageStr = "1",
    vegPage = "1",
  } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const PAGE_SIZE = 12; // 6 cột * 2 hàng ở xl

  const cats = (await listCategories()) as { name: string; slug: string }[];

  const { items: dishItems, total } = await listDishes({
    q,
    cat,
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE));

  const makeQuery = (
    overrides: Record<string, string | number | undefined> = {}
  ) => {
    const query: Record<string, string> = {};
    if (q) query.q = q;
    if (cat && cat !== "all") query.cat = cat;
    if (overrides.page !== undefined) query.page = String(overrides.page);
    return query;
  };

  const Tab = (label: string, key: string) => {
    const isActive = (cat || "all") === key;
    return (
      <Link
        key={key}
        href={{
          pathname: "/home",
          query: makeQuery({
            page: 1,
            ...(key !== "all" ? { cat: key } : { cat: undefined }),
          }),
        }}
        className={`px-3 py-1.5 rounded-full text-sm border transition whitespace-nowrap
          ${
            isActive
              ? "bg-black text-white border-black"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
      >
        {label}
      </Link>
    );
  };

  return (
    // mở rộng chiều rộng layout
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Món ăn</h1>
      </div>

      {/* Tabs filter */}
      <div className="sticky top-27 z-30 -mx-4 px-4 py-4 mb-6 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b">
        <div className="flex items-center gap-2 overflow-x-auto">
          {Tab("Tất cả", "all")}
          {cats.map((c) => Tab(c.name, c.slug))}
        </div>
      </div>

      {/* ===== Layout 2 cột: TOC trái + nội dung phải ===== */}
      <div className="grid grid-cols-1 md:grid-cols-[18%_82%] gap-6">
        {/* Sidebar TOC (sticky) */}
        <SideToc
          items={[
            { id: "section-all", label: "Tất cả món" },
            { id: "section-veg", label: "Món chay nổi bật" },
          ]}
          offset={112}
        />

        {/* Content */}
        <div className="min-w-0">
          {/* Grid chính */}
          <section id="section-all" className="scroll-mt-28">
            <DishGrid
              dishes={dishItems}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
              itemClassName="h-full"
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-2">
                <Link
                  href={{
                    pathname: "/home",
                    query: makeQuery({ page: Math.max(1, page - 1) }),
                  }}
                  aria-disabled={page === 1}
                  className={`px-3 py-1.5 rounded border text-sm ${
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  Trước
                </Link>

                {Array.from({ length: totalPages })
                  .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                  .map((_, i) => {
                    const p = Math.max(1, page - 2) + i;
                    return (
                      <Link
                        key={p}
                        href={{
                          pathname: "/home",
                          query: makeQuery({ page: p }),
                        }}
                        className={`px-3 py-1.5 rounded border text-sm ${
                          p === page
                            ? "bg-black text-white border-black"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}

                <Link
                  href={{
                    pathname: "/home",
                    query: makeQuery({ page: Math.min(totalPages, page + 1) }),
                  }}
                  aria-disabled={page === totalPages}
                  className={`px-3 py-1.5 rounded border text-sm ${
                    page === totalPages
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  Sau
                </Link>
              </nav>
            )}
          </section>

          {/* Veg section */}
          <section
            id="section-veg"
            className="mt-12 scroll-mt-28"
            aria-labelledby="veg-heading"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-purple-300/70 to-transparent" />
            <div className="mt-6 flex items-baseline justify-between">
              <h2
                id="veg-heading"
                className="text-xl font-semibold text-gray-900"
              >
                Món chay nổi bật
              </h2>
              <Link
                href={{
                  pathname: "/home",
                  query: { ...makeQuery(), cat: "veg", page: 1 },
                }}
                className="text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50/60 p-4 sm:p-5">
              <VegDishesSection
                page={Number(vegPage) || 1}
                pageSize={12}
                q={q}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
