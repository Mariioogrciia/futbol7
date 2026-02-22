"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RequireAuthClient() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        console.log('[RequireAuthClient] mounted - checking session');

        // Obtener sesión actual de Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[RequireAuthClient] session error:', error);
          if (mounted) router.replace('/login');
          return;
        }

        if (!session) {
          console.log('[RequireAuthClient] no session - redirecting to login');
          if (mounted) router.replace('/login');
          return;
        }

        console.log('[RequireAuthClient] session valid:', session.user.email);
      } catch (e) {
        console.error('[RequireAuthClient] verify error', e);
        if (mounted) router.replace('/login');
      }
    }

    check();

    // Escuchar cambios en la sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[RequireAuthClient] auth state change:', event, session?.user?.email);

        if (event === 'SIGNED_OUT' || !session) {
          if (mounted) router.replace('/login');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
