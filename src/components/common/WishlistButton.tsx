"use client";
import useWishlist from "@/hooks/useWishlist";

export default function WishlistButton({ dishId }: { dishId: string }) {
  const { toggle, isInWishlist } = useWishlist();
  const active = isInWishlist(dishId);

  return (
    <button
      onClick={() => toggle(dishId)}
      className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-all duration-200 shadow-sm group
        ${active ? "bg-rose-50 border-rose-300" : "bg-white border-gray-200 hover:bg-rose-50 hover:border-rose-300"}
      `}
      aria-label="Yêu thích"
    >
      <svg
        className={`w-5 h-5 transition-colors
          ${active ? "text-rose-500" : "text-gray-400 group-hover:text-rose-500"}
        `}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
