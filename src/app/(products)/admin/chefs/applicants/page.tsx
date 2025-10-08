import { supabaseServer } from "@/libs/supabase/supabase-server";
import Link from "next/link";
import ApplicantsList from "../../../../../components/chef/ApplicantsList";

export const revalidate = 0;

export default async function ChefApplicantsPage() {
  const sb = await supabaseServer();

  const { data: rows, error } = await sb
    .from("profiles")
    .select(
      `
      id, email, display_name, avatar_url, bio, skills,
      cert_status, certificates, created_at, updated_at
    `
    )
    .eq("cert_status", "pending")
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-2xl font-semibold">Chef Applicants</h1>
        <p className="mt-2 text-rose-600">Load failed: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chef Applicants</h1>
        <Link
          href="/chefs"
          className="text-sm rounded-md border px-3 py-2 hover:bg-gray-50"
        >
          View public chefs
        </Link>
      </div>

      <ApplicantsList applicants={rows ?? []} />
    </div>
  );
}
