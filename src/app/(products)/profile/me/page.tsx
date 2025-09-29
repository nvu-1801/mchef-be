// app/profile/me/page.tsx
import { redirect } from "next/navigation";
import { supabaseServer } from "@/libs/db/supabase/supabase-server";
import ProfileView from "./profile-view";

export const revalidate = 0;

export default async function ProfileMePage() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/auth/signin?next=/profile/me");

  const { data: prof } = await sb
    .from("profiles")
    .select(
      "id, email, display_name, avatar_url, bio, skills, role, updated_at, cert_status, certificates"
    )
    .eq("id", user.id)
    .maybeSingle();

  const initialProfile = {
    id: user.id,
    email: user.email ?? prof?.email ?? "",
    fullName: prof?.display_name ?? "",
    avatarUrl: prof?.avatar_url ?? "",
    bio: prof?.bio ?? "",
    skills: Array.isArray(prof?.skills) ? prof.skills : [],
    role: prof?.role ?? "user",
    certStatus: prof?.cert_status ?? null,
    certificates: prof?.certificates ?? [],
    updatedAt: prof?.updated_at ?? null,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-gray-800">
      <div className="relative overflow-hidden rounded-2xl border shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/15 via-fuchsia-500/15 to-emerald-500/15" />
        <div className="relative px-6 py-6">
          <h1 className="text-2xl font-semibold">Your Profile</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and update your personal information.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <ProfileView initial={initialProfile} />
      </div>
    </div>
  );
}
