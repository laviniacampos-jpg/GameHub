"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function AppHeader() {
  const { user, isReady, logout } = useAuth();

  function handleLogout() {
    logout();
    window.location.assign("/login");
  }

  return (
    <header className="app-header">
      <Link href="/" className="brand">GameHub</Link>
      <nav>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/products">Produtos</Link>
        {isReady && user ? (
          <>
            <span className="user-greeting">Olá, {user.name}</span>
            <button className="nav-button" onClick={handleLogout}>Sair</button>
          </>
        ) : (
          <>
            <Link href="/login">Entrar</Link>
            <Link href="/register">Criar conta</Link>
          </>
        )}
      </nav>
    </header>
  );
}
