"use client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../styles/aside-navbar.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BotaoAsideNav from "../components/ui/BotaoAsideNav/BotaoAsideNav";

export default function BarraLateral() {
  const caminhoAtual = usePathname();
  const navegador = useRouter();
  const [usuario, setUsuario] = useState({ nome: "", perfil: "" });
  const [aberto, setAberto] = useState(true);

  // Carrega os dados do usuário ao montar o componente
  useEffect(() => {
    const nome = localStorage.getItem("name") || "";
    const perfil = localStorage.getItem("role") || "";
    setUsuario({ nome: nome, perfil: perfil });
  }, []);

  // Formata o nome do perfil para exibição
  function formatarPerfil(perfil) {
    if (perfil.toLowerCase() === "admin") {
      return "Administrador";
    } else if (perfil.toLowerCase() === "assistente") {
      return "Assistente";
    } else if (perfil.toLowerCase() === "perito") {
      return "Perito";
    }
    return "Perfil Desconhecido";
  }

  // Realiza o logout do sistema
  function fazerLogout() {
    localStorage.clear();
    navegador.push("/");
  }

  // Alterna o estado da barra lateral (aberto/fechado)
  function alternarBarraLateral() {
    setAberto(!aberto);
  }

  return (
    <div className="sidebar-container">
      <aside className={`sidebar ${aberto ? "open" : "closed"}`}>
        <div className="sidebar-content">
          {/* Seção do Logo */}
          <div className="logo">
            <Image
              src="/images/logos/logo-perio-scan.png"
              alt="Logo PerioScan"
              width={30}
              height={30}
            />
            {aberto && <span>PerioScan</span>}
          </div>

          {/* Seção do Perfil */}
          {usuario.nome && (
            <div className="profile">
              {aberto && (
                <div className="user-info">
                  <div className="first-name">{usuario.nome.split(" ")[0]}</div>
                  <div className="last-name">
                    {usuario.nome.split(" ").slice(1).join(" ")}
                  </div>
                  <div className="profile-role">
                    ({formatarPerfil(usuario.perfil)})
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Seção de Navegação */}
          <nav>
            <ul>
              {usuario.perfil.toLowerCase() === "admin" ? (
                // Menu para Administradores
                <>
                  <BotaoAsideNav
                    logo="/images/icons/icone-dashboard.png"
                    src="/admindashboard"
                    alt="Ícone para Dashboard"
                    label="Dashboard"
                    isOpen={aberto}
                    active={caminhoAtual === "/adminDashboard"}
                  />
                  {/* <BotaoAsideNav
                    logo="/images/icons/icone-adicionar.png"
                    src="/admincadastramento"
                    alt="Ícone para Adicionar Usuários"
                    label="Adicionar"
                    isOpen={aberto}
                    active={caminhoAtual === "/admincadastramento"}
                  /> */}
                  <BotaoAsideNav
                    logo="/images/icons/icone-casos.png"
                    src="/casos"
                    alt="Ícone para Casos"
                    label="Casos"
                    isOpen={aberto}
                    active={caminhoAtual === "/casos"}
                  />
                  <BotaoAsideNav
                    logo="/images/icons/icone-relatorios.png"
                    src="/relatorios"
                    alt="Ícone para Relatórios"
                    label="Relatórios"
                    isOpen={aberto}
                    active={caminhoAtual === "/relatorios"}
                  />
                  <BotaoAsideNav
                    logo="/images/icons/icone-gerenciamento.png"
                    src="/gerenciamento"
                    alt="Ícone para Gerenciamento"
                    label="Gerenciamento"
                    isOpen={aberto}
                    active={caminhoAtual === "/gerenciamento"}
                  />
                </>
              ) : (
                // Menu para Assistentes e Peritos
                <>
                  <BotaoAsideNav
                    logo="/images/icons/icone-dashboard.png"
                    src="/dashboard"
                    alt="Ícone para Dashboard"
                    label="Dashboard"
                    isOpen={aberto}
                    active={caminhoAtual === "/dashboard"}
                  />
                  <BotaoAsideNav
                    logo="/images/icons/icone-casos.png"
                    src="/casos"
                    alt="Ícone para Casos"
                    label="Casos"
                    isOpen={aberto}
                    active={caminhoAtual === "/casos"}
                  />
                  <BotaoAsideNav
                    logo="/images/icons/icone-relatorios.png"
                    src="/relatorios"
                    alt="Ícone para Relatórios"
                    label="Relatórios"
                    isOpen={aberto}
                    active={caminhoAtual === "/relatorios"}
                  />
                </>
              )}
            </ul>
          </nav>
        </div>

        {/* Seção de Logout */}
        <div className="logout">
          <button
            onClick={fazerLogout}
            className="nav-link"
            title={!aberto ? "Sair" : ""}
          >
            <Image
              src="/images/icons/icone-logout.png"
              alt="Ícone de Logout"
              width={32}
              height={32}
            />
            {aberto && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Botão para Alternar a Barra Lateral */}
      <button
        onClick={alternarBarraLateral}
        aria-label="Alternar menu"
        className="toggle-button-outside"
      >
        {aberto ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </div>
  );
}
