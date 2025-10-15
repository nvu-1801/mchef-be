"use client";
import React from "react";
import { useState } from "react";
import ChatbotButton from "@/components/chat/ChatbotButton";
import ChatCenterModal from "@/components/chat/ChatCenterModal";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

  return (<>{children}
  
    <ChatbotButton onOpen={() => setOpen(true)} />
      <ChatCenterModal open={open} onClose={() => setOpen(false)} />
 </>);
}
