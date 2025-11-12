// components/upgrade/UpgradePrompt.tsx
"use client";

import Link from "next/link";

interface UpgradePromptProps {
  title?: string;
  description?: string;
  actionUrl?: string;
}

export function UpgradePrompt({
  title = "Nâng cấp lên Premium",
  description = "Để truy cập tính năng này, vui lòng nâng cấp tài khoản của bạn",
  actionUrl = "/upgrade",
}: UpgradePromptProps) {
  return (
    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>

        <Link
          href={actionUrl}
          className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Nâng cấp ngay
        </Link>
      </div>
    </div>
  );
}
