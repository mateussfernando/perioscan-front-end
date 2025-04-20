"use client";
import Image from "next/image";
import { useState, useEffect } from "react"; // Adicionado useEffect
import { useRouter } from "next/navigation";
import "../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Efeito para verificar o token ao carregar o componente
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      // Verificar se o token está expirado (opcional)
      // Aqui você pode adicionar lógica para validar o token
      // Por enquanto, vamos assumir que o token existe e é válido

      setLoading(true);
      if (role === "admin") {
        router.push("/admincadastramento");
      } else {
        router.push("/casos");
      }
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenciais inválidas");
      }

      if (!data.token || !data.user) {
        throw new Error("Dados de autenticação incompletos");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("name", data.user.name);
      localStorage.setItem("role", data.user.role);

      router.push(
        data.user.role === "admin" ? "/admincadastramento" : "/casos"
      );
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
              id="password"
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
