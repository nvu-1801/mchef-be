import { ReactNode } from "react";

// Ngăn prerender & cache để luôn đọc session mới nhất
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  
  return <>{children}</>;
}
