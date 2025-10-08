// libs/server/profile.ts
import { createClient, type User } from "@supabase/supabase-js";
import { supabaseServer } from "@/libs/supabase/supabase-server";

type RawProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: string[] | null;
  role: string | null;
  cert_status: string | null;
  certificates: any[] | null;
  updated_at: string | null;
} | null;

export type ProfileData = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  skills: string[];
  role: string;
  certStatus?: string | null;
  certificates?: any[];
  updatedAt: string | null;
};

function normalizeProfile(user: User, prof: RawProfile): ProfileData {
  return {
    id: user.id,
    email: prof?.email ?? user.email ?? null,
    fullName: prof?.display_name ?? null,
    avatarUrl: prof?.avatar_url ?? null,
    bio: prof?.bio ?? null,
    skills: Array.isArray(prof?.skills) ? prof!.skills! : [],
    role: prof?.role ?? "user",
    certStatus: prof?.cert_status ?? null,
    certificates: Array.isArray(prof?.certificates) ? prof!.certificates! : [],
    updatedAt: prof?.updated_at ?? null,
  };
}

export async function getCurrentUserAndProfileFromCookies() {
  const sb = await supabaseServer();
  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData?.user)
    return { user: null, profile: null as ProfileData | null, error: userErr };

  const user = userData.user;
  const { data: prof, error: profErr } = await sb
    .from("profiles")
    .select(
      `id, email, display_name, avatar_url, bio, skills, role, cert_status, certificates, updated_at`
    )
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: normalizeProfile(user, prof),
    error: profErr ?? null,
  };
}

export function makeClientWithBearer(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getCurrentUserAndProfileFromBearer(token: string) {
  const sb = makeClientWithBearer(token);
  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData?.user)
    return { user: null, profile: null as ProfileData | null, error: userErr };

  const user = userData.user;
  const { data: prof, error: profErr } = await sb
    .from("profiles")
    .select(
      `id, email, display_name, avatar_url, bio, skills, role, cert_status, certificates, updated_at`
    )
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: normalizeProfile(user, prof),
    error: profErr ?? null,
  };
}
