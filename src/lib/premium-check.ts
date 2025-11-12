// lib/middleware.ts
/**
 * Middleware check premium status
 * Dùng để protect routes yêu cầu premium
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function checkPremiumAccess(req: NextRequest) {
  try {
    const sb = await supabaseServer();

    // 1) Xác thực user
    const {
      data: { user },
      error: authErr,
    } = await sb.auth.getUser();

    if (authErr || !user) {
      return {
        isAuthenticated: false,
        isPremium: false,
        user: null,
        error: "Not authenticated",
      };
    }

    // 2) Lấy user info
    const { data: userData, error: userErr } = await sb
      .from("user_profiles")
      .select("plan_id, plan_expired_at, is_premium")
      .eq("user_id", user.id)
      .single();

    if (userErr || !userData) {
      return {
        isAuthenticated: true,
        isPremium: false,
        user,
        error: "User not found",
      };
    }

    // 3) Check nếu plan còn hạn
    const isPremium =
    userData.is_premium === true && 
      !!userData.plan_id &&
      !!userData.plan_expired_at &&
      new Date(userData.plan_expired_at) > new Date();

    return {
      isAuthenticated: true,
      isPremium,
      user,
      planId: userData.plan_id,
      planExpiredAt: userData.plan_expired_at,
    };
  } catch (err) {
    console.error("[checkPremiumAccess] error:", err);
    return {
      isAuthenticated: false,
      isPremium: false,
      user: null,
      error: (err as Error)?.message,
    };
  }
}

/**
 * Guard middleware cho protected routes
 */
export function createPremiumGuard() {
  return async (req: NextRequest) => {
    const result = await checkPremiumAccess(req);

    if (!result.isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!result.isPremium) {
      return NextResponse.json(
        { error: "Premium access required" },
        { status: 403 }
      );
    }

    return null; // Allow access
  };
}
