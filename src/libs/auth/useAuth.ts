"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/libs/supabase/supabase-client";

export type AuthUser = {
  id: string;
  email?: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const sb = supabaseBrowser();

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const { data } = await sb.auth.getSession();
      setUser(data.session?.user ? { id: data.session.user.id, email: data.session.user.email } : null);
      setLoading(false);

      const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
      });
      unsub = sub.subscription.unsubscribe;
    })();

    return () => unsub();
  }, []);

  return { user, loading };
}
