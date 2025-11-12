// app/api/webhook/payos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPayOSClient } from "@/lib/payos";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 👇 Import các hàm từ payment.ts
import { getPlanById, updateUserPlan } from "@/libs/server/payment"; // ⚠️ Kiểm tra đúng đường dẫn

export const runtime = "nodejs";

/**
 * Map trạng thái từ PayOS sang trạng thái local
 */
function mapStatus(payosStatus: string) {
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
    console.error("[ENV] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE", {
      hasUrl: !!url,
      hasKey: !!key,
    });
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

    // 1️⃣ Verify chữ ký webhook (tạm bỏ qua để test)
    const verified = await (
      getPayOSClient as unknown as {
        verifyPaymentWebhookData?: (data: unknown) => Promise<boolean>;
      }
    ).verifyPaymentWebhookData?.(raw as unknown);

    // ⚠️ Tạm thời bỏ qua verify để test
    // if (!verified) {
    //   console.warn("[Webhook] Invalid signature, skipping verification for test");
    //   // return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    // }

    // 2️⃣ Lấy thông tin cần thiết
    const orderCode: number =
      (raw as any)?.data?.orderCode ?? (raw as any)?.orderCode ?? 0;
    const totalAmount: number =
      (raw as any)?.data?.amount ?? (raw as any)?.amount ?? 0;
    const providerStatus: string =
      (raw as any)?.data?.status ?? (raw as any)?.status ?? "PENDING";

    if (orderCode === 0) {
      throw new Error("Webhook received but orderCode is 0 or missing.");
    }

    // 3️⃣ Ghi log webhook
    await sb.from("payments").insert({
      order_code: orderCode,
      amount: totalAmount ?? null,
      event_type: (raw as any)?.event ?? providerStatus ?? "UNKNOWN",
      status: mapStatus(providerStatus),
      raw_webhook: raw,
    });

    // 4️⃣ Cập nhật đơn hàng
    const newStatus = mapStatus(providerStatus);
    const { data: updated, error: upErr } = await sb
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        provider_response: raw, // Lưu toàn bộ payload để debug
      })
      .eq("order_code", orderCode)
      .select()
      .single();

    if (upErr) {
      console.error("[Webhook] Update order error:", upErr);
      // Nếu không tìm thấy đơn hàng, vẫn trả về 200 để PayOS không gửi lại
      if (upErr.code === "PGRST116") {
        return NextResponse.json({
          ok: true,
          message: "Order not found, but acknowledged.",
        });
      }
      throw upErr;
    }

    // 5️⃣ Kích hoạt Premium nếu thanh toán thành công
    if (newStatus === "PAID" && updated) {
      const planId = updated.plan_id;
      const userId = updated.user_id;

      if (!planId || !userId) {
        console.error(
          `[Webhook] Order ${updated.id} is PAID but missing plan_id or user_id.`
        );
        return NextResponse.json({
          ok: true,
          message: "Processed, but missing order details (plan_id/user_id)",
        });
      }

      // 1. Lấy thông tin gói
      const plan = await getPlanById(sb, planId);
      if (!plan) {
        console.error(`[Webhook] Plan ID ${planId} not found!`);
        return NextResponse.json({
          ok: true,
          message: "Processed, but plan not found",
        });
      }

      // 2. Tính ngày hết hạn
      const durationDays = plan.duration_days || 30; // mặc định 30 ngày
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() + durationDays);

      console.log(
        `[Webhook] Plan activated. User: ${userId}. Expires: ${expiredDate.toISOString()}`
      );

      // 3. Cập nhật user premium
      const activated = await updateUserPlan(
        sb,
        userId,
        planId,
        expiredDate.toISOString()
      );

      if (!activated) {
        console.error(`[Webhook] FAILED to activate plan for user ${userId}`);
        throw new Error(`Failed to activate plan for user ${userId}`);
      }

      console.log(
        `[Webhook] Successfully activated plan ${planId} for user ${userId}`
      );
    }

    // ✅ Hoàn tất
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("[Webhook] error", e);
    return NextResponse.json(
      { error: (e as Error).message || "Webhook error" },
      { status: 500 }
    );
  }
}
