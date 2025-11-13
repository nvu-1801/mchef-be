/**
 * Payment service - các hàm helper xử lý thanh toán & gói dịch vụ
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Order, UserPlan, Plan } from "@/libs/types/payment";

/* ========================== PLANS ========================== */
// ⚠️ ĐÃ SỬA TYPO: src/libs/server/payment.ts

/**
 * Lấy thông tin plan theo ID
 */
export async function getPlanById(
  sb: SupabaseClient,
  planId: string
): Promise<Plan | null> {
  const { data, error } = await sb
    .from("plans")
    .select(
      "id, title, description, amount, currency, duration_days, features, active, created_at, updated_at"
    )
    .eq("id", planId)
    .eq("active", true)
    .single();

  if (error) {
    console.error("[getPlanById] error:", error);
    return null;
  }
  return data;
}

/**
 * Lấy danh sách plan đang active
 */
export async function getActivePlans(sb: SupabaseClient): Promise<Plan[]> {
  // (Code không đổi, đã đúng)
  const { data, error } = await sb
    .from("plans")
    .select(
      "id, title, description, amount, currency, duration_days, features, active, created_at, updated_at"
    )
    .eq("active", true)
    .order("amount", { ascending: true });

  if (error) {
    console.error("[getActivePlans] error:", error);
    return [];
  }
  return data || [];
}

/* ========================== ORDERS ========================== */
// (Các hàm Orders (create, get, update) của bạn đã đúng, giữ nguyên)

/**
 * Tạo order mới
 */
export async function createOrder(
  sb: SupabaseClient,
  orderData: Omit<Order, "id" | "created_at" | "updated_at">
): Promise<Order | null> {
  // (Code không đổi, đã đúng)
  const { data, error } = await sb
    .from("orders")
    .insert(orderData)
    .select()
    .single();
  if (error) {
    console.error("[createOrder] error:", error);
    return null;
  }
  return data;
}

/**
 * Lấy order theo order_code
 */
export async function getOrderByCode(
  sb: SupabaseClient,
  orderCode: number
): Promise<Order | null> {
  // (Code không đổi, đã đúng)
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .eq("order_code", orderCode)
    .single();
  if (error && error.code !== "PGRST116") {
    console.error("[getOrderByCode] error:", error);
  }
  return data || null;
}

/**
 * Cập nhật trạng thái order
 */
