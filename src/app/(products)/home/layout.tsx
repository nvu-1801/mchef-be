import { ReactNode } from "react";

// Ngăn prerender & cache để luôn đọc session mới nhất
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  // const supabase = await supabaseServer();
  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();

  // if (!session) {
  //   redirect("/auth/signin");
  // }

  // (tuỳ chọn) có thể fetch user profile ở đây rồi wrap vào context/provider

  return <>{children}</>;
}
