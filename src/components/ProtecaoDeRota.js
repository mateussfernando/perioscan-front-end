// components/AuthGuard.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

export default function ProtecaoDeRota({ children, permissaoNecessaria }) {
  const navegador = useRouter();
  const [statusAutenticacao, setStatusAutenticacao] = useState("verificando"); 

  useEffect(() => {
    const verificarAutenticacao = () => {
      const token = localStorage.getItem("token");
      const dadosUsuario = localStorage.getItem("usuario");

      // Se não estiver autenticado
      if (!token || !dadosUsuario) {
        navegador.push("/");
        return;
      }

      try {
        const usuario = JSON.parse(dadosUsuario);

        // Verifica se o token expirou (baseado no tempo local)
        if (usuario.exp && usuario.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          navegador.push("/");
          return;
        }

        // Verifica se tem a permissão necessária
        if (permissaoNecessaria && usuario.role !== permissaoNecessaria) {
          setStatusAutenticacao("naoAutorizado");
          return;
        }

        // Tudo certo
        setStatusAutenticacao("autorizado");
      } catch (erro) {
        console.error("Erro ao verificar autenticação:", erro);
        navegador.push("/");
      }
    };

    verificarAutenticacao();
  }, [navegador, permissaoNecessaria]);

  // Tela de carregamento enquanto verifica
  if (statusAutenticacao === "verificando") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  // Se não tiver permissão
  if (statusAutenticacao === "naoAutorizado") {
    navegador.push("/nao-autorizado");
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  // Renderiza o conteúdo protegido
  return children;
}
