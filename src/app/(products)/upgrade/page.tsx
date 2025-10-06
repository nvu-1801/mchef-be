import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import UpgradeClient from "@/components/upgrade/UpgradeClient";

export const revalidate = 0;

export default async function UpgradePage() {
  const sb = await supabaseServer();
  const { data: { session } = { session: null } } = await sb.auth.getSession();
  const user = session?.user ?? null;

  let role: "user" | "chef" | "admin" | null = null;
  if (user) {
    const { data: prof } = await sb.from("profiles").select("role").eq("id", user.id).single();
    role = (prof?.role as any) ?? null;
  }

  const isChef = role === "chef" || role === "admin";

  return (
    <div className="min-h-dvh bg-white bg-[radial-gradient(45rem_45rem_at_80%_-10%,#dbeafe_10%,transparent_60%),radial-gradient(40rem_40rem_at_0%_120%,#fce7f3_10%,transparent_60%)]">
      <UpgradeClient isChef={!!isChef} />
    </div>
  );
}
