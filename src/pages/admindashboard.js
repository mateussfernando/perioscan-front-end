"use client";

import { useState, useEffect } from "react";
import AsideNavbar from "@/components/AsideNavBar";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileHeader from "@/components/MobileHeader";

import {
  Bell,
  Calendar,
  Users,
  FileText,
  Clock,
  ChevronRight,
  Activity,
  CheckCircle,
  AlertCircle,
  BarChart2,
  PieChart,
  Loader,
  Archive,
  ImageIcon,
  UserPlus,
  FileCheck,
  RefreshCw,
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
import ControleDeRota from "@/components/ControleDeRota";
import { useRouter } from "next/navigation";

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
  const [todosOsCasos, setTodosOsCasos] = useState([]); // Dados originais dos casos
  const [todosOsUsuarios, setTodosOsUsuarios] = useState([]); // Dados originais dos usuários
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
    atividadesRecentes: [],
  });

  // Estado para controlar a visualização de período
  const [periodoAtivo, setPeriodoAtivo] = useState("mes");

  // Estados para o filtro de período personalizado
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");

  // Dados para gráficos
  const [chartData, setChartData] = useState({
    distribuicaoStatus: {
      labels: ["Em Andamento", "Finalizados", "Arquivados"],
      datasets: [
        {
          data: [0, 0, 0],
          backgroundColor: ["#b99f81", "#62725c", "#969696"],
        },
      ],
    },
    distribuicaoUsuarios: {
      labels: ["Peritos", "Assistentes", "Administradores"],
      datasets: [
        {
          data: [0, 0, 0],
          backgroundColor: ["#706C61", "#0C1618", "#EAD2AC"],
        },
      ],
    },
    tendenciaCasos: {
      labels: [],
      datasets: [
        {
          label: "Casos Abertos",
          data: [],
          borderColor: "#000000",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          tension: 0.4,
        },
        {
          label: "Casos Finalizados",
          data: [],
          borderColor: "#62725c",
          backgroundColor: "rgba(98, 114, 92, 0.2)",
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
          backgroundColor: "#000000",
        },
      ],
    },
  });

  const router = useRouter();

  // Função para filtrar dados por período
  const filtrarDadosPorPeriodo = (
    casos,
    usuarios,
    periodo,
    dataInicio = null,
    dataFim = null
  ) => {
    const hoje = new Date();
    let dataInicialFiltro, dataFinalFiltro;

    if (dataInicio && dataFim) {
      // Período personalizado
      dataInicialFiltro = new Date(dataInicio);
      dataFinalFiltro = new Date(dataFim);
      dataFinalFiltro.setHours(23, 59, 59, 999); // Incluir todo o dia final
    } else {
      // Período predefinido
      switch (periodo) {
        case "semana":
          dataInicialFiltro = new Date(hoje);
          dataInicialFiltro.setDate(hoje.getDate() - 7);
          dataFinalFiltro = hoje;
          break;
        case "mes":
          dataInicialFiltro = new Date(hoje);
          dataInicialFiltro.setDate(hoje.getDate() - 30);
          dataFinalFiltro = hoje;
          break;
        case "ano":
          dataInicialFiltro = new Date(hoje);
          dataInicialFiltro.setFullYear(hoje.getFullYear() - 1);
          dataFinalFiltro = hoje;
          break;
        default:
          dataInicialFiltro = new Date(hoje);
          dataInicialFiltro.setDate(hoje.getDate() - 30);
          dataFinalFiltro = hoje;
      }
    }

    // Filtrar casos por período
    const casosFiltrados = casos.filter((caso) => {
      const dataCaso = new Date(caso.openDate || caso.createdAt);
      return dataCaso >= dataInicialFiltro && dataCaso <= dataFinalFiltro;
    });

    // Filtrar usuários por período (se necessário)
    const usuariosFiltrados = usuarios.filter((usuario) => {
      const dataUsuario = new Date(usuario.createdAt);
      return dataUsuario >= dataInicialFiltro && dataUsuario <= dataFinalFiltro;
    });

    return {
      casosFiltrados,
      usuariosFiltrados,
      dataInicialFiltro,
      dataFinalFiltro,
    };
  };

  // Função para processar dados do dashboard com base no filtro
  const processarDadosDashboard = (casos, usuarios) => {
    // Processar dados dos casos
    const casosEmAndamento = casos.filter(
      (caso) => caso.status?.toLowerCase() === "em andamento"
    ).length;
    const casosFinalizados = casos.filter(
      (caso) => caso.status?.toLowerCase() === "finalizado"
    ).length;
    const casosArquivados = casos.filter(
      (caso) => caso.status?.toLowerCase() === "arquivado"
    ).length;
    const casosPendentes = casos.filter(
      (caso) => caso.status?.toLowerCase() === "pendente"
    ).length;
    const casosCancelados = casos.filter(
      (caso) => caso.status?.toLowerCase() === "cancelado"
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

    // Gerar dados para gráfico de distribuição de status
    const distribuicaoStatus = {
      labels: ["Em Andamento", "Finalizados", "Arquivados"],
      datasets: [
        {
          data: [casosEmAndamento, casosFinalizados, casosArquivados],
          backgroundColor: ["#b99f81", "#62725c", "#969696"],
        },
      ],
    };

    // Gerar dados para gráfico de distribuição de usuários
    const distribuicaoUsuarios = {
      labels: ["Peritos", "Assistentes", "Administradores"],
      datasets: [
        {
          data: [usuariosPeritos, usuariosAssistentes, usuariosAdmin],
          backgroundColor: ["#706C61", "#0C1618", "#EAD2AC"],
        },
      ],
    };

    // Gerar dados para gráfico de tendência de casos
    const tendenciaCasos = gerarDadosTendencia(casos, periodoAtivo);

    // Gerar dados para gráfico de desempenho mensal
    const desempenhoMensal = gerarDadosDesempenho(casos);

    // Gerar atividades recentes
    const atividadesRecentes = gerarAtividadesRecentes(casos, usuarios);

    return {
      dashboardData: {
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
        atividadesRecentes,
      },
      chartData: {
        distribuicaoStatus,
        distribuicaoUsuarios,
        tendenciaCasos,
        desempenhoMensal,
      },
    };
  };

  // Função para aplicar filtro
  const aplicarFiltro = () => {
    if (!todosOsCasos.length && !todosOsUsuarios.length) return;

    let casosFiltrados, usuariosFiltrados;

    if (periodoInicio && periodoFim) {
      // Filtro personalizado
      const resultado = filtrarDadosPorPeriodo(
        todosOsCasos,
        todosOsUsuarios,
        null,
        periodoInicio,
        periodoFim
      );
      casosFiltrados = resultado.casosFiltrados;
      usuariosFiltrados = resultado.usuariosFiltrados;
    } else {
      // Filtro predefinido
      const resultado = filtrarDadosPorPeriodo(
        todosOsCasos,
        todosOsUsuarios,
        periodoAtivo
      );
      casosFiltrados = resultado.casosFiltrados;
      usuariosFiltrados = resultado.usuariosFiltrados;
    }

    const dadosProcessados = processarDadosDashboard(
      casosFiltrados,
      usuariosFiltrados
    );
    setDashboardData(dadosProcessados.dashboardData);
    setChartData(dadosProcessados.chartData);
  };

  // Buscar dados iniciais do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
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

        if (casosResponse.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        }

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

        if (usuariosResponse.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        }

        if (!usuariosResponse.ok) {
          throw new Error(
            `Erro ao buscar usuários: ${usuariosResponse.status}`
          );
        }

        const usuariosData = await usuariosResponse.json();
        let usuarios = [];

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

        // Armazenar dados originais
        setTodosOsCasos(casos);
        setTodosOsUsuarios(usuarios);

        // Processar dados iniciais (período padrão)
        const dadosProcessados = processarDadosDashboard(casos, usuarios);
        setDashboardData(dadosProcessados.dashboardData);
        setChartData(dadosProcessados.chartData);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Aplicar filtro quando período ativo mudar
  useEffect(() => {
    if (todosOsCasos.length > 0 || todosOsUsuarios.length > 0) {
      aplicarFiltro();
    }
  }, [periodoAtivo, todosOsCasos, todosOsUsuarios]);

  // Função para lidar com o botão de filtrar período personalizado
  const handleFiltrarPeriodo = () => {
    if (periodoInicio && periodoFim) {
      setPeriodoAtivo(""); // Limpar filtro rápido
      aplicarFiltro();
    }
  };

  // Função para resetar filtros
  const resetarFiltros = () => {
    setPeriodoInicio("");
    setPeriodoFim("");
    setPeriodoAtivo("mes");
  };

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
        const diasDesdeInicio = Math.floor(
          (dataCaso - dataInicial) / (1000 * 60 * 60 * 24)
        );
        indice = Math.min(Math.max(diasDesdeInicio, 0), 6);
      } else if (intervalo === "semana") {
        const diasDesdeInicio = Math.floor(
          (dataCaso - dataInicial) / (1000 * 60 * 60 * 24)
        );
        indice = Math.min(Math.floor(diasDesdeInicio / 7), 3);
      } else if (intervalo === "mes") {
        indice = dataCaso.getMonth();
      }

      casosAbertos[indice]++;

      if (caso.status?.toLowerCase() === "finalizado") {
        casosFinalizados[indice]++;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: "Casos Abertos",
          data: casosAbertos,
          borderColor: "#000000",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          tension: 0.4,
        },
        {
          label: "Casos Finalizados",
          data: casosFinalizados,
          borderColor: "#62725c",
          backgroundColor: "rgba(98, 114, 92, 0.2)",
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
          (caso.status?.toLowerCase() === "finalizado" ||
            caso.status?.toLowerCase() === "arquivado")
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
          backgroundColor: "#000000",
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
        tipo: "caso_criado",
        titulo: caso.title || "Caso sem título",
        data: caso.createdAt || caso.openDate,
        status: caso.status,
        usuario: caso.createdBy?.name || "Usuário desconhecido",
        id: caso._id || caso.id,
        descricao: `Caso criado por ${
          caso.createdBy?.name || "Usuário desconhecido"
        }`,
        icone: "FileText",
      });

      if (caso.status?.toLowerCase() === "finalizado" && caso.closeDate) {
        atividades.push({
          tipo: "caso_finalizado",
          titulo: caso.title || "Caso sem título",
          data: caso.closeDate,
          status: "finalizado",
          usuario:
            caso.updatedBy?.name ||
            caso.createdBy?.name ||
            "Usuário desconhecido",
          id: caso._id || caso.id,
          descricao: `Caso finalizado por ${
            caso.updatedBy?.name ||
            caso.createdBy?.name ||
            "Usuário desconhecido"
          }`,
          icone: "CheckCircle",
        });
      }
    });

    // Adicionar usuários recentes como atividades
    usuarios.slice(0, 5).forEach((usuario) => {
      atividades.push({
        tipo: "usuario_criado",
        titulo: `${usuario.name || "Usuário"} (${formatarPapel(usuario.role)})`,
        data: usuario.createdAt || new Date(),
        status: usuario.active !== false ? "Ativo" : "Inativo",
        id: usuario._id || usuario.id,
        descricao: `Novo usuário ${formatarPapel(
          usuario.role
        )} adicionado ao sistema`,
        icone: "UserPlus",
      });
    });

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
    const dataAjustada = new Date(
      data.getTime() + data.getTimezoneOffset() * 60000
    );
    return dataAjustada.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Função para obter classe CSS baseada no status
  const getStatusClassName = (status) => {
    if (!status) return "status-desconhecido";
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
      case "ativo":
        return "status-ativo";
      case "inativo":
        return "status-inativo";
      default:
        return "status-outro";
    }
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
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
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
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "Desempenho Mensal",
        font: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: "bold",
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: "Tendência de Casos",
        font: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: "bold",
        },
      },
    },
  };

  // Renderizar componente
  return (
    <ControleDeRota requiredRole="admin">
      <MobileHeader></MobileHeader>
      <MobileBottomNav></MobileBottomNav>
      <main className="admin-dashboard-main-container">
        <AsideNavbar />

        <div className="admin-dashboard-container-dashboard">
          <div className="admin-dashboard-header-dashboard">
            <h2>Dashboard de Gestão</h2>
            <div className="admin-dashboard-header-icons-dashboard">
              {/* <Bell size={24} className="admin-dashboard-header-icon" /> */}
            </div>
          </div>

          {/* Filtro de período */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              margin: "0 0 24px 0",
              flexWrap: "wrap",
            }}
          >
            <label htmlFor="periodoInicio" style={{ fontWeight: 500 }}>
              Período de:
            </label>
            <input
              type="date"
              id="periodoInicio"
              value={periodoInicio}
              onChange={(e) => setPeriodoInicio(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
            <label htmlFor="periodoFim" style={{ fontWeight: 500 }}>
              até:
            </label>
            <input
              type="date"
              id="periodoFim"
              value={periodoFim}
              onChange={(e) => setPeriodoFim(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
            <button
              style={{
                padding: "6px 16px",
                borderRadius: 4,
                border: "none",
                background: "#000",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                opacity: !periodoInicio || !periodoFim ? 0.6 : 1,
              }}
              onClick={handleFiltrarPeriodo}
              disabled={!periodoInicio || !periodoFim}
            >
              Filtrar
            </button>
            <button
              style={{
                padding: "6px 16px",
                borderRadius: 4,
                border: "1px solid #ccc",
                background: "#fff",
                color: "#333",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={resetarFiltros}
            >
              Limpar
            </button>
          </div>

          {loading ? (
            <div className="admin-dashboard-loading">
              <Loader size={40} className="spinner" />
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
              {/* Indicador de filtro ativo */}
              {periodoInicio && periodoFim && (
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: "8px 12px",
                    marginBottom: "16px",
                    textAlign: "center",
                    fontSize: "14px",
                    color: "black",
                  }}
                >
                  📅 Filtro ativo: {formatarData(periodoInicio)} até{" "}
                  {formatarData(periodoFim)}
                </div>
              )}

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
                      <span className="admin-dashboard-stat-label">
                        Ativos:
                      </span>
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
                      <span className="admin-dashboard-stat-label">
                        Peritos:
                      </span>
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
                        onClick={() => {
                          setPeriodoAtivo("semana");
                          setPeriodoInicio("");
                          setPeriodoFim("");
                        }}
                      >
                        Semana
                      </button>
                      <button
                        className={periodoAtivo === "mes" ? "active" : ""}
                        onClick={() => {
                          setPeriodoAtivo("mes");
                          setPeriodoInicio("");
                          setPeriodoFim("");
                        }}
                      >
                        Mês
                      </button>
                      <button
                        className={periodoAtivo === "ano" ? "active" : ""}
                        onClick={() => {
                          setPeriodoAtivo("ano");
                          setPeriodoInicio("");
                          setPeriodoFim("");
                        }}
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
                <div className="admin-dashboard-list-card full-width admin-dashboard-casos-recentes">
                  <div className="admin-dashboard-list-header">
                    <h3>Casos Recentes</h3>
                    <button
                      className="admin-dashboard-view-all-btn"
                      onClick={() => router.push("/casos")}
                    >
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
                            onClick={() =>
                              router.push(`/casos/${caso._id || caso.id}`)
                            }
                            style={{ cursor: "pointer" }}
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
                                  {formatarData(
                                    caso.openDate || caso.createdAt
                                  )}
                                </span>
                              </div>
                              <div className="admin-dashboard-list-item-detail">
                                <Users size={14} />
                                <span>
                                  {caso.createdBy?.name ||
                                    "Usuário desconhecido"}
                                </span>
                              </div>
                              <div className="admin-dashboard-list-item-detail">
                                <Clock size={14} />
                                <span>
                                  {calcularDiasAberto(
                                    caso.openDate || caso.createdAt
                                  )}{" "}
                                  dias em aberto
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
              </div>

              {/* Atividades recentes */}
              <div className="admin-dashboard-activities-container">
                <div className="admin-dashboard-list-card full-width">
                  <div className="admin-dashboard-list-header">
                    <h3>
                      <Activity size={18} /> Atividades Recentes
                    </h3>
                    <button
                      className="admin-dashboard-refresh-btn"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw size={16} />
                      <span>Atualizar</span>
                    </button>
                  </div>
                  <div className="admin-dashboard-list-content">
                    {dashboardData.atividadesRecentes &&
                    dashboardData.atividadesRecentes.length > 0 ? (
                      <ul className="admin-dashboard-list">
                        {dashboardData.atividadesRecentes.map(
                          (atividade, index) => {
                            let AtividadeIcone = FileText;
                            if (atividade.icone === "CheckCircle")
                              AtividadeIcone = CheckCircle;
                            else if (atividade.icone === "Archive")
                              AtividadeIcone = Archive;
                            else if (atividade.icone === "ImageIcon")
                              AtividadeIcone = ImageIcon;
                            else if (atividade.icone === "UserPlus")
                              AtividadeIcone = UserPlus;
                            else if (atividade.icone === "FileCheck")
                              AtividadeIcone = FileCheck;

                            return (
                              <li
                                key={`atividade-${index}-${atividade.id}`}
                                className="admin-dashboard-list-item"
                                data-tipo={atividade.tipo}
                              >
                                <div className="admin-dashboard-activity-icon">
                                  <AtividadeIcone size={18} />
                                </div>
                                <div className="admin-dashboard-activity-content">
                                  <div className="admin-dashboard-list-item-main">
                                    <div className="admin-dashboard-list-item-title">
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
                                  <div className="admin-dashboard-activity-description">
                                    {atividade.descricao}
                                  </div>
                                  <div className="admin-dashboard-list-item-details">
                                    <div className="admin-dashboard-list-item-detail">
                                      <Calendar size={14} />
                                      <span>
                                        {formatarData(atividade.data)}
                                      </span>
                                    </div>
                                    {atividade.usuario && (
                                      <div className="admin-dashboard-list-item-detail">
                                        <Users size={14} />
                                        <span>{atividade.usuario}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </li>
                            );
                          }
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
    </ControleDeRota>
  );
}

// Função para calcular dias em aberto
const calcularDiasAberto = (dataAbertura) => {
  if (!dataAbertura) return "--";
  const inicio = new Date(dataAbertura);
  const hoje = new Date();
  return Math.floor((hoje - inicio) / (1000 * 60 * 60 * 24));
};
