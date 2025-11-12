// app/api/me/transactions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import {
  getUserTransactions,
  // countUserTransactions, // 👈 ĐÃ BỊ XOÁ
  getUserTransactionStats,
} from "@/libs/server/payment"; // 👈 XOÁ countUserTransactions KHỎI IMPORT

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1) Xác thực user (Giữ nguyên)
    const sb = await supabaseServer();
    const {
      data: { user },
      error: authErr,
    } = await sb.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Lấy query params (Giữ nguyên)
    const searchParams = new URL(req.url).searchParams;
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);
    const status = searchParams.get("status") || undefined;

    // 3) & 4) & 5) Chạy 2 truy vấn song song
    const [transactionData, stats] = await Promise.all([
      getUserTransactions(sb, user.id, limit, offset, status), // 👈 Hàm này giờ đã chứa 'total'
      getUserTransactionStats(sb, user.id), // 👈 Hàm này giữ nguyên
    ]);

    // Trích xuất dữ liệu từ kết quả
    const { data: transactions, total } = transactionData;

    // 6) Trả về JSON
    return NextResponse.json({
      transactions,
      pagination: {
        total, // 👈 Lấy 'total' từ transactionData
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
      stats,
    });
  } catch (err: unknown) {
    console.error("[me/transactions] error:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}