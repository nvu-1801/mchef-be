"use client";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // đặt các context ở đây sau này (Theme, QueryClient, Toaster, v.v.)
  return <>{children}</>;
}
