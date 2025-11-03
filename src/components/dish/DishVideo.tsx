"use client";
import React from "react";

type Props = {
  videoUrl: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
};

// ---- Helpers: nhận diện & chuyển đổi YouTube URL → /embed/ ----
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      // https://www.youtube.com/watch?v=VIDEO_ID
      const v = u.searchParams.get("v");
      if (v) return v;
      // https://www.youtube.com/embed/VIDEO_ID
      const m = u.pathname.match(/^\/embed\/([^/?#]+)/);
      if (m) return m[1];
    }
    if (host === "youtu.be") {
      // https://youtu.be/VIDEO_ID
      return u.pathname.replace("/", "") || null;
    }
  } catch {}
  return null;
}

function toYouTubeEmbedUrl(
  url: string,
  opts?: { autoplay?: boolean; mute?: boolean; nocookie?: boolean }
) {
  const id = getYouTubeId(url);
  if (!id) return null;
  const base = opts?.nocookie
    ? "https://www.youtube-nocookie.com"
    : "https://www.youtube.com";
  const params = new URLSearchParams({
    autoplay: opts?.autoplay ? "1" : "0",
    mute: opts?.mute ? "1" : "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  return `${base}/embed/${id}?${params.toString()}`;
}

// ---- Component chính ----
export default function DishVideo({
  videoUrl,
  poster,
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true,
}: Props) {
  const embed = toYouTubeEmbedUrl(videoUrl, {
    autoplay: autoPlay,
    mute: muted,
    nocookie: false, // đổi thành true nếu muốn youtube-nocookie
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-6 shadow-sm mx-auto max-w-2xl">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 opacity-30 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center text-white text-xl shadow-lg shadow-rose-500/30">
            🎬
          </div>
          <h3 className="text-lg font-bold text-gray-900">Video hướng dẫn</h3>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl">
          <div className="aspect-video">
            {embed ? (
              <iframe
                src={embed}
                title="YouTube video"
                className="w-full h-full"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <video
                // Dành cho link file trực tiếp (mp4/webm)
                className="w-full h-full"
                poster={poster}
                preload="metadata"
                playsInline
                controls={controls}
                autoPlay={autoPlay}
                muted={muted}
                loop={loop}
              >
                {/* đoán mime theo đuôi file, vẫn để fallback 2 source */}
                <source src={videoUrl} type={guessMime(videoUrl)} />
                <source src={videoUrl} />
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>Xem video để học cách nấu chi tiết hơn</span>
        </div>
      </div>
    </div>
  );
}

// Đoán mime cơ bản theo đuôi file
function guessMime(url: string): string | undefined {
  const u = url.split("?")[0].toLowerCase();
  if (u.endsWith(".mp4")) return "video/mp4";
  if (u.endsWith(".webm")) return "video/webm";
  if (u.endsWith(".ogg") || u.endsWith(".ogv")) return "video/ogg";
  return undefined;
}
