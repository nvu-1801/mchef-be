// components/common/side-toc.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type TocItem = { id: string; label: string };

export default function SideToc({
  items,
  offset = 88, // bù cho header/tabs sticky
}: {
  items: TocItem[];
  offset?: number;
}) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  // IntersectionObserver để highlight mục đang view
  useEffect(() => {
    if (items.length === 0) return;
    const sections = items
      .map((it) => document.getElementById(it.id))
      .filter(Boolean) as HTMLElement[];

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      {
        rootMargin: `-${offset + 8}px 0px -50% 0px`, // trừ phần sticky + ngưỡng
        threshold: [0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [items, offset]);

  const onJump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActive(id);
  };

  const rendered = useMemo(
    () =>
      items.map((it) => {
        const isActive = active === it.id;
        return (
          <a
            key={it.id}
            href={`#${it.id}`}
            onClick={onJump(it.id)}
            className={[
              "block rounded-lg px-3 py-2 text-sm transition",
              isActive
                ? "bg-purple-50 me-4 text-purple-700 border border-purple-200"
                : "text-gray-700 hover:bg-gray-50 border border-transparent",
            ].join(" ")}
            aria-current={isActive ? "true" : undefined}
          >
            {it.label}
          </a>
        );
      }),
    [items, active]
  );

  return (
    <nav
      aria-label="Mục lục"
      className="hidden md:block sticky top-46 w-56 self-start space-y-2"
    >
      <p className="px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Mục lục
      </p>
      {rendered}
    </nav>
  );
}
