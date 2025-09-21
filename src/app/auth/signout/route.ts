// app/api/auth/signout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  // Tạo sẵn response để ghi Set-Cookie vào đây
  const res = NextResponse.json({ ok: true });

  // ĐỌC cookie từ request (có thể là async ở Next 15)
  const cookieStore = await cookies(); // nếu bản của bạn sync, TS sẽ tự chấp nhận bỏ await cũng được

  // Tạo client với adapter đọc từ request & ghi vào response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // đọc từ request cookies
        get: (name) => cookieStore.get(name)?.value,
        // ghi lên response cookies
        set: (name, value, options) => {
          res.cookies.set(name, value, options);
        },
        remove: (name, options) => {
          res.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  await supabase.auth.signOut();
  return res; // trả response đã chứa Set-Cookie xoá session
}
