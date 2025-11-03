// components/SmartVideo.tsx
import React from "react";
import { toYouTubeEmbedUrl } from "@/utils/isYoutube";

type Props = {
  url: string;
  poster?: string | null;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
};

export function SmartVideo({ url, poster, className, autoPlay, muted, loop }: Props) {
  const ytb = toYouTubeEmbedUrl(url, { autoplay: !!autoPlay, mute: !!muted });

  if (ytb) {
    return (
      <iframe
        src={ytb}
        className={className}
        loading="lazy"
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        // nếu bạn có CSP, cần mở frame-src cho youtube (xem lưu ý bên dưới)
      />
    );
  }

  // fallback: file mp4/webm trực tiếp
  return (
    <video
      src={url}
      playsInline
      muted={muted}
      loop={loop}
      preload="metadata"
      poster={poster ?? "/placeholder.png"}
      className={className}
      controls
    />
  );
}
