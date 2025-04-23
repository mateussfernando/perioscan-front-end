"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import AsideNavbar from "@/components/AsideNavBar";
import "../../styles/caso-detalhes.css";
import { Pencil, Trash2 } from "lucide-react";

// Importar componentes
import EvidenciaItem from "@/components/casos/EvidenciaItem";
import ModalVisualizarEvidencia from "@/components/casos/ModalVisualizarEvidencia";
import ModalCriarLaudo from "@/components/casos/ModalCriarLaudo";
import ModalAdicionarEvidencia from "@/components/casos/ModalAdicionarEvidencia";
import ModalEditarCaso from "@/components/casos/ModalEditarCaso";
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

  // Verifica se o usuário tem permissão para excluir casos
  const podeExcluirCaso = () => {
    return (
      userRole === "admin" ||
      (userRole === "perito" &&
        caso?.createdBy?.id === localStorage.getItem("userId"))
    );
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "--";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
  const salvarCaso = async (e) => {
    e.preventDefault();
    setSalvandoCaso(true);
    setErroEdicao(null);

    try {
      const token = localStorage.getItem("token");
      const casoId = caso._id || caso.id;

      // Garantir que o status esteja no formato correto
      const dadosParaEnviar = {
        ...casoEditado,
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
                    <strong>Data da Ocorrência:</strong>{" "}
                    {formatarData(caso.openDate) || "15-02-2025"}
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
                                    onVerEvidencia={abrirEvidencia}
                                    onCriarLaudo={abrirModalCriarLaudo}
                                    onBaixarPDF={baixarPDF}
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
            onFechar={fecharModal}
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
      </div>
    </div>
  );
}
