"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// ---- Icons
function SparkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 2l1.9 5.7H20l-4.6 3.4L17.4 17 12 13.9 6.6 17l2-5.9L4 7.7h6.1L12 2z"
        fill="currentColor"
      />
    </svg>
  );
}
function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

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

export default function Chatbot() {
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !sending,
    [input, sending]
  );

  // ======= INTENT BUTTONS (gợi ý prompt) =======
  const INTENTS = [
    {
      label: "Tìm sản phẩm",
      prompt: "Tìm giúp tôi giày chạy êm chân dưới 1 triệu, size 42.",
    },
    {
      label: "Kiểm tra tồn kho",
      prompt: "Mã RG-TRAIL-01 còn size 42 ở kho không?",
    },
    {
      label: "Voucher/PayOS",
      prompt: "Hướng dẫn thanh toán PayOS và áp dụng voucher 10%.",
    },
  ];
  const useIntent = (p: string, sendNow = true) => {
    if (sendNow) {
      setInput(p);
      setTimeout(() => onSend(p), 0);
    } else {
      setInput((prev) => (prev ? prev + "\n" + p : p));
    }
  };

  // ======= STREAMING CALL (đÃ FIX) =======
  const onSend = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text) return;

    if (!preset) setInput("");

    // push user message vào UI
    const userLocalId = crypto.randomUUID?.() ?? String(Date.now());
    setMsgs((m) => [
      ...m,
      { id: userLocalId, role: "user", text, rating: null },
    ]);

    // tạo khung assistant trống để stream
    const asstLocalId = crypto.randomUUID?.() ?? String(Date.now() + 1);
    setMsgs((m) => [
      ...m,
      { id: asstLocalId, role: "assistant", text: "", rating: null },
    ]);
    setSending(true);

    // chuẩn bị history: dùng msgs hiện tại + message user vừa gửi
    const historyForApi = [...msgs, { role: "user" as const, text }].map(
      ({ role, text }) => ({ role, text })
    );

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          history: historyForApi,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => `AI error ${res.status}`);
        setMsgs((m) =>
          m.map((msg) =>
            msg.id === asstLocalId
              ? { ...msg, text: `⚠️ ${errText || "AI error"}` }
              : msg
          )
        );
        setSending(false);
        return;
      }

      if (!res.body) throw new Error(`AI error ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let finalAnswer = ""; // <- tích lũy để log sau khi stream xong

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const chunk = decoder.decode(value);
          finalAnswer += chunk;
          setMsgs((m) =>
            m.map((msg) =>
              msg.id === asstLocalId ? { ...msg, text: msg.text + chunk } : msg
            )
          );
        }
      }

      // LOG: user question
      try {
        await fetch("/api/ai/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionRef.current ?? null,
            role: "user",
            text,
            meta: { model: "gemini-1.5-flash" },
          }),
        });
      } catch { }

      // LOG: assistant final answer
      try {
        await fetch("/api/ai/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionRef.current ?? null,
            role: "assistant",
            text: finalAnswer,
            meta: { model: "gemini-1.5-flash" },
          }),
        });
      } catch { }
    } catch (e) {
      setMsgs((m) =>
        m.map((msg) =>
          msg.id === asstLocalId
            ? {
              ...msg,
              text:
                (msg.text || "") +
                "\n\nXin lỗi, hệ thống AI đang bận. Vui lòng thử lại.",
            }
            : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  // ======= PHÍM: Enter gửi, Shift+Enter xuống dòng, Ctrl/⌘+Enter gửi =======
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) return; // xuống dòng
      e.preventDefault();
      if (canSend) onSend();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  // ======= Đánh giá 👍/👎 =======
  const rateMessage = async (id: string, rating: "up" | "down") => {
    setMsgs((m) => m.map((x) => (x.id === id ? { ...x, rating } : x)));
    try {
      const msg = msgs.find((x) => x.id === id);
      await fetch("/api/ai/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id, rating, text: msg?.text ?? "" }),
      });
    } catch { }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        aria-label="Mở chat AI"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[110] flex items-center gap-3 rounded-full 
                 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300
                 px-4 py-3 ring-1 ring-white/20"
      >
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <SparkIcon className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-indigo-600" />
        </span>
        <span className="hidden sm:inline text-[15px]">Hỏi AI</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[120] p-4 sm:p-6 md:p-10"
          role="dialog"
          aria-modal="true"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* card */}
          <div
            className="relative mx-auto h-[85vh] max-h-[900px] w-full max-w-[1000px]
                       transition-all duration-300 ease-out data-[state=open]:opacity-100 data-[state=open]:scale-100
                       opacity-0 scale-95"
            data-state="open"
          >
            {/* animated gradient bg */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/30 via-pink-400/20 to-emerald-400/30 animate-[gradientShift_10s_ease_infinite]" />
            <div className="relative h-full overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
              {/* Header */}
              <div className="border-b bg-white/70 backdrop-blur-sm px-5 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white grid place-items-center shadow">
                    <SparkIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold leading-tight">
                      Run Gear AI
                    </div>
                    <div className="text-xs text-gray-500">
                      Gemini assistant • hỗ trợ tìm sản phẩm, thanh toán
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/faq"
                    className="hidden sm:inline-block text-[13px] px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                  >
                    FAQ
                  </Link>
                  <button
                    onClick={() => setOpen(false)}
                    className="h-9 w-9 grid place-items-center rounded-lg hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* INTENTS */}
              <div className="px-4 sm:px-5 pt-3 bg-white/60">
                <div className="flex flex-wrap gap-2">
                  {INTENTS.map((it) => (
                    <button
                      key={it.label}
                      onClick={() => useIntent(it.prompt, true)}
                      className="text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50"
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="h-[calc(100%-60px-80px-48px)] overflow-y-auto px-4 sm:px-5 py-4 space-y-4 bg-gradient-to-b from-white to-gray-50">
                {msgs.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.role === "user"
                        ? "flex justify-end gap-2"
                        : "flex justify-start gap-2"
                    }
                  >
                    {/* Avatar */}
                    {m.role === "assistant" && (
                      <div className="mr-1 mt-0.5 h-8 w-8 rounded-full bg-indigo-500 text-white grid place-items-center font-bold text-[11px]">
                        AI
                      </div>
                    )}
                    {m.role === "user" && (
                      <div className="order-2 ml-1 mt-0.5 h-8 w-8 rounded-full bg-emerald-500 text-white grid place-items-center font-bold text-[11px]">
                        You
                      </div>
                    )}
                    {/* Bubble */}
                    <div
                      className={
                        m.role === "user"
                          ? "max-w-[78%] rounded-2xl rounded-br-sm bg-indigo-600 text-white px-4 py-2 shadow"
                          : "max-w-[78%] rounded-2xl rounded-bl-sm bg-white border px-4 py-2 shadow-sm"
                      }
                    >
                      <p
                        className={
                          m.role === "user"
                            ? "whitespace-pre-wrap text-[15px] leading-relaxed"
                            : "whitespace-pre-wrap text-[16px] leading-relaxed font-medium text-gray-800"
                        }
                      >
                        {m.text}
                      </p>

                      {/* Rating chỉ cho assistant */}
                      {m.role === "assistant" && (
                        <div className="mt-1 flex items-center gap-1 text-gray-400">
                          <button
                            onClick={() => rateMessage(m.id, "up")}
                            className={`h-7 w-7 grid place-items-center rounded hover:bg-gray-100 ${m.rating === "up" ? "text-emerald-600" : ""
                              }`}
                            title="Hữu ích"
                          >
                            👍
                          </button>
                          <button
                            onClick={() => rateMessage(m.id, "down")}
                            className={`h-7 w-7 grid place-items-center rounded hover:bg-gray-100 ${m.rating === "down" ? "text-rose-600" : ""
                              }`}
                            title="Chưa ổn"
                          >
                            👎
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex justify-start gap-2">
                    <div className="mr-1 mt-0.5 h-8 w-8 rounded-full bg-indigo-500 text-white grid place-items-center font-bold text-[11px]">
                      AI
                    </div>
                    <div className="max-w-[78%] rounded-2xl rounded-bl-sm bg-white border px-4 py-2 shadow-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <span className="inline-flex -space-x-1">
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" />
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:120ms]" />
                          <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:240ms]" />
                        </span>
                        <span className="text-xs">Đang soạn câu trả lời…</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="border-t bg-white/70 backdrop-blur px-4 sm:px-5 py-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="sr-only" htmlFor="rg-ai-input">
                      Nhập câu hỏi
                    </label>
                    <textarea
                      id="rg-ai-input"
                      rows={1}
                      placeholder="Hỏi AI: Ví dụ “Tìm giúp tôi giày chạy êm chân dưới 1 triệu”…"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      className="w-full resize-y min-h-[44px] max-h-[160px] rounded-xl border border-gray-300 px-4 py-3 text-[15px] shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <div className="mt-1 text-[11px] text-gray-500">
                      Enter = gửi • Shift+Enter = xuống dòng • Ctrl/⌘+Enter =
                      gửi
                    </div>
                  </div>
                  <button
                    onClick={() => onSend()}
                    disabled={!canSend}
                    className="shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white
                               bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow"
                  >
                    <SendIcon className="h-5 w-5" />
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
