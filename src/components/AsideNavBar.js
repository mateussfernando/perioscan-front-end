"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import "../styles/aside-navbar.css";

export default function AsideNavBar() {
  const caminhoAtual = usePathname()
  const navegador = useRouter()
  const [dadosUsuario, setDadosUsuario] = useState({
    nome: "",
    perfil: "",
  })

  const itensAdmin = [
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
  ];

  const itensAssistente = [
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
  ];

  const itensPerito = [
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
  ];

  useEffect(() => {
    const nome = localStorage.getItem("name") || ""
    const perfil = localStorage.getItem("role") || ""
    setDadosUsuario({ nome, perfil })
  }, [])

  function fazerLogout() {
    localStorage.clear()
    navegador.push("/")
  }

  function obterItensNavegacao() {
    const perfil = dadosUsuario.perfil.toLowerCase()

    if (perfil === "admin") return itensAdmin;
    if (perfil === "assistente") return itensAssistente;
    if (perfil === "perito") return itensPerito;

    return []
  }

  function formatarPerfil(perfil) {
    const perfilLower = perfil.toLowerCase();
    if (perfilLower === "admin") return "Administrador";
    if (perfilLower === "assistente") return "Assistente";
    if (perfilLower === "perito") return "Perito";
    return "Perfil Desconhecido";
  }

  return (
    <aside className="barra-navegacao">
      <div className="conteudo-barra">
        <div className="logo-barra">
          <Image src="/images/logos/logo-perio-scan.png" alt="Logo PerioScan" width={40} height={40} />
          <span>PerioScan</span>
        </div>

        {dadosUsuario.nome && (
          <div className="perfil-usuario">
            <UserCircle size={48} />
            <span className="info-usuario">
              {dadosUsuario.nome.split(" ")[0]}
              <br />
              {dadosUsuario.nome.split(" ").slice(1).join(" ")}
              <br />({formatarPerfil(dadosUsuario.perfil)})
            </span>
          </div>
        )}

        <nav className="navegacao">
          <ul>
            {obterItensNavegacao().map((item) => (
              <li
                key={item.caminho}
                className={caminhoAtual === item.caminho ? "ativo" : ""}
              >
                <Link href={item.caminho}>
                  <div className="link-conteudo">
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

      <div className="area-logout">
        <button onClick={fazerLogout} className="link-conteudo">
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
  )
}
