import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

type SignedUrlResponse = {
  signedUrl?: string;
  signedURL?: string;
  [key: string]: unknown;
};

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

    // data: { signedUrl } or { signedURL }
    const responseData = data as unknown;
    let signedUrl: string | null = null;

    if (typeof responseData === "object" && responseData !== null) {
      const signedData = responseData as SignedUrlResponse;
      signedUrl = signedData.signedUrl ?? signedData.signedURL ?? null;
    }

    return NextResponse.json({ signedUrl });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null && "message" in err
        ? String((err as { message: unknown }).message)
        : String(err);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
