import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import { generateUserApiKey } from "@/libs/auth/verify-user-api-key";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/get-api-key
 * Trả về API key cho client đã authenticated
 * Client sẽ dùng key này để gọi các API dishes CRUD
 */
export async function GET(request: Request) {
  try {
    const sb = await supabaseServer();

    // Lấy user từ session
    const {
      data: { user },
      error: authError,
    } = await sb.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Kiểm tra user có quyền không (optional)
    const { data: profile } = await sb
      .from("profiles")
      .select("role, can_post")
      .eq("id", user.id)
      .single();

    // Tạo API key động dựa trên user ID + secret
    const apiKey = generateUserApiKey(user.id);

    return NextResponse.json({
      apiKey,
      userId: user.id,
      expiresIn: 86400, // 24 hours (optional)
    });
  } catch (error: unknown) {
    console.error("[get-api-key] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export function verifyUserApiKey(apiKey: string, userId: string): boolean {
  const expected = generateUserApiKey(userId);
  return apiKey === expected;
}
