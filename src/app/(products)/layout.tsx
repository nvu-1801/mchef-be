import { supabaseServer } from "@/libs/supabase/supabase-server";
import { GlobalLoading } from "@/components/common/GlobalLoading";
import Footer from "@/components/common/Footer";
import HeaderBar from "@/components/layout/HeaderBar";

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

  // đọc role từ profiles
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
    <div
      className="min-h-dvh flex flex-col bg-white
      bg-[radial-gradient(45rem_45rem_at_80%_-10%,#dbeafe_10%,transparent_60%),radial-gradient(40rem_40rem_at_0%_120%,#fce7f3_10%,transparent_60%)]"
    >
      <GlobalLoading />

      <HeaderBar isAdmin={isAdmin} isChef={isChef} user={user} />

      {/* Main */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
