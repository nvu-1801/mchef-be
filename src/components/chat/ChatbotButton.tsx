"use client";

import { useState } from "react";

function SparkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 2l1.9 5.7H20l-4.6 3.4L17.4 17 12 13.9 6.6 17l2-5.9L4 7.7h6.1L12 2z" fill="currentColor"/>
    </svg>
  );
}

export default function ChatbotButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      aria-label="Open Chatbot"
      onClick={onOpen}
      className="fixed bottom-5 right-5 z-[110] group flex items-center gap-3 rounded-full px-4 py-3 shadow-xl
                 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500
                 ring-1 ring-white/10 transition"
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
        <SparkIcon className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-indigo-600" />
      </span>
      <span className="hidden sm:block font-semibold">Chatbot</span>
    </button>
  );
}
