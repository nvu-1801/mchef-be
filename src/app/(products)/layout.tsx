import Link from "next/link";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import SignOutButton from "@/components/auth/SignOutButton";
import { GlobalLoading } from "@/components/common/GlobalLoading";
import AdminDropdown from "@/components/common/AdminDropdown";
import Footer from "@/components/common/Footer";

export default async function ProductsGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sb = await supabaseServer();

  const {
    data: { session },
    error,
  } = await sb.auth.getSession();

  const user = session?.user ?? null;
  const accessToken = session?.access_token ?? null;

  console.log("Access Token:", accessToken);
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
    <div
      className="min-h-dvh flex flex-col bg-white
      bg-[radial-gradient(45rem_45rem_at_80%_-10%,#dbeafe_10%,transparent_60%),radial-gradient(40rem_40rem_at_0%_120%,#fce7f3_10%,transparent_60%)]"
    >
      <GlobalLoading />

      {/* Header: glassy + gradient ring */}
      <header className="sticky top-4 z-50 mx-4 md:mx-6">
        <div className="relative">
          <div className="absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r from-pink-400 via-violet-500 to-sky-500 blur-[6px] opacity-40" />
          <div className="relative bg-white/80 backdrop-blur-xl border rounded-2xl shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
              <div className="h-24 flex flex-row items-center gap-6 md:gap-8">
                {/* Brand */}
                <Link
                  href="/home"
                  className="leading-tight shrink-0 px-3 py-2 rounded-xl transition group hover:bg-gray-50"
                >
                  <div className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-600 group-hover:from-fuchsia-500 group-hover:to-sky-500">
                    Master Chef
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-sky-600 transition">
                    Sức khoẻ là vàng
                  </div>
                </Link>

                {/* Center nav */}
                <nav className="hidden md:flex md:flex-row flex-1 justify-center items-center gap-1 text-[15px] font-semibold text-gray-700">
                  {[
                    { href: "/home", label: "Cửa hàng" },
                    { href: "/about", label: "Giới thiệu" },
                    { href: "/faq", label: "Hỏi đáp" },
                    { href: "/contact", label: "Liên hệ" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="relative px-4 py-2 rounded-lg hover:text-violet-700 transition group"
                    >
                      <span className="relative z-10">{item.label}</span>
                      <span
                        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition
                        bg-gradient-to-r from-violet-50 via-sky-50 to-pink-50"
                      />
                      <span
                        className="pointer-events-none absolute -bottom-0 left-1/2 h-[2px] w-0 group-hover:w-4/5 -translate-x-1/2 rounded-full transition-all duration-300
                        bg-gradient-to-r from-pink-500 via-violet-500 to-sky-500"
                      />
                    </Link>
                  ))}
                </nav>

                {/* Right */}
                <div className="flex flex-row items-center gap-2 md:gap-3 shrink-0">
                  <AdminDropdown isAdmin={isAdmin} />

                  {/* Upgrade Button */}
                  <Link
                    href="/upgrade"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold
             text-violet-600 hover:bg-violet-50 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-violet-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="hidden sm:inline bg-gradient-to-r from-violet-500 to-pink-500 text-transparent bg-clip-text font-bold">
                      Upgrade
                    </span>
                  </Link>

                  {/* My Posts Button */}
                  <Link
                    href="/posts/manager"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 3h14a2 2 0 0 1 2 2v16l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2z" />
                    </svg>
                    <span className="hidden sm:inline font-medium">
                      My Posts
                    </span>
                  </Link>

                  {/* Profile button (NEW) */}
                  {user && (
                    <Link
                      href="/profile/me"
                      className="px-3 md:px-4 py-2 rounded-xl text-sm font-bold
                      bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500 text-white
                      hover:shadow-md hover:brightness-110 active:translate-y-px transition"
                    >
                      Profile
                    </Link>
                  )}

                  {/* Auth */}
                  {user ? (
                    <SignOutButton />
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
                      text-white bg-sky-600 hover:bg-sky-700 transition shadow"
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
                      <span className="hidden sm:inline">Đăng nhập</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
