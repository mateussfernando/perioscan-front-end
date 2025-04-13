"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import "../styles/aside-navbar.css"

export default function AsideNavBar() {
  const caminhoAtual = usePathname();
  const navegador = useRouter();
  const [dadosUsuario, setDadosUsuario] = useState({
    nome: "",
    perfil: "",
  });

  // Itens de navegação para cada tipo de usuário
  const itensAdmin = [
    { rotulo: "Dashboard", caminho: "/adminDashboard" },
    { rotulo: "Adicionar", caminho: "/admincadastramento" },
    { rotulo: "Casos", caminho: "/casos" },
    { rotulo: "Relatórios", caminho: "/relatorios" },
    { rotulo: "Gerenciamento", caminho: "/gerenciamento" },
    


  ];

  const itensAssistente = [
    { rotulo: "Dashboard", caminho: "/dashboard" },
    { rotulo: "Casos", caminho: "/casos" },
    { rotulo: "Relatórios", caminho: "/relatorios" },
  ];

  const itensPerito = [
    { rotulo: "Casos", caminho: "/casos" },
    { rotulo: "Meus Laudos", caminho: "/laudos" },
  ];

  // Carrega os dados do usuário ao montar o componente
  useEffect(() => {
    const nome = localStorage.getItem("name") || "";
    const perfil = localStorage.getItem("role") || "";
    setDadosUsuario({ nome, perfil });
  }, []);

  function fazerLogout() {
    localStorage.clear();
    navegador.push("/");
  }

  // Retorna os itens de navegação conforme o perfil do usuário
  function obterItensNavegacao() {
    const perfil = dadosUsuario.perfil.toLowerCase();

    if (perfil === "admin") {
      return itensAdmin;
    }

    if (perfil === "assistente") {
      return itensAssistente;
    }

    if (perfil === "perito") {
      return itensPerito;
    }

    return [];
  }

  // Formata o perfil para exibição
  function formatarPerfil(perfil) {
    const perfilLower = perfil.toLowerCase();

    if (perfilLower === "admin") {
      return "Administrador";
    }

    if (perfilLower === "assistente") {
      return "Assistente";
    }

    if (perfilLower === "perito") {
      return "Perito";
    }

    return "Houve um erro ao formar o perfil para exibição";
  }

  return (
    <aside className="barra-navegacao">
      <div className="conteudo-barra">
        {/* Logo */}
        <div className="logo-barra">
          <Image
            src="/images/logos/logo-perio-scan.png"
            alt="Logo PerioScan"
            width={40}
            height={40}
          />
          <span>PerioScan</span>
        </div>

        {/* Perfil do usuário */}
        {dadosUsuario.nome && (
          <div className="perfil-usuario">
            <UserCircle size={48} />
            <span className="info-usuario">
              {dadosUsuario.nome.split(" ")[0]} {/* Primeiro nome */}
              <br />
              {dadosUsuario.nome.split(" ").slice(1).join(" ")}{" "}
              {/* Sobrenomes */}
              <br />({formatarPerfil(dadosUsuario.perfil)})
            </span>
          </div>
        )}

        {/* Menu de navegação */}
        <nav className="navegacao">
          <ul>
            {obterItensNavegacao().map(function (item) {
              return (
                <li
                  key={item.caminho}
                  className={caminhoAtual === item.caminho ? "ativo" : ""}
                >
                  <Link href={item.caminho}>{item.rotulo}</Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Botão de logout */}
      <div className="area-logout">
        <button onClick={fazerLogout}>
          Sair
        </button>
      </div>
    </aside>
  );
}
