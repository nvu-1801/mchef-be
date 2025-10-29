// app/api/webhook/payos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPayOSClient } from "@/lib/payos";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// map trạng thái PayOS → local enum
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

function getSbAdmin() {
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

export async function POST(req: NextRequest) {
  const sb = getSbAdmin();
  try {
    const raw = await req.json();

    // 1) Verify chữ ký webhook
    // SDK thường có method verifyPaymentWebhookData / tương đương
    const verified = await (
      getPayOSClient as unknown as {
        verifyPaymentWebhookData?: (data: unknown) => Promise<boolean>;
      }
    ).verifyPaymentWebhookData?.(raw as unknown);
    if (!verified) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2) Lấy thông tin cần thiết
    const orderCode: number =
      (raw as unknown as { data?: { orderCode?: number }; orderCode?: number })
        ?.data?.orderCode ??
      (raw as unknown as { orderCode?: number })?.orderCode ??
      0; // fallback value, or handle error if 0 is not valid
    const totalAmount: number =
      (raw as unknown as { data?: { amount?: number }; amount?: number })?.data
        ?.amount ?? (raw as unknown as { amount?: number })?.amount ?? 0;
    const providerStatus: string =
      (raw as unknown as { data?: { status?: string }; status?: string })?.data
        ?.status ?? (raw as unknown as { status?: string })?.status ?? "PENDING";

    // 3) Ghi log webhook
    await sb.from("payments").insert({
      order_code: orderCode,
      amount: totalAmount ?? null,
      event_type:
        (raw as unknown as { event?: string })?.event ??
        providerStatus ??
        "UNKNOWN",
      status: mapStatus(providerStatus) as unknown,
      raw_webhook: raw,
    });

    // 4) Cập nhật đơn
    const newStatus = mapStatus(providerStatus);
    const { data: updated, error: upErr } = await sb
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("order_code", orderCode)
      .select()
      .single();

    if (upErr) {
      console.error("[Webhook] Update order error:", upErr);
    }

    // 5) Nếu Paid → cấp quyền (ví dụ: ghi bảng subscriptions, set feature)
    if (newStatus === "PAID" && updated) {
      // TODO: upsert quyền Premium cho user_id = updated.user_id với plan_id = updated.plan_id
      // Ví dụ: upsert vào bảng subscriptions của bạn
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("[Webhook] error", e);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
