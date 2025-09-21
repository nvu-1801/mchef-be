import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import DishForm from "@/components/dishes/DishForm";
import { createDish, deleteDish } from "./actions";

export const dynamic = "force-dynamic";
type Category = { id: string; name: string };

type DishListItem = {
  id: string;
  title: string;
  cover_image_url: string | null;
  published: boolean;
  created_at: string | null;
};

export default async function DishesManagerPage() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/auth/signin");

  // 1) Categories
  const { data: catData } = await sb
    .from("categories")
    .select("id,name")
    .order("name", { ascending: true });

  // catData: {id,name}[] | null  -> ép về Category[]
  const categories: Category[] = (catData ?? []) as Category[];

  // 2) Dishes
  const { data: dishData } = await sb
    .from("dishes")
    .select("id,title,cover_image_url,published,created_at")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  // dishData: ...[] | null  -> ép về DishListItem[]
  const dishes: DishListItem[] = (dishData ?? []) as DishListItem[];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-gray-700 font-semibold">Quản lý món của tôi</h1>
        <Link href="/posts/manager" className="text-sm text-gray-500 hover:text-gray-900">Làm mới</Link>
      </div>

      <div className="grid text-gray-700 md:grid-cols-2 gap-8">
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-3">Đăng món mới</h2>
          <DishForm action={createDish} categories={categories} submitText="Đăng món" />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium">
            Món của tôi ({dishes.length})
          </div>
          <div className="divide-y">
            {dishes.map((d: any) => (
              <div key={d.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0">
                  {d.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.cover_image_url} alt={d.title} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{d.title}</div>
                  <div className="text-xs text-gray-500">
                    {d.published ? "Public" : "Draft"}
                    {d.created_at ? ` · ${new Date(d.created_at).toLocaleString("vi-VN")}` : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/posts/manager/${d.id}/edit`} className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50">
                    Sửa
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteDish(d.id);
                    }}
                  >
                    <button type="submit" className="text-sm px-3 py-1.5 rounded-md border text-red-600 hover:bg-red-50">
                      Xoá
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {dishes.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-gray-500">Bạn chưa đăng món nào.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
