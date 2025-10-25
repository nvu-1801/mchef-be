// src/app/(products)/admin/chefs/applicants/page.tsx
import { supabaseServer } from "@/libs/supabase/supabase-server";
import fetchPendingCertificates from "@/components/admin/fetchPendingCertificates";
import ApplicantsPageContent from "@/components/admin/ApplicantsPageContent";
import Link from "next/link";

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="mx-auto max-w-6xl p-6">
          <div className="rounded-3xl border bg-white p-8 shadow-xl">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white text-2xl mb-4">
                ⚠️
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Load Failed
              </h1>
              <p className="text-rose-600">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch the pending certificates
  const pendingCerts = await fetchPendingCertificates();

  // FIX: Resolve the type mismatch.
  // The error 'string | null' is not assignable to 'string | undefined'
  // for multiple properties (user_id, title, file_path, etc.).
  // We map the array, converting 'null' to 'undefined' for all problematic properties.
  const certItems = pendingCerts.map((cert) => ({
    ...cert,
    user_id: cert.user_id ?? undefined,
    title: cert.title ?? undefined,
    file_path: cert.file_path ?? undefined,
    mime_type: cert.mime_type ?? undefined,
    created_at: cert.created_at ?? undefined,
    // status, signedUrl, _signErr seem compatible as per error (allow null)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header with glass effect */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/chefs"
                className="group flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border hover:shadow-md transition"
              >
                <svg
                  className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Chef Applicants
                </h1>
                <p className="text-xs text-gray-500">
                  Review and approve chef applications
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-2">
                <span className="text-2xl">⏳</span>
                <div>
                  <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                    Pending
                  </div>
                  <div className="text-lg font-bold text-amber-900">
                    {rows?.length ?? 0}
                  </div>
                </div>
              </div>

              <Link
                href="/admin/chefs"
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                All Chefs
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Hero card */}
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 p-8 shadow-xl mb-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-200/40 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-br from-rose-200/40 to-pink-200/40 blur-3xl" />

          <div className="relative flex items-start gap-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-3xl shadow-lg shadow-amber-500/30">
              👨‍🍳
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-2">
                Pending Applications
              </h2>
              <p className="text-gray-600 leading-relaxed max-w-2xl">
                Review chef applications below. Check certificates, experience,
                and profile details before approving or rejecting.
              </p>
            </div>
          </div>
        </div>

        <ApplicantsPageContent rows={rows} certItems={certItems} />
      </div>
    </div>
  );
}




// import { supabaseServer } from "@/libs/supabase/supabase-server";
// import fetchPendingCertificates from "@/components/admin/fetchPendingCertificates";
// import ApplicantsPageContent from "../../../../../components/admin/ApplicantsPageContent";
// import Link from "next/link";

// export const revalidate = 0;

// export default async function ChefApplicantsPage() {
//   const sb = await supabaseServer();

//   const { data: rows, error } = await sb
//     .from("profiles")
//     .select(
//       `
//       id, email, display_name, avatar_url, bio, skills,
//       cert_status, certificates, created_at, updated_at
//     `
//     )
//     .eq("cert_status", "pending")
//     .order("updated_at", { ascending: false });

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
//         <div className="mx-auto max-w-6xl p-6">
//           <div className="rounded-3xl border bg-white p-8 shadow-xl">
//             <div className="text-center">
//               <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white text-2xl mb-4">
//                 ⚠️
//               </div>
//               <h1 className="text-2xl font-bold text-gray-900 mb-2">
//                 Load Failed
//               </h1>
//               <p className="text-rose-600">{error.message}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const certItems = await fetchPendingCertificates();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
//       {/* Header with glass effect */}
//       <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b shadow-sm">
//         <div className="mx-auto max-w-7xl px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <Link
//                 href="/admin/chefs"
//                 className="group flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border hover:shadow-md transition"
//               >
//                 <svg
//                   className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                 >
//                   <path d="M19 12H5M12 19l-7-7 7-7" />
//                 </svg>
//               </Link>
//               <div>
//                 <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
//                   Chef Applicants
//                 </h1>
//                 <p className="text-xs text-gray-500">
//                   Review and approve chef applications
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               <div className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-2">
//                 <span className="text-2xl">⏳</span>
//                 <div>
//                   <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
//                     Pending
//                   </div>
//                   <div className="text-lg font-bold text-amber-900">
//                     {rows?.length ?? 0}
//                   </div>
//                 </div>
//               </div>

//               <Link
//                 href="/admin/chefs"
//                 className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                 >
//                   <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                 </svg>
//                 All Chefs
//               </Link>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="mx-auto max-w-7xl px-6 py-8">
//         {/* Hero card */}
//         <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 p-8 shadow-xl mb-8">
//           <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-200/40 blur-3xl" />
//           <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-br from-rose-200/40 to-pink-200/40 blur-3xl" />

//           <div className="relative flex items-start gap-6">
//             <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-3xl shadow-lg shadow-amber-500/30">
//               👨‍🍳
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-2">
//                 Pending Applications
//               </h2>
//               <p className="text-gray-600 leading-relaxed max-w-2xl">
//                 Review chef applications below. Check certificates, experience,
//                 and profile details before approving or rejecting.
//               </p>
//             </div>
//           </div>
//         </div>

//         <ApplicantsPageContent rows={rows} certItems={certItems} />
//       </div>
//     </div>
//   );
// }
