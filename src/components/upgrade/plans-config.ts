// components/upgrade/plans-config.ts
// Mapping giữa plan names và UUIDs từ database
// Cấu hình này được load từ database lúc runtime

export const PLAN_MAPPING: Record<string, string> = {
  // Mapping tên plan → UUID
  // Những UUID này được tạo bởi migration 001 (INSERT sample plans)
  "user_premium_month": "", // sẽ được fetch từ database
  "user_premium_year": "",  // sẽ được fetch từ database
};

// Type-safe plan IDs
export type PlanKey = keyof typeof PLAN_MAPPING;

/**
 * Lấy UUID của plan từ key
 */
export function getPlanUuid(planKey: string): string | null {
  const uuid = PLAN_MAPPING[planKey];
  return uuid || null;
}

/**
 * Tên-tên plans (dùng để hiển thị)
 */
export const PLAN_NAMES = {
  "user_premium_month": "Premium 1 Tháng",
  "user_premium_year": "Premium 1 Năm",
};
