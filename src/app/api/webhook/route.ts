/**
 * API Route: app/api/webhook/payos/route.ts
 * Lắng nghe tín hiệu từ PayOS và kích hoạt Premium (Cầu nối)
 */
import { NextRequest, NextResponse } from "next/server";
import { getPayOSClient } from "@/lib/payos"; // Giả sử bạn có file này
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 👇 Import các hàm "cầu nối" từ file payment.ts của bạn
import {
  getPlanById,
  updateUserPlan,
} from "@/libs/server/payment"; // ⚠️ Đảm bảo đường dẫn này đúng

export const runtime = "nodejs";

/**
 * Map trạng thái từ PayOS sang trạng thái local
 */
function mapStatus(payosStatus: string): string { // 👈 Thêm :string
  switch (payosStatus?.toUpperCase()) {
    case "PAID":
    case "SUCCEEDED":
      return "PAID";
    case "CANCELLED":
      return "CANCELLED";
    case "FAILED":
      return "FAILED";
    case "EXPIRED":
      return "EXPIRED";
    default:
      return "PENDING";
  }
}

/**
 * Tạo Supabase Admin Client
 */
function getSbAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !key) {
    console.error("[ENV] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE");
    throw new Error(
      "Server misconfigured: SUPABASE_URL or SUPABASE_SERVICE_ROLE missing"
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Xử lý webhook từ PayOS
 */
export async function POST(req: NextRequest) {
  const sb = getSbAdmin(); // Admin client
  try {
    const raw = await req.json();

    // 1️⃣ Verify chữ ký webhook (nên bật khi production)
    // ... (logic verify của bạn) ...
    
    // (Vì chúng ta đang test, có thể tạm thời bỏ qua verify)

    // 2️⃣ Lấy thông tin
    const orderCode: number =
      (raw as any)?.data?.orderCode ?? (raw as any)?.orderCode ?? 0;
    const providerStatus: string =
      (raw as any)?.data?.status ?? (raw as any)?.status ?? "PENDING";

    if (orderCode === 0) {
      throw new Error("Webhook received but orderCode is 0 or missing.");
    }

    // 3️⃣ Ghi log (tùy chọn nhưng rất tốt)
    // await sb.from("payment_logs").insert({ ... });

    // 4️⃣ Cập nhật đơn hàng
    const newStatus = mapStatus(providerStatus);
    const { data: updatedOrder, error: orderErr } = await sb
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        provider_response: raw, // Lưu toàn bộ payload để debug
      })
      .eq("order_code", orderCode)
      .select()
      .single();

    if (orderErr) {
      console.error(`[Webhook] Update order ${orderCode} error:`, orderErr);
      // Không tìm thấy đơn hàng, vẫn trả về 200 để PayOS không gửi lại
      if (orderErr.code === "PGRST116") {
        return NextResponse.json({
          ok: true,
          message: "Order not found, acknowledged.",
        });
      }
      throw orderErr;
    }

    // 5️⃣ KÍCH HOẠT PREMIUM (PHẦN QUAN TRỌNG NHẤT)
    if (newStatus === "PAID" && updatedOrder) {
      const planId = updatedOrder.plan_id;
      const userId = updatedOrder.user_id;

      if (!planId || !userId) {
        throw new Error(`Order ${updatedOrder.id} PAID, but missing details.`);
      }

      // 5a. Kiểm tra Role (Theo yêu cầu của bạn)
      const { data: userProfile } = await sb
        .from("user_profiles") // 👈 ĐỌC TỪ BẢNG PROFILE
        .select("role")
        .eq("user_id", userId)
        .single();

      if (userProfile?.role === "admin") {
        console.log(`[Webhook] User ${userId} is ADMIN. Skipping Premium.`);
        return NextResponse.json({
          ok: true,
          message: "Admin order, skipping activation.",
        });
      }

      // 5b. Lấy thông tin gói
      const plan = await getPlanById(sb, planId);
      if (!plan) {
        throw new Error(`Plan ID ${planId} not found!`);
      }

      // 5c. Tính ngày hết hạn
      const durationDays = plan.duration_days || 30;
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() + durationDays);

      // 5d. Kích hoạt! (GHI vào user_profiles)
      // Hàm này đã được sửa trong payment.ts để GHI vào "user_profiles"
      const activated = await updateUserPlan(
        sb,
        userId,
        planId,
        expiredDate.toISOString()
      );

      if (!activated) {
        throw new Error(`FAILED to activate plan for user ${userId}`);
      }

      console.log(
        `[Webhook] SUCCESS: Activated plan ${planId} for user ${userId}`
      );
    }

    // ✅ Hoàn tất, báo cho PayOS "OK"
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("[Webhook] Unhandled Error:", e);
    return NextResponse.json(
      { error: (e as Error).message || "Webhook error" },
      { status: 500 }
    );
  }
}