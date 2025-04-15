"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import "../styles/aside-navbar.css";

export default function AsideNavBar() {
  // Hooks and state
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState({ nome: "", perfil: "" });

  // Navigation items by profile type
  const navItems = {
    admin: [
      {
        icone: "/images/icons/icone-dashboard.png",
        rotulo: "Dashboard",
        caminho: "/admindashboard",
      },
      {
        icone: "/images/icons/icone-adicionar.png",
        rotulo: "Adicionar",
        caminho: "/admincadastramento",
      },
      {
        icone: "/images/icons/icone-casos.png",
        rotulo: "Casos",
        caminho: "/casos",
      },
      {
        icone: "/images/icons/icone-relatorios.png",
        rotulo: "Relatórios",
        caminho: "/relatorios",
      },
      {
        icone: "/images/icons/icone-gerenciamento.png",
        rotulo: "Gerenciamento",
        caminho: "/gerenciamento",
      },
    ],
    assistente: [
      {
        icone: "/images/icons/icone-dashboard.png",
        rotulo: "Dashboard",
        caminho: "/dashboard",
      },
      {
        icone: "/images/icons/icone-casos.png",
        rotulo: "Casos",
        caminho: "/casos",
      },
      {
        icone: "/images/icons/icone-relatorios.png",
        rotulo: "Relatórios",
        caminho: "/relatorios",
      },
    ],
    perito: [
      {
        icone: "/images/icons/icone-dashboard.png",
        rotulo: "Dashboard",
        caminho: "/dashboard",
      },
      {
        icone: "/images/icons/icone-casos.png",
        rotulo: "Casos",
        caminho: "/casos",
      },
      {
        icone: "/images/icons/icone-relatorios.png",
        rotulo: "Relatórios",
        caminho: "/relatorios",
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

  // Derived values
  const navItemsToShow = navItems[user.perfil.toLowerCase()] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* Logo section */}
        <div className="logo">
          <Image
            src="/images/logos/logo-perio-scan.png"
            alt="Logo PerioScan"
            width={40}
            height={40}
          />
          <span>PerioScan</span>
        </div>

        {/* Profile section */}
        {user.nome && (
          <div className="profile">
            {/* <UserCircle size={48} /> */}
            <div className="user-info">
              <div className="first-name">{user.nome.split(" ")[0]}</div>
              <div className="last-name">
                {user.nome.split(" ").slice(1).join(" ")}
              </div>
              <div className="profile-role">({formatProfile(user.perfil)})</div>
            </div>
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
                  <div className="nav-link">
                    <Image
                      src={item.icone}
                      alt={item.rotulo}
                      width={32}
                      height={32}
                    />
                    <span>{item.rotulo}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Logout section */}
      <div className="logout">
        <button onClick={logout} className="nav-link">
          <Image
            src="/images/icons/icone-logout.png"
            alt="Ícone de logout"
            width={32}
            height={32}
          />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
