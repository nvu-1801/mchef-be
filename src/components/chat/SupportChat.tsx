"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";
import { RealtimeChat } from "./realtime-chat";

type DBMsg = {
  id: string;
  session_id: string;
  user_id: string | null;
  role: "user" | "admin";
  text: string;
  created_at: string;
};

type ChatMessage = {
  id: string;
  content: string;
  user: { name: string };
  createdAt: string;
};

function useChatSession(): string | null {
  const [sid, setSid] = useState<string | null>(null);
  useEffect(() => {
    let cur = localStorage.getItem("rg_chat_session");
    if (!cur) {
      cur = (crypto.randomUUID?.() ?? String(Date.now())) + "-sess";
      localStorage.setItem("rg_chat_session", cur);
    }
    setSid(cur);
  }, []);
  return sid;
}

export default function SupportChat() {
  const sb = supabaseBrowser();
  const sid = useChatSession();
  const roomName = sid ? `support:${sid}` : undefined;

  const [initial, setInitial] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState<string>("Guest");

  // Lấy tên hiển thị (nếu user đã đăng nhập có email)
  useEffect(() => {
    (async () => {
      const { data } = await sb.auth.getUser();
      const email = data.user?.email;
      if (email) setUsername(email);
    })();
  }, [sb]);

  // Load lịch sử từ DB
  useEffect(() => {
    if (!sid) return;
    let mounted = true;
    (async () => {
      const { data, error } = await sb
        .from("support_messages")
        .select("id, session_id, user_id, role, text, created_at")
        .eq("session_id", sid)
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
        user: { name: m.role === "admin" ? "Support" : "You" },
        createdAt: m.created_at,
      }));
      setInitial(mapped);
    })();
    return () => {
      mounted = false;
    };
  }, [sb, sid]);

  // Gửi từ UI → ghi DB role=user
  async function handleMessage(next: ChatMessage[]) {
    if (!sid) return;
    const last = next[next.length - 1];
    if (!last) return;

    const {
      data: { user },
    } = await sb.auth.getUser();

    const { error } = await sb.from("support_messages").insert({
      session_id: sid,
      user_id: user?.id ?? null,
      role: "user",
      text: last.content,
    });
    if (error) console.error("Insert failed:", error.message ?? error);
  }

  if (!roomName) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 sm:px-5 pt-3 bg-white/60">
        <div className="text-[13px] text-gray-600">
          Chat realtime với nhân viên. Bạn có thể rời trang—cuộc trò chuyện sẽ gắn với phiên hiện tại.
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <RealtimeChat
          roomName={roomName}
          username={username}
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

// type ChatMsg = {
//   id: string;
//   session_id: string | null;
//   user_id: string | null;
//   role: "user" | "admin";
//   text: string;
//   created_at: string;
// };

// function useChatSession() {
//   const sessionRef = useRef<string | null>(null);
//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     let sid = localStorage.getItem("rg_chat_session");
//     if (!sid) {
//       sid = (crypto.randomUUID?.() ?? String(Date.now())) + "-sess";
//       localStorage.setItem("rg_chat_session", sid);
//     }
//     sessionRef.current = sid;
//   }, []);
//   return sessionRef;
// }

// export default function SupportChat() {
//   const [msgs, setMsgs] = useState<ChatMsg[]>([]);
//   const [input, setInput] = useState("");
//   const [sending, setSending] = useState(false);
//   const endRef = useRef<HTMLDivElement | null>(null);
//   const sessionRef = useChatSession();
//   const sb = supabaseBrowser(); // hoặc supabaseBrowser()

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [msgs]);

//   // Load lịch sử + subscribe realtime theo session_id
//   useEffect(() => {
//     if (!sessionRef.current) return;
//     const sid = sessionRef.current;

//     let isMounted = true;

