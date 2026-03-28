"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import { clearSWRCache, revalidateAllSWR } from "@/lib/swr";
import type { User } from "@supabase/supabase-js";
import type { Employee } from "@/types/database";

interface AuthUser {
  user: User;
  employee: Pick<Employee, "id" | "org_id" | "first_name" | "last_name" | "email" | "role" | "is_active"> | null;
}

interface AuthContextValue {
  authUser: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: employee } = await supabase
          .from("employees")
          .select("id, org_id, first_name, last_name, email, role, is_active")
          .eq("id", user.id)
          .single();
        setAuthUser({ user, employee });
      }
      setLoading(false);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const { data: employee } = await supabase
            .from("employees")
            .select("id, org_id, first_name, last_name, email, role, is_active")
            .eq("id", session.user.id)
            .single();
          setAuthUser({ user: session.user, employee });
          clearSWRCache();
          revalidateAllSWR();
        } else if (event === "SIGNED_OUT") {
          setAuthUser(null);
          clearSWRCache();
          revalidateAllSWR();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAuthUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ authUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
