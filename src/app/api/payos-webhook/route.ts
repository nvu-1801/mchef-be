// app/api/payos-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Xác thực chữ ký webhook từ PayOS
 * PayOS sử dụng HMAC SHA256 với checksum_key
 */
function verifyPayOSSignature(
  body: Record<string, unknown>,
  signature: string,
  checksumKey: string
): boolean {
  try {
    // Loại bỏ signature khỏi payload để tính lại
    const { signature: _, ...payload } = body;

    // PayOS sắp xếp keys theo alphabet và nối theo format: key1=value1&key2=value2...
    const sortedKeys = Object.keys(payload).sort();
    const signString = sortedKeys
      .map((k) => {
        const v = payload[k];
        return `${k}=${v}`;
      })
      .join("&");

    // Tính HMAC SHA256
    const computedSignature = crypto
      .createHmac("sha256", checksumKey)
      .update(signString)
      .digest("hex");

    return computedSignature === signature;
  } catch (err) {
    console.error("[webhook] signature verify error:", err);
    return false;
  }
}

/**
 * Tính toán ngày hết hạn gói dựa trên plan_duration_days
 */
function calculateExpiryDate(durationDays: number): string {
  const now = new Date();
  now.setDate(now.getDate() + durationDays);
  return now.toISOString();
}

