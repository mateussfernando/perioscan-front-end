"use client";

import Image from "next/image";
import Link from "next/link";
import "../../styles/btn-mobile-bottom-nav.css";

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

export default BtnMobileBottomNav;
