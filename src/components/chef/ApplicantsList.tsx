// app/admin/chefs/applicants/ApplicantsList.tsx
"use client";

import React from "react";
import { useMemo, useState } from "react";
import type { FC } from "react";
import ApplicantCard from "./ApplicantCard";

type AdminCert = {
  id?: string;
  user_id?: string;
  title?: string;
  file_path?: string | null;
  mime_type?: string | null;
  signedUrl?: string | null;
  created_at?: string | null;
  [k: string]: unknown;
};

export type Applicant = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: string[] | null;
  cert_status: string | null;
  certificates: string[] | null;
  adminCertificates?: AdminCert[] | null;
  created_at: string | null;
  updated_at: string | null;
};

const ApplicantsList: FC<{ applicants: Applicant[] }> = ({ applicants }) => {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return applicants;
    return applicants.filter((a) => {
      const name = a.display_name ?? "";
      const email = a.email ?? "";
      return (
        name.toLowerCase().includes(key) || email.toLowerCase().includes(key)
      );
    });
  }, [q, applicants]);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <span className="text-xs text-gray-500">
          {filtered.length} result(s)
        </span>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <ApplicantCard key={a.id} applicant={a} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border p-6 text-sm text-gray-600">
            No applicants found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantsList;
