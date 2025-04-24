"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BtnMobileBottomNav from "./ui/BtnMobileBottomNav";
import "../styles/mobile-bottom-nav.css";

export default function MobileBottomNav() {
  const caminhoAtual = usePathname();
  const [usuario, setUsuario] = useState({ cargo: "" });

  useEffect(() => {
    const cargo = localStorage.getItem("role") || "";
    setUsuario({ cargo: cargo });
  }, []);

  return (
    <nav className="mobile-bottom-nav">
      <ul className="nav-list">
        {usuario.cargo.toLowerCase() === "admin" ? (
          <>
            <BtnMobileBottomNav
              icon="/images/icons/icone-dashboard.png"
              src="/admindashboard"
              text="Dashboard"
              active={caminhoAtual === "/admindashboard"}
            />
            <BtnMobileBottomNav
              icon="/images/icons/icone-casos.png"
              src="/casos"
              text="Casos"
              active={caminhoAtual === "/casos"}
            />
            <BtnMobileBottomNav
              icon="/images/icons/icone-relatorios.png"
              src="/relatorios"
              text="Relatórios"
              active={caminhoAtual === "/relatorios"}
            />
            <BtnMobileBottomNav
              icon="/images/icons/icone-gerenciamento.png"
              src="/gerenciamento"
              text="Gerenciamento"
              active={caminhoAtual === "/gerenciamento"}
            />
          </>
        ) : (
          <>
            <BtnMobileBottomNav
              icon="/icons/dashboard-icon.svg"
              src="/dashboard"
              text="Dashboard"
              active={caminhoAtual === "/dashboard"}
            />
            <BtnMobileBottomNav
              icon="/icons/add-icon.svg"
              src="/casos"
              text="Casos"
              active={caminhoAtual === "/casos"}
            />
            <BtnMobileBottomNav
              icon="/icons/reports-icon.svg"
              src="/relatorios"
              text="Relatórios"
              active={caminhoAtual === "/relatorios"}
            />
          </>
        )}
      </ul>
    </nav>
  );
}
