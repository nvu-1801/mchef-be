import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createServerClient,
  type CookieOptions,
  type CookieMethodsServer,
} from "@supabase/ssr";

async function handle(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Lấy code từ URL (GET)
  let code = searchParams.get("code");

  // Một số flow có thể POST về (ít gặp), dự phòng parse từ body
  if (!code && request.method === "POST") {
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData();
      code = (form.get("code") as string) || null;
    } else if (ct.includes("application/json")) {
      const body = (await request.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      code = typeof body?.code === "string" ? body.code : null;
    }
  }

  const next = searchParams.get("next") || "/home";

  const cookieStore = await cookies();

  // Build a cookies adapter compatible with the Supabase helper at runtime.
  const cookieAdapter = {
    get: (name: string) => cookieStore.get(name)?.value,
    set: (name: string, value: string, options: CookieOptions) =>
      cookieStore.set({ name, value, ...options }),
    // use `remove` to match Supabase server cookie API
    remove: (name: string) => cookieStore.delete(name),
  } as unknown as CookieMethodsServer;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieAdapter,
    }
  );

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, request.url));
}

export async function GET(request: Request) {
  return handle(request);
}
export async function POST(request: Request) {
  return handle(request);
}

// Tránh cache cho route callback
export const dynamic = "force-dynamic";
