// lib/payment-utils.ts
/**
 * Utility functions cho payment processing
 */

/**
 * Kiểm tra nếu plan đã hết hạn
 */
export function isPlanExpired(expiryDate: string | null): boolean {
  if (!expiryDate) return true;
  return new Date(expiryDate) < new Date();
}

/**
 * Tính số ngày còn lại của plan
 */
export function getDaysRemaining(expiryDate: string | null): number {
  if (!expiryDate) return 0;

  const now = new Date();
  const expiry = new Date(expiryDate);

  if (expiry < now) return 0;

  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format tiền theo VND
 */
export function formatPrice(amount: number, currency: string = "VND"): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format ngày tháng
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Tạo order code
 */
export function generateOrderCode(): number {
  const base = Date.now().toString().slice(-9);
  const rnd = Math.floor(Math.random() * 90 + 10).toString();
  return Number(base + rnd);
}
