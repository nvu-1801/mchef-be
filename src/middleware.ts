import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const url = req.nextUrl;

  // Chỉ áp dụng cho /admin/*
  if (!url.pathname.startsWith("/admin")) return res;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.delete({ name, ...options });
        },
      },
    }
  );

  // 1️⃣ Bắt buộc đăng nhập
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const signin = new URL("/signin", req.url);
    signin.searchParams.set("next", url.pathname + url.search);
    return NextResponse.redirect(signin);
  }

  // 2️⃣ Lấy role từ bảng profiles
  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (prof?.role !== "admin") {
    return NextResponse.rewrite(new URL("/403", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
