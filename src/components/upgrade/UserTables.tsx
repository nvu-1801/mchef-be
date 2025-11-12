// components/upgrade/UserTables.tsx
"use client";

import { useEffect, useState } from "react";
import PriceCard from "./PriceCard";
import { userMonthly, userYearly, CHECK_SVG, CROSS_SVG } from "./data";

function Cell(ok: boolean) {
  return (
    <div className="flex items-center justify-center">
      {ok ? CHECK_SVG : CROSS_SVG}
    </div>
  );
}

// Map hardcoded plan names to their database amounts
const PLAN_AMOUNTS: Record<string, number> = {
  "user_premium_month": 99000,   // 1 month = 99,000 VND
  "user_premium_year": 799000,   // 1 year = 799,000 VND
};

export default function UserTables({
  yearly = false,
  userId,
}: {
  yearly?: boolean;
  userId: string;
}) {
  const [planIdMap, setPlanIdMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Fetch plans dari API dan buat mapping berdasarkan amount
  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/plans");
        if (!res.ok) throw new Error("Failed to fetch plans");
        const { plans } = await res.json();

        // Buat mapping: Plan amount → Plan UUID
        const map: Record<string, string> = {};
        
        // Premium 1 Tháng: 99,000 VND
        const plan1Month = plans?.find((p: any) => p.amount === 99000);
        if (plan1Month) map["user_premium_month"] = plan1Month.id;

        // Premium 1 Năm: 799,000 VND
        const plan1Year = plans?.find((p: any) => p.amount === 799000);
        if (plan1Year) map["user_premium_year"] = plan1Year.id;

        setPlanIdMap(map);
      } catch (err) {
        console.error("[UserTables] Failed to fetch plans:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  const data = yearly ? userYearly : userMonthly;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {data.map((p) => {
        // Lấy UUID thực tế từ map, fallback ke hardcoded ID nếu không tìm thấy
        const actualPlanId = planIdMap[p.planId] || p.planId;
        
        // Nếu không tìm thấy UUID, disable button
        const isDisabled = !planIdMap[p.planId] || loading;
        
        return (
          <PriceCard
            key={p.planId}
            {...p}
            planId={actualPlanId}
            userId={userId}
            disabled={isDisabled}
          >
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                {Cell(p.features.basicRecipes)} Công thức cơ bản (Freemium)
              </li>
              <li className="flex items-center gap-2">
                {Cell(p.features.premiumRecipes)} Công thức chuyên sâu
              </li>
              <li className="flex items-center gap-2">
                {Cell(p.features.hdVideos)} Video HD/chi tiết
              </li>
              <li className="flex items-center gap-2">
                {Cell(p.features.aiCoach)} Trợ lý AI (gợi ý nguyên liệu, meal plan)
              </li>
              <li className="flex items-center gap-2">
                {Cell(p.features.saveCollections)} Lưu bộ sưu tập
              </li>
              <li className="flex items-center gap-2">
                {Cell(p.features.offlineMode)} Xem offline
              </li>
              <li className="flex items-center gap-2">
                {Cell(p.features.noAds)} Không quảng cáo
              </li>
              <li className="flex items-center gap-2">
                {Cell(p.features.prioritySupport)} Hỗ trợ ưu tiên
              </li>
            </ul>
          </PriceCard>
        );
      })}
    </div>
  );
}
