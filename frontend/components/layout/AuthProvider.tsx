"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase-client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, session: null, loading: true, signOut: async () => {},
});

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url?.startsWith("https://") && key && key !== "anon-key" && key.length > 40);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      const supabase = await getBrowserSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      const { data } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
      subscription = data.subscription;
    };

    initAuth();

    return () => subscription?.unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    document.cookie = "dineluxe_demo_session=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "dineluxe_demo_role=; path=/; max-age=0; SameSite=Lax";

    if (isSupabaseConfigured()) {
      const supabase = await getBrowserSupabase();
      await supabase.auth.signOut();
    }

    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
