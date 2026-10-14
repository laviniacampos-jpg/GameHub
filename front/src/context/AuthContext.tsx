"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { LoginResponseDTO } from "@/dto/AuthDTO";

type AuthUser = LoginResponseDTO["user"];

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isReady: boolean;
  setSession: (session: LoginResponseDTO) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "gamehub-token";
const USER_KEY = "gamehub-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  function setSession(session: LoginResponseDTO) {
    window.localStorage.setItem(TOKEN_KEY, session.token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    setToken(session.token);
    setUser(session.user);
  }

  useEffect(() => {
    try {
      const savedToken = window.localStorage.getItem(TOKEN_KEY);
      const savedUser = window.localStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser) as AuthUser;
        if (
          parsedUser.id &&
          parsedUser.email &&
          parsedUser.name &&
          (parsedUser.role === "admin" || parsedUser.role === "student")
        ) {
          setToken(savedToken);
          setUser(parsedUser);
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch {
      logout();
    }

    const handleUnauthorized = () => logout();
    window.addEventListener("gamehub:unauthorized", handleUnauthorized);
    setIsReady(true);
    return () => window.removeEventListener("gamehub:unauthorized", handleUnauthorized);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isReady, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}