"use client";

import { useRouter } from "next/navigation";
import PremiumSwitch from "./PremiumSwitch";

export default function PremiumSwitchWithRefresh({
  dishId,
  compact,
}: { dishId: string; compact?: boolean }) {
  const router = useRouter();
  return (
    <PremiumSwitch
      dishId={dishId}
      compact={compact}
      onChanged={() => {
        // refresh lại dữ liệu server (cards/stats)
        router.refresh();
      }}
    />
  );
}
