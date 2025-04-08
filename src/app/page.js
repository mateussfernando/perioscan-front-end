"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "../styles/auth-login.css";

export default function Home() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const response = await fetch(
        "https://perioscan-back-end-fhhq.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new erro(data.message || "Credenciais inválidas");
      }

      // Armazena os dados CORRETAMENTE (acessando data.user)
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id); // Adicionado ID
      localStorage.setItem("name", data.user.name);
      localStorage.setItem("role", data.user.role);

      // Redireciona baseado no role
      if (data.user.role === "admin") {
        router.push("/admincadastramento");
      } else {
        router.push("/casos"); // Para "assistente" ou "perito"
      }
    } catch (err) {
      seterro(err instanceof erro ? err.message : "Erro no servidor");
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

        {erro && <div className="authlogin-mensagem-erro">{erro}</div>}

        <form onSubmit={handleLogin} className="authlogin-formulario">
          <div className="authlogin-grupo-formulario">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="authlogin-entrada-formulario"
              placeholder="Email"
            />
          </div>

          <div className="authlogin-grupo-formulario">
            <input
              id="senha"
              type="senha"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="authlogin-entrada-formulario"
              placeholder="Senha"
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
