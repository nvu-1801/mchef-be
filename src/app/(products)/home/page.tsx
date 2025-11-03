"use client";

import { useEffect, useState } from "react";
import { listDishesClient as listDishes } from "@/modules/dishes/service/dish.client";
import Carousel from "@/components/common/Carousel";
import SearchBar from "@/components/common/SearchBar";
import SideToc from "@/components/common/side-toc";
import DishGrid from "@/components/dishes/dish-grid";
import { Dish } from "@/modules/dishes/dish-public";

const PAGE_SIZE = 10;

export default function HomePage() {
  const [featuredDishes, setFeaturedDishes] = useState<Dish[]>([]);

  // Dữ liệu cho từng loại section
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [nonVegDishes, setNonVegDishes] = useState<Dish[]>([]);
  const [vegDishes, setVegDishes] = useState<Dish[]>([]);

  // Tổng số lượng
  const [totalAll, setTotalAll] = useState(0);
  const [totalVeg, setTotalVeg] = useState(0);
  const [totalNonVeg, setTotalNonVeg] = useState(0);

  // Trang hiện tại từng loại
  const [pageAll, setPageAll] = useState(1);
  const [pageVeg, setPageVeg] = useState(1);
  const [pageNonVeg, setPageNonVeg] = useState(1);

  const [loading, setLoading] = useState(true);

  const tocItems = [
    { id: "section-featured", label: "Đề xuất nổi bật" },
    { id: "section-all", label: "Tất cả món ăn" },
    { id: "section-nonveg", label: "Món mặn" },
    { id: "section-veg", label: "Món chay" },
  ];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [featuredRes, allRes, vegRes, nonVegRes] = await Promise.all([
          listDishes({ sortBy: "created_at", pageSize: 10 }),
          listDishes({ page: pageAll, pageSize: PAGE_SIZE }),
          listDishes({ page: pageVeg, pageSize: PAGE_SIZE, diet: "veg" }),
          listDishes({ page: pageNonVeg, pageSize: PAGE_SIZE, diet: "nonveg" }),
        ]);

        setFeaturedDishes(featuredRes.items);
        setAllDishes(allRes.items);
        setTotalAll(allRes.total);
        setVegDishes(vegRes.items);
        setTotalVeg(vegRes.total);
        setNonVegDishes(nonVegRes.items);
        setTotalNonVeg(nonVegRes.total);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [pageAll, pageVeg, pageNonVeg]);

  const totalPagesAll = Math.ceil(totalAll / PAGE_SIZE);
  const totalPagesVeg = Math.ceil(totalVeg / PAGE_SIZE);
  const totalPagesNonVeg = Math.ceil(totalNonVeg / PAGE_SIZE);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Carousel */}
        <div className="mb-6">
          <Carousel />
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar />
        </div>

        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl border-2 border-purple-300 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
              🍽️
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Khám phá món ăn</h1>
              <p className="text-sm text-white/90 mt-1">{totalAll ?? 0} món ăn từ các đầu bếp tài năng</p>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-4 shadow-lg">
                <SideToc items={tocItems} offset={100} />
              </div>
            </div>
          </aside>

          <div className="space-y-8">
            {/* Đề xuất nổi bật */}
            <Section
              id="section-featured"
              icon="⭐"
              title="Đề xuất nổi bật"
              desc="Món ăn được đánh giá và yêu thích nhất"
              gradient="from-amber-50 via-orange-50 to-yellow-50"
              border="border-amber-300"
              dishes={featuredDishes}
            />

            {/* Tất cả món ăn */}
            <PaginatedSection
              id="section-all"
              icon="📚"
              title="Tất cả món ăn"
              desc="Khám phá toàn bộ bộ sưu tập"
              gradient="from-blue-50 via-indigo-50 to-purple-50"
              border="border-blue-300"
              dishes={allDishes}
              page={pageAll}
              totalPages={totalPagesAll}
              onPageChange={setPageAll}
            />

            {/* Món mặn */}
            <PaginatedSection
              id="section-nonveg"
              icon="🍖"
              title="Món mặn"
              desc="Các món mặn hấp dẫn"
              gradient="from-red-50 via-rose-50 to-pink-50"
              border="border-red-300"
              dishes={nonVegDishes}
              page={pageNonVeg}
              totalPages={totalPagesNonVeg}
              onPageChange={setPageNonVeg}
            />

            {/* Món chay */}
            <PaginatedSection
              id="section-veg"
              icon="🌱"
              title="Món chay"
              desc="Lựa chọn chay lành mạnh"
              gradient="from-green-50 via-emerald-50 to-teal-50"
              border="border-green-300"
              dishes={vegDishes}
              page={pageVeg}
              totalPages={totalPagesVeg}
              onPageChange={setPageVeg}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({
  id,
  icon,
  title,
  desc,
  gradient,
  border,
  dishes,
}: {
  id: string;
  icon: string;
  title: string;
  desc: string;
  gradient: string;
  border: string;
  dishes: Dish[];
}) {
  return (
    <section id={id} className="scroll-mt-32">
      <div className={`bg-gradient-to-br ${gradient} border-2 ${border} rounded-2xl p-6 shadow-lg`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{desc}</p>
          </div>
        </div>
        <DishGrid dishes={dishes} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" />
      </div>
    </section>
  );
}

function PaginatedSection({
  id,
  icon,
  title,
  desc,
  gradient,
  border,
  dishes,
  page,
  totalPages,
  onPageChange,
}: {
  id: string;
  icon: string;
  title: string;
  desc: string;
  gradient: string;
  border: string;
  dishes: Dish[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  return (
    <section id={id} className="scroll-mt-32">
      <div className={`bg-gradient-to-br ${gradient} border-2 ${border} rounded-2xl p-6 shadow-lg`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{desc}</p>
          </div>
        </div>

        <DishGrid dishes={dishes} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" />

        {/* Nút chuyển trang - Style 3: Classic Simple */}
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span>Trước</span>
          </button>
          
          <div className="px-4 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg">
            <span className="text-gray-700 font-medium text-sm">
              {page} / {totalPages || 1}
            </span>
          </div>
          
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5 shadow-sm"
          >
            <span>Sau</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
