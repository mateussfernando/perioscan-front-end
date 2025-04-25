"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "../styles/mobile-bottom-nav.css";
function BtnMobileBottomNav({ icon, src, text, active }) {
  return (
    <li className="btn-nav">
      <Link href={src} className={`link-nav ${active ? "ativo" : ""}`}>
        <div className="conteudo-nav">
          <div className={`icone-nav ${active ? "ativo" : ""}`}>
            <Image
              src={icon}
              alt={text}
              width={20}
              height={20}
              className="imagem-icone-nav"
            />
          </div>
          <span className="texto-nav">{text}</span>
        </div>
      </Link>
    </li>
  );
}

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
            {/* <BtnMobileBottomNav
              icon="/images/icons/icone-dashboard.png"
              src="/dashboard"
              text="Dashboard"
              active={caminhoAtual === "/dashboard"}
            /> */}
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
          </>
        )}
      </ul>
    </nav>
  );
}
