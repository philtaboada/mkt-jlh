"use client";

import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect } from "react";

interface AuthContextType {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }

      if (event === "SIGNED_OUT") {
        queryClient.setQueryData(["user"], null);
      }

      if (event === "TOKEN_REFRESHED") {
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }

      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, queryClient, router]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  }
  return context;
}
