// app/api/profiles/me/certificates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type NewCertificateRow = {
  user_id: string;
  file_path: string;
  mime_type: string;
  title: string;
  status: "pending" | "approved" | "rejected";
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const files: string[] =
    Array.isArray(body.files) && body.files.every((f) => typeof f === "string")
      ? (body.files as string[])
      : [];
  const links: string[] =
    Array.isArray(body.links) && body.links.every((l) => typeof l === "string")
      ? (body.links as string[])
      : [];

  const cookieStore = await cookies();
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  const {
    data: { user },
    error: uerr,
  } = await sb.auth.getUser();
  if (uerr || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows: NewCertificateRow[] = [];

  for (const p of files) {
    rows.push({
      user_id: user.id,
      file_path: p,
      mime_type: p.endsWith(".pdf")
        ? "application/pdf"
        : p.endsWith(".png")
        ? "image/png"
        : p.endsWith(".jpg") || p.endsWith(".jpeg")
        ? "image/jpeg"
        : "application/octet-stream",
      title: p.split("/").pop() ?? "Certificate",
      status: "pending",
    });
  }

  for (const url of links) {
    rows.push({
      user_id: user.id,
      file_path: url,
      mime_type: "link/url",
      title: "External link",
      status: "pending",
    });
  }

  if (!rows.length)
    return NextResponse.json({ error: "No data" }, { status: 400 });

  const { data, error } = await sb
    .from("certificates")
    .insert(rows)
    .select("*");
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    certificates: data,
    updatedAt: new Date().toISOString(),
  });
}
