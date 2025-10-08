// app/chefs/page.tsx
import { supabaseServer } from "@/libs/supabase/supabase-server";
import PublicChefs from "../../../../components/chef/PublicChefs";

export const revalidate = 60;

export default async function ChefsPublicPage() {
  const sb = await supabaseServer();

  // Ưu tiên dùng VIEW đã gộp số liệu
  const { data, error } = await sb
    .from("chef_overview") // nếu chưa có view, tạm đổi thành "chefs"
    .select(
      `
      id, user_id, display_name, avatar_url, bio,
      is_active, can_post, verified_at, created_at, updated_at,
      rating_avg, rating_count, dishes_count, comments_count
    `
    )
    .eq("is_active", true)
    .order("verified_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-2xl font-semibold">Chefs</h1>
        <p className="mt-2 text-rose-600">Load failed: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold">Chefs</h1>
      <p className="mt-1 text-sm text-gray-600">
        Discover verified chefs and learn their best recipes.
      </p>

      <PublicChefs items={data ?? []} />
    </div>
  );
}
