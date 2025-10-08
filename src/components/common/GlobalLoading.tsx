"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function GlobalLoading() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const start = () => {
    // clear timeout cũ
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setLoading(true);
    // Safety: auto tắt sau 10s nếu vì lý do gì đó không đổi pathname
    timeoutRef.current = window.setTimeout(() => setLoading(false), 3000);
  };

  const done = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setLoading(false);
  };

  useEffect(() => {
    // Bắt click vào <a> nội bộ
    const onDocClick = (e: MouseEvent) => {
      if (
        (e as any).metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        (e as any).button === 1
      )
        return;

      const el = e.target as Element | null;
      const a = el?.closest?.("a");
      if (!a) return;

      const href = a.getAttribute("href");
      const target = a.getAttribute("target");
      if (!href || href.startsWith("#") || target === "_blank") return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return; // external
      start();
    };

    document.addEventListener("click", onDocClick, { capture: true });

    // Patch push/replace để bật loading khi điều hướng bằng code
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

    // Khi user dùng back/forward
    const onPopState = () => start();
    window.addEventListener("popstate", onPopState);

    // Khi tab ẩn/hiện lại
    const onVis = () => {
      if (document.visibilityState === "visible") done();
    };
    document.addEventListener("visibilitychange", onVis);

    // Lần mount đầu không hiển thị overlay
    done();

    return () => {
      document.removeEventListener("click", onDocClick, {
        capture: true,
      } as any);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("visibilitychange", onVis);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔑 TẮT loading bất cứ khi nào pathname đổi (điều hướng xong)
  useEffect(() => {
    if (loading) {
      // chờ 1 frame cho UI ổn định rồi tắt (mượt hơn)
      const id = requestAnimationFrame(() => setLoading(false));
      return () => cancelAnimationFrame(id);
    }
  }, [pathname]); // <-- quan trọng

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[9999]">
      <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-sky-400 rounded-full" />
    </div>
  );
}