export async function updateOrderStatus(
  sb: SupabaseClient,
  orderId: string,
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED",
  providerResponse?: Record<string, unknown>
): Promise<boolean> {
  // (Code không đổi, đã đúng)
  const { error } = await sb
    .from("orders")
    .update({
      status,
      provider_response: providerResponse,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (error) {
    console.error("[updateOrderStatus] error:", error);
    return false;
  }
  return true;
}

/* ========================== USER PLAN ========================== */
// ⚠️ PHẦN NÀY ĐÃ ĐƯỢC SỬA LỖI HOÀN TOÀN

/**
 * Lấy user current plan (Hàm ĐỌC - Trang Profile dùng)
 * ⚠️ SỬA 1: Đọc từ "user_profiles"
 */
export async function getUserPlan(
  sb: SupabaseClient,
  userId: string
): Promise<UserPlan | null> {
  const { data: profile, error } = await sb
    .from("user_profiles") // 👈 SỬA: ĐỌC TỪ PROFILE
    .select("user_id, plan_id, plan_expired_at, role") // Lấy cột ngày hết hạn
    .eq("user_id", userId) // 👈 SỬA: Dùng "user_id"
    .maybeSingle();

  if (error) {
    console.error("[getUserPlan] error:", error);
    // Trả về null để UI biết là có lỗi
    return null;
  }

  if (!profile) {
    // Không có profile => return default free plan
    return {
      id: userId,
      username: "",
      email: "",
      plan_id: null,
      plan_expired_at: null,
      is_premium: false,
    };
  }

  // Logic kiểm tra hết hạn (Quan trọng)
  const isExpired = profile.plan_expired_at
    ? new Date(profile.plan_expired_at) < new Date()
    : false;

  return {
    id: profile.user_id,
    username: "", // (Nên lấy từ profile)
    email: "", // (Nên lấy từ auth.users)
    plan_id: isExpired ? null : profile.plan_id,
    plan_expired_at: isExpired ? null : profile.plan_expired_at,
    is_premium: !!profile.plan_id && !isExpired,
  };
}

/**
 * Cập nhật user plan (Hàm GHI - Webhook dùng)
 * ⚠️ SỬA 2: Ghi vào "user_profiles"
 */
export async function updateUserPlan(
  sb: SupabaseClient,
  userId: string,
  planId: string,
  planExpiredAt: string
): Promise<boolean> {
  const { error } = await sb
    .from("user_profiles") // 👈 SỬA: GHI VÀO PROFILE
    .update({
      plan_id: planId,
      plan_expired_at: planExpiredAt,
      // updated_at: new Date().toISOString(), (Nếu có)
    })
    .eq("user_id", userId); // 👈 SỬA: Dùng "user_id"

  if (error) {
    console.error("[updateUserPlan] error:", error);
    return false;
  }
  return true;
}

/* ========================== TRANSACTIONS ========================== */
// (Hàm createTransaction không đụng tới, nó dùng bảng user_transactions)

/**
 * Lấy lịch sử transaction của user (ĐÃ SỬA THEO Ý BẠN)
 */
export async function getUserTransactions(
  sb: SupabaseClient,
  userId: string,
  limit: number = 50,
  offset: number = 0,
  status?: string
) {
  // (Code này đã tốt, giữ nguyên)
  try {
    const normalizedStatus = status ? status.toUpperCase() : undefined;
    let query = sb
      .from("orders")
      .select(
        `
        id, order_code, amount, currency, status, provider, created_at, plan_id,
        plans:plan_id ( title )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (normalizedStatus) {
      query = query.eq("status", normalizedStatus);
    }
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) {
      throw new Error(error.message);
    }

    const formattedData = (data || []).map((order) => ({
      id: order.id,
      createdAt: order.created_at,
      reference: order.order_code,
      amount: order.amount,
      currency: order.currency,
      type: "UPGRADE",
      status: order.status,
      method: order.provider,
      note: (order.plans as any)?.title ?? "N/A",
      planTitle: (order.plans as any)?.title ?? null,
      orderCode: order.order_code,
    }));
    return { data: formattedData, total: count ?? 0 };
  } catch (err) {
    console.error("[getUserTransactions] unexpected error:", err);
    return { data: [], total: 0 };
  }
}

// ⚠️ ĐÃ XÓA "countUserTransactions" (vì đã gộp)

// (Các hàm getTransaction... đang dùng "user_transactions", tạm bỏ qua)

/**
 * Lấy thống kê transaction của user (COMPLETED/FAILED/PENDING)
 * ⚠️ SỬA 3: Đọc từ "orders"
 */
export async function getUserTransactionStats(
  sb: SupabaseClient,
  userId: string
) {
  // (Chúng ta có thể dùng RPC cho nhanh, nhưng đây là cách sửa nhanh)
  try {
    const { data, error } = await sb
      .from("orders") // 👈 SỬA: Đọc từ "orders"
      .select("status")
      .eq("user_id", userId);

    if (error) {
      console.error("[getUserTransactionStats] error:", error);
      return { total: 0, completed: 0, failed: 0, pending: 0, paid: 0 };
    }

    const stats = { total: 0, completed: 0, failed: 0, pending: 0, paid: 0 };
    for (const t of data || []) {
      stats.total++;
      if (t.status === "COMPLETED") stats.completed++;
      else if (t.status === "FAILED") stats.failed++;
      else if (t.status === "PENDING") stats.pending++;
      else if (t.status === "PAID") stats.paid++; // Thêm trạng thái PAID
    }
    return stats;
  } catch (err) {
    console.error("[getUserTransactionStats] unexpected error:", err);
    return { total: 0, completed: 0, failed: 0, pending: 0, paid: 0 };
  }
}