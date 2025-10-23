
"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import { RealtimeChat } from "../chat/realtime-chat";

type DBMsg = {
  id: string;
  session_id: string;
  user_id: string | null;
  role: "admin" | "user";
  text: string;
  created_at: string;
};

type ChatMessage = {
  id: string;
  content: string;
  user: { name: string };
  createdAt: string;
};

export default function SupportChatPanel({ sessionId }: { sessionId: string }) {
  const sb = supabaseBrowser();
  const [initial, setInitial] = useState<ChatMessage[]>([]);
  const roomName = `support:${sessionId}`;

  // Load lịch sử từ DB và map -> ChatMessage
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await sb
        .from("support_messages")
        .select("id, session_id, user_id, role, text, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (!mounted) return;
      if (error) {
        console.error("load messages error:", error);
        setInitial([]);
        return;
      }
      const mapped = (data as DBMsg[]).map((m) => ({
        id: m.id,
        content: m.text,
        user: { name: m.role === "admin" ? "Admin" : "Khách" },
        createdAt: m.created_at,
      }));
      setInitial(mapped);
    })();
    return () => {
      mounted = false;
    };
  }, [sb, sessionId]);

  // Khi admin gửi từ UI → ghi vào DB (role=admin).
  async function handleMessage(next: ChatMessage[]) {
    const last = next[next.length - 1];
    if (!last) return;

    const {
      data: { user },
      error: authErr,
    } = await sb.auth.getUser();

    if (authErr || !user) {
      console.error("Admin not authenticated");
      return;
    }

    const { error } = await sb.from("support_messages").insert({
      session_id: sessionId,
      user_id: user.id,
      role: "admin",
      text: last.content,
    });
    if (error) console.error("Insert failed:", error.message ?? error);
    // Không set state tại đây — RealtimeChat sẽ broadcast ngay và UI tự cập nhật
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-3 sm:p-4 border-b bg-white/70 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-gray-800">Admin Support</div>
          <span className="text-xs text-gray-500">#{sessionId.slice(0, 8)}…</span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <RealtimeChat
          roomName={roomName}
          username="Admin"
          messages={initial}
          onMessage={handleMessage}
        />
      </div>
    </div>
  );
}

// "use client";
// import { useEffect, useRef, useState } from "react";
// import { supabaseBrowser } from "../../libs/supabase/supabase-client";

// type Message = {
//   id: string;
//   session_id: string;
//   role: "admin" | "user" | string;
//   text: string;
//   created_at: string;
// };

// export default function SupportChatPanel({ sessionId }: { sessionId: string }) {
//   const sb = supabaseBrowser();
//   const [msgs, setMsgs] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [sending, setSending] = useState(false);

//   const scrollerRef = useRef<HTMLDivElement | null>(null);
//   const endRef = useRef<HTMLDivElement | null>(null);

//   // flags
//   const wantScrollRef = useRef<"none" | "auto" | "smooth">("none");
//   const nearBottomRef = useRef(true);

//   // helper
//   const scrollToEnd = (mode: ScrollBehavior = "smooth") => {
//     // dùng scrollTop để chắc chắn cuộn vùng chat, không phải body
//     const el = scrollerRef.current;
//     if (!el) return;
//     // dùng requestAnimationFrame để đợi DOM paint xong
//     requestAnimationFrame(() => {
//       el.scrollTop = el.scrollHeight;
//     });
//   };

//   // track đang ở gần đáy không (để quyết định có auto-scroll với smooth)
//   useEffect(() => {
//     const el = scrollerRef.current;
//     if (!el) return;
//     const onScroll = () => {
//       const threshold = 64;
//       const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
//       nearBottomRef.current = distance <= threshold;
//     };
//     el.addEventListener("scroll", onScroll, { passive: true });
//     return () => el.removeEventListener("scroll", onScroll);
//   }, []);

//   // load lần đầu + subscribe realtime (CHỈ 1 EFFECT)
//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       const { data, error } = await sb
//         .from("support_messages")
//         .select("*")
//         .eq("session_id", sessionId)
//         .order("created_at", { ascending: true });

//       if (!mounted) return;
//       if (error) console.error("load messages error:", error);

//       setMsgs((data as Message[]) || []);
//       // lần đầu: nhảy xuống đáy luôn
//       wantScrollRef.current = "auto";
//     })();

//     const channel = sb
//       .channel(`support:${sessionId}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "support_messages",
//           filter: `session_id=eq.${sessionId}`,
//         },
//         (payload) => {
//           setMsgs((m) => [...m, payload.new as Message]);
//           // chỉ cuộn mượt khi đang gần đáy
//           wantScrollRef.current = nearBottomRef.current ? "smooth" : "none";
//         }
//       )
//       .subscribe();

