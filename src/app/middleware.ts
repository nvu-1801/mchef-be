// middleware.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: Request) {
  const url = new URL(req.url);
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => {
          // đọc cookies từ request headers
          return (req as any).cookies?.get?.(name)?.value;
        },
        set: (name, value, options) => {
          // ghi vào response headers (Set-Cookie)
          res.cookies.set(name, value, options);
        },
        remove: (name, options) => {
          res.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Chặn các path cần login
  const isProtected = url.pathname.startsWith("/home") || url.pathname.startsWith("/wishlist");
  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/home/:path*", "/wishlist/:path*"], // thêm các path private khác nếu cần
};
