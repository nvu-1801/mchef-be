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
  let isChef = false;
  if (user) {
    const { data: prof } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = prof?.role ?? null;

    isAdmin = role === "admin";
    isChef = role === "chef" || role === "admin";
  }

  return (
    <ProductsLayoutClient user={user} isAdmin={isAdmin}>
      {children}
    </ProductsLayoutClient>
  );
}

// import { supabaseServer } from "@/libs/supabase/supabase-server";
// import ProductsLayoutClient from "./ProductsLayoutClient";

// export default async function ProductsGroupLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const sb = await supabaseServer();
//   const {
//     data: { session },
//   } = await sb.auth.getSession();
//   const user = session?.user ?? null;

//   let isAdmin = false;
//   let isChef = false;
//   if (user) {
//     const { data: prof } = await sb
//       .from("profiles")
//       .select("role")
//       .eq("id", user.id)
//       .single();

//     const role = prof?.role ?? null;

//     isAdmin = role === "admin";
//     isChef = role === "chef" || role === "admin";
//   }

//   return (
//     <ProductsLayoutClient user={user} isAdmin={isAdmin}>
//       {children}
//     </ProductsLayoutClient>
//   );
// }