//     return () => {
//       mounted = false;
//       sb.removeChannel(channel);
//     };
//   }, [sb, sessionId]);

//   // thực thi cuộn khi được yêu cầu
//   useEffect(() => {
//     if (wantScrollRef.current === "none") return;
//     const mode = wantScrollRef.current;
//     wantScrollRef.current = "none";
//     scrollToEnd(mode);
//   }, [msgs]);

//   async function doSend() {
//     const text = input.trim();
//     if (!text || sending) return;
//     setSending(true);
//     try {
//       const {
//         data: { user },
//       } = await sb.auth.getUser();
//       if (!user) {
//         console.error("Admin not authenticated");
//         setSending(false);
//         return;
//       }
//       const { error } = await sb.from("support_messages").insert({
//         session_id: sessionId,
//         role: "admin",
//         text,
//         user_id: user.id,
//       });
//       if (error) {
//         console.error(
//           "Insert failed:",
//           (error as { message?: unknown }).message ?? error
//         );
//       } else {
//         setInput("");
//         // sau khi gửi: cuộn mượt xuống cuối
//         wantScrollRef.current = "smooth";
//       }
//     } catch (e: unknown) {
//       console.error("Send exception:", e);
//     } finally {
//       setSending(false);
//     }
//   }

//   const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     const native = e.nativeEvent as unknown;
//     const composingVal = (native as { isComposing?: unknown }).isComposing;
//     const isComposing =
//       typeof composingVal === "boolean" ? composingVal : e.keyCode === 229;
//     if (isComposing) return;
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       void doSend();
//     }
//   };

//   const pretty = (iso: string) =>
//     new Date(iso).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//   const bgPattern =
//     "bg-[radial-gradient(1200px_600px_at_100%_-10%,rgba(99,102,241,0.08),transparent),radial-gradient(1200px_600px_at_0%_110%,rgba(244,114,182,0.08),transparent)]";

//   return (
//     <div className="flex flex-col h-full min-h-0">
//       {/* Header */}
//       <div className="p-3 sm:p-4 border-b bg-white/70 backdrop-blur flex items-center justify-between shrink-0">
//         <div className="flex items-center gap-3">
//           <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white grid place-items-center shadow">
//             🔧
//           </span>
//           <div className="leading-tight">
//             <div className="font-semibold text-gray-800">Admin Support</div>
//             <div className="text-[11px] text-emerald-600 font-medium">
//               ● Đang hoạt động
//             </div>
//           </div>
//         </div>
//         <span className="text-xs text-gray-500 hidden sm:inline">
//           #{sessionId.slice(0, 8)}…
//         </span>
//       </div>

//       {/* Messages (scroll trong khung này) */}
//       <div
//         ref={scrollerRef}
//         className={`flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-3 ${bgPattern}`}
//       >
//         {msgs.map((m) => {
//           const isAdmin = m.role === "admin";
//           return (
//             <div
//               key={m.id}
//               className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
//             >
//               <div className="max-w-[78%] sm:max-w-[70%]">
//                 <div
//                   className={[
//                     "px-4 py-2.5 rounded-2xl shadow-sm",
//                     isAdmin
//                       ? "bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white rounded-br-md"
//                       : "bg-white border border-gray-200 text-gray-800 rounded-bl-md",
//                   ].join(" ")}
//                 >
//                   <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
//                     {m.text}
//                   </div>
//                 </div>
//                 <div
//                   className={`mt-1 text-[10px] ${
//                     isAdmin ? "text-white/80" : "text-gray-400"
//                   }`}
//                 >
//                   {isAdmin ? "Bạn" : "Khách"} • {pretty(m.created_at)}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//         <div ref={endRef} />
//       </div>

//       {/* Input */}
//       <form
//         onSubmit={(e) => {
//           e.preventDefault();
//           void doSend();
//         }}
//         className="border-t bg-white p-3 sm:p-4 shrink-0"
//       >
//         <div className="flex items-end gap-2">
//           <button
//             type="button"
//             className="h-9 w-9 rounded-lg border border-gray-200 grid place-items-center hover:shadow-sm hover:bg-gray-50"
//           >
//             😊
//           </button>
//           <button
//             type="button"
//             className="h-9 w-9 rounded-lg border border-gray-200 grid place-items-center hover:shadow-sm hover:bg-gray-50"
//           >
//             📎
//           </button>
//           <textarea
//             rows={1}
//             placeholder="Nhập tin nhắn…"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={onKeyDown}
//             disabled={sending}
//             className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm
//                        focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400 bg-white/80 disabled:opacity-60"
//           />
//           <button
//             type="submit"
//             disabled={!input.trim() || sending}
//             className="px-4 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-medium shadow hover:opacity-95 disabled:opacity-50"
//           >
//             {sending ? "Đang gửi…" : "Gửi"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
