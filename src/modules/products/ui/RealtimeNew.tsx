"use client";
import { useEffect } from "react";
import { supabaseBrowser } from "../../../libs/db/supabase/supabase-client";

export function RealtimeNew({ onChange }: { onChange: () => void }) {
  useEffect(() => {
    const sb = supabaseBrowser();
    const channel = sb.channel("products-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => onChange())
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [onChange]);
  return null;
}
