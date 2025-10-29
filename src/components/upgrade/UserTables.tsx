// components/upgrade/UserTables.tsx
"use client";

import PriceCard from "./PriceCard";
import { userMonthly, userYearly, CHECK_SVG, CROSS_SVG } from "./data";

function Cell(ok: boolean) {
  return (
    <div className="flex items-center justify-center">
      {ok ? CHECK_SVG : CROSS_SVG}
    </div>
  );
}

export default function UserTables({
  yearly = false,
  userId,
}: {
  yearly?: boolean;
  userId: string;
}) {
  const data = yearly ? userYearly : userMonthly;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {data.map((p) => (
        <PriceCard
          key={p.planId}
          {...p}
          planId={p.planId}
          userId={userId}
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
      ))}
    </div>
  );
}
