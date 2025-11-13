"use client";

import React, { createContext, useContext } from "react";
import { useUserPlan } from "@/hooks/useUserPlan";

const PremiumContext = createContext<boolean | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { plan } = useUserPlan();
  const isPremium = !!plan?.is_premium;
  return (
    <PremiumContext.Provider value={isPremium}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
