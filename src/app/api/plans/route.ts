// app/api/plans/route.ts
/**
 * GET /api/plans
 * Lấy danh sách plans có sẵn
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/libs/supabase/supabase-server";
import { getActivePlans } from "@/libs/server/payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sb = await supabaseServer();
    const plans = await getActivePlans(sb);

    if (!plans || plans.length === 0) {
      return NextResponse.json({ plans: [] });
    }

    return NextResponse.json({ plans });
  } catch (err: unknown) {
    console.error("[plans] error:", err);
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
