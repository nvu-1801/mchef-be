// app/api/ratings/route.ts
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

type PostRequestBody = {
  dishId?: string;
  stars?: number;
  comment?: string;
};

const PAGE_SIZE_DEFAULT = 10;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dishId = searchParams.get("dishId");
  const limit = Number(searchParams.get("limit") ?? PAGE_SIZE_DEFAULT);
  const cursor = searchParams.get("cursor");   // created_at (ISO)
  const cursorId = searchParams.get("cursorId"); // id tie-breaker

  if (!dishId) {
    return NextResponse.json({ error: "Missing dishId" }, { status: 400 });
  }

  const sb = await supabaseServer();

  // Base query: order by created_at desc, id desc (tie-breaker)
  let query = sb
    .from("ratings")
    .select(
      `
      id,
      dish_id,
      user_id,
      stars,
      comment,
      created_at,
      user:profiles!ratings_user_id_fkey(
        id,
        display_name,
        avatar_url
      )
    `
    )
    .eq("dish_id", dishId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1); // fetch dư 1 để xác định hasMore

  // thô: filter theo created_at <= cursor (seek đơn giản)
  if (cursor) query = query.lte("created_at", cursor);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let items = (data ?? []) as RatingRow[];

  // tie-breaker tại server khi created_at == cursor
  if (cursor && cursorId) {
    items = items.filter((row) => {
      if (row.created_at < cursor) return true;
      if (row.created_at > cursor) return false;
      // created_at == cursor → id < cursorId (vì desc)
      return row.id < cursorId;
    });
  }

  const hasMore = items.length > limit;
  const pageItems = items.slice(0, limit);

  const nextCursor =
    hasMore && pageItems.length > 0
      ? pageItems[pageItems.length - 1].created_at
      : null;
  const nextCursorId =
    hasMore && pageItems.length > 0
      ? pageItems[pageItems.length - 1].id
      : null;

  const result: RatingDTO[] = pageItems.map((r) => {
    // Handle user field (could be single object or array from join)
    const userRow = Array.isArray(r.user) ? r.user[0] ?? null : r.user ?? null;
    
    return {
      id: r.id,
      dish_id: r.dish_id,
      user_id: r.user_id,
      stars: r.stars,
      comment: r.comment ?? null,
      created_at: r.created_at,
      user: userRow
        ? {
            id: userRow.id,
            display_name: userRow.display_name,
            avatar_url: userRow.avatar_url,
          }
        : null,
    };
  });

  return NextResponse.json({
    items: result,
    nextCursor,
    nextCursorId,
    hasMore,
  });
}

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const {
    data: { session },
  } = await sb.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as PostRequestBody | null;
  const dishId = body?.dishId;
  const stars = Number(body?.stars ?? 0);
  const commentRaw = (body?.comment ?? "") as string;
  const comment = commentRaw.trim() || null;

  if (!dishId) {
    return NextResponse.json({ error: "Missing dishId" }, { status: 400 });
  }
  if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "Stars must be 1..5" }, { status: 400 });
  }

  // Upsert theo unique (dish_id, user_id)
  const { data, error } = await sb
    .from("ratings")
    .upsert(
      {
        dish_id: dishId,
        user_id: session.user.id,
        stars,
        comment,
      },
      { onConflict: "dish_id,user_id" }
    )
    .select(
      `
      id, dish_id, user_id, stars, comment, created_at,
      user:profiles!ratings_user_id_fkey(
        id,
        display_name,
        avatar_url
      )
    `
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

// // app/api/ratings/route.ts
// import { NextResponse } from "next/server";
// import { supabaseServer } from "@/libs/supabase/supabase-server";

// type RatingUser = {
//   id: string;
//   display_name: string | null;
//   avatar_url: string | null;
// };

// type RatingDTO = {
//   id: string;
//   dish_id: string;
//   user_id: string;
//   stars: number;
//   comment: string | null;
//   created_at: string;
//   user: RatingUser | null;
// };

// const PAGE_SIZE_DEFAULT = 10;

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const dishId = searchParams.get("dishId");
//   const limit = Number(searchParams.get("limit") ?? PAGE_SIZE_DEFAULT);
//   const cursor = searchParams.get("cursor");   // created_at (ISO)
//   const cursorId = searchParams.get("cursorId"); // id tie-breaker

//   if (!dishId) {
//     return NextResponse.json({ error: "Missing dishId" }, { status: 400 });
//   }

//   const sb = await supabaseServer();

//   // Base query: order by created_at desc, id desc (tie-breaker)
//   let query = sb
//     .from("ratings")
//     .select(
//       `
//       id,
//       dish_id,
//       user_id,
//       stars,
//       comment,
//       created_at,
//       user:profiles!ratings_user_id_fkey(
//         id,
//         display_name,
//         avatar_url
//       )
//     `
//     )
//     .eq("dish_id", dishId)
//     .order("created_at", { ascending: false })
//     .order("id", { ascending: false })
//     .limit(limit + 1); // fetch dư 1 để xác định hasMore

//   // thô: filter theo created_at <= cursor (seek đơn giản)
//   if (cursor) query = query.lte("created_at", cursor);

//   const { data, error } = await query;

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   let items = (data ?? []) as any[];

//   // tie-breaker tại server khi created_at == cursor
//   if (cursor && cursorId) {
//     items = items.filter((row) => {
//       if (row.created_at < cursor) return true;
//       if (row.created_at > cursor) return false;
//       // created_at == cursor → id < cursorId (vì desc)
//       return row.id < cursorId;
//     });
//   }

//   const hasMore = items.length > limit;
//   const pageItems = items.slice(0, limit);

//   const nextCursor =
//     hasMore && pageItems.length > 0
//       ? pageItems[pageItems.length - 1].created_at
//       : null;
//   const nextCursorId =
//     hasMore && pageItems.length > 0
//       ? pageItems[pageItems.length - 1].id
//       : null;

//   const result: RatingDTO[] = pageItems.map((r) => ({
//     id: r.id,
//     dish_id: r.dish_id,
//     user_id: r.user_id,
//     stars: r.stars,
//     comment: r.comment ?? null,
//     created_at: r.created_at,
//     user: r.user
//       ? {
//           id: r.user.id,
//           display_name: r.user.display_name,
//           avatar_url: r.user.avatar_url,
//         }
//       : null,
//   }));

//   return NextResponse.json({
//     items: result,
//     nextCursor,
//     nextCursorId,
//     hasMore,
//   });
// }

// export async function POST(req: Request) {
//   const sb = await supabaseServer();
//   const {
//     data: { session },
//   } = await sb.auth.getSession();

//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const body = await req.json().catch(() => null);
//   const dishId = body?.dishId as string | undefined;
//   const stars = Number(body?.stars ?? 0);
//   const commentRaw = (body?.comment ?? "") as string;
//   const comment = commentRaw.trim() || null;

//   if (!dishId) {
//     return NextResponse.json({ error: "Missing dishId" }, { status: 400 });
//   }
//   if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
//     return NextResponse.json({ error: "Stars must be 1..5" }, { status: 400 });
//   }

//   // Upsert theo unique (dish_id, user_id)
//   const { data, error } = await sb
//     .from("ratings")
//     .upsert(
//       {
//         dish_id: dishId,
//         user_id: session.user.id,
//         stars,
//         comment,
//       },
//       { onConflict: "dish_id,user_id" }
//     )
//     .select(
//       `
//       id, dish_id, user_id, stars, comment, created_at,
//       user:profiles!ratings_user_id_fkey(
//         id,
//         display_name,
//         avatar_url
//       )
//     `
//     )
//     .single();

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   const userRow = Array.isArray(data.user) ? data.user[0] ?? null : data.user ?? null;

//   const result: RatingDTO = {
//     id: data.id,
//     dish_id: data.dish_id,
//     user_id: data.user_id,
//     stars: data.stars,
//     comment: data.comment ?? null,
//     created_at: data.created_at,
//     user: userRow
//       ? {
//           id: userRow.id,
//           display_name: userRow.display_name,
//           avatar_url: userRow.avatar_url,
//         }
//       : null,
//   };

//   return NextResponse.json({ item: result });
// }
