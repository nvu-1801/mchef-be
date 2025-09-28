// app/api/profiles/me/certificates/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";

const BodySchema = z.object({
  files: z.array(z.string().min(1)).min(1), // các path trong bucket đã upload
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.format() }, { status: 400 });
  }

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  // Append hoặc replace? Ở đây mình sẽ REPLACE danh sách certificates.
  const { files } = parsed.data;

  const { data, error } = await sb
    .from("profiles")
    .update({ certificates: files, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("id, display_name, certificates, cert_status, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Update certificates failed", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    fullName: data.display_name ?? "",
    certificates: data.certificates ?? [],
    certStatus: data.cert_status ?? null,
    updatedAt: data.updated_at ?? null,
  });
}
