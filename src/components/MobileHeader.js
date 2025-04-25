import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import "../styles/mobile-header.css";

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState({ nome: "", perfil: "" });
  const router = useRouter();

  useEffect(() => {
    const nome = localStorage.getItem("name") || "";
    const perfil = localStorage.getItem("role") || "";
    setUsuario({ nome: nome, perfil: perfil });
  }, []);

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

  function fazerLogout() {
    localStorage.clear();
    router.push("/");
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navItems = [
    {
      path: "/",
      name: "Sair",
      onClick: fazerLogout,
      icon: (
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
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      ),
    },
  ];

  return (
    <header className="header">
      <div className="headerContainer">
        {/* Área do usuário (esquerda) */}
        <div className="userInfoMobile">
          {usuario.nome && (
            <>
              <div className="userNameMobile">{usuario.nome.split(" ")[0]}</div>
              <div className="userRoleMobile">
                ({formatarPerfil(usuario.perfil)})
              </div>
            </>
          )}
        </div>

        {/* Menu hamburguer (direita) */}
        <button
          onClick={toggleMenu}
          type="button"
          className="menuButton"
          aria-controls="navbar-default"
          aria-expanded={isMenuOpen}
        >
          <span className="srOnly">Open main menu</span>
          <svg
            className="menuIcon"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        {/* Menu dropdown */}
        <div
          className={`navbar ${isMenuOpen ? "show" : ""}`}
          id="navbar-default"
        >
          <ul className="navList">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`navLink ${
                    router.pathname === item.path ? "activeLink" : ""
                  }`}
                  onClick={item.onClick || closeMenu}
                >
                  {item.icon}
                  <span className="logoutText">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
