// pages/admincadastramento.js
import "../styles/admin-dashboard.css";
import AsideNavbar from "@/components/AsideNavBar";
import ControleDeRota from "@/components/ControleDeRota";
import Image from "next/image";

export default function AdminDashboard() {
  return (
    <ControleDeRota requiredRole="admin">
      <main className="admin-dashboard-main-container">
        <AsideNavbar></AsideNavbar>

        <div className="admin-dashboard-container-dashboard">
          <div className="admin-dashboard-header-dashboard">
            <h2>Visão geral do sistema de gestão</h2>
            <div className="admin-dashboard-header-icons-dashboard">
              <Image
                src="/images/logos/Notification.png"
                alt="Icone Notificação"
                width={32}
                height={32}
                className="admin-dashboard-button-case-dashboard-img"
              />
              <Image
                src="/images/logos/Settings.png"
                alt="Icone configurações"
                width={32}
                height={32}
                className="admin-dashboard-button-case-dashboard-img"
              />
            </div>
          </div>

          <div className="admin-dashboard-container-cards">
            <div className="admin-dashboard-card">
              <div className="admin-dashboard-titulo-card">
                <span>Em andamento</span>
                <Image
                  src="/images/logos/Icon-casos-EmAndamento.png"
                  alt="Icone de casos em andamento"
                  width={28}
                  height={28}
                />
              </div>
              <div className="admin-dashboard-card-texto">
                <h4>42</h4>
                <p>-2 desde o mês passado</p>
              </div>
            </div>
            <div className="admin-dashboard-card">
              <div className="admin-dashboard-titulo-card">
                <span>Arquivados</span>
                <Image
                  src="/images/logos/Icon-casos-Arquivado.png"
                  alt="Icone de casos arquivados"
                  width={28}
                  height={28}
                />
              </div>
              <div className="admin-dashboard-card-texto">
                <h4>7</h4>
              </div>
            </div>
          </div>
          <div className="admin-dashboard-container-cards">
            <div className="admin-dashboard-card">
              <div className="admin-dashboard-titulo-card">
                <span>Finalizados</span>
                <Image
                  src="/images/logos/Icon-casos-Finalizado.png"
                  alt="Icone de casos finalizados"
                  width={28}
                  height={28}
                />
              </div>
              <div className="admin-dashboard-card-texto">
                <h4>85</h4>
                <p>+7 desde a semana passada</p>
              </div>
            </div>
            <div className="admin-dashboard-card">
              <div className="admin-dashboard-titulo-card">
                <span>Número de usuários</span>
                <Image
                  src="/images/logos/Icon-User.png"
                  alt="Icone de User"
                  width={28}
                  height={28}
                />
              </div>
              <div className="admin-dashboard-card-texto">
                <h4>24</h4>
                <p>+2 novos peritos cadastrados</p>
              </div>
            </div>
          </div>
          <div className="admin-dashboard-card-case-dashboard">
            <div className="admin-dashboard-container-case-dashboard">
              <h3>Casos recentes</h3>
              <div className="admin-dashboard-button-case-dashboard">
                <p>Ver todos</p>
                <Image
                  src="/images/logos/Icon-Arrow-Right.png"
                  alt="Icone de seta para direita"
                  width={30}
                  height={30}
                  className="admin-dashboard-button-case-dashboard-img"
                />
              </div>
            </div>
            <div className="admin-dashboard-container-case-dashboard">
              <h3>Casos com Urgência</h3>
              <div className="admin-dashboard-button-case-dashboard">
                <p>Ver todos</p>
                <Image
                  src="/images/logos/Icon-Arrow-Right.png"
                  alt="Icone de seta para direita"
                  width={30}
                  height={30}
                  className="admin-dashboard-button-case-dashboard-img"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </ControleDeRota>
  );
}
