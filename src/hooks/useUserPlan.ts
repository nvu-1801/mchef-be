// hooks/useUserPlan.ts
/**
 * Hook để lấy thông tin plan của user hiện tại
 * Dùng khi user login → check plan_id + plan_expired_at → unlock premium
 */

import { useEffect, useState, useCallback } from "react";
import type { UserPlan } from "@/libs/types/payment";

export function useUserPlan() {
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/me/plan");
      if (!response.ok) {
        if (response.status === 401) {
          // User chưa login
          setPlan(null);
          return;
        }
        throw new Error(`Failed to fetch plan: ${response.status}`);
      }

      const data = await response.json();
      setPlan(data);
    } catch (err) {
      console.error("[useUserPlan] error:", err);
      setError((err as Error)?.message || "Failed to fetch plan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserPlan();
  }, [fetchUserPlan]);

  return { plan, loading, error, refetch: fetchUserPlan };
}
