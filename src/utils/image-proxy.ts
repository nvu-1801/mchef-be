export const proxied = (
  u?: string | null,
  fallback = "/default-avatar.png"
) => {
  if (!u) return fallback;
  if (u.startsWith("/")) return u;
  return `/api/img?u=${encodeURIComponent(u)}`;
};
