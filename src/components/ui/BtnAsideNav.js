"use client";

import Image from "next/image";
import Link from "next/link";
import "../../styles/btn-aside-nav.css";

// Define o componente funcional BtnAsideNav que recebe propriedades via desestruturação
function BtnAsideNav({
  logo, // Caminho para a imagem do ícone
  src, // URL de destino do link
  alt, // Texto alternativo para acessibilidade
  label, // Texto do botão
  isOpen, // Booleano que indica se a sidebar está expandida
  active, // Booleano que indica se esta rota está ativa
}) {
  return (
    // Elemento de lista com classe 'active' quando o botão está ativo
    <li className={active ? "active" : ""}>
      {/* Componente Link do Next.js para navegação sem recarregar a página */}
      <Link href={src}>
        {/* Container do link de navegação */}
        <div
          className="nav-link" // Classe base para estilização
          title={!isOpen ? label : ""} // Tooltip aparece apenas quando sidebar está recolhida
        >
          {/* Componente de imagem otimizado */}
          <Image
            src={logo || "/placeholder.svg"} // Usa imagem passada ou fallback
            alt={alt} // Texto alternativo para acessibilidade
            width={32} // Largura fixa
            height={32} // Altura fixa
          />

          {/* Mostra o texto do botão apenas quando a sidebar está expandida */}
          {isOpen && <span>{label}</span>}
        </div>
      </Link>
    </li>
  );
}

// Exporta o componente como padrão
export default BtnAsideNav;
