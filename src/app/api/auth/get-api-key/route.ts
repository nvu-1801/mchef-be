// src/app/api/auth/get-api-key/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import { generateUserApiKey } from "@/libs/auth/verify-user-api-key";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/get-api-key
 */
export async function GET(request: Request) {
  try {
    const sb = await supabaseServer();

    const {
      data: { user },
      error: authError,
    } = await sb.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: lấy profile nếu cần
    const { data: profile } = await sb
      .from("profiles")
      .select("role, can_post")
      .eq("id", user.id)
      .single();

    const apiKey = generateUserApiKey(user.id);

    return NextResponse.json({
      apiKey,
      userId: user.id,
      expiresIn: 86400,
    });
  } catch (error: unknown) {
    console.error("[get-api-key] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ❌ KHÔNG được có dòng này trong route.ts:
// export function verifyUserApiKey(...) { ... }
// hoặc bất kỳ export khác ngoài GET/POST/runtime/dynamic...
