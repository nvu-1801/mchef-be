"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import RunGearAIChat from "./RunGearAIChat";
import SupportChat from "./SupportChat";

function HeaderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 2l1.9 5.7H20l-4.6 3.4L17.4 17 12 13.9 6.6 17l2-5.9L4 7.7h6.1L12 2z" fill="currentColor" />
    </svg>
  );
}

export default function ChatCenterModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"ai" | "support">("ai");
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Reset tab khi mở
  useEffect(() => {
    if (!open) return;
    setTab("ai");
  }, [open]);

  // ESC để đóng
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setTab("ai");
      if (e.key === "ArrowRight") setTab("support");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] p-4 sm:p-6 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-label="Chat Center"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />

      {/* Card */}
      <div
        ref={dialogRef}
        className="relative mx-auto h-[85vh] max-h-[900px] w-full max-w-[1000px] transition-all duration-300 ease-out data-[state=open]:opacity-100 data-[state=open]:scale-100 opacity-0 scale-95"
        data-state="open"
      >
        {/* Subtle animated gradient ring */}
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-indigo-500/25 via-fuchsia-400/15 to-emerald-400/25 animate-[gradientShift_10s_ease_infinite] blur-[2px]" />
        <div className="relative h-full overflow-hidden rounded-[28px] bg-white/90 shadow-2xl ring-1 ring-black/10 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          {/* Header */}
          <div className="border-b border-black/5 bg-white/75 backdrop-blur-sm px-5 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white grid place-items-center shadow">
                <HeaderIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold leading-tight">Chat Center</div>
                <div className="text-xs text-gray-500">RunGear AI • Hỗ trợ khách hàng</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/faq"
                className="hidden sm:inline-block text-[13px] px-3 py-1.5 rounded-lg border border-black/10 hover:bg-gray-50"
              >
                FAQ
              </Link>
              <button
                onClick={onClose}
                className="h-9 w-9 grid place-items-center rounded-lg hover:bg-gray-100"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs (Segmented control, rõ ràng & nổi bật) */}
          <div className="px-4 sm:px-6 pt-4 bg-white/70">
            <div
              role="tablist"
              aria-label="Chọn loại chat"
              className="relative w-full max-w-[360px] rounded-2xl bg-gray-100 border border-black/5 p-1 shadow-sm"
            >
              {/* Thumb trượt */}
              <div
                className={[
                  "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-white shadow ring-1 ring-black/5 transition-transform duration-300 ease-out",
                  tab === "support" ? "translate-x-[calc(100%+8px)]" : "translate-x-1",
                ].join(" ")}
                aria-hidden="true"
              />
              <div className="relative grid grid-cols-2 gap-2">
                <button
                  role="tab"
                  aria-selected={tab === "ai"}
                  aria-controls="panel-ai"
                  id="tab-ai"
                  onClick={() => setTab("ai")}
                  className={[
                    "z-10 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-sm transition-colors",
                    tab === "ai" ? "text-indigo-700 font-semibold" : "text-gray-600 hover:text-gray-800",
                  ].join(" ")}
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-indigo-600/70" />
                  RunGear AI
                </button>
                <button
                  role="tab"
                  aria-selected={tab === "support"}
                  aria-controls="panel-support"
                  id="tab-support"
                  onClick={() => setTab("support")}
                  className={[
                    "z-10 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-sm transition-colors",
                    tab === "support" ? "text-indigo-700 font-semibold" : "text-gray-600 hover:text-gray-800",
                  ].join(" ")}
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-600/70" />
                  Hỗ trợ khách hàng
                </button>
              </div>
            </div>

            {/* Mô tả ngắn dưới Tabs để định hướng người dùng */}
            <p className="mt-2 text-xs text-gray-500">
              Chọn <span className="font-medium">RunGear AI</span> để hỏi đáp tự động, hoặc{" "}
              <span className="font-medium">Hỗ trợ khách hàng</span> để trò chuyện với nhân viên.
            </p>
          </div>

          {/* Body */}
          <div className="h-[calc(100%-60px-88px)] bg-gradient-to-b from-white to-gray-50 px-1 sm:px-2 pb-2">
            <section
              role="tabpanel"
              id="panel-ai"
              aria-labelledby="tab-ai"
              hidden={tab !== "ai"}
              className="h-full"
            >
              {tab === "ai" && (
                <div className="h-full rounded-2xl border border-black/5 bg-white shadow-sm">
                  <RunGearAIChat />
                </div>
              )}
            </section>

            <section
              role="tabpanel"
              id="panel-support"
              aria-labelledby="tab-support"
              hidden={tab !== "support"}
              className="h-full"
            >
              {tab === "support" && (
                <div className="h-full rounded-2xl border border-black/5 bg-white shadow-sm">
                  <SupportChat />
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
