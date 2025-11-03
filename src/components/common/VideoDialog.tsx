"use client";
import { useEffect, useState } from "react";

type Props = {
  url: string;
  poster?: string | null;
  trigger?: "badge" | "overlay"; // badge = nhỏ góc, overlay = nút tròn giữa ảnh
  label?: string;
  className?: string;
};

export default function VideoDialog({
  url,
  poster,
  trigger = "badge",
  label = "Xem video",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const Trigger =
    trigger === "overlay" ? (
      // Nút tròn giữa ảnh
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-grid place-items-center rounded-full border border-white/40 bg-black/55 backdrop-blur px-5 py-5 text-white text-lg font-semibold hover:bg-black/70 active:scale-95 transition ${className}`}
        aria-label="Play video"
      >
        ▶
      </button>
    ) : (
      // Badge nhỏ góc
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 rounded-lg bg-black/60 text-white px-2 py-1 text-xs hover:bg-black/70 ${className}`}
      >
        🎬 {label}
      </button>
    );

  return (
    <>
      {Trigger}

      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />

          {/* Container căn giữa */}
          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-5xl">
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                <video
                  src={url}
                  controls
                  autoPlay
                  playsInline
                  poster={poster ?? undefined}
                  // object-contain để video nằm giữa, không bị crop
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute top-3 right-3 rounded-full bg-white/90 text-gray-800 px-3 py-1 text-sm font-semibold hover:bg-white"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
