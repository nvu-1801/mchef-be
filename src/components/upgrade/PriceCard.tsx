// components/upgrade/PriceCard.tsx
"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export default function PriceCard({
  title,
  price,
  period,
  highlight,
  cta,
  children,
}: {
  title: string;
  price: string;
  period: string;
  highlight?: boolean;
  cta: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <div className={`rounded-2xl border backdrop-blur bg-white/80 p-6 shadow-sm relative ${highlight ? "ring-2 ring-violet-400" : ""}`}>
      {highlight && (
        <div className="absolute -top-3 right-4 text-[11px] font-bold bg-gradient-to-r from-pink-500 to-violet-500 text-white px-2.5 py-1 rounded-full shadow">
          Khuyên dùng
        </div>
      )}
      <div className="mb-3 text-lg font-bold">{title}</div>
      <div className="mb-5">
        <span className="text-3xl font-extrabold">{price}</span>
        <span className="text-gray-500"> {period}</span>
      </div>
      {children}
      <Link
        href={cta.href}
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500 hover:brightness-110 transition"
      >
        {cta.label}
      </Link>
    </div>
  );
}