//     (async () => {
//       const { data, error } = await sb
//         .from("support_messages")
//         .select("*")
//         .eq("session_id", sid)
//         .order("created_at", { ascending: true });
//       if (!error && isMounted) setMsgs(data as ChatMsg[]);
//     })();

//     const channel = sb
//       .channel(`support:${sid}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "INSERT",
//           schema: "public",
//           table: "support_messages",
//           filter: `session_id=eq.${sid}`,
//         },
//         (payload) => {
//           setMsgs((m) => [...m, payload.new as ChatMsg]);
//         }
//       )
//       .subscribe((status) => {
//         // console.log("Realtime status:", status);
//       });

//     return () => {
//       isMounted = false;
//       sb.removeChannel(channel);
//     };
//   }, [sb, sessionRef.current]);

//   async function send() {
//     const text = input.trim();
//     if (!text || !sessionRef.current || sending) return;
//     setSending(true);

//     const sid = sessionRef.current;
//     // Lấy user hiện tại nếu đang đăng nhập (để phân biệt admin phía server)
//     const {
//       data: { user },
//     } = await sb.auth.getUser();

//     const { error } = await sb.from("support_messages").insert({
//       session_id: sid,
//       user_id: user?.id ?? null,
//       role: "user",
//       text,
//     });
//     if (!error) setInput("");
//     setSending(false);
//   }

//   const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       send();
//     }
//   };

//   return (
//     <div className="h-full flex flex-col">
//       {/* Info bar */}
//       <div className="px-4 sm:px-5 pt-3 bg-white/60">
//         <div className="text-[13px] text-gray-600">
//           Chat realtime với nhân viên RunGear. Khi bạn rời trang, cuộc trò
//           chuyện vẫn được giữ theo phiên hiện tại.
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 bg-gradient-to-b from-white to-gray-50">
//         {msgs.map((m) => {
//           const mine = m.role === "user";
//           return (
//             <div
//               key={m.id}
//               className={
//                 mine ? "flex justify-end gap-2" : "flex justify-start gap-2"
//               }
//             >
//               {!mine && (
//                 <div className="mr-1 mt-0.5 h-8 w-8 rounded-full bg-indigo-500 text-white grid place-items-center font-bold text-[11px]">
//                   CS
//                 </div>
//               )}
//               {mine && (
//                 <div className="order-2 ml-1 mt-0.5 h-8 w-8 rounded-full bg-emerald-500 text-white grid place-items-center font-bold text-[11px]">
//                   You
//                 </div>
//               )}
//               <div
//                 className={
//                   mine
//                     ? "max-w-[78%] rounded-2xl rounded-br-sm bg-indigo-600 text-white px-4 py-2 shadow"
//                     : "max-w-[78%] rounded-2xl rounded-bl-sm bg-white border px-4 py-2 shadow-sm"
//                 }
//               >
//                 <p
//                   className={
//                     mine
//                       ? "whitespace-pre-wrap text-[15px] leading-relaxed"
//                       : "whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800"
//                   }
//                 >
//                   {m.text}
//                 </p>
//                 <div className="mt-1 text-[11px] text-gray-400">
//                   {new Date(m.created_at).toLocaleString()}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//         <div ref={endRef} />
//       </div>

//       {/* Input */}
//       <div className="border-t bg-white/70 backdrop-blur px-4 sm:px-5 py-3">
//         <div className="flex items-end gap-2">
//           <div className="flex-1">
//             <textarea
//               rows={1}
//               placeholder="Nhập tin nhắn cho nhân viên hỗ trợ..."
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={onKeyDown}
//               className="w-full resize-y min-h-[44px] max-h-[160px] rounded-xl border border-gray-300 px-4 py-3 text-[15px] shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
//             />
//             <div className="mt-1 text-[11px] text-gray-500">
//               Enter = gửi • Shift+Enter = xuống dòng
//             </div>
//           </div>
//           <button
//             onClick={send}
//             disabled={sending || !input.trim()}
//             className="shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow"
//           >
//             Gửi
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
