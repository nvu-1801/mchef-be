// app/admin/moderation/dishes/page.tsx
import { supabaseServer } from "@/libs/supabase/supabase-server";
import ModerationDishesClient from "./ui";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const sb = await supabaseServer();
  const { data: sess } = await sb.auth.getUser();
  const uid = sess.user?.id ?? null;

  if (!uid) {
    // Tuỳ UX, có thể redirect /auth
    return <div className="p-6 text-red-600">Bạn cần đăng nhập.</div>;
  }
  const { data: prof } = await sb.from("profiles").select("role, display_name, avatar_url").eq("id", uid).single();
  if (prof?.role !== "admin") {
    return <div className="p-6 text-red-600">Bạn không có quyền truy cập.</div>;
  }

  // server just renders shell; client will fetch list via API to get pagination/search
  return <ModerationDishesClient />;
}
