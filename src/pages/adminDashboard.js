"use client";

import { useState, useEffect } from "react";
import AsideNavbar from "@/components/AsideNavBar";
import {
  Bell,
  Settings,
  Calendar,
  Users,
  FileText,
  Clock,
  AlertTriangle,
  ChevronRight,
  Activity,
  CheckCircle,
  AlertCircle,
  BarChart2,
  PieChart,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import "../styles/admin-dashboard.css";

// Registrar componentes do Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

export default function AdminDashboard() {
  // Estados para armazenar dados do dashboard
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalCasos: 0,
    casosEmAndamento: 0,
    casosFinalizados: 0,
    casosArquivados: 0,
    casosPendentes: 0,
    casosCancelados: 0,
    totalUsuarios: 0,
    usuariosAtivos: 0,
    usuariosPeritos: 0,
    usuariosAssistentes: 0,
    usuariosAdmin: 0,
    casosRecentes: [],
    casosUrgentes: [],
    atividadesRecentes: [],
  });

  // Estado para controlar a visualização de período
  const [periodoAtivo, setPeriodoAtivo] = useState("mes");

  // Dados para gráficos
  const [chartData, setChartData] = useState({
    distribuicaoStatus: {
      labels: [
        "Em Andamento",
        "Finalizados",
        "Arquivados",
        "Pendentes",
        "Cancelados",
      ],
      datasets: [
        {
          data: [0, 0, 0, 0, 0],
          backgroundColor: [
            "#b99f81",
            "#62725c",
            "#969696",
            "#f39c12",
            "#e74c3c",
          ],
        },
      ],
    },
    distribuicaoUsuarios: {
      labels: ["Peritos", "Assistentes", "Administradores"],
      datasets: [
        {
          data: [0, 0, 0],
          backgroundColor: ["#3498db", "#2ecc71", "#9b59b6"],
        },
      ],
    },
    tendenciaCasos: {
      labels: [],
      datasets: [
        {
          label: "Casos Abertos",
          data: [],
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.2)",
          tension: 0.4,
        },
        {
          label: "Casos Finalizados",
          data: [],
          borderColor: "#2ecc71",
          backgroundColor: "rgba(46, 204, 113, 0.2)",
          tension: 0.4,
        },
      ],
    },
    desempenhoMensal: {
      labels: [],
      datasets: [
        {
          label: "Casos Processados",
          data: [],
          backgroundColor: "#3498db",
        },
      ],
    },
  });

  // Buscar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token de autenticação não encontrado");
        }

        // Buscar casos
        const casosResponse = await fetch(
          "https://perioscan-back-end-fhhq.onrender.com/api/cases",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!casosResponse.ok) {
          throw new Error(`Erro ao buscar casos: ${casosResponse.status}`);
        }

        const casosData = await casosResponse.json();
        const casos =
          casosData.success && Array.isArray(casosData.data)
            ? casosData.data
            : [];

        // Buscar usuários
        const usuariosResponse = await fetch(
          "https://perioscan-back-end-fhhq.onrender.com/api/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!usuariosResponse.ok) {
          throw new Error(
            `Erro ao buscar usuários: ${usuariosResponse.status}`
          );
        }

        const usuariosData = await usuariosResponse.json();
        let usuarios = [];

        // Verificar a estrutura da resposta de usuários
        if (Array.isArray(usuariosData)) {
          usuarios = usuariosData;
        } else if (usuariosData.data && Array.isArray(usuariosData.data)) {
          usuarios = usuariosData.data;
        } else if (usuariosData.users && Array.isArray(usuariosData.users)) {
          usuarios = usuariosData.users;
        } else {
          console.error(
            "Estrutura de dados de usuários inesperada:",
            usuariosData
          );
          usuarios = [];
        }

        // Processar dados dos casos
        const casosEmAndamento = casos.filter(
          (caso) => caso.status === "Em Andamento"
        ).length;
        const casosFinalizados = casos.filter(
          (caso) => caso.status === "Finalizado"
        ).length;
        const casosArquivados = casos.filter(
          (caso) => caso.status === "Arquivado"
        ).length;
        const casosPendentes = casos.filter(
          (caso) => caso.status === "Pendente"
        ).length;
        const casosCancelados = casos.filter(
          (caso) => caso.status === "Cancelado"
        ).length;

        // Processar dados dos usuários
        const usuariosAtivos = usuarios.filter(
          (usuario) => usuario.active !== false
        ).length;
        const usuariosPeritos = usuarios.filter(
          (usuario) => usuario.role === "perito"
        ).length;
        const usuariosAssistentes = usuarios.filter(
          (usuario) => usuario.role === "assistente"
        ).length;
        const usuariosAdmin = usuarios.filter(
          (usuario) => usuario.role === "admin"
        ).length;

        // Ordenar casos por data de criação (mais recentes primeiro)
        const casosOrdenados = [...casos].sort((a, b) => {
          return (
            new Date(b.createdAt || b.openDate) -
            new Date(a.createdAt || a.openDate)
          );
        });

        // Casos recentes (últimos 5)
        const casosRecentes = casosOrdenados.slice(0, 5);

        // Casos urgentes (em andamento com mais de 30 dias)
        const casosUrgentes = casos
          .filter((caso) => {
            if (caso.status !== "Em Andamento") return false;
            const dataAbertura = new Date(caso.openDate || caso.createdAt);
            const hoje = new Date();
            const diferencaDias = Math.floor(
              (hoje - dataAbertura) / (1000 * 60 * 60 * 24)
            );
            return diferencaDias > 30;
          })
          .slice(0, 5);

        // Gerar dados para gráfico de distribuição de status
        const distribuicaoStatus = {
          labels: [
            "Em Andamento",
            "Finalizados",
            "Arquivados",
            "Pendentes",
            "Cancelados",
          ],
          datasets: [
            {
              data: [
                casosEmAndamento,
                casosFinalizados,
                casosArquivados,
                casosPendentes,
                casosCancelados,
              ],
              backgroundColor: [
                "#b99f81",
                "#62725c",
                "#969696",
                "#f39c12",
                "#e74c3c",
              ],
            },
          ],
        };

        // Gerar dados para gráfico de distribuição de usuários
        const distribuicaoUsuarios = {
          labels: ["Peritos", "Assistentes", "Administradores"],
          datasets: [
            {
              data: [usuariosPeritos, usuariosAssistentes, usuariosAdmin],
              backgroundColor: ["#3498db", "#2ecc71", "#9b59b6"],
            },
          ],
        };

        // Gerar dados para gráfico de tendência de casos
        const tendenciaCasos = gerarDadosTendencia(casos, periodoAtivo);

        // Gerar dados para gráfico de desempenho mensal
        const desempenhoMensal = gerarDadosDesempenho(casos);

        // Gerar atividades recentes (combinação de casos e outras atividades)
        const atividadesRecentes = gerarAtividadesRecentes(casos, usuarios);

        // Atualizar estado do dashboard
        setDashboardData({
          totalCasos: casos.length,
          casosEmAndamento,
          casosFinalizados,
          casosArquivados,
          casosPendentes,
          casosCancelados,
          totalUsuarios: usuarios.length,
          usuariosAtivos,
          usuariosPeritos,
          usuariosAssistentes,
          usuariosAdmin,
          casosRecentes,
          casosUrgentes,
          atividadesRecentes,
        });

        // Atualizar dados dos gráficos
        setChartData({
          distribuicaoStatus,
          distribuicaoUsuarios,
          tendenciaCasos,
          desempenhoMensal,
        });
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [periodoAtivo]);

  // Função para gerar dados de tendência com base no período selecionado
  const gerarDadosTendencia = (casos, periodo) => {
    const hoje = new Date();
    let dataInicial, labels, intervalo;

    // Definir período e formato de data
    switch (periodo) {
      case "semana":
        dataInicial = new Date(hoje);
        dataInicial.setDate(hoje.getDate() - 7);
        labels = Array.from({ length: 7 }, (_, i) => {
          const data = new Date(hoje);
          data.setDate(hoje.getDate() - 6 + i);
          return data.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          });
        });
        intervalo = "dia";
        break;
      case "mes":
        dataInicial = new Date(hoje);
        dataInicial.setDate(hoje.getDate() - 30);
        labels = Array.from({ length: 4 }, (_, i) => {
          const data = new Date(hoje);
          data.setDate(hoje.getDate() - 28 + i * 7);
          return `Semana ${i + 1}`;
        });
        intervalo = "semana";
        break;
      case "ano":
        dataInicial = new Date(hoje);
        dataInicial.setFullYear(hoje.getFullYear() - 1);
        labels = [
          "Jan",
          "Fev",
          "Mar",
          "Abr",
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez",
        ];
        intervalo = "mes";
        break;
      default:
        dataInicial = new Date(hoje);
        dataInicial.setDate(hoje.getDate() - 30);
        labels = Array.from({ length: 4 }, (_, i) => `Semana ${i + 1}`);
        intervalo = "semana";
    }

    // Filtrar casos dentro do período
    const casosDoPeriodo = casos.filter((caso) => {
      const dataCaso = new Date(caso.openDate || caso.createdAt);
      return dataCaso >= dataInicial && dataCaso <= hoje;
    });

    // Inicializar arrays de dados
    const casosAbertos = Array(labels.length).fill(0);
    const casosFinalizados = Array(labels.length).fill(0);

    // Preencher dados de acordo com o intervalo
    casosDoPeriodo.forEach((caso) => {
      const dataCaso = new Date(caso.openDate || caso.createdAt);
      let indice = 0;

      if (intervalo === "dia") {
        // Calcular dias desde o início do período
        const diasDesdeInicio = Math.floor(
          (dataCaso - dataInicial) / (1000 * 60 * 60 * 24)
        );
        indice = Math.min(Math.max(diasDesdeInicio, 0), 6);
      } else if (intervalo === "semana") {
        // Calcular semanas desde o início do período
        const diasDesdeInicio = Math.floor(
          (dataCaso - dataInicial) / (1000 * 60 * 60 * 24)
        );
        indice = Math.min(Math.floor(diasDesdeInicio / 7), 3);
      } else if (intervalo === "mes") {
        // Usar o mês do ano
        indice = dataCaso.getMonth();
      }

      // Incrementar contadores
      casosAbertos[indice]++;

      // Se o caso está finalizado, incrementar o contador de finalizados
      if (caso.status === "Finalizado") {
        casosFinalizados[indice]++;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: "Casos Abertos",
          data: casosAbertos,
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.2)",
          tension: 0.4,
        },
        {
          label: "Casos Finalizados",
          data: casosFinalizados,
          borderColor: "#2ecc71",
          backgroundColor: "rgba(46, 204, 113, 0.2)",
          tension: 0.4,
        },
      ],
    };
  };

  // Função para gerar dados de desempenho mensal
  const gerarDadosDesempenho = (casos) => {
    const hoje = new Date();
    const meses = [];
    const dadosMensais = [];

    // Gerar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje);
      data.setMonth(hoje.getMonth() - i);
      meses.push(data.toLocaleDateString("pt-BR", { month: "short" }));

      // Contar casos processados neste mês
      const casosProcessados = casos.filter((caso) => {
        const dataCaso = new Date(
          caso.closeDate || caso.updatedAt || caso.createdAt
        );
        return (
          dataCaso.getMonth() === data.getMonth() &&
          dataCaso.getFullYear() === data.getFullYear() &&
          (caso.status === "Finalizado" || caso.status === "Arquivado")
        );
      }).length;

      dadosMensais.push(casosProcessados);
    }

    return {
      labels: meses,
      datasets: [
        {
          label: "Casos Processados",
          data: dadosMensais,
          backgroundColor: "#3498db",
        },
      ],
    };
  };

  // Função para gerar atividades recentes
  const gerarAtividadesRecentes = (casos, usuarios) => {
    const atividades = [];

    // Adicionar casos recentes como atividades
    casos.slice(0, 10).forEach((caso) => {
      atividades.push({
        tipo: "caso",
        titulo: caso.title || "Caso sem título",
        data: caso.createdAt || caso.openDate,
        status: caso.status,
        usuario: caso.createdBy?.name || "Usuário desconhecido",
        id: caso._id || caso.id,
      });
    });

    // Adicionar usuários recentes como atividades
    usuarios.slice(0, 5).forEach((usuario) => {
      atividades.push({
        tipo: "usuario",
        titulo: `${usuario.name || "Usuário"} (${formatarPapel(usuario.role)})`,
        data: usuario.createdAt || new Date(),
        status: usuario.active !== false ? "Ativo" : "Inativo",
        id: usuario._id || usuario.id,
      });
    });

    // Ordenar por data (mais recentes primeiro) e limitar a 10
    return atividades
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 10);
  };

  // Função para formatar papel do usuário
  const formatarPapel = (role) => {
    if (!role) return "Desconhecido";

    const mapeamento = {
      admin: "Administrador",
      perito: "Perito",
      assistente: "Assistente",
    };

    return mapeamento[role.toLowerCase()] || role;
  };

  // Função para formatar data
  const formatarData = (dataISO) => {
    if (!dataISO) return "--";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Função para calcular variação percentual
  const calcularVariacao = (atual, anterior) => {
    if (anterior === 0) return atual > 0 ? 100 : 0;
    return Math.round(((atual - anterior) / anterior) * 100);
  };

  // Opções para gráficos
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Desempenho Mensal",
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Tendência de Casos",
      },
    },
  };

  // Renderizar componente
  return (
    <main className="admin-dashboard-main-container">
      <AsideNavbar />

      <div className="admin-dashboard-container-dashboard">
        <div className="admin-dashboard-header-dashboard">
          <h2>Dashboard de Gestão</h2>
          <div className="admin-dashboard-header-icons-dashboard">
            <Bell size={24} className="admin-dashboard-header-icon" />
            <Settings size={24} className="admin-dashboard-header-icon" />
          </div>
        </div>

        {loading ? (
          <div className="admin-dashboard-loading">
            <div className="admin-dashboard-loading-spinner"></div>
            <p>Carregando dados do dashboard...</p>
          </div>
        ) : error ? (
          <div className="admin-dashboard-error">
            <AlertCircle size={48} />
            <h3>Erro ao carregar dados</h3>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="admin-dashboard-reload-btn"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {/* Resumo de estatísticas */}
            <div className="admin-dashboard-stats-summary">
              <div className="admin-dashboard-stat-card">
                <div className="admin-dashboard-stat-icon casos">
                  <FileText size={24} />
                </div>
                <div className="admin-dashboard-stat-content">
                  <h3>Total de Casos</h3>
                  <div className="admin-dashboard-stat-value">
                    {dashboardData.totalCasos}
                  </div>
                  <div className="admin-dashboard-stat-comparison">
                    <span className="admin-dashboard-stat-label">Ativos:</span>
                    <span className="admin-dashboard-stat-number">
                      {dashboardData.casosEmAndamento}
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-dashboard-stat-card">
                <div className="admin-dashboard-stat-icon usuarios">
                  <Users size={24} />
                </div>
                <div className="admin-dashboard-stat-content">
                  <h3>Usuários</h3>
                  <div className="admin-dashboard-stat-value">
                    {dashboardData.totalUsuarios}
                  </div>
                  <div className="admin-dashboard-stat-comparison">
                    <span className="admin-dashboard-stat-label">Peritos:</span>
                    <span className="admin-dashboard-stat-number">
                      {dashboardData.usuariosPeritos}
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-dashboard-stat-card">
                <div className="admin-dashboard-stat-icon finalizados">
                  <CheckCircle size={24} />
                </div>
                <div className="admin-dashboard-stat-content">
                  <h3>Casos Finalizados</h3>
                  <div className="admin-dashboard-stat-value">
                    {dashboardData.casosFinalizados}
                  </div>
                  <div className="admin-dashboard-stat-comparison">
                    <span className="admin-dashboard-stat-label">Taxa:</span>
                    <span className="admin-dashboard-stat-number">
                      {dashboardData.totalCasos > 0
                        ? Math.round(
                            (dashboardData.casosFinalizados /
                              dashboardData.totalCasos) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-dashboard-stat-card">
                <div className="admin-dashboard-stat-icon urgentes">
                  <AlertTriangle size={24} />
                </div>
                <div className="admin-dashboard-stat-content">
                  <h3>Casos Urgentes</h3>
                  <div className="admin-dashboard-stat-value">
                    {dashboardData.casosUrgentes.length}
                  </div>
                  <div className="admin-dashboard-stat-comparison">
                    <span className="admin-dashboard-stat-label">
                      Pendentes:
                    </span>
                    <span className="admin-dashboard-stat-number">
                      {dashboardData.casosPendentes}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos principais */}
            <div className="admin-dashboard-charts-container">
              <div className="admin-dashboard-chart-row">
                <div className="admin-dashboard-chart-card">
                  <div className="admin-dashboard-chart-header">
                    <h3>
                      <PieChart size={18} /> Distribuição de Casos
                    </h3>
                  </div>
                  <div className="admin-dashboard-chart-content">
                    <div className="admin-dashboard-chart-wrapper">
                      <Pie
                        data={chartData.distribuicaoStatus}
                        options={pieOptions}
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-dashboard-chart-card">
                  <div className="admin-dashboard-chart-header">
                    <h3>
                      <PieChart size={18} /> Distribuição de Usuários
                    </h3>
                  </div>
                  <div className="admin-dashboard-chart-content">
                    <div className="admin-dashboard-chart-wrapper">
                      <Pie
                        data={chartData.distribuicaoUsuarios}
                        options={pieOptions}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-dashboard-chart-card full-width">
                <div className="admin-dashboard-chart-header">
                  <h3>
                    <Activity size={18} /> Tendência de Casos
                  </h3>
                  <div className="admin-dashboard-chart-period-selector">
                    <button
                      className={periodoAtivo === "semana" ? "active" : ""}
                      onClick={() => setPeriodoAtivo("semana")}
                    >
                      Semana
                    </button>
                    <button
                      className={periodoAtivo === "mes" ? "active" : ""}
                      onClick={() => setPeriodoAtivo("mes")}
                    >
                      Mês
                    </button>
                    <button
                      className={periodoAtivo === "ano" ? "active" : ""}
                      onClick={() => setPeriodoAtivo("ano")}
                    >
                      Ano
                    </button>
                  </div>
                </div>
                <div className="admin-dashboard-chart-content">
                  <div className="admin-dashboard-chart-wrapper">
                    <Line
                      data={chartData.tendenciaCasos}
                      options={lineOptions}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-dashboard-chart-card full-width">
                <div className="admin-dashboard-chart-header">
                  <h3>
                    <BarChart2 size={18} /> Desempenho Mensal
                  </h3>
                </div>
                <div className="admin-dashboard-chart-content">
                  <div className="admin-dashboard-chart-wrapper">
                    <Bar
                      data={chartData.desempenhoMensal}
                      options={barOptions}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Listas de casos e atividades */}
            <div className="admin-dashboard-lists-container">
              <div className="admin-dashboard-list-card">
                <div className="admin-dashboard-list-header">
                  <h3>Casos Recentes</h3>
                  <button className="admin-dashboard-view-all-btn">
                    Ver todos <ChevronRight size={16} />
                  </button>
                </div>
                <div className="admin-dashboard-list-content">
                  {dashboardData.casosRecentes.length > 0 ? (
                    <ul className="admin-dashboard-list">
                      {dashboardData.casosRecentes.map((caso) => (
                        <li
                          key={caso._id || caso.id}
                          className="admin-dashboard-list-item"
                        >
                          <div className="admin-dashboard-list-item-main">
                            <div className="admin-dashboard-list-item-title">
                              {caso.title || "Caso sem título"}
                            </div>
                            <div
                              className={`admin-dashboard-list-item-badge ${getStatusClassName(
                                caso.status
                              )}`}
                            >
                              {caso.status || "Sem status"}
                            </div>
                          </div>
                          <div className="admin-dashboard-list-item-details">
                            <div className="admin-dashboard-list-item-detail">
                              <Calendar size={14} />
                              <span>
                                {formatarData(caso.openDate || caso.createdAt)}
                              </span>
                            </div>
                            <div className="admin-dashboard-list-item-detail">
                              <Users size={14} />
                              <span>
                                {caso.createdBy?.name || "Usuário desconhecido"}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="admin-dashboard-empty-list">
                      <p>Nenhum caso recente encontrado</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-dashboard-list-card">
                <div className="admin-dashboard-list-header">
                  <h3>Casos Urgentes</h3>
                  <button className="admin-dashboard-view-all-btn">
                    Ver todos <ChevronRight size={16} />
                  </button>
                </div>
                <div className="admin-dashboard-list-content">
                  {dashboardData.casosUrgentes.length > 0 ? (
                    <ul className="admin-dashboard-list">
                      {dashboardData.casosUrgentes.map((caso) => (
                        <li
                          key={caso._id || caso.id}
                          className="admin-dashboard-list-item urgent"
                        >
                          <div className="admin-dashboard-list-item-main">
                            <div className="admin-dashboard-list-item-title">
                              {caso.title || "Caso sem título"}
                            </div>
                            <div className="admin-dashboard-list-item-badge status-urgente">
                              Urgente
                            </div>
                          </div>
                          <div className="admin-dashboard-list-item-details">
                            <div className="admin-dashboard-list-item-detail">
                              <Calendar size={14} />
                              <span>
                                {formatarData(caso.openDate || caso.createdAt)}
                              </span>
                            </div>
                            <div className="admin-dashboard-list-item-detail">
                              <Clock size={14} />
                              <span>
                                {calcularDiasAberto(
                                  caso.openDate || caso.createdAt
                                )}{" "}
                                dias
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="admin-dashboard-empty-list">
                      <p>Nenhum caso urgente encontrado</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Atividades recentes */}
            <div className="admin-dashboard-activities-container">
              <div className="admin-dashboard-list-card full-width">
                <div className="admin-dashboard-list-header">
                  <h3>Atividades Recentes</h3>
                </div>
                <div className="admin-dashboard-list-content">
                  {dashboardData.atividadesRecentes.length > 0 ? (
                    <ul className="admin-dashboard-list">
                      {dashboardData.atividadesRecentes.map(
                        (atividade, index) => (
                          <li
                            key={`atividade-${index}-${atividade.id}`}
                            className="admin-dashboard-list-item"
                          >
                            <div className="admin-dashboard-list-item-main">
                              <div className="admin-dashboard-list-item-title">
                                {atividade.tipo === "caso"
                                  ? "Caso: "
                                  : "Usuário: "}
                                {atividade.titulo}
                              </div>
                              <div
                                className={`admin-dashboard-list-item-badge ${getStatusClassName(
                                  atividade.status
                                )}`}
                              >
                                {atividade.status}
                              </div>
                            </div>
                            <div className="admin-dashboard-list-item-details">
                              <div className="admin-dashboard-list-item-detail">
                                <Calendar size={14} />
                                <span>{formatarData(atividade.data)}</span>
                              </div>
                              {atividade.usuario && (
                                <div className="admin-dashboard-list-item-detail">
                                  <Users size={14} />
                                  <span>{atividade.usuario}</span>
                                </div>
                              )}
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <div className="admin-dashboard-empty-list">
                      <p>Nenhuma atividade recente encontrada</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// Função auxiliar para calcular dias em aberto
function calcularDiasAberto(dataAbertura) {
  if (!dataAbertura) return "--";
  const inicio = new Date(dataAbertura);
  const hoje = new Date();
  return Math.floor((hoje - inicio) / (1000 * 60 * 60 * 24));
}

// Função para obter classe CSS baseada no status
function getStatusClassName(status) {
  if (!status) return "status-desconhecido";

  // Normalize o status para minúsculas e sem espaços
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "-");

  switch (normalizedStatus) {
    case "em-andamento":
      return "status-em-andamento";
    case "finalizado":
      return "status-finalizado";
    case "pendente":
      return "status-pendente";
    case "arquivado":
      return "status-arquivado";
    case "cancelado":
      return "status-cancelado";
    case "urgente":
      return "status-urgente";
    case "ativo":
      return "status-ativo";
    case "inativo":
      return "status-inativo";
    default:
      return "status-outro";
  }
}
