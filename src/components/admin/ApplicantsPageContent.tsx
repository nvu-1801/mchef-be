import Link from "next/link";
import ApplicantsList from "../chef/ApplicantsList";
import React from "react";

export default function ApplicantsPageContent({
  rows,
  certItems,
}: {
  rows: any[] | null;
  certItems: any[];
}) {
  const certsByUser = new Map<string, any[]>();
  for (const it of certItems) {
    const uid = it.user_id ?? it.userId ?? null;
    if (!uid) continue;
    const arr = certsByUser.get(uid) ?? [];
    arr.push(it);
    certsByUser.set(uid, arr);
  }

  const rowsWithCerts = (rows ?? []).map((r: any) => ({
    ...r,
    adminCertificates: certsByUser.get(r.id) ?? [],
  }));

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

      <ApplicantsList applicants={rowsWithCerts} />
    </div>
  );
}
