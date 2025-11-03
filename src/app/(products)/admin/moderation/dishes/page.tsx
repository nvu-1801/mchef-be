// app/(products)/admin/moderation/dishes/page.tsx
import { supabaseServer } from "@/libs/supabase/supabase-server";
import ModerationDishesClient from "./ui";

export const dynamic = "force-dynamic";
// Nếu bạn dùng supabase-js (Node APIs), thêm dòng này để chắc chắn không chạy edge:
export const runtime = "nodejs";

export default async function Page() {
  const sb = await supabaseServer();
  const { data: sess } = await sb.auth.getUser();
  const uid = sess.user?.id ?? null;

  if (!uid) {
    return <div className="p-6 text-red-600">Bạn cần đăng nhập.</div>;
  }

  const { data: prof } = await sb
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", uid)
    .single();

  if (prof?.role !== "admin") {
    return <div className="p-6 text-red-600">Bạn không có quyền truy cập.</div>;
  }

  return <ModerationDishesClient />;
}
