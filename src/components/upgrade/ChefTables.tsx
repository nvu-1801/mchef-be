// components/upgrade/ChefTables.tsx
"use client";

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
  const data = yearly ? chefYearly : chefMonthly;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {data.map((p) => (
        <PriceCard
          key={p.planId}
          {...p}
          planId={p.planId}
          userId={userId}
          // cta trong data có { label, href } nhưng PriceCard chỉ cần label
          // spread {...p} vẫn ổn; PriceCard chỉ đọc cta.label
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
      ))}
    </div>
  );
}
