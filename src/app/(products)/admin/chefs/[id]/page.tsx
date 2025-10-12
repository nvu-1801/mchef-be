// app/chefs/[id]/page.tsx
import { notFound } from "next/navigation";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import ChefHeader from "../../../../../components/chef/ChefHeader";
import DishMini from "../../../../../components/chef/DishMini";
import RatingItem from "../../../../../components/chef/RatingItem";

export const revalidate = 60;

type Chef = {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  can_post: boolean | null;
  is_active: boolean | null;
  verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  rating_avg: number | null;
  rating_count: number | null;
  dishes_count: number | null;
  comments_count: number | null;
};

type Dish = {
  id: string;
  slug: string | null;
  title: string | null;
  cover_image_url: string | null;
  time_minutes: number | null;
  servings: number | null;
  created_at: string | null;
};

type Rating = {
  stars: number | null;
  comment: string | null;
  created_at: string | null;
  rater: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export default async function ChefDetailPage({
  params,
}: {
  params: { id: string }; 
}) {
  const { id } = params;

  const sb = await supabaseServer();

  // 1) Lấy hồ sơ chef từ VIEW
  const { data: chef, error: e1 } = await sb
    .from("chef_overview")
    .select("*")
    .eq("id", id)
    .single<Chef>();

  if (e1 || !chef || !chef.is_active) {
    return notFound();
  }

  // 2) Lấy 8 món mới nhất do chef (theo user_id) & đã publish
  const { data: dishes } = (await sb
    .from("dishes")
    .select(
      "id, slug, title, cover_image_url, time_minutes, servings, created_at"
    )
    .eq("created_by", chef.user_id)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(8)) as { data: Dish[] | null };

  // 3) Lấy 10 rating gần nhất cho chef (kèm người đánh giá)
  const { data: ratings } = (await sb
    .from("chef_ratings")
    .select(
      `
      stars, comment, created_at,
      rater:profiles ( id, display_name, avatar_url )
    `
    )
    .eq("chef_id", chef.id)
    .order("created_at", { ascending: false })
    .limit(10)) as { data: Rating[] | null };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <ChefHeader chef={chef} />

      {/* Dishes */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent dishes</h2>
          <a
            href={`/search?chef=${chef.user_id}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            View all
          </a>
        </div>

        {!dishes || dishes.length === 0 ? (
          <div className="mt-3 rounded-xl border p-6 text-sm text-gray-600">
            This chef has not published any dishes yet.
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dishes.map((d) => (
              <DishMini key={d.id} dish={d} />
            ))}
          </div>
        )}
      </section>

      {/* Ratings */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Recent ratings</h2>
        {!ratings || ratings.length === 0 ? (
          <div className="mt-3 rounded-xl border p-6 text-sm text-gray-600">
            No ratings yet.
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {ratings.map((r, i) => (
              <RatingItem key={i} rating={r} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
