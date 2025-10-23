// app/api/ai/log/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, role, text, meta, userId } = body ?? {};

    if (!role || !text) {
      return new Response(JSON.stringify({ error: "Missing role/text" }), {
        status: 400,
      });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error("Missing SUPABASE env for ai/log");
      return new Response(
        JSON.stringify({ error: "Server misconfiguration" }),
        {
          status: 500,
        }
      );
    }

    const supabaseAdmin = createClient(url, key);

    const { error } = await supabaseAdmin.from("ai_chat_logs").insert({
      user_id: userId ?? null,
      session_id: sessionId ?? null,
      role,
      text,
      meta: meta ?? null,
    });

    if (error) throw error;
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const msg =
      typeof e === "object" && e !== null && "message" in e
        ? String((e as { message?: unknown }).message ?? String(e))
        : String(e);
    console.error("/api/ai/log POST error:", msg);
    return new Response(JSON.stringify({ error: msg || "log error" }), {
      status: 500,
    });
  }
}
