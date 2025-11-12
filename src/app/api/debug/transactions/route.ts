// app/api/debug/transactions/route.ts
/**
 * 🔍 DEBUG endpoint - Kiểm tra transaction data
 * Chỉ dùng cho testing, xóa trước khi production
 */

import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sb = await supabaseServer();

    // 1) Get current user
    const {
      data: { user },
      error: authErr,
    } = await sb.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        { error: "Unauthorized", auth: null },
        { status: 401 }
      );
    }

    // 2) Lấy user info từ user_profiles
    const { data: userData, error: userErr } = await sb
      .from("user_profiles")
      .select("plan_id, plan_expired_at, is_premium")
      .eq("user_id", user.id)
      .single();

    if (userErr) {
      console.error("[debug] user_profiles query error:", userErr);
    }

    // 3) Check transactions table directly
    const { data: allTransactions, error: transErr } = await sb
      .from("user_transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (transErr) {
      console.error("[debug] transactions query error:", transErr);
    }

    // 4) Check user's transactions specifically
    const { data: userTransactions, error: userTransErr } = await sb
      .from("user_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (userTransErr) {
      console.error("[debug] user transactions query error:", userTransErr);
    }

    // 5) Check orders
    const { data: orders, error: ordersErr } = await sb
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersErr) {
      console.error("[debug] orders query error:", ordersErr);
    }

    return NextResponse.json({
      debug: {
        currentUser: {
          id: user.id,
          email: user.email,
        },
        userProfilesData: userData || null,
        userProfilesError: userErr?.message || null,
        userTransactionsCount: userTransactions?.length || 0,
        userTransactions: userTransactions || [],
        userTransError: userTransErr?.message || null,
        allTransactionsCount: allTransactions?.length || 0,
        allTransactions: allTransactions || [],
        transError: transErr?.message || null,
        ordersCount: orders?.length || 0,
        orders: orders || [],
        ordersError: ordersErr?.message || null,
      },
    });
  } catch (error) {
    console.error("[debug] error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message },
      { status: 500 }
    );
  }
}
