import Link from "next/link";
import {
  listDishes,
  dishImageUrl,
  listCategories,
} from "@/modules/dishes/service/dish.service";

export const revalidate = 60;

type Search = { q?: string; cat?: string };

export default async function HomePage({
  searchParams,
}: {
  // Next 15: searchParams là Promise
  searchParams: Promise<Search>;
}) {
  const { q = "", cat = "all" } = await searchParams;

  // Tabs categories (đọc động từ DB)
  const cats = await listCategories();
  const dishes = await listDishes({ q, cat });

  const Tab = (label: string, key: string) => {
    const isActive = (cat || "all") === key;
    const query: Record<string, string> = {};
    if (q) query.q = q;
    if (key !== "all") query.cat = key;

    return (
      <Link
        key={key}
        href={{ pathname: "/home", query }}
        className={`px-3 py-1.5 rounded-full text-sm border transition
          ${isActive ? "bg-black text-white border-black" : "bg-white text-gray-700 hover:bg-gray-50"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Món ăn</h1>
      </div>

      {/* Tabs filter: All + từ DB */}
      <div className="flex items-center gap-2 mb-8">
        {Tab("Tất cả", "all")}
        {cats.map((c: any) => Tab(c.name, c.slug))}
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {dishes.map((d) => (
          <li key={d.id} className="group">
            <Link href={`/home/${d.slug}`} className="block">
              <div className="aspect-square overflow-hidden rounded-2xl border">
                <img
                  src={dishImageUrl(d) ?? "/placeholder.png"}
                  alt={d.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>
              <div className="mt-3">
                <p className="font-medium line-clamp-1 text-gray-900">
                  {d.title}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {d.time_minutes ? `${d.time_minutes} phút` : "—"} ·{" "}
                  {d.servings ? `${d.servings} phần` : "—"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
