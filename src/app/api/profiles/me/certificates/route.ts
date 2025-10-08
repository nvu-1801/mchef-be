// app/api/profiles/me/certificates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr"; // hoặc hàm supabaseServer() của bạn

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const files: string[] = Array.isArray(body.files) ? body.files : [];
  const links: string[] = Array.isArray(body.links) ? body.links : [];

  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  const { data: { user }, error: uerr } = await sb.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows: any[] = [];

  // files (storage paths)
  for (const p of files) {
    rows.push({
      user_id: user.id,
      file_path: p,
      // mime có thể fetch từ storage metadata, nhưng đơn giản gán theo đuôi:
      mime_type: p.endsWith(".pdf") ? "application/pdf" :
                 p.endsWith(".png") ? "image/png" :
                 p.endsWith(".jpg") || p.endsWith(".jpeg") ? "image/jpeg" : "application/octet-stream",
      title: p.split("/").pop() ?? "Certificate",
      status: "pending",
    });
  }

  // external links (tùy chọn)
  for (const url of links) {
    rows.push({
      user_id: user.id,
      file_path: url,        // lưu URL ngoài
      mime_type: "link/url",
      title: "External link",
      status: "pending",
    });
  }

  if (!rows.length) return NextResponse.json({ error: "No data" }, { status: 400 });

  const { data, error } = await sb.from("certificates").insert(rows).select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Có thể trả lại danh sách certificates mới cho UI gắn vào profile
  return NextResponse.json({ certificates: data, updatedAt: new Date().toISOString() });
}
