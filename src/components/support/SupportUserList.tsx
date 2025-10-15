"use client";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";

type Props = {
  sessions: { session_id: string; user_id: string | null }[];
  selectedSession: string | null;
  onSelect: (sid: string) => void;
};

type UserLite = { email: string | null };

const COLORS = [
  "from-indigo-500 to-sky-500",
  "from-fuchsia-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-blue-600 to-cyan-500",
  "from-rose-500 to-orange-500",
];

function pickGradient(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  const idx = Math.abs(hash) % COLORS.length;
  return COLORS[idx];
}

export default function SupportUserList({
  sessions,
  selectedSession,
  onSelect,
}: Props) {
  const sb = supabaseBrowser();
  const [users, setUsers] = useState<Record<string, UserLite | null>>({});
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const ids = Array.from(
        new Set(sessions.map((s) => s.user_id).filter(Boolean) as string[])
      );
      if (ids.length === 0) return;

      const { data, error } = await sb
        .from("profiles")
        .select("id, email")
        .in("id", ids);

      if (error) {
        console.error("load profiles error:", error);
        return;
      }
      if (data) {
        const map: Record<string, UserLite | null> = {};
        for (const row of data as { id: string; email: string | null }[]) {
          map[row.id] = { email: row.email };
        }
        setUsers((prev) => ({ ...prev, ...map }));
      }
    })();
  }, [sessions, sb]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return sessions;
    return sessions.filter((s) => {
      const email = s.user_id ? users[s.user_id]?.email ?? "" : "";
      return (
        email.toLowerCase().includes(keyword) ||
        s.session_id.toLowerCase().includes(keyword)
      );
    });
  }, [q, sessions, users]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white grid place-items-center">
            👥
          </span>
          Danh sách khách hàng
        </div>
        <div className="mt-3 relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo email hoặc session id…"
            className="w-full h-10 rounded-xl border border-gray-300 pl-10 pr-3 text-sm
                       focus:ring-2 focus:ring-indigo-400/60"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔎
          </span>
        </div>
      </div>

      {/* List */}
      <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-gradient-to-b from-gray-50/60 to-white">
        {filtered.map((s) => {
          const email = s.user_id
            ? users[s.user_id]?.email ?? `Khách vãng lai (${s.session_id.slice(0, 6)}…)`
            : `Khách vãng lai (${s.session_id.slice(0, 6)}…)`;
          const active = selectedSession === s.session_id;
          const grad = pickGradient(s.session_id);
          const initials = (email || "G").slice(0, 1).toUpperCase();

          return (
            <li
              key={s.session_id}
              onClick={() => onSelect(s.session_id)}
              className={`group px-4 py-3 cursor-pointer transition
                          ${active ? "bg-indigo-50/80" : "hover:bg-gray-50"}`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className={`h-10 w-10 rounded-xl text-white grid place-items-center
                                 bg-gradient-to-br ${grad} shadow-sm`}
                >
                  <span className="text-sm font-bold">{initials}</span>
                </div>

                {/* Texts */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-800 truncate text-sm">
                      {email}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full
                                  ${active ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}
                    >
                      {s.user_id ? "Đã đăng nhập" : "Guest"}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">{s.session_id}</div>
                </div>

                {/* Chevron */}
                <div className="opacity-0 group-hover:opacity-100 transition text-gray-400">
                  ›
                </div>
              </div>
            </li>
          );
        })}

        {filtered.length === 0 && (
          <li className="p-6 text-gray-400 text-sm italic">
            Không tìm thấy khách hàng phù hợp…
          </li>
        )}

        {sessions.length === 0 && (
          <li className="p-6 text-gray-400 text-sm italic">Chưa có khách hàng nào chat</li>
        )}
      </ul>
    </div>
  );
}
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { supabaseBrowser } from "../../libs/supabase/supabase-client";

// type Props = {
//   sessions: { session_id: string; user_id: string | null }[];
//   selectedSession: string | null;
//   onSelect: (sid: string) => void;
// };

// type UserLite = { email: string | null };

// const COLORS = [
//   "from-indigo-500 to-sky-500",
//   "from-fuchsia-500 to-pink-500",
//   "from-emerald-500 to-teal-500",
//   "from-amber-500 to-orange-500",
//   "from-blue-600 to-cyan-500",
//   "from-rose-500 to-orange-500",
// ];

// function pickGradient(key: string) {
//   let hash = 0;
//   for (let i = 0; i < key.length; i++)
//     hash = (hash * 31 + key.charCodeAt(i)) | 0;
//   const idx = Math.abs(hash) % COLORS.length;
//   return COLORS[idx];
// }

