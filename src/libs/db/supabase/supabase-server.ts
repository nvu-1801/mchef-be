import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ✅ CHỈ đọc cookie trong Server Component
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // ✅ NO-OP: KHÔNG ghi cookie ở đây
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(_name: string, _options: CookieOptions) {},
      },
    }
  );
}
