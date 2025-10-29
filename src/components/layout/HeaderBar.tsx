// components/layout/HeaderBar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import AdminDropdown from "@/components/common/AdminDropdown";
import SignOutButton from "@/components/auth/SignOutButton";

type Props = {
  isAdmin: boolean;
  user: { id: string } | null;
};

export default function HeaderBar({ isAdmin, user }: Props) {
  const [open, setOpen] = useState(false);

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className="relative px-4 py-2 rounded-lg hover:text-violet-700 transition group"
      onClick={() => setOpen(false)}
    >
      <span className="relative z-10">{label}</span>
      <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-violet-50 via-sky-50 to-pink-50" />
      <span className="pointer-events-none absolute -bottom-0 left-1/2 h-[2px] w-0 group-hover:w-4/5 -translate-x-1/2 rounded-full transition-all duration-300 bg-gradient-to-r from-pink-500 via-violet-500 to-sky-500" />
    </Link>
  );

  return (
    <header className="sticky top-2 z-50 mx-2 sm:mx-4">
      <div className="relative">
        <div className="absolute -inset-[1.2px] rounded-2xl bg-gradient-to-r from-pink-400 via-violet-500 to-sky-500 blur-[6px] opacity-40" />
        <div className="relative bg-white/80 backdrop-blur-xl border rounded-2xl shadow-lg">
          <div className="mx-auto max-w-7xl px-3 sm:px-4">
            <div className="h-16 sm:h-20 flex items-center justify-between gap-3">
              {/* Brand */}
              <Link
                href="/home"
                className="leading-tight shrink-0 px-2 py-1 rounded-xl transition group hover:bg-gray-50"
              >
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-600 group-hover:from-fuchsia-500 group-hover:to-sky-500">
                  Master Chef
                </div>
                <div className="hidden sm:block text-[11px] text-gray-500 group-hover:text-sky-600 transition">
                  Sức khoẻ là vàng
                </div>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex flex-1 justify-center items-center gap-1 text-[15px] font-semibold text-gray-700">
                <NavLink href="/about" label="Giới thiệu" />
                <NavLink href="/faq" label="Hỏi đáp" />
                <NavLink href="/contact" label="Liên hệ" />
              </nav>

              {/* Right actions (desktop + mobile) */}
              <div className="hidden sm:flex items-center gap-2 md:gap-3">
                <AdminDropdown isAdmin={isAdmin} />
                <Link
                  href="/upgrade"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-violet-600 hover:bg-violet-50 transition"
                >
                  <svg className="w-5 h-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="hidden lg:inline bg-gradient-to-r from-violet-500 to-pink-500 text-transparent bg-clip-text font-bold">
                    Upgrade
                  </span>
                </Link>

                <Link
                  href="/posts/manager"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition"
                >
                  <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 3h14a2 2 0 0 1 2 2v16l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2z" />
                  </svg>
                  <span className="hidden lg:inline font-medium">My Posts</span>
                </Link>

                {user ? (
                  <>
                    <Link
                      href="/profile/me"
                      className="px-3 md:px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500 text-white hover:shadow-md hover:brightness-110 active:translate-y-px transition"
                    >
                      Profile
                    </Link>
                    <SignOutButton />
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="px-3 md:px-4 py-2 rounded-xl text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 transition shadow"
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
                className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border text-gray-700 hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {open ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile sheet */}
          <div
            className={`sm:hidden transition-[max-height,opacity] duration-300 ease-out overflow-hidden ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="px-3 pb-3">
              <nav className="grid gap-1">
                <Link href="/about" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Giới thiệu</Link>
                <Link href="/faq" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Hỏi đáp</Link>
                <Link href="/contact" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Liên hệ</Link>

                <div className="h-px my-2 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                <div className="flex items-center gap-2">
                  <Link href="/upgrade" onClick={() => setOpen(false)} className="flex-1 rounded-xl px-3 py-2 text-sm font-bold text-violet-700 bg-violet-50 hover:bg-violet-100">
                    Upgrade
                  </Link>
                  {user ? (
                    <Link href="/profile/me" onClick={() => setOpen(false)} className="flex-1 rounded-xl px-3 py-2 text-sm font-bold text-white bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500 text-center">
                      Profile
                    </Link>
                  ) : (
                    <Link href="/auth/signin" onClick={() => setOpen(false)} className="flex-1 rounded-xl px-3 py-2 text-sm font-bold text-white bg-sky-600 text-center">
                      Đăng nhập
                    </Link>
                  )}
                </div>

                <div className="pt-2">
                  <AdminDropdown isAdmin={isAdmin} />
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
