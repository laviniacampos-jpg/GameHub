"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

export function AuthGate({ children }: { children: ReactNode }) {
  const { token, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !token) {
      const next = encodeURIComponent(window.location.pathname);
      window.location.replace(`/login?next=${next}`);
    }
  }, [isReady, token]);

  if (!isReady || !token) {
    return <p className="state-message">Verificando sua sessão...</p>;
  }

  return children;
}