"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { register } from "@/fetch/authRequests";
import { useAuth } from "@/context/AuthContext";

export function RegisterPage() {
  const { setSession } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await register({ name, email, password });
      setSession(session);
      window.location.assign("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">JUNTE-SE AO GAMEHUB</span>
        <h1>Criar conta</h1>
        <p>O cadastro cria uma conta de aluno. Acesso administrativo é reservado.</p>
        <label>Nome<input autoComplete="name" required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label>E-mail<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Senha<input type="password" autoComplete="new-password" required minLength={6} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button--full" disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
        <p className="auth-switch">Já tem uma conta? <Link href="/login">Entrar</Link></p>
      </form>
    </section>
  );
}

export default RegisterPage;