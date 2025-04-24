"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import AsideNavbar from "@/components/AsideNavBar";
import "../../styles/caso-detalhes.css";
// Adicionar importações para os novos componentes e ícones
import {
  Pencil,
  Trash2,
  FilePlus,
  FileCheck,
  Download,
  CheckCircle2,
  Eye,
  Loader,
  X,
} from "lucide-react";

// Importar componentes
import EvidenciaItem from "@/components/casos/EvidenciaItem";
import ModalVisualizarEvidencia from "@/components/casos/ModalVisualizarEvidencia";
import ModalCriarLaudo from "@/components/casos/ModalCriarLaudo";
import ModalAdicionarEvidencia from "@/components/casos/ModalAdicionarEvidencia";
import ModalEditarCaso from "../../components/casos/ModalEditarCaso";
import ModalExcluirCaso from "@/components/casos/ModalExcluirCaso";
import NotificacaoLaudo from "@/components/casos/NotificacaoLaudo";
import EvidenciasFiltro from "@/components/casos/EvidenciasFiltro";

export default function CasoDetalhes() {
  const router = useRouter();
  const params = useParams();
  const [caso, setCaso] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [loadingCaso, setLoadingCaso] = useState(true);
  const [loadingEvidencias, setLoadingEvidencias] = useState(true);
  const [error, setError] = useState(null);
  const [evidenciaAtiva, setEvidenciaAtiva] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [gerandoLaudo, setGerandoLaudo] = useState({});
  const [baixandoPDF, setBaixandoPDF] = useState({});
  const [laudosEvidencias, setLaudosEvidencias] = useState({}); // Mapeia evidência ID -> laudo ID

  // Estados para o modal de criar laudo
  const [modalCriarLaudoAberto, setModalCriarLaudoAberto] = useState(false);
  const [evidenciaParaLaudo, setEvidenciaParaLaudo] = useState(null);
  const [criandoLaudo, setCriandoLaudo] = useState(false);
  const [erroLaudo, setErroLaudo] = useState(null);

  // Estados para o modal de adicionar evidência
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [enviandoEvidencia, setEnviandoEvidencia] = useState(false);
  const [erroUpload, setErroUpload] = useState(null);

  // Estados para o modal de edição de caso
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  // Corrigir o estado inicial de casoEditado
  const [casoEditado, setCasoEditado] = useState({
    title: "",
    description: "",
    location: "",
    status: "em andamento", // Valor correto em minúsculas
    observation: "",
    occurrenceDate: "",
    type: "outro", // Valor padrão para o tipo
  });
  const [salvandoCaso, setSalvandoCaso] = useState(false);
  const [erroEdicao, setErroEdicao] = useState(null);

  // Estados para o modal de exclusão de caso
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [excluindoCaso, setExcluindoCaso] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(null);
  const [userRole, setUserRole] = useState("");

  // Estado para notificações de laudo
  const [notificacaoLaudo, setNotificacaoLaudo] = useState({
    visible: false,
    message: "",
    type: "",
  });

  // Adicionar estados para busca e filtros
  const [evidenciasFiltradas, setEvidenciasFiltradas] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [filtrosAtivos, setFiltrosAtivos] = useState({
    tipo: "",
    dataInicio: "",
    dataFim: "",
    criadoPor: "",
  });

  // Adicionar novos estados para gerenciar relatórios - adicionar após os estados existentes
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
  const [relatorioData, setRelatorioData] = useState({
    title: "",
    content: "",
    methodology: "",
    conclusion: "",
    status: "rascunho",
  });
  const [criandoRelatorio, setCriandoRelatorio] = useState(false);
  const [erroRelatorio, setErroRelatorio] = useState(null);
  const [relatorios, setRelatorios] = useState([]);
  const [relatorioAtual, setRelatorioAtual] = useState(null);
  const [carregandoRelatorios, setCarregandoRelatorios] = useState(true);
  const [baixandoPDFRelatorio, setBaixandoPDFRelatorio] = useState(false);
  const [assinandoRelatorio, setAssinandoRelatorio] = useState(false);
  const [modalVisualizarRelatorioAberto, setModalVisualizarRelatorioAberto] =
    useState(false);

  // Adicionar estado para controlar o modal de exclusão de evidência:
  const [modalExcluirEvidenciaAberto, setModalExcluirEvidenciaAberto] =
    useState(false);
  const [evidenciaParaExcluir, setEvidenciaParaExcluir] = useState(null);
  const [excluindoEvidencia, setExcluindoEvidencia] = useState(false);
  const [erroExclusaoEvidencia, setErroExclusaoEvidencia] = useState(null);

  // Adicionar estado para controlar o modal de exclusão de relatório
  const [modalExcluirRelatorioAberto, setModalExcluirRelatorioAberto] =
    useState(false);
  const [relatorioParaExcluir, setRelatorioParaExcluir] = useState(null);
  const [excluindoRelatorio, setExcluindoRelatorio] = useState(false);

  // Adicionar useEffect para filtrar evidências quando os dados mudarem
  useEffect(() => {
    filtrarEvidencias();
  }, [evidencias, termoBusca, filtrosAtivos]);

  // Corrigir a inicialização do estado com os dados do caso
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const id = params?.id;

    setUserRole(role || "");

    if (!token) {
      router.push("/");
      return;
    }

    if (!id) {
      setError("ID do caso não encontrado");
      setLoadingCaso(false);
      return;
    }

    // Função para buscar os detalhes do caso
    async function fetchCasoDetalhes() {
      try {
        setLoadingCaso(true);
        console.log(`Buscando detalhes do caso ${id}...`);

        const response = await fetch(
          `https://perioscan-back-end-fhhq.onrender.com/api/cases/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }

        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        const textData = await response.text();
        const responseObject = textData ? JSON.parse(textData) : {};

        if (responseObject.success && responseObject.data) {
          setCaso(responseObject.data);
          // Inicializar o estado de edição com os dados atuais do caso
          // Garantir que o status seja um dos valores permitidos pelo backend
          const statusNormalizado = normalizarStatus(
            responseObject.data.status || "em andamento"
          );

          setCasoEditado({
            title: responseObject.data.title || "",
            description: responseObject.data.description || "",
            location: responseObject.data.location || "",
            status: statusNormalizado, // Usar o valor normalizado
            observation: responseObject.data.observation || "",
            occurrenceDate: responseObject.data.occurrenceDate || "", // Add this line
            type: responseObject.data.type || "outro",
          });

          console.log("Status normalizado:", statusNormalizado);
        } else {
          console.error("Formato de resposta inesperado:", responseObject);
          setError("Formato de resposta inesperado");
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do caso:", error);
        setError(`Falha ao carregar detalhes do caso: ${error.message}`);
      } finally {
        setLoadingCaso(false);
      }
    }

    // Função para buscar as evidências do caso
    async function fetchEvidencias() {
      try {
        setLoadingEvidencias(true);
        console.log(`Buscando evidências do caso ${id}...`);

        const response = await fetch(
          `https://perioscan-back-end-fhhq.onrender.com/api/cases/${id}/evidence`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }

        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        const textData = await response.text();
        const responseObject = textData ? JSON.parse(textData) : {};

        if (responseObject.success && responseObject.data) {
          setEvidencias(responseObject.data);

          // Buscar laudos existentes para cada evidência
          const evidenciasIds = responseObject.data.map(
            (ev) => ev._id || ev.id
          );
          if (evidenciasIds.length > 0) {
            fetchLaudosExistentes(evidenciasIds);
          }
        } else {
          console.error(
            "Formato de resposta inesperado para evidências:",
            responseObject
          );
          // Não bloqueia o carregamento do caso se as evidências falham
        }
      } catch (error) {
        console.error("Erro ao buscar evidências do caso:", error);
        // Não bloqueia o carregamento do caso se as evidências falham
      } finally {
        setLoadingEvidencias(false);
      }
    }

    // Função para buscar laudos existentes para as evidências
    async function fetchLaudosExistentes(evidenciasIds) {
      try {
        const token = localStorage.getItem("token");

        // Buscar todos os laudos
        const response = await fetch(
          `https://perioscan-back-end-fhhq.onrender.com/api/evidence-reports`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error("Erro ao buscar laudos existentes:", response.status);
          return;
        }

        const data = await response.json();
        if (data.success && data.data) {
          // Mapear evidências para seus laudos
          const laudosMap = {};
          data.data.forEach((laudo) => {
            if (evidenciasIds.includes(laudo.evidence)) {
              laudosMap[laudo.evidence] = laudo._id || laudo.id;
            }
          });

          setLaudosEvidencias(laudosMap);
          console.log("Laudos existentes:", laudosMap);
        }
      } catch (error) {
        console.error("Erro ao buscar laudos existentes:", error);
      }
    }

    // Executa ambas as requisições
    fetchCasoDetalhes();
    fetchEvidencias();
  }, [params, router]);

  // Adicionar função para buscar relatórios do caso - adicionar após o useEffect que busca evidências
  useEffect(() => {
    const fetchRelatorios = async () => {
      if (!caso) return;

      try {
        const token = localStorage.getItem("token");
        const casoId = caso._id || caso.id;

        setCarregandoRelatorios(true);

        const response = await fetch(
          `https://perioscan-back-end-fhhq.onrender.com/api/reports?case=${casoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error("Erro ao buscar relatórios:", response.status);
          setRelatorios([]);
          return;
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setRelatorios(data.data);
        } else if (Array.isArray(data)) {
          setRelatorios(data);
        } else {
          console.error(
            "Formato de resposta inesperado para relatórios:",
            data
          );
          setRelatorios([]);
        }
      } catch (error) {
        console.error("Erro ao buscar relatórios:", error);
        setRelatorios([]);
      } finally {
        setCarregandoRelatorios(false);
      }
    };

    if (caso) {
      fetchRelatorios();
    }
  }, [caso]);

  // Função para filtrar evidências
  const filtrarEvidencias = () => {
    if (!evidencias.length) {
      setEvidenciasFiltradas([]);
      return;
    }

    let resultado = [...evidencias];

    // Filtrar por termo de busca
    if (termoBusca) {
      const termo = termoBusca.toLowerCase();
      resultado = resultado.filter(
        (ev) =>
          (ev.description && ev.description.toLowerCase().includes(termo)) ||
          (ev.content && ev.content.toLowerCase().includes(termo))
      );
    }

    // Filtrar por tipo
    if (filtrosAtivos.tipo) {
      resultado = resultado.filter((ev) => ev.type === filtrosAtivos.tipo);
    }

    // Filtrar por data de criação
    if (filtrosAtivos.dataInicio) {
      const dataInicio = new Date(filtrosAtivos.dataInicio);
      resultado = resultado.filter((ev) => {
        const dataEvidencia = new Date(ev.createdAt || ev.collectionDate);
        return dataEvidencia >= dataInicio;
      });
    }

    if (filtrosAtivos.dataFim) {
      const dataFim = new Date(filtrosAtivos.dataFim);
      dataFim.setHours(23, 59, 59, 999); // Fim do dia
      resultado = resultado.filter((ev) => {
        const dataEvidencia = new Date(ev.createdAt || ev.collectionDate);
        return dataEvidencia <= dataFim;
      });
    }

    // Filtrar por criador
    if (filtrosAtivos.criadoPor) {
      const termoCriador = filtrosAtivos.criadoPor.toLowerCase();
      resultado = resultado.filter(
        (ev) =>
          (ev.collectedBy?.name &&
            ev.collectedBy.name.toLowerCase().includes(termoCriador)) ||
          (typeof ev.collectedBy === "string" &&
            ev.collectedBy.toLowerCase().includes(termoCriador))
      );
    }

    setEvidenciasFiltradas(resultado);
  };

  // Funções para lidar com busca e filtros
  const handleSearch = (termo) => {
    setTermoBusca(termo);
  };

  const handleFilter = (filtros) => {
    setFiltrosAtivos(filtros);
  };

  // Função para abrir o modal de criar laudo
  const abrirModalCriarLaudo = (evidencia) => {
    setEvidenciaParaLaudo(evidencia);
    setErroLaudo(null);
    setModalCriarLaudoAberto(true);
  };

  // Função para fechar o modal de criar laudo
  const fecharModalCriarLaudo = () => {
    setModalCriarLaudoAberto(false);
    setEvidenciaParaLaudo(null);
  };

  // Adicionar função para abrir o modal de exclusão de evidência:
  const abrirModalExcluirEvidencia = (evidencia) => {
    setEvidenciaParaExcluir(evidencia);
    setErroExclusaoEvidencia(null);
    setModalExcluirEvidenciaAberto(true);
  };

  const fecharModalExcluirEvidencia = () => {
    setModalExcluirEvidenciaAberto(false);
    setEvidenciaParaExcluir(null);
  };

  // Adicionar função para abrir o modal de exclusão de relatório
  const abrirModalExcluirRelatorio = (relatorio) => {
    setRelatorioParaExcluir(relatorio);
    setModalExcluirRelatorioAberto(true);
  };

  // Adicionar função para fechar o modal de exclusão de relatório
  const fecharModalExcluirRelatorio = () => {
    setModalExcluirRelatorioAberto(false);
    setRelatorioParaExcluir(null);
  };

  // Função para criar o laudo da evidência
  const criarLaudo = async (evidencia, dadosLaudo) => {
    if (!evidencia) {
      setErroLaudo("Evidência não selecionada");
      return;
    }

    setCriandoLaudo(true);
    setErroLaudo(null);

    try {
      const token = localStorage.getItem("token");
      const evidenciaId = evidencia._id || evidencia.id;

      console.log(`Criando laudo para evidência ${evidenciaId}...`);

      // Preparar dados para enviar ao backend
      const laudoData = {
        title: dadosLaudo.titulo,
        content: dadosLaudo.conteudo,
        evidence: evidenciaId,
        findings: dadosLaudo.achados,
        methodology: dadosLaudo.metodologia,
      };

      console.log("Dados do laudo:", laudoData);

      const response = await fetch(
        "https://perioscan-back-end-fhhq.onrender.com/api/evidence-reports",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(laudoData),
        }
      );

      // Capturar a resposta completa para debug
      const responseText = await response.text();
      console.log("Resposta bruta da criação de laudo:", responseText);

      if (!response.ok) {
        console.error("Resposta de erro ao criar laudo:", responseText);
        throw new Error(
          `Falha ao criar laudo: ${response.status} ${response.statusText}`
        );
      }

      // Tentar analisar a resposta como JSON
      let novoLaudo;
      try {
        novoLaudo = JSON.parse(responseText);
      } catch (e) {
        console.error("Erro ao analisar resposta JSON da criação de laudo:", e);
        // Continuar mesmo com erro de parsing
      }

      console.log("Laudo criado com sucesso:", novoLaudo);

      // Atualizar o mapeamento de laudos
      if (novoLaudo && (novoLaudo.data || novoLaudo)) {
        const laudoData = novoLaudo.data || novoLaudo;
        const laudoId = laudoData._id || laudoData.id;

        setLaudosEvidencias((prev) => ({
          ...prev,
          [evidenciaId]: laudoId,
        }));

        // Mostrar notificação de sucesso
        setNotificacaoLaudo({
          visible: true,
          message: "Laudo criado com sucesso! Agora você pode baixar o PDF.",
          type: "success",
        });
      }

      // Fechar o modal
      fecharModalCriarLaudo();
    } catch (error) {
      console.error("Erro ao criar laudo:", error);
      setErroLaudo(`Falha ao criar laudo: ${error.message}`);
    } finally {
      setCriandoLaudo(false);

      // Esconder a notificação após 5 segundos
      setTimeout(() => {
        setNotificacaoLaudo((prev) => ({ ...prev, visible: false }));
      }, 5000);
    }
  };

  // Adicionar função para excluir a evidência:
  const excluirEvidencia = async () => {
    if (!evidenciaParaExcluir) return;

    setExcluindoEvidencia(true);
    setErroExclusaoEvidencia(null);

    try {
      const token = localStorage.getItem("token");
      const evidenciaId = evidenciaParaExcluir._id || evidenciaParaExcluir.id;

      console.log(`Excluindo evidência ${evidenciaId}...`);

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/evidence/${evidenciaId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Resposta de erro ao excluir evidência:", errorText);
        throw new Error(
          `Falha ao excluir evidência: ${response.status} ${response.statusText}`
        );
      }

      console.log("Evidência excluída com sucesso");

      // Remover a evidência da lista
      setEvidencias(
        evidencias.filter(
          (ev) => ev._id !== evidenciaId && ev.id !== evidenciaId
        )
      );

      // Atualizar a lista filtrada também
      setEvidenciasFiltradas(
        evidenciasFiltradas.filter(
          (ev) => ev._id !== evidenciaId && ev.id !== evidenciaId
        )
      );

      // Mostrar notificação de sucesso
      setNotificacaoLaudo({
        visible: true,
        message: "Evidência excluída com sucesso!",
        type: "success",
      });

      // Fechar o modal
      fecharModalExcluirEvidencia();
    } catch (error) {
      console.error("Erro ao excluir evidência:", error);
      setErroExclusaoEvidencia(`Falha ao excluir evidência: ${error.message}`);
    } finally {
      setExcluindoEvidencia(false);

      // Esconder a notificação após 5 segundos
      setTimeout(() => {
        setNotificacaoLaudo((prev) => ({ ...prev, visible: false }));
      }, 5000);
    }
  };

  // Função para baixar o PDF do laudo
  const baixarPDF = async (evidenciaId, laudoId) => {
    // Atualizar estado para mostrar o loader para este laudo específico
    setBaixandoPDF((prev) => ({ ...prev, [laudoId]: true }));

    try {
      const token = localStorage.getItem("token");

      console.log(
        `Baixando PDF do laudo ${laudoId} para evidência ${evidenciaId}...`
      );

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/evidence-reports/${laudoId}/pdf`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // Tentar obter mais informações sobre o erro
        let errorMessage = `Erro ${response.status}`;
        try {
          const errorData = await response.text();
          console.error("Resposta de erro completa:", errorData);
          errorMessage += `: ${errorData}`;
        } catch (e) {
          // Se não conseguir ler o corpo da resposta, use a mensagem padrão
        }

        throw new Error(`Erro ao baixar PDF: ${errorMessage}`);
      }

      // Verificar o tipo de conteúdo da resposta
      const contentType = response.headers.get("content-type");
      console.log("Tipo de conteúdo da resposta:", contentType);

      if (contentType && contentType.includes("application/pdf")) {
        // É um PDF, vamos fazer o download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `laudo-evidencia-${evidenciaId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Mostrar notificação de sucesso
        setNotificacaoLaudo({
          visible: true,
          message: "PDF baixado com sucesso!",
          type: "success",
        });
      } else {
        // Não é um PDF, pode ser uma resposta JSON com erro
        const data = await response.text();
        console.error("Resposta não é um PDF:", data);
        throw new Error(
          "O servidor não retornou um PDF. Verifique os logs para mais detalhes."
        );
      }
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      setNotificacaoLaudo({
        visible: true,
        message: `${error.message}`,
        type: "error",
      });
    } finally {
      // Remover o estado de loading para este laudo
      setBaixandoPDF((prev) => {
        const newState = { ...prev };
        delete newState[laudoId];
        return newState;
      });

      // Esconder a notificação após 5 segundos
      setTimeout(() => {
        setNotificacaoLaudo((prev) => ({ ...prev, visible: false }));
      }, 5000);
    }
  };

  // Adicionar função para abrir o modal de criação de relatório
  const abrirModalRelatorio = () => {
    // Preencher título padrão com o título do caso
    setRelatorioData({
      title: `Relatório: ${caso?.title || "Caso"}`,
      content: "",
      methodology:
        "Análise comparativa de registros odontológicos e evidências coletadas.",
      conclusion: "",
      status: "rascunho",
    });
    setErroRelatorio(null);
    setModalRelatorioAberto(true);
  };

  // Adicionar função para fechar o modal de relatório
  const fecharModalRelatorio = () => {
    setModalRelatorioAberto(false);
  };

  // Adicionar função para lidar com mudanças nos campos do formulário de relatório
  const handleRelatorioChange = (e) => {
    const { name, value } = e.target;
    setRelatorioData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Adicionar função para criar relatório
  const criarRelatorio = async (e) => {
    e.preventDefault();

    if (!relatorioData.title || !relatorioData.content) {
      setErroRelatorio("Título e conteúdo são obrigatórios.");
      return;
    }

    setCriandoRelatorio(true);
    setErroRelatorio(null);

    try {
      const token = localStorage.getItem("token");
      const casoId = caso._id || caso.id;

      const dadosParaEnviar = {
        ...relatorioData,
        case: casoId,
      };

      console.log("Enviando dados do relatório:", dadosParaEnviar);

      const response = await fetch(
        "https://perioscan-back-end-fhhq.onrender.com/api/reports",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosParaEnviar),
        }
      );

      const responseText = await response.text();
      console.log("Resposta bruta da criação do relatório:", responseText);

      if (!response.ok) {
        throw new Error(
          `Falha ao criar relatório: ${response.status} ${response.statusText}`
        );
      }

      let novoRelatorio;
      try {
        novoRelatorio = JSON.parse(responseText);
      } catch (e) {
        console.error(
          "Erro ao analisar resposta JSON da criação do relatório:",
          e
        );
      }

      console.log("Relatório criado com sucesso:", novoRelatorio);

      // Atualizar a lista de relatórios
      if (novoRelatorio && (novoRelatorio.data || novoRelatorio)) {
        const relatorioData = novoRelatorio.data || novoRelatorio;
        setRelatorios((prev) => [...prev, relatorioData]);

        // Mostrar notificação de sucesso
        setNotificacaoLaudo({
          visible: true,
          message: "Relatório criado com sucesso!",
          type: "success",
        });

        // Atualizar o status do caso para "finalizado"
        await atualizarStatusCasoParaFinalizado();
      }

      // Fechar o modal
      fecharModalRelatorio();
    } catch (error) {
      console.error("Erro ao criar relatório:", error);
      setErroRelatorio(`Falha ao criar relatório: ${error.message}`);
    } finally {
      setCriandoRelatorio(false);

      // Esconder a notificação após 5 segundos
      setTimeout(() => {
        setNotificacaoLaudo((prev) => ({ ...prev, visible: false }));
      }, 5000);
    }
  };

  // Função para atualizar o status do caso para finalizado após criar um relatório
  const atualizarStatusCasoParaFinalizado = async () => {
    try {
      // Criar um evento sintético para passar para salvarCaso
      const syntheticEvent = { preventDefault: () => {} };

      // Criar uma cópia do caso atual com status atualizado
      const casoAtualizado = {
        ...casoEditado,
        status: "finalizado",
      };

      // Chamar a função existente para salvar o caso
      await salvarCaso(syntheticEvent, casoAtualizado);

      // Atualizar o estado local do caso
      setCaso((prev) => ({
        ...prev,
        status: "finalizado",
      }));

      console.log(
        "Status do caso atualizado para finalizado após criar relatório"
      );

      // Mostrar notificação adicional
      setNotificacaoLaudo({
        visible: true,
        message: "Status do caso atualizado para Finalizado",
        type: "success",
      });
    } catch (error) {
      console.error("Erro ao atualizar status do caso:", error);
    }
  };

  // Adicionar função para baixar o PDF do relatório
  const baixarPDFRelatorio = async (relatorioId) => {
    setBaixandoPDFRelatorio(true);

    try {
      const token = localStorage.getItem("token");

      console.log(`Baixando PDF do relatório ${relatorioId}...`);

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/reports/${relatorioId}/pdf`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let errorMessage = `Erro ${response.status}`;
        try {
          const errorData = await response.text();
          console.error("Resposta de erro completa:", errorData);
          errorMessage += `: ${errorData}`;
        } catch (e) {}

        throw new Error(`Erro ao baixar PDF: ${errorMessage}`);
      }

      const contentType = response.headers.get("content-type");
      console.log("Tipo de conteúdo da resposta:", contentType);

      if (contentType && contentType.includes("application/pdf")) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `relatorio-${relatorioId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setNotificacaoLaudo({
          visible: true,
          message: "PDF do relatório baixado com sucesso!",
          type: "success",
        });
      } else {
        const data = await response.text();
        console.error("Resposta não é um PDF:", data);
        throw new Error(
          "O servidor não retornou um PDF. Verifique os logs para mais detalhes."
        );
      }
    } catch (error) {
      console.error("Erro ao baixar PDF do relatório:", error);
      setNotificacaoLaudo({
        visible: true,
        message: `${error.message}`,
        type: "error",
      });
    } finally {
      setBaixandoPDFRelatorio(false);

      setTimeout(() => {
        setNotificacaoLaudo((prev) => ({ ...prev, visible: false }));
      }, 5000);
    }
  };

  // Adicionar função para assinar relatório
  const assinarRelatorio = async (relatorioId) => {
    setAssinandoRelatorio(true);

    try {
      const token = localStorage.getItem("token");

      console.log(`Assinando relatório ${relatorioId}...`);

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/reports/${relatorioId}/sign`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Falha ao assinar relatório: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Relatório assinado com sucesso:", data);

      // Atualizar o relatório na lista
      setRelatorios((prev) =>
        prev.map((rel) =>
          rel._id === relatorioId || rel.id === relatorioId
            ? { ...rel, signed: true, signedAt: new Date().toISOString() }
            : rel
        )
      );

      setNotificacaoLaudo({
        visible: true,
        message: "Relatório assinado com sucesso!",
        type: "success",
      });
    } catch (error) {
      console.error("Erro ao assinar relatório:", error);
      setNotificacaoLaudo({
        visible: true,
        message: `Falha ao assinar relatório: ${error.message}`,
        type: "error",
      });
    } finally {
      setAssinandoRelatorio(false);

      setTimeout(() => {
        setNotificacaoLaudo((prev) => ({ ...prev, visible: false }));
      }, 5000);
    }
  };

  // Adicionar função para abrir o modal de visualização de relatório
  const abrirVisualizarRelatorio = (relatorio) => {
    setRelatorioAtual(relatorio);
    setModalVisualizarRelatorioAberto(true);
  };

  // Adicionar função para fechar o modal de visualização de relatório
  const fecharVisualizarRelatorio = () => {
    setModalVisualizarRelatorioAberto(false);
    setRelatorioAtual(null);
  };

  // Modificar a função para excluir relatório para usar o modal de confirmação
  const excluirRelatorio = async (relatorioId) => {
    setExcluindoRelatorio(true);

    try {
      const token = localStorage.getItem("token");

      console.log(`Excluindo relatório ${relatorioId}...`);

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/reports/${relatorioId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Falha ao excluir relatório: ${response.status} ${response.statusText}`
        );
      }

      console.log("Relatório excluído com sucesso");

      // Remover o relatório da lista
      setRelatorios((prev) =>
        prev.filter((rel) => rel._id !== relatorioId && rel.id !== relatorioId)
      );

      setNotificacaoLaudo({
        visible: true,
        message: "Relatório excluído com sucesso!",
        type: "success",
      });
    } catch (error) {
      console.error("Erro ao excluir relatório:", error);
      setNotificacaoLaudo({
        visible: true,
        message: `Falha ao excluir relatório: ${error.message}`,
        type: "error",
      });
    } finally {
      setExcluindoRelatorio(false);
      fecharModalExcluirRelatorio();

      setTimeout(() => {
        setNotificacaoLaudo((prev) => ({ ...prev, visible: false }));
      }, 5000);
    }
  };

  // Verifica se o usuário tem permissão para excluir casos
  const podeExcluirCaso = () => {
    return (
      userRole === "admin" ||
      (userRole === "perito" &&
        caso?.createdBy?.id === localStorage.getItem("userId"))
    );
  };

  // Substitua a função formatarData atual por esta versão corrigida
  const formatarData = (dataISO) => {
    if (!dataISO) return "--";

    // Criar a data garantindo que não haja ajuste de fuso horário
    const data = new Date(dataISO);

    // Ajustar para o fuso horário local para evitar o problema de -1 dia
    const dataAjustada = new Date(
      data.getTime() + data.getTimezoneOffset() * 60000
    );

    return dataAjustada.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Função para formatar o tipo do caso
  const formatarTipoCaso = (tipo) => {
    if (!tipo) return "Outro";

    const tipos = {
      acidente: "Acidente",
      "identificação de vítima": "Identificação de Vítima",
      "exame criminal": "Exame Criminal",
      outro: "Outro",
    };

    return tipos[tipo] || tipo;
  };

  // Função para obter a classe CSS baseada no status
  const getStatusClassName = (status) => {
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
      default:
        return "status-outro";
    }
  };

  // Função para abrir o modal de visualização de evidência
  const abrirEvidenciaModal = (evidencia) => {
    setEvidenciaAtiva(evidencia);
    setModalAberto(true);
  };

  // Função para fechar o modal
  const fecharEvidenciaModal = () => {
    setModalAberto(false);
    setEvidenciaAtiva(null);
  };

  // Função para abrir evidência
  const abrirEvidencia = (evidencia) => {
    setEvidenciaAtiva(evidencia);
    setModalAberto(true);
  };

  // Função para fechar o modal
  const fecharModal = () => {
    setModalAberto(false);
    setEvidenciaAtiva(null);
  };

  // Função para abrir o modal de adicionar evidência
  const abrirModalAdicionar = () => {
    setModalAdicionarAberto(true);
  };

  // Função para fechar o modal de adicionar evidência
  const fecharModalAdicionar = () => {
    setModalAdicionarAberto(false);
  };

  // Função para abrir o modal de edição de caso
  const abrirModalEditar = () => {
    // Resetar o erro de edição
    setErroEdicao(null);
    setModalEditarAberto(true);
  };

  // Função para fechar o modal de edição de caso
  const fecharModalEditar = () => {
    setModalEditarAberto(false);
  };

  // Função para abrir o modal de exclusão de caso
  const abrirModalExcluir = () => {
    if (!podeExcluirCaso()) {
      alert("Você não tem permissão para excluir este caso.");
      return;
    }

    setErroExclusao(null);
    setModalExcluirAberto(true);
  };

  // Função para fechar o modal de exclusão de caso
  const fecharModalExcluir = () => {
    setModalExcluirAberto(false);
  };

  // Função para excluir o caso
  const excluirCaso = async () => {
    setExcluindoCaso(true);
    setErroExclusao(null);

    try {
      const token = localStorage.getItem("token");
      const casoId = caso._id || caso.id;

      console.log(`Excluindo caso ${casoId}...`);

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Capturar a resposta completa para debug
      const responseText = await response.text();
      console.log("Resposta bruta da exclusão do caso:", responseText);

      if (!response.ok) {
        console.error("Resposta de erro ao excluir caso:", responseText);
        throw new Error(
          `Falha ao excluir caso: ${response.status} ${response.statusText}`
        );
      }

      console.log("Caso excluído com sucesso");

      // Redirecionar para a lista de casos
      router.push("/casos");
    } catch (error) {
      console.error("Erro ao excluir caso:", error);
      setErroExclusao(`Falha ao excluir caso: ${error.message}`);
    } finally {
      setExcluindoCaso(false);
    }
  };

  // Função para lidar com mudanças nos campos do formulário de edição
  const handleCasoChange = (e) => {
    const { name, value } = e.target;
    setCasoEditado((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Adicionar logs para depuração na função salvarCaso
  const salvarCaso = async (e, casoModificado) => {
    e.preventDefault();
    setSalvandoCaso(true);
    setErroEdicao(null);

    try {
      const token = localStorage.getItem("token");
      const casoId = caso._id || caso.id;

      // Usar o caso modificado se fornecido, caso contrário usar o casoEditado
      const dadosParaEnviar = {
        ...(casoModificado || casoEditado),
        status: normalizarStatus(casoEditado.status),
      };

      console.log(
        "Enviando dados atualizados do caso:",
        JSON.stringify(dadosParaEnviar, null, 2)
      );
      console.log("Status sendo enviado:", dadosParaEnviar.status);

      const response = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/cases/${casoId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosParaEnviar),
        }
      );

      // Capturar a resposta completa para debug
      const responseText = await response.text();
      console.log("Resposta bruta da atualização do caso:", responseText);

      if (!response.ok) {
        console.error("Resposta de erro ao atualizar caso:", responseText);
        throw new Error(
          `Falha ao atualizar caso: ${response.status} ${response.statusText}`
        );
      }

      // Tentar analisar a resposta como JSON
      let casoAtualizado;
      try {
        casoAtualizado = JSON.parse(responseText);
      } catch (e) {
        console.error(
          "Erro ao analisar resposta JSON da atualização do caso:",
          e
        );
        // Continuar mesmo com erro de parsing
      }

      console.log("Caso atualizado com sucesso:", casoAtualizado);

      // Atualizar o estado do caso com os novos dados
      if (casoAtualizado && casoAtualizado.data) {
        setCaso(casoAtualizado.data);
      } else {
        // Se não conseguirmos obter os dados atualizados da resposta, recarregamos a página
        window.location.reload();
      }

      // Fechar o modal
      fecharModalEditar();
    } catch (error) {
      console.error("Erro ao atualizar caso:", error);
      setErroEdicao(`Falha ao atualizar caso: ${error.message}`);
    } finally {
      setSalvandoCaso(false);
    }
  };

  // Função para enviar a evidência
  const enviarEvidencia = async (e, dadosEvidencia) => {
    e.preventDefault();

    const {
      tipoEvidencia,
      descricaoEvidencia,
      conteudoTexto,
      imagemSelecionada,
      tipoImagem,
    } = dadosEvidencia;

    if (tipoEvidencia === "image" && !imagemSelecionada) {
      setErroUpload("Por favor, selecione uma imagem para upload.");
      return;
    }

    if (tipoEvidencia === "text" && !conteudoTexto) {
      setErroUpload("Por favor, insira o conteúdo do texto.");
      return;
    }

    if (!descricaoEvidencia) {
      setErroUpload("Por favor, insira uma descrição para a evidência.");
      return;
    }

    setEnviandoEvidencia(true);
    setErroUpload(null);

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const casoId = caso._id || caso.id;

      // Para evidências do tipo imagem, primeiro fazemos upload da imagem
      let imageUrl = null;
      let uploadData = null;
      if (tipoEvidencia === "image" && imagemSelecionada) {
        const formData = new FormData();
        // Usar o nome de campo correto 'image' em vez de 'file'
        formData.append("image", imagemSelecionada);
        // Adicionar o tipo de evidência como parâmetro opcional
        formData.append("evidenceType", "caso");
        // Adicionar o ID do caso
        formData.append("case", casoId);

        console.log("Enviando imagem para upload...");

        const uploadResponse = await fetch(
          "https://perioscan-back-end-fhhq.onrender.com/api/upload",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              // Não incluir Content-Type aqui, o navegador vai definir automaticamente com o boundary correto
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("Resposta de erro do upload:", errorText);
          throw new Error(
            `Falha ao fazer upload da imagem: ${uploadResponse.status} ${uploadResponse.statusText}`
          );
        }

        // Obter a resposta completa como texto primeiro para debug
        const responseText = await uploadResponse.text();
        console.log("Resposta bruta do upload:", responseText);

        // Tentar analisar a resposta como JSON
        try {
          uploadData = JSON.parse(responseText);
        } catch (e) {
          console.error("Erro ao analisar resposta JSON:", e);
          throw new Error("A resposta da API não é um JSON válido");
        }

        console.log("Resposta do upload (objeto):", uploadData);

        // Tentar encontrar a URL da imagem em diferentes propriedades possíveis
        if (uploadData.data && uploadData.data.url) {
          imageUrl = uploadData.data.url;
          console.log("URL encontrada em data.url:", imageUrl);
        } else if (uploadData.url) {
          imageUrl = uploadData.url;
          console.log("URL encontrada em url:", imageUrl);
        } else if (uploadData.imageUrl) {
          imageUrl = uploadData.imageUrl;
          console.log("URL encontrada em imageUrl:", imageUrl);
        } else if (uploadData.data && uploadData.data.imageUrl) {
          imageUrl = uploadData.data.imageUrl;
          console.log("URL encontrada em data.imageUrl:", imageUrl);
        } else if (uploadData.secure_url) {
          imageUrl = uploadData.secure_url;
          console.log("URL encontrada em secure_url:", imageUrl);
        } else if (uploadData.data && uploadData.data.secure_url) {
          imageUrl = uploadData.data.secure_url;
          console.log("URL encontrada em data.secure_url:", imageUrl);
        } else {
          console.error(
            "Não foi possível encontrar a URL da imagem na resposta:",
            uploadData
          );
          throw new Error(
            "A API de upload não retornou uma URL de imagem válida"
          );
        }

        // Verificar se a URL é válida
        try {
          new URL(imageUrl);
          console.log("URL da imagem extraída e validada:", imageUrl);
        } catch (e) {
          console.error("URL da imagem inválida:", imageUrl);
          throw new Error(
            "A URL da imagem retornada pelo Cloudinary é inválida"
          );
        }
      }

      // Agora criamos a evidência com todos os campos necessários
      const evidenciaData = {
        type: tipoEvidencia,
        case: casoId,
        description: descricaoEvidencia,
        content: tipoEvidencia === "text" ? conteudoTexto : "",
        // Campos adicionais baseados no exemplo fornecido
        evidenceType:
          tipoEvidencia === "image" ? "ImageEvidence" : "TextEvidence",
        annotations: [],
        collectedBy: userId, // ID do usuário logado
      };

      // Adicionar campos específicos para evidências de imagem
      if (tipoEvidencia === "image" && imageUrl) {
        // Extrair o public_id da resposta do Cloudinary
        let publicId = null;
        if (uploadData.data && uploadData.data.public_id) {
          publicId = uploadData.data.public_id;
        } else if (uploadData.public_id) {
          publicId = uploadData.public_id;
        }

        // Garantir que a URL da imagem seja passada exatamente como recebida do Cloudinary
        evidenciaData.imageUrl = imageUrl;
        evidenciaData.imageType = tipoImagem;

        // Adicionar o objeto cloudinary que o backend espera
        evidenciaData.cloudinary = {
          url: imageUrl,
          public_id: publicId,
        };

        // Log para debug
        console.log("URL da imagem sendo enviada:", imageUrl);
        console.log("Public ID extraído:", publicId);
        console.log(
          "Dados completos da evidência:",
          JSON.stringify(evidenciaData, null, 2)
        );
      }

      // Verificar se temos uma URL de imagem para evidências do tipo imagem
      if (tipoEvidencia === "image" && !imageUrl) {
        setErroUpload(
          "Falha ao obter URL da imagem do Cloudinary. Tente novamente."
        );
        setEnviandoEvidencia(false);
        return;
      }

      console.log("Criando evidência:", evidenciaData);

      const response = await fetch(
        "https://perioscan-back-end-fhhq.onrender.com/api/evidence",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(evidenciaData),
        }
      );

      // Capturar a resposta completa para debug
      const responseText = await response.text();
      console.log("Resposta bruta da criação de evidência:", responseText);

      if (!response.ok) {
        console.error("Resposta de erro ao criar evidência:", responseText);
        throw new Error(
          `Falha ao criar evidência: ${response.status} ${response.statusText}`
        );
      }

      // Tentar analisar a resposta como JSON
      let novaEvidencia;
      try {
        novaEvidencia = JSON.parse(responseText);
      } catch (e) {
        console.error(
          "Erro ao analisar resposta JSON da criação de evidência:",
          e
        );
        // Continuar mesmo com erro de parsing
      }

      console.log("Evidência criada com sucesso:", novaEvidencia);

      if (novaEvidencia && novaEvidencia.data) {
        setEvidencias([...evidencias, novaEvidencia.data]);
      }

      // Fechar o modal
      fecharModalAdicionar();

      // Recarregar as evidências para garantir que temos os dados mais recentes
      const id = params?.id;
      const evidenciasResponse = await fetch(
        `https://perioscan-back-end-fhhq.onrender.com/api/cases/${id}/evidence`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (evidenciasResponse.ok) {
        const evidenciasData = await evidenciasResponse.json();
        if (evidenciasData.success && evidenciasData.data) {
          setEvidencias(evidenciasData.data);
        }
      }
    } catch (error) {
      console.error("Erro ao enviar evidência:", error);
      setErroUpload(`Falha ao enviar evidência: ${error.message}`);
    } finally {
      setEnviandoEvidencia(false);
    }
  };

  const normalizarStatus = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "em andamento" || statusLower === "em-andamento") {
      return "em andamento";
    } else if (statusLower === "finalizado") {
      return "finalizado";
    } else if (statusLower === "pendente") {
      return "pendente";
    } else if (statusLower === "arquivado") {
      return "arquivado";
    } else if (statusLower === "cancelado") {
      return "cancelado";
    } else {
      return "em andamento"; // Default
    }
  };

  return (
    <div className="main-container-caso-detalhes">
      <AsideNavbar />

      <div className="container-caso-detalhes">
        {/* Notificação de laudo */}
        <NotificacaoLaudo
          notificacao={notificacaoLaudo}
          onFechar={() =>
            setNotificacaoLaudo((prev) => ({ ...prev, visible: false }))
          }
        />

        {loadingCaso ? (
          <div className="loading-container">
            <p>Carregando detalhes do caso...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button
              onClick={() => router.push("/casos")}
              className="voltar-button"
            >
              Voltar para lista de casos
            </button>
          </div>
        ) : caso ? (
          <div className="caso-card">
            <div className="caso-card-header">
              <h1>{caso.title}</h1>
              <div className="header-actions">
                <button className="btn-editar" onClick={abrirModalEditar}>
                  <Pencil size={16} />
                  Editar Caso
                </button>
                <button
                  className="btn-excluir"
                  onClick={abrirModalExcluir}
                  disabled={!podeExcluirCaso()}
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
                <button
                  className="btn-voltar"
                  onClick={() => router.push("/casos")}
                >
                  Voltar
                </button>
              </div>
            </div>

            <div className="caso-content">
              <div className="info-coluna">
                <div className="info-section">
                  <h2>Informações Gerais</h2>
                  <div className="info-item">
                    <strong>ID do Caso:</strong>{" "}
                    {caso._id || caso.id || "ID não disponível"}
                  </div>
                  <div className="info-item">
                    <strong>Título:</strong> {caso.title}
                  </div>
                  <div className="info-item">
                    <strong>Data de Abertura:</strong>{" "}
                    {formatarData(caso.openDate) || "Não informada"}
                  </div>
                  <div className="info-item">
                    <strong>Data da Ocorrência:</strong>{" "}
                    {formatarData(caso.occurrenceDate) || "Não informada"}
                  </div>
                  <div className="info-item">
                    <strong>Local:</strong>{" "}
                    {caso.location || "Belo Horizonte, MG"}
                  </div>
                  <div className="info-item">
                    <strong>Status:</strong>{" "}
                    <span className={getStatusClassName(caso.status)}>
                      {caso.status || "Em Andamento"}
                    </span>
                  </div>
                  <div className="info-item">
                    <strong>Criado por:</strong>{" "}
                    {caso.createdBy?.name || "Não informado"}
                  </div>
                  <div className="info-item">
                    <strong>Tipo:</strong>{" "}
                    {formatarTipoCaso(caso.type) || "Outro"}
                  </div>
                </div>

                <div className="evidencias-section">
                  <h2>Evidências</h2>
                  {loadingEvidencias ? (
                    <div className="loading-evidencias">
                      Carregando evidências...
                    </div>
                  ) : (
                    <>
                      <EvidenciasFiltro
                        onSearch={handleSearch}
                        onFilter={handleFilter}
                      />
                      <div className="evidencias-tabela">
                        <table>
                          <thead>
                            <tr>
                              <th>Nome/Descrição</th>
                              <th>Tipo</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {evidenciasFiltradas.length > 0 ? (
                              evidenciasFiltradas.map((evidencia, index) => {
                                const evidenciaId =
                                  evidencia._id || evidencia.id;
                                const temLaudo =
                                  !!laudosEvidencias[evidenciaId];
                                const laudoId = laudosEvidencias[evidenciaId];

                                return (
                                  <EvidenciaItem
                                    key={evidenciaId || index}
                                    evidencia={evidencia}
                                    index={index}
                                    temLaudo={temLaudo}
                                    laudoId={laudoId}
                                    baixandoPDF={baixandoPDF}
                                    gerandoLaudo={gerandoLaudo}
                                    onVerEvidencia={abrirEvidenciaModal}
                                    onCriarLaudo={abrirModalCriarLaudo}
                                    onBaixarPDF={baixarPDF}
                                    onExcluirEvidencia={
                                      abrirModalExcluirEvidencia
                                    }
                                  />
                                );
                              })
                            ) : evidencias.length > 0 ? (
                              <tr>
                                <td colSpan="3" className="no-evidencias">
                                  Nenhuma evidência encontrada com os filtros
                                  aplicados
                                </td>
                              </tr>
                            ) : (
                              <tr>
                                <td colSpan="3" className="no-evidencias">
                                  Nenhuma evidência registrada
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <button
                        className="btn-adicionar"
                        onClick={abrirModalAdicionar}
                      >
                        Adicionar Evidência
                      </button>
                    </>
                  )}
                </div>
                {/* Modificar o JSX para adicionar a seção de relatórios - adicionar após a seção de evidências
                Dentro do <div className="info-coluna"> após a seção de evidências */}
                <div className="relatorios-section">
                  <h2>Relatórios</h2>
                  {carregandoRelatorios ? (
                    <div className="loading-relatorios">
                      Carregando relatórios...
                    </div>
                  ) : (
                    <>
                      <div className="relatorios-tabela">
                        <table>
                          <thead>
                            <tr>
                              <th>Título</th>
                              <th>Status</th>
                              <th>Data de Criação</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {relatorios.length > 0 ? (
                              relatorios.map((relatorio) => (
                                <tr
                                  key={relatorio._id || relatorio.id}
                                  className="relatorio-row"
                                >
                                  <td
                                    onClick={() =>
                                      abrirVisualizarRelatorio(relatorio)
                                    }
                                  >
                                    <div className="relatorio-info-cell">
                                      <span className="relatorio-titulo">
                                        {relatorio.title}
                                      </span>
                                      {relatorio.signed && (
                                        <span className="relatorio-assinado">
                                          <CheckCircle2 size={14} /> Assinado
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <span
                                      className={`status-badge ${
                                        relatorio.status === "rascunho"
                                          ? "status-pendente"
                                          : "status-finalizado"
                                      }`}
                                    >
                                      {relatorio.status === "rascunho"
                                        ? "Rascunho"
                                        : "Finalizado"}
                                    </span>
                                  </td>
                                  <td>{formatarData(relatorio.createdAt)}</td>
                                  <td className="acoes-cell">
                                    <button
                                      className="btn-ver-caso"
                                      onClick={() =>
                                        abrirVisualizarRelatorio(relatorio)
                                      }
                                      title="Ver relatório"
                                    >
                                      <Eye size={18} />
                                    </button>
                                    <button
                                      className="btn-baixar-pdf"
                                      onClick={() =>
                                        baixarPDFRelatorio(
                                          relatorio._id || relatorio.id
                                        )
                                      }
                                      disabled={baixandoPDFRelatorio}
                                      title="Baixar PDF do relatório"
                                    >
                                      {baixandoPDFRelatorio ? (
                                        <Loader size={18} className="spinner" />
                                      ) : (
                                        <Download size={18} />
                                      )}
                                    </button>
                                    {!relatorio.signed && (
                                      <button
                                        className="btn-assinar"
                                        onClick={() =>
                                          assinarRelatorio(
                                            relatorio._id || relatorio.id
                                          )
                                        }
                                        disabled={assinandoRelatorio}
                                        title="Assinar relatório"
                                      >
                                        {assinandoRelatorio ? (
                                          <Loader
                                            size={18}
                                            className="spinner"
                                          />
                                        ) : (
                                          <FileCheck size={18} />
                                        )}
                                      </button>
                                    )}
                                    <button
                                      className="btn-excluir-relatorio"
                                      onClick={() =>
                                        abrirModalExcluirRelatorio(relatorio)
                                      }
                                      title="Excluir relatório"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="no-relatorios">
                                  Nenhum relatório registrado
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <button
                        className="btn-adicionar"
                        onClick={abrirModalRelatorio}
                      >
                        <FilePlus size={16} className="mr-2" />
                        Criar Relatório
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="descricao-coluna">
                <h2>Descrição do Caso</h2>
                <div className="descricao-content">
                  <p>
                    {caso.description ||
                      `No dia 15 de fevereiro de 2024, um incêndio destruiu uma residência no bairro Santa Efigênia, na zona leste da zona. Durante a perícia, foram encontrados restos mortais carbonizados, impossibilitando a identificação visual da vítima. A polícia solicitou exames odontológicos para comparação de registros dentários e tentativa de identificação da vítima.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="not-found-container">
            <p>Caso não encontrado</p>
            <button
              onClick={() => router.push("/casos")}
              className="voltar-button"
            >
              Voltar para lista de casos
            </button>
          </div>
        )}

        {/* Modal para visualizar evidências */}
        {modalAberto && evidenciaAtiva && (
          <ModalVisualizarEvidencia
            evidenciaAtiva={evidenciaAtiva}
            temLaudo={
              !!laudosEvidencias[evidenciaAtiva._id || evidenciaAtiva.id]
            }
            laudoId={laudosEvidencias[evidenciaAtiva._id || evidenciaAtiva.id]}
            baixandoPDF={baixandoPDF}
            gerandoLaudo={gerandoLaudo}
            onFechar={fecharEvidenciaModal}
            onCriarLaudo={abrirModalCriarLaudo}
            onBaixarPDF={baixarPDF}
          />
        )}

        {/* Modal para criar laudo */}
        {modalCriarLaudoAberto && evidenciaParaLaudo && (
          <ModalCriarLaudo
            evidencia={evidenciaParaLaudo}
            onFechar={fecharModalCriarLaudo}
            onCriar={criarLaudo}
            criandoLaudo={criandoLaudo}
            erroLaudo={erroLaudo}
          />
        )}

        {/* Modal para adicionar evidência */}
        {modalAdicionarAberto && (
          <ModalAdicionarEvidencia
            onFechar={fecharModalAdicionar}
            onEnviar={enviarEvidencia}
            enviandoEvidencia={enviandoEvidencia}
            erroUpload={erroUpload}
          />
        )}

        {/* Modal para editar caso */}
        {modalEditarAberto && (
          <ModalEditarCaso
            casoEditado={casoEditado}
            onFechar={fecharModalEditar}
            onSalvar={salvarCaso}
            onCasoChange={handleCasoChange}
            salvandoCaso={salvandoCaso}
            erroEdicao={erroEdicao}
          />
        )}

        {/* Modal para excluir caso */}
        {modalExcluirAberto && (
          <ModalExcluirCaso
            onFechar={fecharModalExcluir}
            onExcluir={excluirCaso}
            excluindoCaso={excluindoCaso}
            erroExclusao={erroExclusao}
          />
        )}

        {/* Modal para excluir evidência */}
        {modalExcluirEvidenciaAberto && evidenciaParaExcluir && (
          <div
            className="evidencia-modal-overlay"
            onClick={fecharModalExcluirEvidencia}
          >
            <div
              className="evidencia-modal-content modal-excluir"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="evidencia-modal-header excluir-header">
                <h3>Excluir Evidência</h3>
                <button
                  className="btn-fechar-modal"
                  onClick={fecharModalExcluirEvidencia}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="evidencia-modal-body">
                <div className="excluir-aviso">
                  <Trash2 size={48} className="excluir-icone" />
                  <p>
                    Tem certeza que deseja excluir esta evidência?
                    <br />
                    <strong>
                      {evidenciaParaExcluir.description ||
                        `Evidência ${
                          evidencias.indexOf(evidenciaParaExcluir) + 1
                        }`}
                    </strong>
                  </p>
                  <p>
                    <strong>Esta ação não pode ser desfeita!</strong>
                  </p>
                </div>
                {erroExclusaoEvidencia && (
                  <div className="upload-error">
                    <p>{erroExclusaoEvidencia}</p>
                  </div>
                )}
              </div>
              <div className="evidencia-modal-footer">
                <button
                  className="btn-cancelar"
                  onClick={fecharModalExcluirEvidencia}
                  disabled={excluindoEvidencia}
                >
                  Cancelar
                </button>
                <button
                  className="btn-excluir-confirmar"
                  onClick={excluirEvidencia}
                  disabled={excluindoEvidencia}
                >
                  {excluindoEvidencia ? (
                    <>
                      <Loader size={16} className="spinner" />
                      <span>Excluindo...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Excluir Evidência</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para excluir relatório */}
        {modalExcluirRelatorioAberto && relatorioParaExcluir && (
          <div
            className="evidencia-modal-overlay"
            onClick={fecharModalExcluirRelatorio}
          >
            <div
              className="evidencia-modal-content modal-excluir"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="evidencia-modal-header excluir-header">
                <h3>Excluir Relatório</h3>
                <button
                  className="btn-fechar-modal"
                  onClick={fecharModalExcluirRelatorio}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="evidencia-modal-body">
                <div className="excluir-aviso">
                  <Trash2 size={48} className="excluir-icone" />
                  <p>
                    Tem certeza que deseja excluir este relatório?
                    <br />
                    <strong>{relatorioParaExcluir.title || "Relatório"}</strong>
                  </p>
                  <p>
                    <strong>Esta ação não pode ser desfeita!</strong>
                  </p>
                </div>
              </div>
              <div className="evidencia-modal-footer">
                <button
                  className="btn-cancelar"
                  onClick={fecharModalExcluirRelatorio}
                  disabled={excluindoRelatorio}
                >
                  Cancelar
                </button>
                <button
                  className="btn-excluir-confirmar"
                  onClick={() =>
                    excluirRelatorio(
                      relatorioParaExcluir._id || relatorioParaExcluir.id
                    )
                  }
                  disabled={excluindoRelatorio}
                >
                  {excluindoRelatorio ? (
                    <>
                      <Loader size={16} className="spinner" />
                      <span>Excluindo...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Excluir Relatório</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para criar relatório */}
      {modalRelatorioAberto && (
        <div className="evidencia-modal-overlay" onClick={fecharModalRelatorio}>
          <div
            className="evidencia-modal-content modal-criar-relatorio"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="evidencia-modal-header">
              <h3>Criar Relatório</h3>
              <button
                className="btn-fechar-modal"
                onClick={fecharModalRelatorio}
              >
                <X size={20} />
              </button>
            </div>

            <div className="evidencia-modal-body">
              <form onSubmit={criarRelatorio} className="form-criar-relatorio">
                {/* Título do relatório */}
                <div className="form-group">
                  <label htmlFor="title">Título do Relatório</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={relatorioData.title}
                    onChange={handleRelatorioChange}
                    placeholder="Ex: Relatório de Análise Odontológica"
                    required
                  />
                </div>

                {/* Conteúdo do relatório */}
                <div className="form-group">
                  <label htmlFor="content">Conteúdo do Relatório</label>
                  <textarea
                    id="content"
                    name="content"
                    value={relatorioData.content}
                    onChange={handleRelatorioChange}
                    placeholder="Descreva detalhadamente a análise do caso..."
                    rows={8}
                    required
                  ></textarea>
                </div>

                {/* Metodologia */}
                <div className="form-group">
                  <label htmlFor="methodology">Metodologia</label>
                  <textarea
                    id="methodology"
                    name="methodology"
                    value={relatorioData.methodology}
                    onChange={handleRelatorioChange}
                    placeholder="Descreva a metodologia utilizada..."
                    rows={4}
                  ></textarea>
                </div>

                {/* Conclusão */}
                <div className="form-group">
                  <label htmlFor="conclusion">Conclusão</label>
                  <textarea
                    id="conclusion"
                    name="conclusion"
                    value={relatorioData.conclusion}
                    onChange={handleRelatorioChange}
                    placeholder="Descreva a conclusão da análise..."
                    rows={4}
                  ></textarea>
                </div>

                {/* Status */}
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={relatorioData.status}
                    onChange={handleRelatorioChange}
                  >
                    <option value="rascunho">Rascunho</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>

                {/* Mensagem de erro */}
                {erroRelatorio && (
                  <div className="upload-error">
                    <p>{erroRelatorio}</p>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={fecharModalRelatorio}
                    disabled={criandoRelatorio}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-salvar"
                    disabled={criandoRelatorio}
                  >
                    {criandoRelatorio ? (
                      <>
                        <Loader size={16} className="spinner" />
                        <span>Criando...</span>
                      </>
                    ) : (
                      <>
                        <FilePlus size={16} />
                        <span>Criar Relatório</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para visualizar relatório */}
      {modalVisualizarRelatorioAberto && relatorioAtual && (
        <div
          className="evidencia-modal-overlay"
          onClick={fecharVisualizarRelatorio}
        >
          <div
            className="evidencia-modal-content modal-visualizar-relatorio"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="evidencia-modal-header">
              <h3>Visualizar Relatório</h3>
              <button
                className="btn-fechar-modal"
                onClick={fecharVisualizarRelatorio}
              >
                <X size={20} />
              </button>
            </div>

            <div className="evidencia-modal-body relatorio-visualizacao">
              <div className="relatorio-header">
                <h2>{relatorioAtual.title}</h2>
                <div className="relatorio-meta">
                  <p>
                    <strong>Data de criação:</strong>{" "}
                    {formatarData(relatorioAtual.createdAt)}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`status-badge ${
                        relatorioAtual.status === "rascunho"
                          ? "status-pendente"
                          : "status-finalizado"
                      }`}
                    >
                      {relatorioAtual.status === "rascunho"
                        ? "Rascunho"
                        : "Finalizado"}
                    </span>
                  </p>
                  {relatorioAtual.signed && (
                    <p className="relatorio-assinado-info">
                      <CheckCircle2 size={16} className="mr-1" />
                      <strong>Assinado em:</strong>{" "}
                      {formatarData(relatorioAtual.signedAt)}
                    </p>
                  )}
                </div>
              </div>

              <div className="relatorio-section">
                <h3>Conteúdo</h3>
                <div className="relatorio-content">
                  {relatorioAtual.content}
                </div>
              </div>

              {relatorioAtual.methodology && (
                <div className="relatorio-section">
                  <h3>Metodologia</h3>
                  <div className="relatorio-content">
                    {relatorioAtual.methodology}
                  </div>
                </div>
              )}

              {relatorioAtual.conclusion && (
                <div className="relatorio-section">
                  <h3>Conclusão</h3>
                  <div className="relatorio-content">
                    {relatorioAtual.conclusion}
                  </div>
                </div>
              )}
            </div>

            <div className="evidencia-modal-footer">
              <button
                className="btn-baixar-pdf-modal"
                onClick={() =>
                  baixarPDFRelatorio(relatorioAtual._id || relatorioAtual.id)
                }
                disabled={baixandoPDFRelatorio}
              >
                {baixandoPDFRelatorio ? (
                  <>
                    <Loader size={16} className="spinner" />
                    <span>Baixando PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Baixar PDF</span>
                  </>
                )}
              </button>

              {!relatorioAtual.signed && (
                <button
                  className="btn-assinar-modal"
                  onClick={() =>
                    assinarRelatorio(relatorioAtual._id || relatorioAtual.id)
                  }
                  disabled={assinandoRelatorio}
                >
                  {assinandoRelatorio ? (
                    <>
                      <Loader size={16} className="spinner" />
                      <span>Assinando...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck size={16} />
                      <span>Assinar Relatório</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
