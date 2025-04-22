"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../styles/aside-navbar.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AsideNavBar() {
  // Hooks and state
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState({ nome: "", perfil: "" });
  const [isOpen, setIsOpen] = useState(true);

  // Navigation items by profile type
  const navItems = {
    admin: [
      {
        icone: "/images/icons/icone-dashboard.png",
        rotulo: "Dashboard",
        caminho: "/adminDashboard",
        textoAlternativo:
          "Icone de redirecionamento para a página de Dashboard",
      },
      {
        icone: "/images/icons/icone-adicionar.png",
        rotulo: "Adicionar",
        caminho: "/admincadastramento",
        textoAlternativo:
          "Icone de redirecionamento para a página de Adicionar usuarios",
      },
      {
        icone: "/images/icons/icone-casos.png",
        rotulo: "Casos",
        caminho: "/casos",
        textoAlternativo: "Icone de redirecionamento para a página de Casos",
      },
      {
        icone: "/images/icons/icone-relatorios.png",
        rotulo: "Relatórios",
        caminho: "/relatorios",
        textoAlternativo:
          "Icone de redirecionamento para a página de Relatórios",
      },
      {
        icone: "/images/icons/icone-gerenciamento.png",
        rotulo: "Gerenciamento",
        caminho: "/gerenciamento",
        textoAlternativo:
          "Icone de redirecionamento para a página de Gerenciamento de usuarios",
      },
    ],
    assistente: [
      {
        icone: "/images/icons/icone-dashboard.png",
        rotulo: "Dashboard",
        caminho: "/dashboard",
        textoAlternativo:
          "Icone de redirecionamento para a página de Dashboard",
      },
      {
        icone: "/images/icons/icone-casos.png",
        rotulo: "Casos",
        caminho: "/casos",
        textoAlternativo: "Icone de redirecionamento para a página de Casos",
      },
      {
        icone: "/images/icons/icone-relatorios.png",
        rotulo: "Relatórios",
        caminho: "/relatorios",
        textoAlternativo:
          "Icone de redirecionamento para a página de Relatórios",
      },
    ],
    perito: [
      {
        icone: "/images/icons/icone-dashboard.png",
        rotulo: "Dashboard",
        caminho: "/dashboard",
        textoAlternativo:
          "Icone de redirecionamento para a página de Dashboard",
      },
      {
        icone: "/images/icons/icone-casos.png",
        rotulo: "Casos",
        caminho: "/casos",
        textoAlternativo: "Icone de redirecionamento para a página de Casos",
      },
      {
        icone: "/images/icons/icone-relatorios.png",
        rotulo: "Relatórios",
        caminho: "/relatorios",
        textoAlternativo:
          "Icone de redirecionamento para a página de Relatórios",
      },
    ],
  };

  // Effects
  useEffect(function loadUserFromStorage() {
    setUser({
      nome: localStorage.getItem("name") || "",
      perfil: localStorage.getItem("role") || "",
    });
  }, []);

  // Helper functions
  function formatProfile(perfil) {
    return (
      {
        admin: "Administrador",
        assistente: "Assistente",
        perito: "Perito",
      }[perfil.toLowerCase()] || "Perfil Desconhecido"
    );
  }

  function logout() {
    localStorage.clear();
    router.push("/");
  }

  // Toggle sidebar
  function toggleSidebar() {
    setIsOpen(!isOpen);
  }

  // Derived values
  const navItemsToShow = navItems[user.perfil.toLowerCase()] || [];

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
              {navItemsToShow.map((item) => (
                <li
                  key={item.caminho}
                  className={pathname === item.caminho ? "active" : ""}
                >
                  <Link href={item.caminho}>
                    <div
                      className="nav-link"
                      title={!isOpen ? item.rotulo : ""}
                    >
                      <Image
                        src={item.icone || "/placeholder.svg"}
                        alt={item.textoAlternativo}
                        width={32}
                        height={32}
                      />
                      {isOpen && <span>{item.rotulo}</span>}
                    </div>
                  </Link>
                </li>
              ))}
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
