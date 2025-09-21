"use client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const onClick = async () => {
    const r = await fetch("/auth/signout", {
      method: "POST",
      credentials: "include", // kèm cookie để xoá session
      cache: "no-store",
    });

    if (r.ok) {
      router.push("/auth/signin");
      router.refresh(); 
    } else {
      console.error("Signout failed", await r.text());
    }
  };

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 p-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
    >
      {/* icon logout */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span>Đăng xuất</span>
    </button>
  );
}
