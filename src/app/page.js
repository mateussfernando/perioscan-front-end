"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "../styles/auth-login.css"

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://perioscan-back-end.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenciais inválidas");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        router.push("/dashboard");
      } else if (data.user.role === "assistente") {
        router.push("/casos");
      } else {
        router.push("/casos");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authlogin-page">
      <div className="authlogin-caixa">
        <h1 className="authlogin-titulo authlogin-text">Login</h1>

        <div className="authlogin-logo-page">
          <Image
            src="/images/logos/logo-perio-scan.png"
            alt="logo PerioScan"
            width={100}
            height={90}
            className="authlogin-imagem-logo"
          />
          <h2 className="authlogin-texto-logo">PerioScan</h2>
        </div>

        {error && <div className="authlogin-mensagem-erro">{error}</div>}

        <form onSubmit={handleLogin} className="authlogin-formulario">
          <div className="authlogin-grupo-formulario">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="authlogin-entrada-formulario"
              placeholder="email"
            />
          </div>

          <div className="authlogin-grupo-formulario">
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="authlogin-entrada-formulario"
              placeholder="senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="authlogin-botao-enviar"
          >
            {loading ? "Autenticando..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
