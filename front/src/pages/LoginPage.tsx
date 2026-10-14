"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { login } from "@/fetch/authRequests";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const { setSession } = useAuth();
  const [email, setEmail] = useState("aluno@gamehub.local");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login({ email, password });
      setSession(result);
      window.location.assign("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">BEM-VINDO DE VOLTA</span>
        <h1>Entrar no GameHub</h1>
        <p>Use a conta de demonstração para acessar o sistema.</p>
        <label>E-mail<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Senha<input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button--full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <p className="auth-switch">Ainda não tem uma conta? <Link href="/register">Cadastre-se</Link></p>
      </form>
    </section>
  );
}

export default LoginPage;
