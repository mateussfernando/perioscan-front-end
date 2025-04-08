"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "../styles/auth-login.css";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Alterado de senha para password
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validação básica no cliente
    if (!email || !password) {
      setErro("Por favor, preencha todos os campos");
      return;
    }
    
    setLoading(true);
    setErro("");

    try {
      const response = await fetch(
        "https://perioscan-back-end-fhhq.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            email: email.trim(),
            password: password // Usando o nome correto que o backend espera
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenciais inválidas");
      }

      // Verifica se os dados necessários estão presentes na resposta
      if (!data.token || !data.user) {
        throw new Error("Dados de autenticação incompletos");
      }

      // Armazenamento seguro (considerar usar context/state management no futuro)
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("name", data.user.name);
      localStorage.setItem("role", data.user.role);

      // Redirecionamento baseado no role
      router.push(data.user.role === "admin" 
        ? "/admincadastramento" 
        : "/casos");
      
    } catch (err) {
      console.error("Erro no login:", err);
      setErro(
        err.message.includes("Failed to fetch") 
          ? "Não foi possível conectar ao servidor" 
          : err.message
      );
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
              id="password" // Alterado para manter consistência
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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