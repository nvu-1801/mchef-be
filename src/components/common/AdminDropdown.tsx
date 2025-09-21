"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminDropdown({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="btn-vip me-2 flex items-center gap-1" type="button">
        Admin Manager
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

     {open && (
  <div className="absolute left-0 top-full -mt-0.2 w-48 rounded-xl border bg-white shadow-lg z-50">
    <ul className="flex flex-col py-1 text-sm">
      <li>
        <Link
          href="/admin/products"
          className="block px-3 py-1.5 text-gray-600 hover:bg-gray-100"
        >
          Manager Product
        </Link>
      </li>
      <li>
        <Link
          href="/admin/dashboard"
          className="block px-3 py-1.5 text-gray-600 hover:bg-gray-100"
        >
          Dashboard
        </Link>
      </li>
    </ul>
  </div>
)}

    </div>
  );
}
