import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { SALES_SYSTEM_PROMPT, renderPrompt } from "../prompts/sales-system";

export const runtime = "nodejs";

const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL || "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
];

// helper to safely extract message from unknown errors
function getMessage(err: unknown) {
  if (typeof err === "object" && err !== null && "message" in err) {
    try {
      return String((err as { message?: unknown }).message ?? String(err));
    } catch {
      return String(err);
    }
  }
  return String(err);
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, history, sessionId, userId } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response("Missing 'prompt'", { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return new Response("Server missing Supabase config", { status: 500 });
    }

    const supabaseAdmin = createClient(url, key);

    // persist user message (best-effort)
    try {
      await supabaseAdmin.from("ai_chat_logs").insert({
        session_id: sessionId ?? null,
        role: "user",
        text: prompt,
        user_id: userId ?? null,
        meta: { source: "chat_api" },
      });
    } catch (e: unknown) {
      // don't fail the request if logging fails
      console.error("ai_chat_logs insert user error:", getMessage(e));
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
      return new Response("Server missing GEMINI_API_KEY", { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);

    const histContents = Array.isArray(history)
      ? history
          .filter((m: unknown) => {
            if (typeof m !== "object" || m === null) return false;
            const mm = m as { text?: unknown; role?: unknown };
            return (
              typeof mm.text === "string" &&
              (mm.role === "user" || mm.role === "assistant")
            );
          })
          .map((m: unknown) => {
            const mm = m as { text: string; role: string };
            return {
              role: mm.role === "user" ? "user" : "model",
              parts: [{ text: mm.text }],
            };
          })
      : [];

    const systemPrompt = renderPrompt(SALES_SYSTEM_PROMPT, {
      STORE_NAME: process.env.STORE_NAME ?? "Run Gear",
    });

    const tryModelsInOrder = async () => {
      let lastErr: unknown = null;
      for (const modelId of MODEL_CANDIDATES) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelId,
            systemInstruction: systemPrompt,
          });
          const result = await model.generateContentStream({
            contents: [
              ...histContents,
              { role: "user", parts: [{ text: prompt }] },
            ],
          });
          return { modelId, stream: result.stream };
        } catch (e: unknown) {
          const msg = getMessage(e);
          if (
            msg.includes("404") ||
            msg.includes("not found") ||
            msg.includes("is not supported")
          ) {
            lastErr = e;
            continue;
          }
          throw e;
        }
      }
      throw lastErr ?? new Error("No available Gemini model");
    };

    const { modelId, stream } = await tryModelsInOrder();

    const encoder = new TextEncoder();
    let assistantText = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const part = (chunk as unknown as { text?: () => string }).text?.();
            if (part) {
              assistantText += part;
              controller.enqueue(encoder.encode(part));
            }
          }
        } catch (err: unknown) {
          const errMsg = `\n[AI error] ${getMessage(err)}`;
          // enqueue error message to client
          controller.enqueue(encoder.encode(errMsg));
          assistantText += errMsg;
        } finally {
          controller.close();
          // persist assistant reply (best-effort)
          try {
            await supabaseAdmin.from("ai_chat_logs").insert({
              session_id: sessionId ?? null,
              role: "assistant",
              text: assistantText,
              user_id: userId ?? null,
              meta: { model: modelId },
            });
          } catch (e: unknown) {
            console.error(
              "ai_chat_logs insert assistant error:",
              getMessage(e)
            );
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Model-Used": modelId,
      },
    });
  } catch (e: unknown) {
    return new Response(getMessage(e), { status: 500 });
  }
}
