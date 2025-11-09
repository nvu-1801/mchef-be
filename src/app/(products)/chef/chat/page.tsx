"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import SupportUserList from "@/components/support/SupportUserList";
import SupportChatPanel from "@/components/support/SupportChatPanel";

type SessionRow = {
  session_id: string;
  user_id: string | null;
  created_at?: string;
};

type GuardState = {
  ready: boolean;
  user: { id: string } | null;
  error: null | { code: string; message?: string };
};

type PayloadRecord = {
  session_id?: string;
  user_id?: string;
  created_at?: string;
};

export default function ChefSupportPage() {
  const sb = supabaseBrowser();

  const [guard, setGuard] = useState<GuardState>({
    ready: false,
    user: null,
    error: null,
  });

  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const redirectTo = "/auth/sign-in";
  const next = "/chef/support";

  // ✅ Guard cho CHEF (admin vẫn pass như chef)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Lấy user hiện tại
        const { data: auth } = await sb.auth.getUser();
        const currentUser = auth?.user ?? null;

        if (!currentUser) {
          if (!cancelled) {
            setGuard({ ready: true, user: null, error: { code: "UNAUTH" } });
            // redirect kèm next
            window.location.href = `${redirectTo}?next=${encodeURIComponent(next)}`;
          }
          return;
        }

        // Lấy role từ profiles
        const { data: prof, error: profErr } = await sb
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single();

        if (profErr) {
          if (!cancelled) {
            setGuard({
              ready: true,
              user: currentUser,
              error: { code: "PROFILE_READ_FAIL", message: profErr.message },
            });
          }
          return;
        }

        const role = prof?.role ?? null;
        const isChef = role === "chef" || role === "admin"; // admin kiêm chef

        if (!cancelled) {
          if (isChef) {
            setGuard({ ready: true, user: currentUser, error: null });
          } else {
            setGuard({
              ready: true,
              user: currentUser,
              error: { code: "FORBIDDEN", message: "Not chef/admin" },
            });
          }
        }
      } catch (e) {
        if (!cancelled) {
          setGuard({
            ready: true,
            user: null,
            error: { code: "UNKNOWN", message: (e as Error)?.message },
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sb]);

  const { ready, user, error } = guard;

  // ✅ upsert + đẩy session mới lên đầu danh sách
  function upsertAndBumpTop(s: SessionRow) {
    setSessions((prev) => {
      if (!s.session_id) return prev;
      const map = new Map(prev.map((r) => [r.session_id, r]));
      const merged = { ...(map.get(s.session_id) || {}), ...s };
      map.set(s.session_id, merged);
      const rest = Array.from(map.values()).filter(
        (r) => r.session_id !== s.session_id
      );
      return [merged, ...rest];
    });
  }

  // ✅ Load initial (chỉ khi đã pass guard)
  useEffect(() => {
    if (!ready || error) return;
    let cancelled = false;

    (async () => {
      const { data, error: qErr } = await sb
        .from("support_messages")
        .select("session_id, user_id, created_at")
        .not("session_id", "is", null)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (qErr) {
        console.error("load sessions error:", qErr);
      } else if (data) {
        const unique = Array.from(
          new Map<string, SessionRow>(
            (data as SessionRow[]).map((d) => [d.session_id, d])
          ).values()
        );
        setSessions(unique);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, error, sb]);

  // ✅ Subscribe realtime (chỉ khi đã pass guard)
  useEffect(() => {
    if (!ready || error) return;

    const channel = sb
      .channel("support_messages_chef")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages" },
        (payload) => {
<<<<<<< HEAD
          const d = payload.new as PayloadRecord;
          if (d && typeof d.session_id === "string") {
            upsertAndBumpTop({
              session_id: d.session_id,
              user_id: typeof d.user_id === "string" ? d.user_id : null,
              created_at: typeof d.created_at === "string" ? d.created_at : undefined,
            });
=======
          const d = payload.new as unknown;

          if (typeof d === "object" && d !== null) {
            const dd = d as Record<string, unknown>;

            if ("session_id" in dd && typeof dd.session_id === "string") {
              upsertAndBumpTop({
                session_id: dd.session_id as string,
                user_id:
                  "user_id" in dd && typeof dd.user_id === "string"
                    ? (dd.user_id as string)
                    : null,
                created_at:
                  "created_at" in dd && typeof dd.created_at === "string"
                    ? (dd.created_at as string)
                    : undefined,
              });
            }
>>>>>>> 3057f1c6c06ccbc727f902bb54446fc1c00e25b5
          }
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [ready, error, sb]);

  // ✅ Nếu chưa chọn, tự chọn session đầu tiên (khi có dữ liệu)
  useEffect(() => {
    if (!selectedSession && sessions.length > 0) {
      setSelectedSession(sessions[0].session_id);
    }
  }, [sessions, selectedSession]);

  // ✅ UI (đổi text sang "chef")
  return (
    <div className="flex h-[75vh] mt-8 max-w-7xl mx-auto px-4 border rounded-lg overflow-hidden shadow-lg bg-white min-h-0">
      {/* Panel trái */}
      <div className="w-1/3 border-r bg-gray-50">
        {ready && !error ? (
          <SupportUserList
            sessions={sessions}
            selectedSession={selectedSession}
            onSelect={setSelectedSession}
          />
        ) : (
          <div className="h-full grid place-items-center text-sm text-gray-500 p-4">
            {!ready
              ? "Đang kiểm tra quyền chef…"
              : "Bạn không có quyền truy cập trang hỗ trợ dành cho chef."}
          </div>
        )}
      </div>

      {/* Panel phải */}
      <div className="flex-1 min-h-0">
        {!ready ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-lg">
            Đang kiểm tra quyền chef…
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-600 text-sm">
            Bạn không có quyền truy cập trang hỗ trợ dành cho chef.
          </div>
        ) : selectedSession ? (
          <SupportChatPanel key={selectedSession} sessionId={selectedSession} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-lg">
            👈 Chọn 1 người dùng để bắt đầu chat
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { supabaseBrowser } from "@/libs/supabase/supabase-client";
// import SupportUserList from "@/components/support/SupportUserList";
// import SupportChatPanel from "@/components/support/SupportChatPanel";

// type SessionRow = {
//   session_id: string;
//   user_id: string | null;
//   created_at?: string;
// };

// type GuardState = {
//   ready: boolean;
//   user: { id: string } | null;
//   error: null | { code: string; message?: string };
// };

// export default function ChefSupportPage() {
//   const sb = supabaseBrowser();

//   const [guard, setGuard] = useState<GuardState>({
//     ready: false,
//     user: null,
//     error: null,
//   });

//   const [sessions, setSessions] = useState<SessionRow[]>([]);
//   const [selectedSession, setSelectedSession] = useState<string | null>(null);

//   const redirectTo = "/auth/sign-in";
//   const next = "/chef/support";

//   // ✅ Guard cho CHEF (admin vẫn pass như chef)
//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       try {
//         // Lấy user hiện tại
//         const { data: auth } = await sb.auth.getUser();
//         const currentUser = auth?.user ?? null;

//         if (!currentUser) {
//           if (!cancelled) {
//             setGuard({ ready: true, user: null, error: { code: "UNAUTH" } });
//             // redirect kèm next
//             window.location.href = `${redirectTo}?next=${encodeURIComponent(next)}`;
//           }
//           return;
//         }

//         // Lấy role từ profiles
//         const { data: prof, error: profErr } = await sb
//           .from("profiles")
//           .select("role")
//           .eq("id", currentUser.id)
//           .single();

//         if (profErr) {
//           if (!cancelled) {
//             setGuard({
//               ready: true,
//               user: currentUser,
//               error: { code: "PROFILE_READ_FAIL", message: profErr.message },
//             });
//           }
//           return;
//         }

//         const role = prof?.role ?? null;
//         const isChef = role === "chef" || role === "admin"; // admin kiêm chef

//         if (!cancelled) {
//           if (isChef) {
//             setGuard({ ready: true, user: currentUser, error: null });
//           } else {
//             setGuard({
//               ready: true,
//               user: currentUser,
//               error: { code: "FORBIDDEN", message: "Not chef/admin" },
//             });
//           }
//         }
//       } catch (e) {
//         if (!cancelled) {
//           setGuard({
//             ready: true,
//             user: null,
//             error: { code: "UNKNOWN", message: (e as Error)?.message },
//           });
//         }
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [sb]);

//   const { ready, user, error } = guard;

//   // ✅ upsert + đẩy session mới lên đầu danh sách
//   function upsertAndBumpTop(s: SessionRow) {
//     setSessions((prev) => {
//       if (!s.session_id) return prev;
//       const map = new Map(prev.map((r) => [r.session_id, r]));
//       const merged = { ...(map.get(s.session_id) || {}), ...s };
//       map.set(s.session_id, merged);
//       const rest = Array.from(map.values()).filter(
//         (r) => r.session_id !== s.session_id
//       );
//       return [merged, ...rest];
//     });
//   }

//   // ✅ Load initial (chỉ khi đã pass guard)
//   useEffect(() => {
//     if (!ready || error) return;
//     let cancelled = false;

//     (async () => {
//       const { data, error: qErr } = await sb
//         .from("support_messages")
//         .select("session_id, user_id, created_at")
//         .not("session_id", "is", null)
//         .order("created_at", { ascending: false });

//       if (cancelled) return;

//       if (qErr) {
//         console.error("load sessions error:", qErr);
//       } else if (data) {
//         const unique = Array.from(
//           new Map<string, SessionRow>(
//             (data as SessionRow[]).map((d) => [d.session_id, d])
//           ).values()
//         );
//         setSessions(unique);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [ready, error, sb]);

//   // ✅ Subscribe realtime (chỉ khi đã pass guard)
//   useEffect(() => {
//     if (!ready || error) return;

//     const channel = sb
//       .channel("support_messages_chef")
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "public", table: "support_messages" },
//         (payload) => {
//           const d = payload.new as unknown;
//           if (
//             typeof d === "object" &&
//             d !== null &&
//             "session_id" in d &&
//             typeof (d as any).session_id === "string"
//           ) {
//             upsertAndBumpTop({
//               session_id: (d as any).session_id,
//               user_id:
//                 "user_id" in d && typeof (d as any).user_id === "string"
//                   ? (d as any).user_id
//                   : null,
//               created_at:
//                 "created_at" in d && typeof (d as any).created_at === "string"
//                   ? (d as any).created_at
//                   : undefined,
//             });
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       sb.removeChannel(channel);
//     };
//   }, [ready, error, sb]);

//   // ✅ Nếu chưa chọn, tự chọn session đầu tiên (khi có dữ liệu)
//   useEffect(() => {
//     if (!selectedSession && sessions.length > 0) {
//       setSelectedSession(sessions[0].session_id);
//     }
//   }, [sessions, selectedSession]);

//   // ✅ UI (đổi text sang “chef”)
//   return (
//     <div className="flex h-[75vh] mt-8 max-w-7xl mx-auto px-4 border rounded-lg overflow-hidden shadow-lg bg-white min-h-0">
//       {/* Panel trái */}
//       <div className="w-1/3 border-r bg-gray-50">
//         {ready && !error ? (
//           <SupportUserList
//             sessions={sessions}
//             selectedSession={selectedSession}
//             onSelect={setSelectedSession}
//           />
//         ) : (
//           <div className="h-full grid place-items-center text-sm text-gray-500 p-4">
//             {!ready
//               ? "Đang kiểm tra quyền chef…"
//               : "Bạn không có quyền truy cập trang hỗ trợ dành cho chef."}
//           </div>
//         )}
//       </div>

//       {/* Panel phải */}
//       <div className="flex-1 min-h-0">
//         {!ready ? (
//           <div className="h-full flex items-center justify-center text-gray-400 text-lg">
//             Đang kiểm tra quyền chef…
//           </div>
//         ) : error ? (
//           <div className="h-full flex items-center justify-center text-red-600 text-sm">
//             Bạn không có quyền truy cập trang hỗ trợ dành cho chef.
//           </div>
//         ) : selectedSession ? (
//           <SupportChatPanel key={selectedSession} sessionId={selectedSession} />
//         ) : (
//           <div className="h-full flex items-center justify-center text-gray-400 text-lg">
//             👈 Chọn 1 người dùng để bắt đầu chat
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
