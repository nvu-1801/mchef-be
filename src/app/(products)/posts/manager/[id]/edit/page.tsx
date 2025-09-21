import { redirect } from "next/navigation";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import DishForm from "@/components/dishes/DishForm";
import { updateDish } from "../../actions";

type Category = { id: string; name: string };
type DishFormValues = {
  title: string;
  category_id: string | null;
  cover_image_url: string | null;
  diet: string | null;
  time_minutes: number | null;
  servings: number | null;
  tips: string | null;
  published: boolean;
};

export default async function EditDishPage({
  params,
}: {
  params: { id: string };
}) {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: catData } = await sb
    .from("categories")
    .select("id,name")
    .order("name", { ascending: true });
  const categories: Category[] = (catData ?? []) as Category[];

  const { data: dishData, error } = await sb
    .from("dishes")
    .select(
      "id,title,category_id,cover_image_url,diet,time_minutes,servings,tips,published,created_by"
    )
    .eq("id", params.id)
    .single();

  if (error || !dishData || dishData.created_by !== user.id) {
    redirect("/dishes/manager");
  }

  const dish: DishFormValues & { id: string } = {
    id: dishData.id,
    title: dishData.title,
    category_id: dishData.category_id,
    cover_image_url: dishData.cover_image_url,
    diet: dishData.diet,
    time_minutes: dishData.time_minutes,
    servings: dishData.servings,
    tips: dishData.tips,
    published: dishData.published,
  };

  return (
    <div className="max-w-3xl text-gray-700 mx-auto px-4 md:px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Sửa món</h1>
      <DishForm
        categories={categories}
        defaultValues={dish}
        submitText="Cập nhật"
        action={updateDish.bind(null, dish.id)}  
      />
    </div>
  );
}
