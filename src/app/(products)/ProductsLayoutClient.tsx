"use client";

import dynamic from "next/dynamic";
import type { User } from "@supabase/supabase-js";
import Footer from "@/components/common/Footer";

const HeaderBar = dynamic(() => import("@/components/layout/HeaderBar"), {
  ssr: false,
});
const GlobalLoading = dynamic(
  () => import("@/components/common/GlobalLoading"),
  { ssr: false }
);

<<<<<<< HEAD
type ProductsLayoutClientProps = {
  children: React.ReactNode;
  user: User | null;
  isAdmin: boolean;
=======
type User = {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  // Add other user properties as needed
>>>>>>> 3057f1c6c06ccbc727f902bb54446fc1c00e25b5
};

export default function ProductsLayoutClient({
  children,
  user,
  isAdmin,
<<<<<<< HEAD
}: ProductsLayoutClientProps) {
=======
}: {
  children: React.ReactNode;
  user: User | null;
  isAdmin: boolean;
}) {
>>>>>>> 3057f1c6c06ccbc727f902bb54446fc1c00e25b5
  return (
    <div className="min-h-dvh flex flex-col bg-white bg-[radial-gradient(45rem_45rem_at_80%_-10%,#dbeafe_10%,transparent_60%),radial-gradient(40rem_40rem_at_0%_120%,#fce7f3_10%,transparent_60%)]">
      <GlobalLoading />
      <HeaderBar isAdmin={isAdmin} user={user} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// "use client";

// import dynamic from "next/dynamic";
// import Footer from "@/components/common/Footer";

// const HeaderBar = dynamic(() => import("@/components/layout/HeaderBar"), {
//   ssr: false,
// });
// const GlobalLoading = dynamic(
//   () => import("@/components/common/GlobalLoading"),
//   { ssr: false }
// );

// export default function ProductsLayoutClient({
//   children,
//   user,
//   isAdmin,
// }: {
//   children: React.ReactNode;
//   user: any;
//   isAdmin: boolean;
// }) {
//   return (
//     <div className="min-h-dvh flex flex-col bg-white bg-[radial-gradient(45rem_45rem_at_80%_-10%,#dbeafe_10%,transparent_60%),radial-gradient(40rem_40rem_at_0%_120%,#fce7f3_10%,transparent_60%)]">
//       <GlobalLoading />
//       <HeaderBar isAdmin={isAdmin} user={user} />

//       <main className="flex-1">
//         <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
//           {children}
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// }
