"use client";

import { useEffect, useState } from "react";
import {
  listDishesClient as listDishes,
  listCategoriesClient,
} from "@/modules/dishes/service/dish.client";
import Carousel from "@/components/common/Carousel";
import SearchBar from "@/components/common/SearchBar";
import SideToc from "@/components/common/side-toc";
import DishGrid from "@/components/home/dish-grid";
import { Dish } from "@/modules/dishes/dish-public";
import { supabaseBrowser } from "@/libs/supabase/supabase-client"; // ⬅️ thêm

const PAGE_SIZE = 10;

export default function HomePage() {
  const [featuredDishes, setFeaturedDishes] = useState<Dish[]>([]);
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [nonVegDishes, setNonVegDishes] = useState<Dish[]>([]);
  const [vegDishes, setVegDishes] = useState<Dish[]>([]);
  const [totalAll, setTotalAll] = useState(0);
  const [totalVeg, setTotalVeg] = useState(0);
  const [totalNonVeg, setTotalNonVeg] = useState(0);
  const [pageAll, setPageAll] = useState(1);
  const [pageVeg, setPageVeg] = useState(1);
  const [pageNonVeg, setPageNonVeg] = useState(1);
  const [categories, setCategories] = useState<
    Array<{ id: string; slug: string; name: string; icon: string | null }>
  >([]);
  const [selectedCatId, setSelectedCatId] = useState<string | "all">("all");
  const [loading, setLoading] = useState(true);

  // ⬇️ NEW: trạng thái quyền Premium của user
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  const tocItems = [
    { id: "section-featured", label: "Đề xuất nổi bật" },
    { id: "section-all", label: "Tất cả món ăn" },
    { id: "section-nonveg", label: "Món mặn" },
    { id: "section-veg", label: "Món chay" },
  ];

  useEffect(() => {
    async function init() {
      const cats = await listCategoriesClient();
      setCategories(cats);
    }
    init();
  }, []);

  // ⬇️ NEW: kiểm tra user có Premium không (client-side, qua RLS)
  useEffect(() => {
    const sb = supabaseBrowser();
    async function checkPremium() {
      try {
        const {
          data: { user },
        } = await sb.auth.getUser();
        if (!user) {
          setHasPremiumAccess(false);
          return;
        }
        const { count, error } = await sb
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "PAID")
          .eq("plan_id", "premium");

        if (error) {
          // an toàn: không chặn UI nếu lỗi, coi như chưa có premium
          setHasPremiumAccess(false);
          return;
        }
        setHasPremiumAccess((count ?? 0) > 0);
      } catch {
        setHasPremiumAccess(false);
      }
    }
    checkPremium();
  }, []); // chạy 1 lần khi vào trang

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [featuredRes, allRes, vegRes, nonVegRes] = await Promise.all([
          listDishes({ sortBy: "created_at", pageSize: 10 }),
          listDishes({
            page: pageAll,
            pageSize: PAGE_SIZE,
            cat: selectedCatId !== "all" ? selectedCatId : undefined,
          }),
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
  }, [pageAll, pageVeg, pageNonVeg, selectedCatId]);

  const totalPagesAll = Math.ceil(totalAll / PAGE_SIZE);
  const totalPagesVeg = Math.ceil(totalVeg / PAGE_SIZE);
  const totalPagesNonVeg = Math.ceil(totalNonVeg / PAGE_SIZE);

  const selectedCatName =
    selectedCatId === "all"
      ? "Tất cả món ăn"
      : categories.find((c) => c.id === selectedCatId)?.name ?? "Tất cả món ăn";

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
              <p className="text-sm text-white/90 mt-1">
                {totalAll ?? 0} món ăn từ các đầu bếp tài năng
              </p>
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
              hasPremiumAccess={hasPremiumAccess}
            />

            {/* Tất cả món ăn */}
            <PaginatedSection
              id="section-all"
              icon="📚"
              title={selectedCatName} // ⬅️ hiển thị theo cate đang chọn (tuỳ chọn)
              desc="Khám phá toàn bộ bộ sưu tập"
              gradient="from-blue-50 via-indigo-50 to-purple-50"
              border="border-blue-300"
              dishes={allDishes}
              page={pageAll}
              totalPages={totalPagesAll}
              onPageChange={setPageAll}
              hasPremiumAccess={hasPremiumAccess}
              filters={
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedCatId("all");
                      setPageAll(1);
                    }}
                    className={`px-3 py-1.5 rounded-full border text-sm ${
                      selectedCatId === "all"
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-purple-300"
                    }`}
                  >
                    Tất cả
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCatId(c.id);
                        setPageAll(1);
                      }}
                      className={`px-3 py-1.5 rounded-full border text-sm flex items-center gap-1.5 ${
                        selectedCatId === c.id
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-purple-300"
                      }`}
                      title={c.slug}
                    >
                      <span className="text-base">{c.icon ?? "🍽️"}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              }
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
              hasPremiumAccess={hasPremiumAccess}
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
              hasPremiumAccess={hasPremiumAccess} // ⬅️ truyền xuống
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export type ReviewStatus = "pending" | "approved" | "rejected";

function Section({
  id,
  icon,
  title,
  desc,
  gradient,
  border,
  dishes,
  hasPremiumAccess,
}: {
  id: string;
  icon: string;
  title: string;
  desc: string;
  gradient: string;
  border: string;
  dishes: Array<{
    id?: string;
    slug: string;
    title: string;
    category_name?: string;
    diet?: string | null;
    time_minutes?: number | null;
    servings?: number | null;
    review_status?: ReviewStatus | null;
    video_url?: string | null;
    cover_image_url?: string | null;
    premium?: {
      active: boolean;
      required_plan: string;
      chef_id?: string;
    } | null; // ⬅️ thêm
  }>;
  hasPremiumAccess: boolean; // ⬅️ thêm
}) {
  return (
    <section id={id} className="scroll-mt-32">
      <div
        className={`bg-gradient-to-br ${gradient} border-2 ${border} rounded-2xl p-6 shadow-lg`}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{desc}</p>
          </div>
        </div>
        <DishGrid
          dishes={dishes as any}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
          hasPremiumAccess={hasPremiumAccess} // ⬅️ truyền
        />
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
  hasPremiumAccess,
  filters,
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
  hasPremiumAccess: boolean;
  filters?: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32">
      <div
        className={`bg-gradient-to-br ${gradient} border-2 ${border} rounded-2xl p-6 shadow-lg`}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{desc}</p>
          </div>
        </div>

        {filters ? <div className="mb-4">{filters}</div> : null}

        <DishGrid
          dishes={dishes as any}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
          hasPremiumAccess={hasPremiumAccess} // ⬅️ truyền
        />

        {/* Pagination */}
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span>Trước</span>
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5 shadow-sm"
          >
            <span>Sau</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
