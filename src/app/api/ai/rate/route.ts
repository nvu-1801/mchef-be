// app/api/ai/rate/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messageId, rating, text, userId } = await req.json();
    if (!messageId || !rating || !text) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }
    if (rating !== "up" && rating !== "down") {
      return new Response(JSON.stringify({ error: "Invalid rating" }), {
        status: 400,
      });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error("/api/ai/rate missing SUPABASE env");
      return new Response(
        JSON.stringify({ error: "Server misconfiguration" }),
        {
          status: 500,
        }
      );
    }

    const supabaseAdmin = createClient(url, key);

    const { error } = await supabaseAdmin.from("ai_message_ratings").insert({
      message_local_id: messageId,
      rating,
      text,
      user_id: userId ?? null,
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
    console.error("/api/ai/rate POST error:", msg);
    return new Response(JSON.stringify({ error: msg || "rate error" }), {
      status: 500,
    });
  }
}
