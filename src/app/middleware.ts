// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ALLOWED_ORIGINS = new Set<string>([
  'http://localhost:8081',     // Expo web dev
  'http://10.12.7.104:8081',   // Expo web qua IP LAN
  // thêm origin khác nếu cần
]);

// Các path cần đăng nhập
const PROTECTED_PREFIXES = ['/home', '/wishlist'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin') ?? '';

  // --- 1) Nhánh CORS cho API ---
  if (pathname.startsWith('/api/')) {
    const res = NextResponse.next();

    if (ALLOWED_ORIGINS.has(origin)) {
      res.headers.set('Access-Control-Allow-Origin', origin);
      res.headers.set('Vary', 'Origin');
      res.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.headers.set(
      'Access-Control-Allow-Headers',
      // để rộng cho dev: thêm Authorization, Content-Type, X-Requested-With, v.v.
      'Content-Type, Authorization, X-Requested-With, Accept, Origin'
    );
    res.headers.set('Access-Control-Max-Age', '86400');

    // Trả lời preflight sớm
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: res.headers });
    }

    return res;
  }

  // --- 2) Nhánh bảo vệ trang (không áp CORS) ---
  // Chỉ chạy Supabase khi route thuộc nhóm cần bảo vệ → tránh tốn chi phí cho mọi request
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const res = NextResponse.next();

    // Tạo Supabase client trong middleware (Edge)
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
            res.cookies.set({ name, value: '', ...options, maxAge: 0 });
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/signin';
      // (tuỳ chọn) redirect kèm next= để quay lại sau khi login
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    return res;
  }

  // --- 3) Mặc định: cho qua ---
  return NextResponse.next();
}

// Áp dụng cho cả API và các trang private
export const config = {
  matcher: ['/api/:path*', '/home/:path*', '/wishlist/:path*'],
};
