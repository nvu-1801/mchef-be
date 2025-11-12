/**
 * Payment service - các hàm helper xử lý thanh toán & gói dịch vụ
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Order, UserPlan, Plan } from "@/libs/types/payment";

/* ========================== PLANS ========================== */
//src/libs/sever/payment.ts
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

/**
 * Tạo order mới
 */
export async function createOrder(
  sb: SupabaseClient,
  orderData: Omit<Order, "id" | "created_at" | "updated_at">
): Promise<Order | null> {
  const { data, error } = await sb.from("orders").insert(orderData).select().single();

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

/**
 * Lấy user current plan
 */
export async function getUserPlan(
  sb: SupabaseClient,
  userId: string
): Promise<UserPlan | null> {
  // ✅ 1) Kiểm tra xem bảng nào tồn tại
  const { data: profile, error } = await sb
    .from("user_profiles") // nếu bảng bạn là "users" thì đổi chỗ này
    .select("user_id, plan_id, plan_expired_at")
    .eq("user_id", userId)
    .maybeSingle(); // 🔄 đổi từ .single() → .maybeSingle()

  if (error) {
    console.error("[getUserPlan] error:", error);
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

  const isExpired = profile.plan_expired_at
    ? new Date(profile.plan_expired_at) < new Date()
    : false;

  return {
    id: profile.user_id,
    username: "",
    email: "",
    plan_id: isExpired ? null : profile.plan_id,
    plan_expired_at: isExpired ? null : profile.plan_expired_at,
    is_premium: !!profile.plan_id && !isExpired,
  };
}


/**
 * Cập nhật user plan
 */
export async function updateUserPlan(
  sb: SupabaseClient,
  userId: string,
  planId: string,
  planExpiredAt: string
): Promise<boolean> {
  const { error } = await sb
    .from("users")
    .update({
      plan_id: planId,
      plan_expired_at: planExpiredAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[updateUserPlan] error:", error);
    return false;
  }

  return true;
}

/* ========================== TRANSACTIONS ========================== */

/**
 * Tạo transaction record
 */
export async function createTransaction(
  sb: SupabaseClient,
  transactionData: {
    user_id: string;
    order_id?: string;
    plan_id: string;
    amount: number;
    currency: string;
    payment_method: string;
    transaction_type: string;
    status: string;
    reference_code?: string;
    notes?: string;
  }
): Promise<boolean> {
  const { error } = await sb.from("user_transactions").insert({
    ...transactionData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[createTransaction] error:", error);
    return false;
  }

  return true;
}

/**
 * Lấy lịch sử transaction của user (có join plans & orders)
 */
export async function getUserTransactions(
  sb: SupabaseClient, // 👈 Sửa "any" thành "SupabaseClient"
  userId: string,
  limit: number = 50,
  offset: number = 0,
  status?: string
) {
  try {
    const normalizedStatus = status ? status.toUpperCase() : undefined;

    let query = sb
      .from("orders") // 👈 SỬA LẠI: Dùng bảng "orders" (theo ý bạn)
      .select(
        `
        id,
        order_code,
        amount,
        currency,
        status,
        provider,
        created_at,
        plan_id,
        plans:plan_id ( title )
      `,
        { count: "exact" } // 👈 THÊM VÀO ĐỂ ĐẾM
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (normalizedStatus) {
      query = query.eq("status", normalizedStatus);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query; // 👈 Lấy "count" từ kết quả

    if (error) {
      console.error("[getUserTransactions] error:", error);
      // Ném lỗi để API route bắt được
      throw new Error(error.message);
    }
    
    // Map lại dữ liệu cho gọn gàng (nếu muốn)
    const formattedData = (data || []).map((order) => ({
      id: order.id,
      createdAt: order.created_at, // 👈 Client dùng 'createdAt'
      reference: order.order_code, // 👈 Client dùng 'reference'
      amount: order.amount,
      currency: order.currency,
      type: "UPGRADE", // 👈 Client dùng 'type' (gán cứng là 'UPGRADE')
      status: order.status,
      method: order.provider, // 👈 Client dùng 'method'
      // 👈 Client dùng 'note' (lấy từ tên plan)
      note: (order.plans as any)?.title ?? "N/A",
      
      // Các trường mà Client không dùng nhưng vẫn có
      planTitle: (order.plans as any)?.title ?? null,
      orderCode: order.order_code,
    }));

    // Trả về object chứa data đã map VÀ tổng số
    return { data: formattedData, total: count ?? 0 };
  } catch (err) {
    console.error("[getUserTransactions] unexpected error:", err);
    return { data: [], total: 0 };
  }
}

/**
 * Đếm tổng số transaction của user
 */
// export async function countUserTransactions(
//   sb: SupabaseClient,
//   userId: string,
//   status?: string
// ): Promise<number> {
//   const normalizedStatus = status ? status.toUpperCase() : undefined;

//   let query = sb
//     .from("user_transactions")
//     .select("id", { count: "exact", head: true })
//     .eq("user_id", userId);

//   if (normalizedStatus) {
//     query = query.eq("status", normalizedStatus);
//   }

//   const { count, error } = await query;

//   if (error) {
//     console.error("[countUserTransactions] error:", error);
//     return 0;
//   }

//   return count || 0;
// }

/**
 * Lấy transaction theo ID
 */
export async function getTransactionById(
  sb: SupabaseClient,
  transactionId: string
) {
  const { data, error } = await sb
    .from("user_transactions")
    .select("*")
    .eq("id", transactionId)
    .single();

  if (error) {
    console.error("[getTransactionById] error:", error);
    return null;
  }

  return data;
}

/**
 * Lấy transaction theo reference code
 */
export async function getTransactionByReferenceCode(
  sb: SupabaseClient,
  referenceCode: string
) {
  const { data, error } = await sb
    .from("user_transactions")
    .select("*")
    .eq("reference_code", referenceCode)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[getTransactionByReferenceCode] error:", error);
  }

  return data || null;
}

/**
 * Lấy tổng doanh thu user (các transaction COMPLETED)
 */
export async function getUserTotalSpent(
  sb: SupabaseClient,
  userId: string
): Promise<number> {
  const { data, error } = await sb
    .from("user_transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("status", "COMPLETED");

  if (error) {
    console.error("[getUserTotalSpent] error:", error);
    return 0;
  }

  return (data || []).reduce((sum, t) => sum + (t.amount || 0), 0);
}

/**
 * Lấy thống kê transaction của user (COMPLETED/FAILED/PENDING)
 */
export async function getUserTransactionStats(
  sb: SupabaseClient,
  userId: string
) {
  try {
    const { data, error } = await sb
      .from("user_transactions")
      .select("status")
      .eq("user_id", userId);

    if (error) {
      console.error("[getUserTransactionStats] error:", error);
      return { total: 0, completed: 0, failed: 0, pending: 0 };
    }

    const stats = { total: 0, completed: 0, failed: 0, pending: 0 };

    for (const t of data || []) {
      stats.total++;
      if (t.status === "COMPLETED") stats.completed++;
      else if (t.status === "FAILED") stats.failed++;
      else if (t.status === "PENDING") stats.pending++;
    }

    return stats;
  } catch (err) {
    console.error("[getUserTransactionStats] unexpected error:", err);
    return { total: 0, completed: 0, failed: 0, pending: 0 };
  }
}