export async function POST(req: NextRequest) {
  try {
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    if (!checksumKey) {
      console.error("[webhook] ❌ PAYOS_CHECKSUM_KEY missing in .env");
      return NextResponse.json(
        { error: "Webhook config error" },
        { status: 500 }
      );
    }

    // 1) Parse request body
    const body = await req.json();
    console.log("[webhook] 📨 Received webhook from PayOS:", JSON.stringify(body, null, 2));

    // 2) Xác thực chữ ký
    const signature = body.signature || body.checksumSignature;
    if (!signature) {
      console.warn("[webhook] ⚠️ Missing signature in request");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    const isValid = verifyPayOSSignature(body, signature, checksumKey);
    if (!isValid) {
      console.error("[webhook] ❌ Signature verification FAILED");
      console.error("[webhook] Expected signature:", signature);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }
    console.log("[webhook] ✅ Signature verified successfully");

    // 3) Lấy thông tin từ webhook
    // PayOS gửi: { code, desc, data: { orderCode, amount, status, ... }, signature }
    const code = body.code; // "0" = thành công
    const desc = body.desc || "";
    const data = body.data || {};
    const orderCode = data.orderCode;
    const paymentStatus = data.status; // "PAID", "PENDING", "FAILED", etc.

    console.log("[webhook] 📝 Extracted data:", {
      code,
      desc,
      orderCode,
      paymentStatus,
      amount: data.amount,
      currency: data.currency,
    });

    if (!orderCode) {
      console.warn("[webhook] ⚠️ Missing orderCode in webhook data");
      return NextResponse.json(
        { error: "Missing orderCode" },
        { status: 400 }
      );
    }

    // 4) Kết nối database
    const sb = await supabaseServer();

    // 5) Tìm order theo order_code
    const { data: order, error: orderErr } = await sb
      .from("orders")
      .select("id, user_id, plan_id, status")
      .eq("order_code", orderCode)
      .single();

    if (orderErr) {
      console.error("[webhook] order query error:", orderErr);
      // Trả về 200 để PayOS không retry (order không tồn tại)
      return NextResponse.json({ message: "Order not found" }, { status: 200 });
    }

    if (!order) {
      console.warn("[webhook] order not found for code:", orderCode);
      return NextResponse.json({ message: "Order not found" }, { status: 200 });
    }

    // 6) Nếu order đã xử lý, bỏ qua
    if (order.status === "COMPLETED" || order.status === "FAILED") {
      console.log(`[webhook] order ${orderCode} already processed as ${order.status}`);
      return NextResponse.json({ message: "Order already processed" }, { status: 200 });
    }

    // 7) Cập nhật trạng thái order
    let newOrderStatus = "PENDING";
    if (code === "0" && paymentStatus === "PAID") {
      newOrderStatus = "COMPLETED";
    } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
      newOrderStatus = "FAILED";
    }

    const { error: updateOrderErr } = await sb
      .from("orders")
      .update({
        status: newOrderStatus,
        provider_response: body, // lưu raw webhook response
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateOrderErr) {
      console.error("[webhook] order update error:", updateOrderErr);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    // 8) Nếu thanh toán thành công → cập nhật user plan + ghi transaction
    if (newOrderStatus === "COMPLETED") {
      // Lấy thông tin plan
      const { data: plan, error: planErr } = await sb
        .from("plans")
        .select("id, duration_days")
        .eq("id", order.plan_id)
        .single();

      if (planErr || !plan) {
        console.error("[webhook] plan query error:", planErr);
        return NextResponse.json(
          { message: "Updated order, but plan not found" },
          { status: 200 }
        );
      }

      // Tính ngày hết hạn
      const planExpiredAt = calculateExpiryDate(plan.duration_days || 30);

      // Cập nhật user_profiles: plan_id, plan_expired_at
      const { error: updateUserErr } = await sb
        .from("user_profiles")
        .upsert({
  user_id: order.user_id,
  plan_id: plan.id,
  plan_expired_at: planExpiredAt,
  is_premium: true,
  updated_at: new Date().toISOString(),
}, { onConflict: "user_id" });

      if (updateUserErr) {
        console.error("[webhook] ❌ user profile update error:", updateUserErr);
        console.error("[webhook] ❌ Failed to upgrade user to premium");
        return NextResponse.json(
          { message: "Order completed, but user plan update failed" },
          { status: 200 }
        );
      }

      console.log(`[webhook] ✅ User ${order.user_id} upgraded to premium with plan ${plan.id}, expires at ${planExpiredAt}`);

      // 9) Ghi lịch sử transaction
      const transactionPayload = {
        user_id: order.user_id,
        order_id: order.id,
        plan_id: plan.id,
        amount: data.amount || 0,
        currency: data.currency || "VND",
        payment_method: "PAYOS",
        transaction_type: "UPGRADE",
        status: "COMPLETED",
        reference_code: orderCode,
        notes: `Upgraded to ${plan.id} plan, expires at ${planExpiredAt}`,
        created_at: new Date().toISOString(),
      };

      console.log(`[webhook] 📝 Inserting transaction:`, transactionPayload);

      const { error: transErr, data: transData } = await sb
        .from("user_transactions")
        .insert(transactionPayload)
        .select();

      if (transErr) {
        console.error("[webhook] ❌ transaction insert error:", transErr);
        console.error("[webhook] ❌ error code:", transErr.code);
        console.error("[webhook] ❌ error message:", transErr.message);
        console.error("[webhook] ❌ error details:", transErr.details);
        // Không fail webhook vì transaction là optional
      } else {
        console.log(`[webhook] ✅ Transaction saved successfully:`, {
          id: transData?.[0]?.id,
          user_id: transData?.[0]?.user_id,
          order_id: transData?.[0]?.order_id,
        });
      }

      console.log(`[webhook] ✅ Order ${orderCode} completed. User ${order.user_id} upgraded to plan ${plan.id}`);
    } else if (newOrderStatus === "FAILED") {
      // 9b) Ghi lịch sử transaction cho FAILED payments
      console.log(`[webhook] 📝 Creating FAILED transaction for order ${orderCode}`);

      const { error: transErr } = await sb
        .from("user_transactions")
        .insert({
          user_id: order.user_id,
          order_id: order.id,
          plan_id: order.plan_id,
          amount: data.amount || 0,
          currency: data.currency || "VND",
          payment_method: "PAYOS",
          transaction_type: "UPGRADE",
          status: "FAILED",
          reference_code: orderCode,
          notes: `Payment failed. Status: ${paymentStatus}`,
          created_at: new Date().toISOString(),
        });

      if (transErr) {
        console.error("[webhook] ❌ failed transaction insert error:", transErr);
      } else {
        console.log(`[webhook] ✅ Failed transaction saved for order ${orderCode}`);
      }

      console.log(`[webhook] ❌ Order ${orderCode} failed. Status: ${paymentStatus}`);
    }

    // 10) Trả về 200 OK
    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
  } catch (err: unknown) {
    console.error("[webhook] unhandled error:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Webhook GET (tùy chọn để test)
export async function GET() {
  return NextResponse.json({ message: "Webhook endpoint is ready" });
}
