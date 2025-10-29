// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sinh orderCode số nguyên dương, độ dài vừa phải
function genOrderCode() {
  // ví dụ: 9 chữ số cuối của epoch + random 2 số
  const base = Date.now().toString().slice(-9);
  const rnd = Math.floor(Math.random() * 90 + 10).toString();
  return Number(base + rnd);
}

// helper: cắt mô tả ≤ max ký tự, bỏ kí tự lạ/emoji để chắc chắn
function safeDescription(input: string, max = 25) {
  const s = input.normalize("NFKC").replace(/\s+/g, " ").trim();
  // (tuỳ chọn) bỏ emoji/kí tự ngoài BMP nếu sợ cắt sai
  const noEmoji = s.replace(/[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F9FF}]/gu, "");
  return noEmoji.length <= max ? noEmoji : noEmoji.slice(0, max);
}

// Ký HMAC SHA256 theo format chuẩn: nối các cặp key=value theo thứ tự alphabet
function signPayload(obj: Record<string, unknown>, checksumKey: string) {
  // Lấy đúng 5 key: amount, cancelUrl, description, orderCode, returnUrl
  const picked: Record<string, string> = {};
  const keys = ["amount", "cancelUrl", "description", "orderCode", "returnUrl"];
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null) picked[k] = String(v);
  }
  const raw = keys.map((k) => `${k}=${picked[k] ?? ""}`).join("&");
  return crypto.createHmac("sha256", checksumKey).update(raw).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { planId, userId, returnUrl, cancelUrl } = await req.json();

    if (!planId || !userId) {
      return NextResponse.json(
        { error: "Missing planId or userId" },
        { status: 400 }
      );
    }

    // 1) Xác thực user theo session cookie
    const sb = await supabaseServer();
    const {
      data: { user },
      error: authErr,
    } = await sb.auth.getUser();
    if (authErr || !user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) ENV bắt buộc
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

    if (!baseUrl)
      return NextResponse.json(
        { error: "NEXT_PUBLIC_BASE_URL missing" },
        { status: 500 }
      );
    if (!clientId || !apiKey || !checksumKey) {
      return NextResponse.json({ error: "PAYOS env missing" }, { status: 500 });
    }

    // 3) Lấy plan (cần RLS: SELECT active)
    const { data: plan, error: planErr } = await sb
      .from("plans")
      .select("id, title, amount, currency, active")
      .eq("id", planId)
      .single();

    if (planErr) {
      console.error("[checkout] plan select error:", planErr);
      return NextResponse.json({ error: "Plan query failed" }, { status: 500 });
    }
    if (!plan || !plan.active) {
      return NextResponse.json(
        { error: "Plan not found/inactive" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(plan.amount) || plan.amount <= 0) {
      return NextResponse.json(
        { error: "Invalid plan amount" },
        { status: 400 }
      );
    }

    // 4) orderCode + payload
    const orderCode = genOrderCode();

    // ⚠️ description phải ≤ 25 kí tự
    // Ví dụ ngắn gọn: "Plan <id> #<order>"
    const rawDesc = `Plan ${planId} #${orderCode}`;
    const desc = safeDescription(rawDesc, 25);

    // Đảm bảo amount là integer > 0
    const amount = Math.max(0, Math.round(Number(plan.amount)));
    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid plan amount" },
        { status: 400 }
      );
    }

    const payload = {
      amount, // dùng amount đã chuẩn hoá
      orderCode,
      description: desc, // dùng mô tả đã rút gọn
      returnUrl: returnUrl ?? `${baseUrl}/checkout/return`,
      cancelUrl: cancelUrl ?? `${baseUrl}/checkout/cancel`,
      // optional: expiredAt: Math.floor(Date.now()/1000) + 30*60,
    };
    const signature = signPayload(payload, checksumKey);

    // 5) Gọi REST PayOS
    const resp = await fetch(
      "https://api-merchant.payos.vn/v2/payment-requests",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-client-id": clientId,
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ ...payload, signature }),
      }
    );

    const j = await resp.json();

    if (!resp.ok) {
      console.error("[PayOS] error:", j);
      const msg = j?.desc || j?.message || "PayOS error";
      return NextResponse.json({ error: msg, detail: j }, { status: 502 });
    }

    const data = j?.data ?? {};
    const checkoutUrl =
      typeof data?.checkoutUrl === "string" ? data.checkoutUrl : null;
    const paymentLinkId = data?.paymentLinkId ?? data?.id ?? null;
    const qrCode = data?.qrCode ?? null;

    if (!checkoutUrl) {
      console.error("[PayOS] missing checkoutUrl. Raw response:", j);
      return NextResponse.json(
        { error: "Missing checkoutUrl from PayOS", detail: j },
        { status: 502 }
      );
    }

    // 6) Lưu order (cần RLS: INSERT owner)
    const { data: inserted, error: insErr } = await sb
      .from("orders")
      .insert({
        user_id: userId,
        plan_id: plan.id,
        amount: plan.amount,
        currency: plan.currency ?? "VND",
        order_code: orderCode,
        status: "PENDING",
        provider: "PAYOS",
        provider_payment_link_id: paymentLinkId,
        checkout_url: checkoutUrl,
        qr_code: qrCode,
        raw_payload: j, // lưu raw để đối soát
      })
      .select("id")
      .single();

    if (insErr) {
      console.error("[DB] insert order error:", insErr);
      return NextResponse.json(
        { error: "DB insert failed (RLS?)" },
        { status: 500 }
      );
    }

    const accept = req.headers.get("accept") || "";
    const wantsHtml = accept.includes("text/html");
    if (wantsHtml) {
      return NextResponse.redirect(checkoutUrl, { status: 303 });
    }

    return NextResponse.json({
      orderId: inserted.id,
      orderCode,
      checkoutUrl,
      qrCode,
      paymentLinkId,
    });
  } catch (e: unknown) {
    console.error("[checkout] unhandled:", e);
    return NextResponse.json(
      { error: (e as Error)?.message || "Failed to create checkout" },
      { status: 500 }
    );
  }
}
