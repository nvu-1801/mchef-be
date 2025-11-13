"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminDropdown from "@/components/common/AdminDropdown";
import SignOutButton from "@/components/auth/SignOutButton";
import WishlistIcon from "@/components/common/WishlistIcon";
import { useUserPlan } from "@/hooks/useUserPlan"; // 👈 BƯỚC 1: Import hook

type Props = {
  isAdmin: boolean;
  user: { id: string } | null;
  isChef?: boolean;
  // ⛔️ KHÔNG CẦN "isPremium" prop ở đây nữa
};

export default function HeaderBar({ isAdmin, user, isChef = false }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // 👈 BƯỚC 2: Gọi hook để lấy plan
  const { plan } = useUserPlan();

  // 👈 BƯỚC 3: Tạo biến isPremium từ plan
  const isPremium = plan?.is_premium ?? false;

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = pathname?.startsWith(href);
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-lg text-[15px] font-medium transition
          ${
            active
              ? "text-gray-900 bg-gray-100"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        onClick={() => setOpen(false)}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="h-14 sm:h-16 flex items-center justify-between gap-2">
            {/* Brand */}
            <Link
              href="/home"
              className="shrink-0 rounded-lg px-2 py-1 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label="Master Chef Home"
            >
              <div className="text-[19px] sm:text-[21px] font-extrabold tracking-tight text-gray-900">
                Master Chef
              </div>
              <div className="hidden sm:block text-[11px] text-gray-500">
                Sức khoẻ là vàng
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex flex-1 justify-center items-center gap-1">
              <NavLink href="/about" label="Giới thiệu" />
              <NavLink href="/faq" label="Hỏi đáp" />
              <NavLink href="/contact" label="Liên hệ" />
            </nav>

            {/* Right actions (desktop) */}
            <div className="hidden sm:flex items-center gap-2">
              <WishlistIcon />

              {isChef && (
                <Link
                  href="/chef/chat"
                  className="inline-flex items-center justify-center h-10 rounded-xl px-3
                             border border-gray-200 text-sm text-gray-700 hover:bg-gray-50
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  title="Chef Chat"
                  aria-label="Chef Chat"
                >
                  <svg
                    className="w-5 h-5 mr-1 text-gray-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />
                  </svg>
                  <span className="hidden lg:inline">Chat</span>
                </Link>
              )}

              {/* 👇 BƯỚC 4: Sử dụng biến "isPremium" (từ hook) */}
              {!isAdmin &&
                (isPremium ? (
                  <span
                    className="inline-flex items-center justify-center h-10 rounded-xl px-4
                             text-sm font-semibold text-white
                             bg-gradient-to-r from-violet-500 to-pink-500
                             transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/30 hover:scale-105"
                    title="Bạn đang ở gói Premium"
                  >
                    Premium
                  </span>
                ) : (
                  <Link
                    href="/upgrade"
                    className="inline-flex items-center justify-center h-10 rounded-xl px-3
                             border border-gray-200 text-sm font-semibold text-gray-800
                             hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  >
                    Upgrade
                  </Link>
                ))}
              {/* 👆 Logic đã sử dụng hook 👆 */}

              <Link
                href="/posts/manager"
                className="inline-flex items-center justify-center h-10 rounded-xl px-3
                           border border-gray-200 text-sm text-gray-700 hover:bg-gray-50
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                My Posts
              </Link>

              {/* Orders / Checkout */}
              <Link
                href="/checkout/orders"
                className="inline-flex items-center justify-center h-10 rounded-xl px-3
                           border border-gray-200 text-sm text-gray-700 hover:bg-gray-50
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                Orders
              </Link>

              <AdminDropdown isAdmin={isAdmin} />

              {user ? (
                <>
                  <Link
                    href="/profile/me"
                    className="inline-flex items-center justify-center h-10 rounded-xl px-3
                               bg-gray-900 text-white text-sm font-semibold hover:opacity-90
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  >
                    Profile
                  </Link>
                  <SignOutButton />
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center h-10 rounded-xl px-3
                             bg-gray-900 text-white text-sm font-semibold hover:opacity-90
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  Đăng nhập
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl
                         border text-gray-700 hover:bg-gray-50 focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {open ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        <div
          className={`sm:hidden border-t overflow-hidden transition-[max-height,opacity] duration-200 ease-out
            ${
              open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`} /* Tăng max-height để vừa đủ */
        >
          <div className="px-3 py-3 space-y-2">
            <nav className="grid gap-1">
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                Giới thiệu
              </Link>
              <Link
                href="/faq"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                Hỏi đáp
              </Link>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                Liên hệ
              </Link>
            </nav>

            <div className="flex items-center gap-2 pt-2">
              <Link
                href="/wishlist"
                onClick={() => setOpen(false)}
                className="flex-1 inline-flex items-center justify-center h-10 rounded-xl
                           border border-gray-200 text-sm text-gray-800 hover:bg-gray-50
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <svg
                  className="w-5 h-5 mr-1 text-gray-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Wishlist
              </Link>

              {isChef && (
                <Link
                  href="/chef/chat"
                  onClick={() => setOpen(false)}
                  className="flex-1 inline-flex items-center justify-center h-10 rounded-xl
                             border border-gray-200 text-sm text-gray-800 hover:bg-gray-50
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  <svg
                    className="w-5 h-5 mr-1 text-gray-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />
                  </svg>
                  Chat
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* 👇 BƯỚC 4: Sử dụng biến "isPremium" (từ hook) */}
              {isPremium ? (
                <span
                  className="flex-1 inline-flex items-center justify-center h-10 rounded-xl px-3
                             text-sm font-semibold text-white cursor-not-allowed
                             bg-gradient-to-r from-violet-500 to-pink-500"
                  title="Bạn đang ở gói Premium"
                >
                  Premium
                </span>
              ) : (
                <Link
                  href="/upgrade"
                  onClick={() => setOpen(false)}
                  className="flex-1 inline-flex items-center justify-center h-10 rounded-xl
                             border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  Upgrade
                </Link>
              )}
              {/* 👆 Logic đã sử dụng hook 👆 */}

              <Link
                href="/posts/manager"
                onClick={() => setOpen(false)}
                className="flex-1 inline-flex items-center justify-center h-10 rounded-xl
                           border border-gray-200 text-sm text-gray-800 hover:bg-gray-50
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                My Posts
              </Link>

              {/* Mobile Orders button */}
              <Link
                href="/checkout/orders"
                onClick={() => setOpen(false)}
                className="flex-1 inline-flex items-center justify-center h-10 rounded-xl
                           border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                Orders
              </Link>
            </div>

            <div className="pt-2">
              <AdminDropdown isAdmin={isAdmin} />
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    href="/profile/me"
                    onClick={() => setOpen(false)}
                    className="flex-1 inline-flex items-center justify-center h-10 rounded-xl
                               bg-gray-900 text-white text-sm font-semibold hover:opacity-90
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  >
                    Profile
                  </Link>
                  <SignOutButton />
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  onClick={() => setOpen(false)}
                  className="flex-1 inline-flex items-center justify-center h-10 rounded-xl
                             bg-gray-900 text-white text-sm font-semibold hover:opacity-90
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
