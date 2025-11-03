// src/modules/dishes/lib/image-url.ts
const SUPABASE_BASE =
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");

function isAbsoluteUrl(u: string) {
  return /^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("//");
}

/** Nếu objectPath là đường dẫn trong bucket public, đổi sang URL public.
 *  Nếu bạn không cần, có thể bỏ hàm này. */
export function imagePathToUrl(objectPath: string) {
  const safe = objectPath.split("/").map(encodeURIComponent).join("/");
  if (!SUPABASE_BASE) return `/${objectPath.replace(/^\/+/, "")}`;
  return `${SUPABASE_BASE}/storage/v1/object/public/${safe}`;
}

export function resolveImageUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const url = typeof raw === "string" ? raw.trim() : String(raw ?? "");
  if (!url) return null;
  if (isAbsoluteUrl(url)) return url.startsWith("//") ? `https:${url}` : url;
  if (url.startsWith("/")) return url;
  // fallback: bạn tự chỉnh theo CDN/public folder nếu có
  return `/images/${url}`;
}

// tiện alias
export const dishImageUrl = resolveImageUrl;
