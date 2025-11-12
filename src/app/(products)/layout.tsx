import { supabaseServer } from "@/libs/supabase/supabase-server";
import ProductsLayoutClient from "./ProductsLayoutClient";

export default async function ProductsGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sb = await supabaseServer();
  
  // Dùng getUser() thay vì getSession() để bảo mật hơn
  const {
    data: { user },
  } = await sb.auth.getUser();

  let isAdmin = false;
  let isChef = false;
  // let isPremium = false; // 👈 1. Bổ sung biến này

  if (user) {
    const { data: prof } = await sb
      .from("profiles") // 👈 Đảm bảo tên bảng "profiles" là đúng
      .select("role") // 👈 2. Bổ sung "is_premium" vào đây
      .eq("id", user.id)
      .single();

    const role = prof?.role ?? null;
    // isPremium = prof?.is_premium ?? false; // 👈 3. Lấy giá trị is_premium

    isAdmin = role === "admin";
    isChef = role === "chef" || role === "admin";
  }

  return (
    // 4. Truyền isPremium xuống Client Component
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
