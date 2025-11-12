/**
 * GET /api/me/plan
 * Lấy thông tin plan của user hiện tại
 * Nếu chưa có user_profiles, tạo test record với is_premium = true
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1) Khởi tạo Supabase client server-side (Service Role Key)
    const sb = await supabaseServer();

    // 2) Lấy user auth hiện tại
    const {
      data: { user },
      error: authErr,
    } = await sb.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3) Lấy thông tin user_profiles
    let { data: userProfile, error: profileErr } = await sb
      .from("user_profiles")
      .select("plan_id, plan_expired_at, is_premium")
      .eq("user_id", user.id)
      .single();

    // 4) Nếu chưa có record → tạo test record với UUID hợp lệ
    if (!userProfile) {
      console.log("[me/plan] No user_profiles found. Creating test record...");

      const planExpiredAt = new Date();
      planExpiredAt.setDate(planExpiredAt.getDate() + 30); // 30 ngày test

      const newPlanId = randomUUID(); // UUID hợp lệ

      const { data: insertedProfile, error: insertErr } = await sb
        .from("user_profiles")
        .insert({
          user_id: user.id,
          plan_id: newPlanId,
          plan_expired_at: planExpiredAt.toISOString(),
          is_premium: true,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertErr) {
        console.error("[me/plan] Failed to upsert test user_profiles:", insertErr);
      } else {
        userProfile = insertedProfile;
        console.log("[me/plan] Created test user_profiles:", userProfile);
      }
    }

    // 5) Trả về plan info
    return NextResponse.json({
      id: user.id,
      username: user.user_metadata?.username || "",
      email: user.email || "",
      plan_id: userProfile?.plan_id || null,
      plan_expired_at: userProfile?.plan_expired_at || null,
      is_premium: userProfile?.is_premium || false,
    });
  } catch (err: unknown) {
    console.error("[me/plan] error:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to fetch plan" },
      { status: 500 }
    );
  }
}
