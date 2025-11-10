// app/api/ratings/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

type RatingUser = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type RatingDTO = {
  id: string;
  dish_id: string;
  user_id: string;
  stars: number;
  comment: string | null;
  created_at: string;
  user: RatingUser | null;
};

type RatingRow = {
  id: string;
  dish_id: string;
  user_id: string;
  stars: number;
  comment: string | null;
  created_at: string;
  user: RatingUser | RatingUser[] | null;
};

type PatchRequestBody = {
  stars?: number;
  comment?: string;
};

type RatingUpdateFields = {
  stars?: number;
  comment?: string | null;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sb = await supabaseServer();
  const {
    data: { session },
  } = await sb.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as PatchRequestBody | null;
  const stars = body?.stars;
  const commentRaw = body?.comment;

  const patch: RatingUpdateFields = {};
  if (typeof stars !== "undefined") {
    if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
      return NextResponse.json(
        { error: "Stars must be 1..5" },
        { status: 400 }
      );
    }
    patch.stars = stars;
  }
  if (typeof commentRaw !== "undefined") {
    const comment = commentRaw?.trim() || null;
    patch.comment = comment;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("ratings")
    .update(patch)
    .eq("id", id)
    .eq("user_id", session.user.id) // đảm bảo owner
    .select(
      `
      id, dish_id, user_id, stars, comment, created_at,
      user:profiles!ratings_user_id_fkey(
        id, display_name, avatar_url
      )
    `
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  const typedData = data as RatingRow;
  const userRow = Array.isArray(typedData.user)
    ? typedData.user[0] ?? null
    : typedData.user ?? null;

  const result: RatingDTO = {
    id: typedData.id,
    dish_id: typedData.dish_id,
    user_id: typedData.user_id,
    stars: typedData.stars,
    comment: typedData.comment ?? null,
    created_at: typedData.created_at,
    user: userRow
      ? {
          id: userRow.id,
          display_name: userRow.display_name,
          avatar_url: userRow.avatar_url,
        }
      : null,
  };

  return NextResponse.json({ item: result });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sb = await supabaseServer();
  const {
    data: { session },
  } = await sb.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await sb
    .from("ratings")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id); // đảm bảo owner

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}

// // app/api/ratings/[id]/route.ts
// import { NextResponse } from "next/server";
// import { supabaseServer } from "@/libs/supabase/supabase-server";

// export async function PATCH(req: Request, { params }: { params: { id: string } }) {
//   const { id } = params;
//   if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

//   const sb = await supabaseServer();
//   const {
//     data: { session },
//   } = await sb.auth.getSession();

//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const body = await req.json().catch(() => null);
//   const stars = body?.stars as number | undefined;
//   const commentRaw = (body?.comment ?? undefined) as string | undefined;

//   const patch: Record<string, any> = {};
//   if (typeof stars !== "undefined") {
//     if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
//       return NextResponse.json({ error: "Stars must be 1..5" }, { status: 400 });
//     }
//     patch.stars = stars;
//   }
//   if (typeof commentRaw !== "undefined") {
//     const comment = commentRaw?.trim() || null;
//     patch.comment = comment;
//   }

//   if (Object.keys(patch).length === 0) {
//     return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
//   }

//   const { data, error } = await sb
//     .from("ratings")
//     .update(patch)
//     .eq("id", id)
//     .eq("user_id", session.user.id) // đảm bảo owner
//     .select(
//       `
//       id, dish_id, user_id, stars, comment, created_at,
//       user:profiles!ratings_user_id_fkey(
//         id, display_name, avatar_url
//       )
//     `
//     )
//     .single();

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 403 });
//   }

//   const userRow = Array.isArray(data.user) ? data.user[0] ?? null : data.user ?? null;

//   return NextResponse.json({
//     item: {
//       id: data.id,
//       dish_id: data.dish_id,
//       user_id: data.user_id,
//       stars: data.stars,
//       comment: data.comment ?? null,
//       created_at: data.created_at,
//       user: userRow
//         ? {
//             id: userRow.id,
//             display_name: userRow.display_name,
//             avatar_url: userRow.avatar_url,
//           }
//         : null,
//     },
//   });
// }

// export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
//   const { id } = params;
//   if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

//   const sb = await supabaseServer();
//   const {
//     data: { session },
//   } = await sb.auth.getSession();

//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { error } = await sb
//     .from("ratings")
//     .delete()
//     .eq("id", id)
//     .eq("user_id", session.user.id); // đảm bảo owner

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 403 });
//   }

//   return NextResponse.json({ ok: true });
// }
