"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function GlobalLoading() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = () => setLoading(true);
    const done = () => setLoading(false);

    // 1) Bắt mọi click vào <a> nội bộ (Link cũng render thành <a>)
    const onDocClick = (e: MouseEvent) => {
      // bỏ qua nếu dùng Ctrl/Cmd/Shift/Alt, hoặc middle-click
      if ((e as any).metaKey || e.ctrlKey || e.shiftKey || e.altKey || (e as any).button === 1) return;

      const el = e.target as Element | null;
      const a = el?.closest?.("a");
      if (!a) return;

      const href = a.getAttribute("href");
      const target = a.getAttribute("target");
      if (!href || href.startsWith("#") || target === "_blank") return;

      // chỉ bật khi là điều hướng nội bộ (same-origin)
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;

      start();
    };

    document.addEventListener("click", onDocClick, { capture: true });

    // 2) Patch router.push/replace cho các nơi bạn gọi bằng code
    const origPush = router.push;
    router.push = ((...args: any) => {
      start();
      return origPush.apply(router, args);
    }) as typeof router.push;

    const origReplace = router.replace;
    router.replace = ((...args: any) => {
      start();
      return origReplace.apply(router, args);
    }) as typeof router.replace;

    // 3) Khi pathname thay đổi => điều hướng đã xong
    done();

    return () => {
      document.removeEventListener("click", onDocClick, { capture: true } as any);
      // không cần restore router.* vì component sống suốt vòng đời app
    };
  }, [router, pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[9999]">
      <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-sky-400 rounded-full" />
    </div>
  );
}
