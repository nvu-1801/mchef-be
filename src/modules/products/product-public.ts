export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  images: string[] | null;
  category_id?: string;
};

/** Lấy public URL ảnh đầu tiên từ bucket "products" */
export function productImageUrl(p: Pick<Product, "images">) {
  const path = p.images?.[0];
  return path
    ? `${
        process.env.NEXT_PUBLIC_SUPABASE_URL
      }/storage/v1/object/public//${encodeURIComponent(path)}`
    : null;
}

/** Convert 1 path trong bucket sang URL public */
export function imagePathToUrl(path: string) {
  return `${
    process.env.NEXT_PUBLIC_SUPABASE_URL
  }/storage/v1/object/public//${encodeURIComponent(path)}`;
}
