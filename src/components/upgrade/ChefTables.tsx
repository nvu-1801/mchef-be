// components/upgrade/ChefTables.tsx
"use client";

import { useEffect, useState } from "react";
import PriceCard from "./PriceCard";
import { chefMonthly, chefYearly, CHECK_SVG, CROSS_SVG } from "./data";

function Cell(ok: boolean) {
  return (
    <div className="flex items-center justify-center">
      {ok ? CHECK_SVG : CROSS_SVG}
    </div>
  );
}

export default function ChefTables({
  yearly = false,
  userId,
}: {
  yearly?: boolean;
  userId: string;
}) {
  const [planIdMap, setPlanIdMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Fetch plans dari API
  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/plans");
        if (!res.ok) throw new Error("Failed to fetch plans");
        const { plans } = await res.json();

        // Buat mapping berdasarkan title atau amount
        const map: Record<string, string> = {};
        
        // Untuk Chef plans, map berdasarkan title
        plans?.forEach((p: any) => {
          if (p.title.includes("Tháng") && !p.title.includes("3")) {
            map["chef_premium_month"] = p.id;
          }
          if (p.title.includes("Năm")) {
            map["chef_premium_year"] = p.id;
          }
        });

        setPlanIdMap(map);
      } catch (err) {
        console.error("[ChefTables] Failed to fetch plans:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  const data = yearly ? chefYearly : chefMonthly;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {data.map((p) => {
        const actualPlanId = planIdMap[p.planId] || p.planId;
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
                {Cell(p.features.postRecipes)} Đăng công thức không giới hạn
              </li>
              <li className="flex items-center gap-2">
                {Cell(!!p.features.featuredSlots)} Featured recipe:{" "}
                <b className="ml-1">{p.features.featuredSlots}</b> slot/tháng
              </li>
              <li className="flex items-center gap-2">
                {Cell(p.features.paidClasses)} Mở lớp học trả phí (buổi / gói)
              </li>
              <li className="flex items-center gap-2">
                {Cell(true)} Chia sẻ doanh thu:{" "}
                <b className="ml-1">{p.features.revenueShare}</b>
              </li>
              <li className="flex items-center gap-2">
                {Cell(!!p.features.analytics)} Thống kê học viên & doanh thu
              </li>
              <li className="flex items-center gap-2">
                {Cell(!!p.features.watermarkRemove)} Xoá watermark video
              </li>
              <li className="flex items-center gap-2">
                {Cell(!!p.features.prioritySupport)} Hỗ trợ ưu tiên
              </li>
              <li className="flex items-center gap-2">
                {Cell(!!p.features.courseLandingPages)} Landing page bán khoá học
              </li>
            </ul>
          </PriceCard>
        );
      })}
    </div>
  );
}
