// components/upgrade/PremiumBadge.tsx
"use client";

import { useUserPlan } from "@/hooks/useUserPlan";
import { getDaysRemaining } from "@/lib/payment-utils";

export function PremiumBadge() {
  const { plan } = useUserPlan();

  if (!plan?.is_premium) {
    return null;
  }

  const daysRemaining = getDaysRemaining(plan.plan_expired_at);

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-1 text-sm font-semibold text-white">
      ⭐ Premium
      {daysRemaining < 30 && daysRemaining > 0 && (
        <span className="text-xs">({daysRemaining} ngày)</span>
      )}
    </div>
  );
}
