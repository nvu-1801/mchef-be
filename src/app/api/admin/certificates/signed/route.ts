// app/api/certificates/sign/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export const dynamic = "force-dynamic";

function normalizeObjectPath(input: string) {
  try {
    if (input.startsWith("http")) {
      const u = new URL(input);
      const idx = u.pathname.lastIndexOf("/certificates/");
      if (idx >= 0) {
        const after = u.pathname.slice(idx + "/certificates/".length);
        return decodeURIComponent(after);
      }
    }
  } catch {}
  let p = decodeURIComponent(input).replace(/^\/+/, "");
  if (p.startsWith("certificates/")) p = p.slice("certificates/".length);
  return p;
}

async function extractRaw(req: Request) {
  const url = new URL(req.url);

  // 1) Query
  const qId = url.searchParams.get("id")
    || url.searchParams.get("certificate_id")
    || url.searchParams.get("certId");
  const qFile = url.searchParams.get("file") || url.searchParams.get("path") || url.searchParams.get("url");
  if (qId) return { mode: "id", value: qId };
  if (qFile) return { mode: "path", value: qFile };

  // 2) Headers
  const h = req.headers;
  const hId = h.get("x-id") || h.get("x-certificate-id") || h.get("x-cert-id");
  const hFile = h.get("x-file") || h.get("x-path") || h.get("x-url");
  if (hId) return { mode: "id", value: hId };
  if (hFile) return { mode: "path", value: hFile };

  // 3) Body: JSON / form-urlencoded / multipart
  const ct = h.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const body = (await req.json().catch(() => null)) as any;
      const bId = body?.id || body?.certificate_id || body?.certId;
      const bFile = body?.file || body?.path || body?.url || body?.objectPath;
      if (typeof bId === "string" && bId.trim()) return { mode: "id", value: bId };
      if (typeof bFile === "string" && bFile.trim()) return { mode: "path", value: bFile };
    } else if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const fId = form.get("id") || form.get("certificate_id") || form.get("certId");
      const fFile = form.get("file") || form.get("path") || form.get("url") || form.get("objectPath");
      if (typeof fId === "string" && fId.trim()) return { mode: "id", value: fId };
      if (typeof fFile === "string" && fFile.trim()) return { mode: "path", value: fFile };
    }
  } catch {
    /* ignore parse errors */
  }

  return null;
}

async function handleSign(req: Request) {
  const raw = await extractRaw(req);
  if (!raw) {
    return NextResponse.json(
      {
        error: "file or path query required",
        hint:
          "Use ?id=<certificateId> to fetch from DB, or ?file=<objectPath> on GET, or { id } / { file } in POST body.",
        examples: [
          "/api/certificates/sign?id=0f8ad0e0-....-b2a1",
          "/api/certificates/sign?file=user-uuid/doc.pdf",
          "/api/certificates/sign (POST JSON: {\"id\":\"<certId>\"})",
        ],
      },
      { status: 400 }
    );
  }

  const sb = await supabaseServer();

  // cần session để pass RLS/policy
  const { data: userRes, error: userErr } = await sb.auth.getUser();
  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });
  if (!userRes?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (raw.mode === "id") {
    const certId = String(raw.value);
    const { data: rows, error: certErr } = await sb
      .from("certificates")
      .select("file_path,mime_type")
      .eq("id", certId)
      .limit(1);
    if (certErr) return NextResponse.json({ error: certErr.message }, { status: 500 });
    const cert = rows?.[0];
    if (!cert) return NextResponse.json({ error: "Certificate not found or not permitted" }, { status: 404 });

    if (cert.mime_type === "link/url") {
      return NextResponse.json({ signedUrl: cert.file_path, objectPath: null, passthrough: true, source: "db" });
    }
    const objectPath = normalizeObjectPath(cert.file_path);
    const { data: signed, error: signErr } = await sb.storage
      .from("certificates")
      .createSignedUrl(objectPath, 60 * 10);
    if (signErr) return NextResponse.json({ error: signErr.message, objectPath }, { status: 500 });
    const signedUrl = (signed as any)?.signedUrl ?? (signed as any)?.signedURL ?? null;
    return NextResponse.json({ signedUrl, objectPath, source: "db" });
  }

  // mode path/url
  const objectPath = normalizeObjectPath(String(raw.value));
  const { data: signed, error } = await sb.storage
    .from("certificates")
    .createSignedUrl(objectPath, 60 * 10);
  if (error) return NextResponse.json({ error: error.message, objectPath }, { status: 500 });
  const signedUrl = (signed as any)?.signedUrl ?? (signed as any)?.signedURL ?? null;
  return NextResponse.json({ signedUrl, objectPath, source: "path" });
}

export async function GET(req: Request) {
  return handleSign(req);
}
export async function POST(req: Request) {
  return handleSign(req);
}
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,x-file,x-path,x-url,x-id",
      },
    }
  );
}
