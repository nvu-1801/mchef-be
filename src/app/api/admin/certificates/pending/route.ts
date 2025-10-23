import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

type CertificateRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  file_path: string | null;
  mime_type: string | null;
  created_at: string | null;
  status: string | null;
};

type SignedUrlResponse = {
  signedUrl?: string;
  signedURL?: string;
  [key: string]: unknown;
};

export async function GET() {
  const sb = await supabaseServer();

  const { data, error } = await sb
    .from("certificates")
    .select("id,user_id,title,file_path,mime_type,created_at,status")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const items = await Promise.all(
    ((data ?? []) as CertificateRow[]).map(async (r) => {
      try {
        if (!r.file_path)
          return { ...r, signedUrl: null, _signErr: "missing file_path" };
        if (r.mime_type === "link/url") return { ...r, signedUrl: r.file_path };

        const { data: s, error: e } = await sb.storage
          .from("certificates")
          .createSignedUrl(r.file_path, 60 * 10);

        const responseData = s as unknown;
        let signedUrl: string | null = null;

        if (typeof responseData === "object" && responseData !== null) {
          const signedData = responseData as SignedUrlResponse;
          signedUrl = signedData.signedUrl ?? signedData.signedURL ?? null;
        }

        return { ...r, signedUrl, _signErr: e?.message ?? null };
      } catch (ex: unknown) {
        const errorMessage =
          ex instanceof Error
            ? ex.message
            : typeof ex === "object" && ex !== null && "message" in ex
            ? String((ex as { message: unknown }).message)
            : String(ex);

        return { ...r, signedUrl: null, _signErr: errorMessage };
      }
    })
  );

  return NextResponse.json({ items });
}
