// components/ControleDeRota.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

export default function ControleDeRota({ children, requiredRole }) {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState("verificando");

  useEffect(() => {
    const verifyAuth = () => {
      try {
        // Verifica se está no cliente
        if (typeof window === "undefined") {
          setAuthStatus("autorizado");
          return;
        }

        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");

        console.log("Dados de autenticação:", { token, role, userId });

        // Se não estiver autenticado
        if (!token || !role || !userId) {
          console.log("Redirecionando para login - faltando credenciais");
          router.push("/");
          return;
        }

        // Verifica a role se necessário
        if (requiredRole && role !== requiredRole) {
          console.log(`Permissão necessária: ${requiredRole}, possui: ${role}`);
          setAuthStatus("naoAutorizado");
          return;
        }

        // Tudo ok
        setAuthStatus("autorizado");
      } catch (error) {
        console.error("Erro na verificação:", error);
        router.push("/");
      }
    };

    verifyAuth();
  }, [router, requiredRole]);

  if (authStatus === "verificando") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  if (authStatus === "naoAutorizado") {
    setTimeout(() => router.push("/nao-autorizado"), 100);
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  return children;
}
