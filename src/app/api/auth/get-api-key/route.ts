import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import { createHash } from "crypto";

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

    // Nếu muốn restrict chỉ cho chef/admin
    // if (!profile?.can_post && profile?.role !== "admin") {
    //   return NextResponse.json(
    //     { error: "Forbidden: Not a chef" },
    //     { status: 403 }
    //   );
    // }

    // Tạo API key động dựa trên user ID + secret
    const apiKey = generateUserApiKey(user.id);

    return NextResponse.json({
      apiKey,
      userId: user.id,
      expiresIn: 86400, // 24 hours (optional)
    });
  } catch (error: any) {
    console.error("[get-api-key] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Tạo API key cho từng user
 * Format: hash(userId + SECRET)
 */
function generateUserApiKey(userId: string): string {
  const secret = process.env.INTERNAL_API_KEY || "fallback-secret";
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Reset mỗi ngày

  return createHash("sha256")
    .update(`${userId}:${secret}:${timestamp}`)
    .digest("hex")
    .substring(0, 32);
}

/**
 * Verify API key từ user
 */
export function verifyUserApiKey(apiKey: string, userId: string): boolean {
  const expected = generateUserApiKey(userId);
  return apiKey === expected;
}
