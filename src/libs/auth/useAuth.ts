// hooks/useAuth.ts
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
    let isMounted = true;

    async function bootstrap() {
      try {
        setLoading(true);
        const { data, error } = await sb.auth.getSession();
        if (error) {
          // optional: console.error(error);
        }
        const u = data.session?.user
          ? { id: data.session.user.id, email: data.session.user.email }
          : null;
        if (isMounted) setUser(u);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    bootstrap();

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      // Không block UI: chỉ cập nhật user; bạn có thể setLoading(true/false) nếu muốn show spinner trong transitions
      const u = session?.user
        ? { id: session.user.id, email: session.user.email }
        : null;
      if (isMounted) setUser(u);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // sb từ supabaseBrowser() đã là singleton → không cần đưa vào deps

  return { user, loading };
}
