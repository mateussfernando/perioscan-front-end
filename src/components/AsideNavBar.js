"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../styles/aside-navbar.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BotaoAsideNav from "../components/ui/BotaoAsideNav/BotaoAsideNav";

// Componente BotaoAsideNav reutilizável

export default function AsideNavBar() {
  // Hooks and state
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState({ nome: "", perfil: "" });
  const [isOpen, setIsOpen] = useState(true);

  // Effects
  useEffect(function loadUserFromStorage() {
    setUser({
      nome: localStorage.getItem("name") || "",
      perfil: localStorage.getItem("role") || "",
    });
  }, []);

  // Helper functions
  function formatProfile(perfil) {
    const profiles = {
      admin: "Administrador",
      assistente: "Assistente",
      perito: "Perito",
    };
    return profiles[perfil.toLowerCase()] || "Perfil Desconhecido";
  }

  function logout() {
    localStorage.clear();
    router.push("/");
  }

  // Toggle sidebar
  function toggleSidebar() {
    setIsOpen(!isOpen);
  }

  return (
    <div className="sidebar-container">
      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-content">
          {/* Logo section */}
          <div className="logo">
            <Image
              src="/images/logos/logo-perio-scan.png"
              alt="Logo PerioScan"
              width={30}
              height={30}
            />
            {isOpen && <span>PerioScan</span>}
          </div>

          {/* Profile section */}
          {user.nome && (
            <div className="profile">
              {isOpen && (
                <div className="user-info">
                  <div className="first-name">{user.nome.split(" ")[0]}</div>
                  <div className="last-name">
                    {user.nome.split(" ").slice(1).join(" ")}
                  </div>
                  <div className="profile-role">
                    ({formatProfile(user.perfil)})
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation section */}
          <nav>
            <ul>
              {user.perfil.toLowerCase() === "admin" && (
                <>
                  <BotaoAsideNav
                    logo="/images/icons/icone-dashboard.png"
                    src="/admindashboard"
                    alt="Icone de redirecionamento para a página de Dashboard"
                    label="Dashboard"
                    isOpen={isOpen}
                    active={pathname === "/adminDashboard"}
                  />
                  <BotaoAsideNav
                    logo="/images/icons/icone-adicionar.png"
                    src="/admincadastramento"
                    alt="Icone de redirecionamento para a página de Adicionar usuarios"
                    label="Adicionar"
                    isOpen={isOpen}
                    active={pathname === "/admincadastramento"}
                  />
                  <BotaoAsideNav
                    logo="/images/icons/icone-casos.png"
                    src="/casos"
                    alt="Icone de redirecionamento para a página de Casos"
                    label="Casos"
                    isOpen={isOpen}
                    active={pathname === "/casos"}
                  />
                  <BotaoAsideNav
                    logo="/images/icons/icone-relatorios.png"
                    src="/relatorios"
                    alt="Icone de redirecionamento para a página de Relatórios"
                    label="Relatórios"
                    isOpen={isOpen}
                    active={pathname === "/relatorios"}
                  />
                  <BotaoAsideNav
                    logo="/images/icons/icone-gerenciamento.png"
                    src="/gerenciamento"
                    alt="Icone de redirecionamento para a página de Gerenciamento de usuarios"
                    label="Gerenciamento"
                    isOpen={isOpen}
                    active={pathname === "/gerenciamento"}
                  />
                </>
              )}

              {(user.perfil.toLowerCase() === "assistente" ||
                user.perfil.toLowerCase() === "perito") && (
                <>
                  <BotaoAsideNav
                    logo="/images/icons/icone-dashboard.png"
                    src="/dashboard"
                    alt="Icone de redirecionamento para a página de Dashboard"
                    label="Dashboard"
                    isOpen={isOpen}
                    active={pathname === "/dashboard"}
                  />
                  <BotaoAsideNav
                    logo="/images/icons/icone-casos.png"
                    src="/casos"
                    alt="Icone de redirecionamento para a página de Casos"
                    label="Casos"
                    isOpen={isOpen}
                    active={pathname === "/casos"}
                  />
                  <BotaoAsideNav
                    logo="/images/icons/icone-relatorios.png"
                    src="/relatorios"
                    alt="Icone de redirecionamento para a página de Relatórios"
                    label="Relatórios"
                    isOpen={isOpen}
                    active={pathname === "/relatorios"}
                  />
                </>
              )}
            </ul>
          </nav>
        </div>

        {/* Logout section */}
        <div className="logout">
          <button
            onClick={logout}
            className="nav-link"
            title={!isOpen ? "Sair" : ""}
          >
            <Image
              src="/images/icons/icone-logout.png"
              alt="Ícone de logout"
              width={32}
              height={32}
            />
            {isOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Botão de toggle fora da sidebar */}
      <button
        onClick={toggleSidebar}
        aria-label="Alternar menu"
        className="toggle-button-outside"
      >
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </div>
  );
}
