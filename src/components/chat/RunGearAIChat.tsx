"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  rating?: "up" | "down" | null;
};

function useChatSession() {
  const sessionRef = useRef<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let sid = localStorage.getItem("rg_chat_session");
    if (!sid) {
      sid = (crypto.randomUUID?.() ?? String(Date.now())) + "-sess";
      localStorage.setItem("rg_chat_session", sid);
    }
    sessionRef.current = sid;
  }, []);
  return sessionRef;
}

function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

export default function RunGearAIChat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "m0",
      role: "assistant",
      text: "Xin chào! Mình là trợ lý AI của Run Gear. Bạn muốn tìm sản phẩm hay cần trợ giúp thanh toán?",
      rating: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const sessionRef = useChatSession();
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  const INTENTS = [
    { label: "Tìm sản phẩm", prompt: "Tìm giúp tôi giày chạy êm chân dưới 1 triệu, size 42." },
    { label: "Kiểm tra tồn kho", prompt: "Mã RG-TRAIL-01 còn size 42 ở kho không?" },
    { label: "Voucher/PayOS", prompt: "Hướng dẫn thanh toán PayOS và áp dụng voucher 10%." },
  ];
  const useIntent = (p: string) => {
    setInput(p);
    setTimeout(() => onSend(p), 0);
  };

  const onSend = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text) return;
    if (!preset) setInput("");

    const userLocalId = crypto.randomUUID?.() ?? String(Date.now());
    setMsgs((m) => [...m, { id: userLocalId, role: "user", text, rating: null }]);

    const asstLocalId = crypto.randomUUID?.() ?? String(Date.now() + 1);
    setMsgs((m) => [...m, { id: asstLocalId, role: "assistant", text: "", rating: null }]);
    setSending(true);

    const historyForApi = [...msgs, { role: "user" as const, text }].map(({ role, text }) => ({ role, text }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, history: historyForApi }),
      });
      if (!res.ok || !res.body) throw new Error(`AI error ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let finalAnswer = "";

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const chunk = decoder.decode(value);
          finalAnswer += chunk;
          setMsgs((m) => m.map((msg) => (msg.id === asstLocalId ? { ...msg, text: msg.text + chunk } : msg)));
        }
      }

      // log
      try {
        await fetch("/api/ai/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionRef.current ?? null, role: "user", text, meta: { model: "gemini-1.5-flash" } }),
        });
      } catch {}
      try {
        await fetch("/api/ai/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionRef.current ?? null, role: "assistant", text: finalAnswer, meta: { model: "gemini-1.5-flash" } }),
        });
      } catch {}
    } catch (e) {
      setMsgs((m) =>
        m.map((msg) =>
          msg.id === asstLocalId
            ? { ...msg, text: (msg.text || "") + "\n\nXin lỗi, hệ thống AI đang bận. Vui lòng thử lại." }
            : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) return;
      e.preventDefault();
      if (canSend) onSend();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  const rateMessage = async (id: string, rating: "up" | "down") => {
    setMsgs((m) => m.map((x) => (x.id === id ? { ...x, rating } : x)));
    try {
      const msg = msgs.find((x) => x.id === id);
      await fetch("/api/ai/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id, rating, text: msg?.text ?? "" }),
      });
    } catch {}
  };

  return (
    <div className="h-full flex flex-col">
      {/* INTENTS */}
      <div className="px-4 sm:px-5 pt-3 bg-white/60">
        <div className="flex flex-wrap gap-2">
          {INTENTS.map((it) => (
            <button key={it.label} onClick={() => useIntent(it.prompt)} className="text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50">
              {it.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 bg-gradient-to-b from-white to-gray-50">
        {msgs.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end gap-2" : "flex justify-start gap-2"}>
            {m.role === "assistant" && (
              <div className="mr-1 mt-0.5 h-8 w-8 rounded-full bg-indigo-500 text-white grid place-items-center font-bold text-[11px]">AI</div>
            )}
            {m.role === "user" && (
              <div className="order-2 ml-1 mt-0.5 h-8 w-8 rounded-full bg-emerald-500 text-white grid place-items-center font-bold text-[11px]">You</div>
            )}
            <div className={m.role === "user" ? "max-w-[78%] rounded-2xl rounded-br-sm bg-indigo-600 text-white px-4 py-2 shadow" : "max-w-[78%] rounded-2xl rounded-bl-sm bg-white border px-4 py-2 shadow-sm"}>
              <p className={m.role === "user" ? "whitespace-pre-wrap text-[15px] leading-relaxed" : "whitespace-pre-wrap text-[16px] leading-relaxed font-medium text-gray-800"}>{m.text}</p>
              {m.role === "assistant" && (
                <div className="mt-1 flex items-center gap-1 text-gray-400">
                  <button onClick={() => rateMessage(m.id, "up")} className={`h-7 w-7 grid place-items-center rounded hover:bg-gray-100 ${m.rating === "up" ? "text-emerald-600" : ""}`} title="Hữu ích">👍</button>
                  <button onClick={() => rateMessage(m.id, "down")} className={`h-7 w-7 grid place-items-center rounded hover:bg-gray-100 ${m.rating === "down" ? "text-rose-600" : ""}`} title="Chưa ổn">👎</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {/** loader nhỏ khi sending */}
      </div>

      {/* Input */}
      <div className="border-t bg-white/70 backdrop-blur px-4 sm:px-5 py-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="sr-only" htmlFor="rg-ai-input">Nhập câu hỏi</label>
            <textarea
              id="rg-ai-input"
              rows={1}
              placeholder="Hỏi AI: Ví dụ “Tìm giúp tôi giày chạy êm chân dưới 1 triệu”…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-full resize-y min-h-[44px] max-h-[160px] rounded-xl border border-gray-300 px-4 py-3 text-[15px] shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="mt-1 text-[11px] text-gray-500">Enter = gửi • Shift+Enter = xuống dòng • Ctrl/⌘+Enter = gửi</div>
          </div>
          <button
            onClick={() => onSend()}
            disabled={!canSend}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow"
          >
            <SendIcon className="h-5 w-5" />
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
