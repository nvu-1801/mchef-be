export function publicImageUrl(path?: string | null) {
  if (!path) return null;
  return `${
    process.env.NEXT_PUBLIC_SUPABASE_URL
  }/storage/v1/object/public//${encodeURIComponent(path)}`;
}
