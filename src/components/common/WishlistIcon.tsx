"use client";

import Link from "next/link";
import useWishlist from "@/hooks/useWishlist";

export default function WishlistIcon() {
  const { wishlist } = useWishlist();
  const count = wishlist.length;

  return (
    <Link
      href="/wishlist"
      className="relative inline-flex items-center justify-center h-10 w-10 
                 rounded-xl border border-gray-200 hover:bg-gray-50 
                 transition focus:outline-none"
      aria-label="Wishlist"
      title="Wishlist"
    >
      <svg
        className={`w-5 h-5 transition ${count > 0 ? "text-rose-600" : "text-gray-600"}`}
        viewBox="0 0 24 24"
        fill={count > 0 ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>

      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full 
                         bg-rose-500 text-white text-[10px] flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
