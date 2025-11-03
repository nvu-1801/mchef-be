// app/api/img/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("u");
  if (!url) return new NextResponse("Missing u", { status: 400 });

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return new NextResponse("Upstream error", { status: 502 });

  // chuyển content-type & cache header
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=86400, immutable",
    },
  });
}
