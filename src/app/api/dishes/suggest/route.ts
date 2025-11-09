import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

type CategoryData = {
  name: string;
};

type DishRow = {
  title: string;
  slug: string;
  cover_image_url: string | null;
  category: CategoryData | CategoryData[] | null;
};

type SuggestionResponse = {
  title: string;
  slug: string;
  image: string | null;
  category: string;
};

export async function GET(req: Request) {
  const sb = await supabaseServer();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) return NextResponse.json([]);

  const { data, error } = await sb
    .from("dishes")
    .select(`
      title,
      slug,
      cover_image_url,
      category:category_id (
        name
      )
    `)
    .ilike("title", `%${q}%`)
    .eq("published", true)
    .limit(10);

  if (error) {
    console.error("Suggestion API error:", error);
    return NextResponse.json([]);
  }

  const dishes = data as DishRow[] | null;

  return NextResponse.json(
    (dishes ?? []).map((d): SuggestionResponse => ({
      title: d.title,
      slug: d.slug,
      image: d.cover_image_url,
      category: Array.isArray(d.category) ? d.category[0]?.name ?? "" : d.category?.name ?? "",
    }))
  );
}

// import { NextResponse } from "next/server";
// import { supabaseServer } from "@/libs/supabase/supabase-server";

// export async function GET(req: Request) {
//   const sb = await supabaseServer();
//   const { searchParams } = new URL(req.url);
//   const q = searchParams.get("q")?.trim() ?? "";

//   if (!q) return NextResponse.json([]);

//   const { data, error } = await sb
//     .from("dishes")
//     .select(`
//       title,
//       slug,
//       cover_image_url,
//       category:category_id (
//         name
//       )
//     `)
//     .ilike("title", `%${q}%`)
//     .eq("published", true)
//     .limit(10);

//   if (error) {
//     console.error("Suggestion API error:", error);
//     return NextResponse.json([]);
//   }

//   return NextResponse.json(
//     data.map((d: any) => ({
//       title: d.title,
//       slug: d.slug,
//       image: d.cover_image_url,
//       category: Array.isArray(d.category) ? d.category[0]?.name ?? "" : d.category?.name ?? "",
//     }))
//   );
// }
