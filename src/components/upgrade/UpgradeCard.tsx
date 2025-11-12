// components/upgrade/UpgradeCard.tsx
"use client";

import { useState } from "react";
import { useCheckout } from "@/hooks/useCheckout";
import type { Plan } from "@/libs/types/payment";

interface UpgradeCardProps {
  plan: Plan;
  isCurrentPlan?: boolean;
  daysRemaining?: number;
}

export function UpgradeCard({
  plan,
  isCurrentPlan = false,
  daysRemaining = 0,
}: UpgradeCardProps) {
  const { startCheckout, loading, error } = useCheckout();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const result = await startCheckout({ planId: plan.id });
      if (result?.checkoutUrl) {
        // Redirect đến PayOS checkout
        window.location.href = result.checkoutUrl;
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const features = Array.isArray(plan.features)
    ? plan.features
    : (plan.features || []);

  return (
    <div
      className={`rounded-lg border-2 p-6 transition-all ${
        isCurrentPlan
          ? "border-blue-500 bg-blue-50 shadow-lg"
          : "border-gray-200 bg-white hover:shadow-md"
      }`}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{plan.title}</h3>
        {plan.description && (
          <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
        )}
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900">
            {plan.amount.toLocaleString("vi-VN")}
          </span>
          <span className="ml-2 text-gray-600">₫/{plan.duration_days} ngày</span>
        </div>
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div className="mb-6 space-y-3">
          {features.map((feature: string, idx: number) => (
            <div key={idx} className="flex items-start">
              <span className="mr-3 text-green-600">✓</span>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      )}

      {/* Current Status */}
      {isCurrentPlan && daysRemaining > 0 && (
        <div className="mb-6 rounded-md bg-blue-100 p-3">
          <p className="text-sm font-medium text-blue-900">
            Gói hiện tại - Còn {daysRemaining} ngày
          </p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleUpgrade}
        disabled={loading || isProcessing}
        className={`w-full rounded-lg px-4 py-2 font-semibold text-white transition-colors ${
          isProcessing || loading
            ? "cursor-not-allowed bg-gray-400"
            : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
        }`}
      >
        {isProcessing || loading ? "Đang xử lý..." : "Nâng cấp"}
      </button>

      {/* Error Display */}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
