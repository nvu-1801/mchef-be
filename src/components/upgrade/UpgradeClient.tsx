// components/upgrade/UpgradeClient.tsx
"use client";

import { useState } from "react";
import PillTab from "./PillTab";
import UserTables from "./UserTables";
import ChefTables from "./ChefTables";

export default function UpgradeClient({ isChef, userId }: { isChef: boolean; userId: string }) {
  const [audience, setAudience] = useState<"user" | "chef">(isChef ? "chef" : "user");
  const [period, setPeriod] = useState<"month" | "year">("month");

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-block rounded-full border px-3 py-1 text-xs text-gray-600 bg-white/70 backdrop-blur">
          Freemium • Featured Recipe • Khoá học trả phí
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-600">
          Nâng cấp tài khoản
        </h1>
        <p className="mt-2 text-gray-600">
          Truy cập công thức chuyên sâu, video chi tiết và mở lớp học online để tăng thu nhập.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 mb-8">
        <PillTab
          items={[
            { key: "user", label: "Người học" },
            { key: "chef", label: "Đầu bếp" },
          ]}
          value={audience}
          onChange={(v) => setAudience(v as "user" | "chef")}
        />
        <PillTab
          items={[
            { key: "month", label: "Gói theo tháng" },
            { key: "year", label: "Gói theo năm" },
          ]}
          value={period}
          onChange={(v) => setPeriod(v as "month" | "year")}
        />
      </div>

      <div className="rounded-3xl border bg-white/70 backdrop-blur p-6 md:p-8 shadow-sm">
        {audience === "user"
  ? (period === "month"
      ? <UserTables userId={userId} />
      : <UserTables yearly userId={userId} />)
  : (period === "month"
      ? <ChefTables userId={userId} />
      : <ChefTables yearly userId={userId} />)}

      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl border p-5 bg-white/70">
          <div className="font-bold mb-1">Thanh toán an toàn</div>
          <p className="text-sm text-gray-600">Thanh toán qua PayOS/Stripe. Hoá đơn điện tử gửi qua email.</p>
        </div>
        <div className="rounded-2xl border p-5 bg-white/70">
          <div className="font-bold mb-1">Tự động gia hạn</div>
          <p className="text-sm text-gray-600">Bạn có thể huỷ bất cứ lúc nào. Quyền lợi giữ đến hết chu kỳ.</p>
        </div>
        <div className="rounded-2xl border p-5 bg-white/70">
          <div className="font-bold mb-1">Hoàn tiền 7 ngày</div>
          <p className="text-sm text-gray-600">Nếu không hài lòng, yêu cầu hoàn trong 7 ngày đầu tiên.</p>
        </div>
      </div>
    </div>
  );
}
