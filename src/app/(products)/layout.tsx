import { supabaseServer } from "@/libs/supabase/supabase-server";
import ProductsLayoutClient from "./ProductsLayoutClient";

export default async function ProductsGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sb = await supabaseServer();
  const {
    data: { session },
  } = await sb.auth.getSession();
  const user = session?.user ?? null;

  let isAdmin = false;
  if (user) {
    const { data: prof } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = prof?.role === "admin";
  }

  return (
    <ProductsLayoutClient user={user} isAdmin={isAdmin}>
      {children}
    </ProductsLayoutClient>
  );
}
