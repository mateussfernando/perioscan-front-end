"use client" // Indica que este é um componente do lado do cliente (Next.js)

// Importações de bibliotecas e componentes
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import "../styles/aside-navbar.css"
import { ChevronLeft, ChevronRight } from "lucide-react"
import BotaoAsideNav from "./ui/BtnAsideNav"

export default function AsideNavBar() {
  // Hooks do Next.js para roteamento
  const caminhoAtual = usePathname() // Obtém a rota atual
  const navegador = useRouter() // Objeto para navegação programática

  // Estados do componente
  const [usuario, setUsuario] = useState({ nome: "", perfil: "" }) // Armazena dados do usuário
  const [aberto, setAberto] = useState(true) // Controla se a sidebar está aberta ou fechada

  // Efeito que carrega os dados do usuário ao montar o componente
  useEffect(() => {
    const nome = localStorage.getItem("name") || "" // Obtém nome do localStorage
    const perfil = localStorage.getItem("role") || "" // Obtém perfil do localStorage
    setUsuario({ nome: nome, perfil: perfil }) // Atualiza estado com dados do usuário
  }, []) // Array vazio = executa apenas no mount

  // Função para formatar o texto do perfil para exibição amigável
  function formatarPerfil(perfil) {
    if (perfil.toLowerCase() === "admin") {
      return "Administrador"
    } else if (perfil.toLowerCase() === "assistente") {
      return "Assistente"
    } else if (perfil.toLowerCase() === "perito") {
      return "Perito"
    }
    return "Perfil Desconhecido" // Fallback para perfis não mapeados
  }

  // Função para realizar logout
  function fazerLogout() {
    localStorage.clear() // Limpa todos os dados do localStorage
    navegador.push("/") // Redireciona para a página inicial
  }

  // Função para alternar entre sidebar aberta/fechada
  function alternarAsideNavBar() {
    setAberto(!aberto) // Inverte o estado atual
  }

  return (
    <div className="sidebar-container">
      {/* Container principal da sidebar - classe muda entre 'open' e 'closed' */}
      <aside className={`sidebar ${aberto ? "open" : "closed"}`}>
        <div className="sidebar-content">
          {/* Seção do Logo - mostra texto apenas quando aberto */}
          <div className="logo">
            <Image src="/images/logos/logo-perio-scan.png" alt="Logo PerioScan" width={30} height={30} />
            {aberto && <span>PerioScan</span>} {/* Nome só aparece quando aberto */}
          </div>

          {/* Seção do Perfil - só renderiza se tiver nome de usuário */}
          {usuario.nome && (
            <div className="profile">
              {aberto && ( // Conteúdo só aparece quando sidebar está aberta
                <div className="user-info">
                  <div className="first-name">{usuario.nome.split(" ")[0]}</div> {/* Primeiro nome */}
                  <div className="last-name">
                    {usuario.nome.split(" ").slice(1).join(" ")} {/* Sobrenome(s) */}
                  </div>
                  <div className="profile-role">
                    ({formatarPerfil(usuario.perfil)}) {/* Perfil formatado */}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Seção de Navegação - menus diferentes para admin e outros perfis */}
          <nav>
            <ul>
              {usuario.perfil.toLowerCase() === "admin" ? ( // Verifica se é admin
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
                  {/* <BotaoAsideNav
                    logo="/images/icons/icone-dashboard.png"
                    src="/dashboard"
                    alt="Ícone para Dashboard"
                    label="Dashboard"
                    isOpen={aberto}
                    active={caminhoAtual === "/dashboard"}
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
            title={!aberto ? "Sair" : ""} // Tooltip quando fechado
          >
            <Image src="/images/icons/icone-logout.png" alt="Ícone de Logout" width={32} height={32} />
            {aberto && <span>Sair</span>} {/* Texto só aparece quando aberto */}
          </button>
        </div>
      </aside>

      {/* Botão para Alternar a Barra Lateral (fora da sidebar) */}
      <button
        onClick={alternarAsideNavBar}
        aria-label="Alternar menu" // Acessibilidade
        className="toggle-button-outside"
      >
        {aberto ? <ChevronLeft size={20} /> : <ChevronRight size={20} />} {/* Ícone muda conforme estado */}
      </button>
    </div>
  )
}
