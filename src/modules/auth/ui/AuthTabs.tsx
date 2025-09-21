"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthTabs() {
  const pathname = usePathname();
  const isSignin = pathname?.includes("/auth/signin");

  return (
    <div className="inline-flex rounded-full border border-gray-300 bg-white p-1">
      <Link
        href="/auth/signin"
        className={`px-4 py-1.5 rounded-full text-sm transition
          ${isSignin ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
      >
        Sign in
      </Link>
      <Link
        href="/auth/signup"
        className={`px-4 py-1.5 rounded-full text-sm transition
          ${!isSignin ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
      >
        Sign up
      </Link>
    </div>
  );
}