// export default function SupportUserList({
//   sessions,
//   selectedSession,
//   onSelect,
// }: Props) {
//   const sb = supabaseBrowser();
//   const [users, setUsers] = useState<Record<string, UserLite | null>>({});
//   const [q, setQ] = useState("");

//   // Lấy email của từng user_id (nếu có)
//   useEffect(() => {
//     async function load() {
//       const ids = sessions.map((s) => s.user_id).filter(Boolean) as string[];
//       if (ids.length === 0) return;
//       const { data } = await sb
//         .from("profiles")
//         .select("id, email")
//         .in("id", ids);

//       if (data) {
//         const map: Record<string, UserLite | null> = {};
//         data.forEach((u: unknown) => {
//           const row = u as Record<string, unknown>;
//           if (!row || row.id == null) return;
//           const id = String(row.id);
//           const email = typeof row.email === "string" ? row.email : null;
//           map[id] = { email };
//         });
//         setUsers(map);
//       }
//     }
//     load();
//   }, [sessions, sb]);

//   const filtered = useMemo(() => {
//     const keyword = q.trim().toLowerCase();
//     if (!keyword) return sessions;
//     return sessions.filter((s) => {
//       const email = s.user_id ? users[s.user_id]?.email ?? "" : "";
//       return (
//         String(email).toLowerCase().includes(keyword) ||
//         s.session_id.toLowerCase().includes(keyword)
//       );
//     });
//   }, [q, sessions, users]);

//   return (
//     <div className="h-full flex flex-col">
//       {/* Header */}
//       <div className="p-4 border-b bg-white">
//         <div className="font-semibold text-gray-800 flex items-center gap-2">
//           <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white grid place-items-center">
//             👥
//           </span>
//           Danh sách khách hàng
//         </div>
//         <div className="mt-3 relative">
//           <input
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="Tìm theo email hoặc session id…"
//             className="w-full h-10 rounded-xl border border-gray-300 pl-10 pr-3 text-sm
//                        focus:ring-2 focus:ring-indigo-400/60"
//           />
//           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
//             🔎
//           </span>
//         </div>
//       </div>

//       {/* List */}
//       <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-gradient-to-b from-gray-50/60 to-white">
//         {filtered.map((s) => {
//           const email = s.user_id
//             ? users[s.user_id]?.email
//             : `Khách vãng lai (${s.session_id.slice(0, 6)}…)`;
//           const active = selectedSession === s.session_id;
//           const grad = pickGradient(s.session_id);
//           const initials = (email || "G").slice(0, 1).toUpperCase();

//           return (
//             <li
//               key={s.session_id}
//               onClick={() => onSelect(s.session_id)}
//               className={`group px-4 py-3 cursor-pointer transition
//                           ${active ? "bg-indigo-50/80" : "hover:bg-gray-50"}`}
//             >
//               <div className="flex items-center gap-3">
//                 {/* Avatar */}
//                 <div
//                   className={`h-10 w-10 rounded-xl text-white grid place-items-center
//                                  bg-gradient-to-br ${grad} shadow-sm`}
//                 >
//                   <span className="text-sm font-bold">{initials}</span>
//                 </div>

//                 {/* Texts */}
//                 <div className="min-w-0 flex-1">
//                   <div className="flex items-center gap-2">
//                     <div className="font-medium text-gray-800 truncate text-sm">
//                       {email}
//                     </div>
//                     <span
//                       className={`text-[10px] px-2 py-0.5 rounded-full
//                                   ${
//                                     active
//                                       ? "bg-indigo-600 text-white"
//                                       : "bg-gray-100 text-gray-600"
//                                   }`}
//                     >
//                       {s.user_id ? "Đã đăng nhập" : "Guest"}
//                     </span>
//                   </div>
//                   <div className="text-[11px] text-gray-500 truncate">
//                     {s.session_id}
//                   </div>
//                 </div>

//                 {/* Chevron */}
//                 <div className="opacity-0 group-hover:opacity-100 transition text-gray-400">
//                   ›
//                 </div>
//               </div>
//             </li>
//           );
//         })}

//         {filtered.length === 0 && (
//           <li className="p-6 text-gray-400 text-sm italic">
//             Không tìm thấy khách hàng phù hợp…
//           </li>
//         )}

//         {sessions.length === 0 && (
//           <li className="p-6 text-gray-400 text-sm italic">
//             Chưa có khách hàng nào chat
//           </li>
//         )}
//       </ul>
//     </div>
//   );
// }
