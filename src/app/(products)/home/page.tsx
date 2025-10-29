// app/home/page.tsx
import Link from "next/link";
import {
  listDishes,
  listCategories,
} from "@/modules/dishes/service/dish.service";
import VegDishesSection from "@/components/dishes/veg-dishes";
import DishGrid from "@/components/dishes/dish-grid";
import SideToc from "@/components/common/side-toc";
import Carousel from "@/components/common/Carousel";
import SearchBar from "@/components/common/SearchBar";

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
  const PAGE_SIZE = 12;

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
        className={`group relative px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
          isActive
            ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30"
            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-violet-300 hover:shadow-sm"
        }`}
      >
        {isActive && (
          <span className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" />
        )}
        <span className="relative">{label}</span>
      </Link>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Carousel */}
        <div className="mb-8">
          <Carousel />
        </div>

        {/* Search + Header */}
        <div className="mb-6">
          <SearchBar />
        </div>

        {/* Header with gradient */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-50 via-fuchsia-50 to-pink-50 border border-violet-100 p-8 shadow-sm">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-violet-200 to-fuchsia-200 opacity-30 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 opacity-30 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-3xl text-white shadow-lg shadow-violet-500/30">
              🍽️
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-fuchsia-900 bg-clip-text text-transparent">
                Khám phá món ăn
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {total ?? 0} món ăn từ các đầu bếp tài năng
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs - Sticky */}
        <div className="sticky top-28 z-40 px-8 sm:-mx-6 lg:-mx-8 mb-8 rounded-3xl ">
          <div className="bg-white/95 backdrop-blur-xl border-y border-gray-200 shadow-sm rounded-3xl">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-4">
                {/* Scrollable tabs */}
                <div className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="flex gap-2 pb-1">
                    {Tab("Tất cả", "all")}
                    {cats.map((c) => Tab(c.name, c.slug))}
                  </div>
                </div>

                {/* Page info */}
                <div className="hidden lg:flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 12h18M3 6h18M3 18h18" />
                    </svg>
                    <span className="font-medium text-gray-700">
                      {total ?? 0}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Trang{" "}
                    <span className="font-semibold text-gray-900">{page}</span>{" "}
                    / {totalPages}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-48">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-violet-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Nội dung
                </h3>
                <SideToc
                  items={[
                    { id: "section-all", label: "Tất cả món" },
                    { id: "section-veg", label: "Món chay nổi bật" },
                  ]}
                  offset={144}
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="min-w-0 space-y-12">
            {/* Dish Grid Section */}
            <section id="section-all" className="scroll-mt-36">
              <DishGrid
                dishes={dishItems}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                itemClassName="h-full"
              />

              {/* Modern Pagination */}
              {totalPages > 1 && (
                <nav className="mt-10 flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-white border border-gray-200 p-2 shadow-sm">
                    {/* Previous */}
                    <Link
                      href={{
                        pathname: "/home",
                        query: makeQuery({ page: Math.max(1, page - 1) }),
                      }}
                      className={`group flex items-center justify-center h-10 px-4 rounded-xl text-sm font-medium transition ${
                        page === 1
                          ? "pointer-events-none opacity-40 cursor-not-allowed text-gray-400"
                          : "text-gray-700 hover:bg-violet-50 hover:text-violet-700"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                      Trước
                    </Link>

                    {/* Page numbers - compact on mobile */}
                    <div className="flex items-center gap-1">
                      {/* Mobile: show current/total */}
                      <div className="sm:hidden px-3 py-2 text-sm font-medium text-gray-700">
                        {page} / {totalPages}
                      </div>

                      {/* Desktop: show page buttons */}
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: totalPages })
                          .map((_, i) => i + 1)
                          .filter((p) => {
                            if (totalPages <= 7) return true;
                            if (p === 1 || p === totalPages) return true;
                            if (p >= page - 1 && p <= page + 1) return true;
                            return false;
                          })
                          .map((p, i, arr) => {
                            const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                            return (
                              <div key={p} className="flex items-center gap-1">
                                {showEllipsis && (
                                  <span className="px-2 text-gray-400">
                                    •••
                                  </span>
                                )}
                                <Link
                                  href={{
                                    pathname: "/home",
                                    query: makeQuery({ page: p }),
                                  }}
                                  className={`flex items-center justify-center h-10 min-w-[40px] px-3 rounded-xl text-sm font-medium transition ${
                                    p === page
                                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30"
                                      : "text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  {p}
                                </Link>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Next */}
                    <Link
                      href={{
                        pathname: "/home",
                        query: makeQuery({
                          page: Math.min(totalPages, page + 1),
                        }),
                      }}
                      className={`group flex items-center justify-center h-10 px-4 rounded-xl text-sm font-medium transition ${
                        page === totalPages
                          ? "pointer-events-none opacity-40 cursor-not-allowed text-gray-400"
                          : "text-gray-700 hover:bg-violet-50 hover:text-violet-700"
                      }`}
                    >
                      Sau
                      <svg
                        className="w-4 h-4 ml-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Link>
                  </div>
                </nav>
              )}
            </section>

            {/* Veg Section */}
            <section
              id="section-veg"
              className="scroll-mt-36"
              aria-labelledby="veg-heading"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-100 p-8 shadow-sm">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 opacity-30 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-2xl text-white shadow-lg shadow-emerald-500/30">
                        🌱
                      </div>
                      <div>
                        <h2
                          id="veg-heading"
                          className="text-2xl font-bold text-gray-900"
                        >
                          Món chay nổi bật
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          Khám phá các món chay tốt cho sức khỏe
                        </p>
                      </div>
                    </div>

                    <Link
                      href={{
                        pathname: "/home",
                        query: { ...makeQuery(), cat: "veg", page: 1 },
                      }}
                      className="group hidden sm:inline-flex items-center gap-2 rounded-xl bg-white border border-emerald-200 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition shadow-sm"
                    >
                      Xem tất cả
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  <div className="relative rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 p-4 shadow-sm">
                    <VegDishesSection
                      page={Number(vegPage) || 1}
                      pageSize={12}
                      q={q}
                    />
                  </div>

                  {/* Mobile "View all" button */}
                  <Link
                    href={{
                      pathname: "/home",
                      query: { ...makeQuery(), cat: "veg", page: 1 },
                    }}
                    className="sm:hidden mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30"
                  >
                    Xem tất cả món chay
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
