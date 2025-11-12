// libs/types/payment.ts
/**
 * Định nghĩa types cho hệ thống thanh toán
 */

export type OrderStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type PaymentProvider = "PAYOS" | "STRIPE" | "MOMO";
export type TransactionType = "UPGRADE" | "REFUND" | "MANUAL";

export interface Plan {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  duration_days: number;
  features?: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  order_code: number;
  status: OrderStatus;
  provider: PaymentProvider;
  provider_payment_link_id?: string;
  checkout_url?: string;
  qr_code?: string;
  raw_payload?: Record<string, unknown>;
  provider_response?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UserTransaction {
  id: string;
  user_id: string;
  order_id?: string;
  plan_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentProvider;
  transaction_type: TransactionType;
  status: "PENDING" | "COMPLETED" | "FAILED";
  reference_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPlan {
  id: string;
  username: string;
  email?: string;
  plan_id: string | null;
  plan_expired_at: string | null;
  is_premium: boolean;
}

export interface CheckoutResponse {
  orderId: string;
  orderCode: number;
  checkoutUrl: string;
  qrCode?: string;
  paymentLinkId?: string;
}

export interface PayOSWebhookPayload {
  code: string | number;
  desc: string;
  data: {
    orderCode: number;
    amount: number;
    currency?: string;
    status: string;
    [key: string]: unknown;
  };
  signature: string;
}
