// app/api/comments/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

// Kiểu trả về ra client
type CommentDTO = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

const PAGE_SIZE_DEFAULT = 10;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dishId = searchParams.get("dishId");
  const limit = Number(searchParams.get("limit") ?? PAGE_SIZE_DEFAULT);
  const cursor = searchParams.get("cursor"); // ISO date string hoặc null
  const cursorId = searchParams.get("cursorId"); // tie-breaker id

  if (!dishId) {
    return NextResponse.json(
      { error: "Missing dishId" },
      { status: 400 }
    );
  }

  const sb = await supabaseServer();

  // Phân trang dạng cursor (created_at desc, rồi id desc)
  // Nếu có cursor: lấy các bản ghi "trước" cursor (thời gian nhỏ hơn),
  // hoặc thời gian bằng nhưng id < cursorId (ràng buộc phụ)
  let query = sb
    .from("comments")
    .select(
      `
      id,
      content,
      created_at,
      user_id,
      user:profiles!comments_user_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq("dish_id", dishId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1); // +1 để biết có next

  if (cursor) {
    // Supabase chưa hỗ trợ "seek" phức tạp, nên ta filter bằng RPC hoặc 2 bước.
    // Ở đây làm cách đơn giản: filter created_at <= cursor rồi lọc tiếp trên server.
    query = query.lte("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Lọc tie-breaker id phía server nếu có cursor + cursorId
  let items = (data ?? []) as any[];

  if (cursor && cursorId) {
    items = items.filter((row) => {
      if (row.created_at < cursor) return true;
      if (row.created_at > cursor) return false;
      // created_at == cursor => lấy những id < cursorId theo thứ tự desc
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

  const result: CommentDTO[] = pageItems.map((c) => ({
    id: c.id,
    content: c.content,
    created_at: c.created_at,
    user_id: c.user_id,
    user: c.user
      ? {
        id: c.user.id,
        full_name: c.user.full_name,
        avatar_url: c.user.avatar_url,
      }
      : null,
  }));

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

  const body = await req.json().catch(() => null);
  const dishId = body?.dishId as string | undefined;
  const contentRaw = (body?.content ?? "") as string;

  if (!dishId) {
    return NextResponse.json({ error: "Missing dishId" }, { status: 400 });
  }
  const content = contentRaw.trim();
  if (content.length === 0) {
    return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
  }
  if (content.length > 5000) {
    return NextResponse.json({ error: "Content too long" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("comments")
    .insert({
      dish_id: dishId,
      user_id: session.user.id,
      content,
    })
    .select(
      `
      id, content, created_at, user_id,
      user:profiles!comments_user_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `
    )
    .single();

  if (error) {
    // Gợi ý khi dính unique (trùng dish_id, user_id, content)
    if (error.message?.toLowerCase().includes("duplicate") || error.code === "23505") {
      return NextResponse.json(
        { error: "Bạn đã gửi bình luận trùng nội dung cho món này." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userRow = Array.isArray(data.user) ? data.user[0] ?? null : data.user ?? null;

  return NextResponse.json({
    item: {
      id: data.id,
      content: data.content,
      created_at: data.created_at,
      user_id: data.user_id,
      user: userRow
        ? {
            id: userRow.id,
            full_name: userRow.full_name,
            avatar_url: userRow.avatar_url,
          }
        : null,
    } as CommentDTO,
  });
}
