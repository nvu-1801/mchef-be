// app/chefs/page.tsx
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import PublicChefs from "./applicants/PublicChefs";

export const revalidate = 60;

export default async function ChefsPublicPage() {
  const sb = await supabaseServer();

  // Nếu bạn có view `chefs_public`, thay .from("chefs") => .from("chefs_public").select("*")
  const { data, error } = await sb
    .from("chefs")
    .select(`
      id, user_id, display_name, avatar_url, bio, can_post, is_active, verified_at, created_at, updated_at,
      user:profiles!chefs_user_id_fkey ( id, display_name, avatar_url )
    `)
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
