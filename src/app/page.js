"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../styles/login.css";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar senha
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      setLoading(true);
      if (role === "admin") {
        router.push("/admindashboard");
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
        data.user.role === "admin" ? "/admindashboard" : "/casos"
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
        <div className="authlogin-logo-page">
          <Image
            src="/images/logos/logo-perio-scan.png"
            alt="logo PerioScan"
            width={80}
            height={70}
            className="authlogin-imagem-logo"
          />
          <h2 className="authlogin-texto-logo">PerioScan</h2>
          <h1 className="authlogin-titulo authlogin-text">Login</h1>
        </div>

        {erro && <div className="authlogin-mensagem-erro">{erro}</div>}

        <form onSubmit={handleLogin} className="authlogin-formulario">
          <div className="authlogin-grupo-formulario">
            <label>Email:</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="authlogin-entrada-formulario"
              placeholder="Digite o email"
            />
          </div>

          <div className="authlogin-grupo-formulario authlogin-password-container">
            <label>Senha:</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="authlogin-entrada-formulario"
              placeholder="Digite sua senha"
            />
            <button
              type="button"
              className="authlogin-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
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
