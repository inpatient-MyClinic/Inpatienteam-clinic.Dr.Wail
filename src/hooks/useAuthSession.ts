import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UseAuthSessionOptions = {
  /** Fallback to stop showing a blocking loader even if session init fails/hangs. */
  timeoutMs?: number;
};

export function useAuthSession(options: UseAuthSessionOptions = {}) {
  const { timeoutMs = 1500 } = options;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Ensure we never get stuck on an infinite loading screen.
    const timeout = window.setTimeout(() => {
      if (!mounted) return;
      setLoading(false);
    }, timeoutMs);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setLoading(false);
      setError(null);
      window.clearTimeout(timeout);
    });

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session);
        setLoading(false);
        setError(null);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "Auth initialization failed");
        setLoading(false);
      } finally {
        window.clearTimeout(timeout);
      }
    })();

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [timeoutMs]);

  return { session, loading, error };
}
