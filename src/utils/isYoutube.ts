// utils/isYoutube.ts
export function getYouTubeId(url: string) {
  try {
    const u = new URL(url);
    // https://www.youtube.com/watch?v=VIDEO_ID
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v");
    }
    // https://youtu.be/VIDEO_ID
    if (u.hostname === "youtu.be") {
      return u.pathname.replace("/", "");
    }
  } catch {}
  return null;
}

export function toYouTubeEmbedUrl(url: string, opts?: { autoplay?: boolean; mute?: boolean }) {
  const id = getYouTubeId(url);
  if (!id) return null;
  const params = new URLSearchParams({
    autoplay: opts?.autoplay ? "1" : "0",
    mute: opts?.mute ? "1" : "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}
