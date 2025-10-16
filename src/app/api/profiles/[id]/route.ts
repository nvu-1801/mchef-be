// app/api/profiles/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";

export async function GET(request: Request) {
  // extract id from request URL to avoid incompatible second-param typing
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("profiles");
  const id = idx >= 0 && parts.length > idx + 1 ? parts[idx + 1] : null;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const sb = await supabaseServer();

  const { data, error } = await sb
    .from("profiles")
    .select("id, display_name, avatar_url, bio, skills, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Fetch failed", detail: error.message },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Public profile: hide email, role, cert_status, certificates
  return NextResponse.json({
    id: data.id,
    fullName: data.display_name ?? "",
    avatarUrl: data.avatar_url ?? "",
    bio: data.bio ?? "",
    skills: Array.isArray(data.skills) ? data.skills : [],
    updatedAt: data.updated_at ?? null,
  });
}
