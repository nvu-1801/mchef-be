import Link from "next/link";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import SignOutButton from "@/components/auth/SignOutButton";
import { GlobalLoading } from "@/components/common/GlobalLoading";
import AdminDropdown from "@/components/common/AdminDropdown";

export default async function ProductsGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();

  // đọc role từ profiles
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
    <div className="min-h-dvh flex flex-col bg-white">
      {/* <GlobalLoading /> */}
      <header className="sticky top-4 z-50 mx-4 md:mx-6 bg-white/80 backdrop-blur border rounded-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-20 flex flex-row items-center gap-6">
            {/* Brand */}
            <Link
              href="/home"
              className="leading-tight shrink-0 px-2 py-1 rounded-md"
            >
              <div className="text-3xl font-semibold text-gray-900">
                Master Chef
              </div>
              <div className="text-[11px] text-gray-500">Sức khoẻ là vàng</div>
            </Link>

            {/* Center nav */}
            <nav className="hidden md:flex md:flex-row flex-1 justify-center items-center gap-2 text-[14px] text-gray-600">
              <Link
                href="/home"
                className="px-3 py-2 rounded-md hover:bg-gray-50 hover:text-black font-medium"
              >
                Cửa hàng
              </Link>
              <Link
                href="/about"
                className="px-3 py-2 rounded-md hover:bg-gray-50 hover:text-black"
              >
                Giới thiệu
              </Link>
              <Link
                href="/faq"
                className="px-3 py-2 rounded-md hover:bg-gray-50 hover:text-black"
              >
                Hỏi đáp
              </Link>
              <Link
                href="/contact"
                className="px-3 py-2 rounded-md hover:bg-gray-50 hover:text-black"
              >
                Liên hệ
              </Link>
            </nav>

            {/* Right */}
            <div className="flex flex-row items-center gap-2 shrink-0">
              <AdminDropdown isAdmin={isAdmin} />

              {/* My Posts button – luôn hiển thị */}
              <Link
                href="/posts/manager"
                className="flex items-center gap-2 p-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 7h18M3 12h18M3 17h18" />
                </svg>
                <span className="hidden sm:inline">My Posts</span>
              </Link>

              {/* Search */}
              <form className="relative hidden sm:block">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </span>
                <input
                  name="q"
                  placeholder="Tìm kiếm..."
                  className="pl-7 pr-3 py-2 text-sm outline-none border rounded-md focus:ring-1 focus:ring-black/10 text-gray-900"
                />
              </form>

              {/* Auth: nếu có user → Đăng xuất, ngược lại → Đăng nhập */}
              {user ? (
                <SignOutButton />
              ) : (
                <Link
                  href="/auth/signin"
                  className="flex items-center gap-2 p-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="hidden sm:inline">Đ.nhập</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Shop
      </footer>
    </div>
  );
}
