import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const file = url.searchParams.get("file") || url.searchParams.get("path");
    if (!file) {
      return NextResponse.json(
        { error: "file query required" },
        { status: 400 }
      );
    }

    const sb = await supabaseServer();
    const { data, error } = await sb.storage
      .from("certificates")
      .createSignedUrl(file, 60 * 10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // data: { signedUrl }
    return NextResponse.json({ signedUrl: (data as any)?.signedUrl ?? null });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
