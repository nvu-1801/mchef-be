// components/common/AdminDropdown.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AdminDropdown({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  if (!isAdmin) return null;

  // Đóng khi click ra ngoài
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const items = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 13h8V3H3v10zM13 21h8v-6h-8v6zM13 3v8h8V3h-8zM3 21h8v-6H3v6z" />
        </svg>
      ),
    },
    {
      href: "/admin/chefs",
      label: "Chefs Profiles",
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      href: "/admin/chefs/applicants",
      label: "Chefs Applicants",
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 12c2.8 0 5-2.2 5-5S14.8 2 12 2 7 4.2 7 7s2.2 5 5 5Z" />
          <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
      ),
    },
    {
      href: "/admin/moderation/dishes",
      label: "Moderation Dishes",
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5l-3 3V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
  ];

  return (
    <div
      ref={wrapRef}
      className="relative"
      // Hover mở trên màn hình md trở lên
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)} // mobile: click để mở/đóng
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-gray-200
                   bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition"
      >
        <span>Admin</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Panel */}
      <div
        className={`absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-200 bg-white shadow-xl
                    ring-1 ring-black/5 overflow-hidden transition
                    ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"}`}
        role="menu"
      >
        <ul className="p-1.5">
          {items.map((it) => {
            const active = pathname?.startsWith(it.href);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition
                    ${active
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <span className="shrink-0 text-gray-600">{it.icon}</span>
                  <span className="truncate">{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
