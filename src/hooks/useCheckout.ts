// hooks/useCheckout.ts
/**
 * Hook để initiate checkout process
 */

import { useState, useCallback } from "react";
import type { CheckoutResponse } from "@/libs/types/payment";

export interface CheckoutOptions {
  planId: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(
    async (options: CheckoutOptions): Promise<CheckoutResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        // Lấy user từ session/auth
        const meResponse = await fetch("/api/me");
        if (!meResponse.ok) {
          throw new Error("Not authenticated");
        }
        const { id: userId } = await meResponse.json();

        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            planId: options.planId,
            userId,
            returnUrl: options.returnUrl || window.location.origin + "/upgrade/success",
            cancelUrl: options.cancelUrl || window.location.origin + "/upgrade/cancel",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Checkout failed");
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const message = (err as Error)?.message || "Checkout error";
        setError(message);
        console.error("[useCheckout] error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { startCheckout, loading, error };
}
